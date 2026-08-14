"""CanteenX API application."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request, Response, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from strawberry.fastapi import GraphQLRouter
from strawberry.subscriptions import GRAPHQL_TRANSPORT_WS_PROTOCOL, GRAPHQL_WS_PROTOCOL

from app.api.context import GraphQLContext, build_context
from app.api.graphql.schema import schema
from app.api.middleware import CSRFMiddleware, RequestContextMiddleware
from app.api.rest import payments, uploads
from app.core.config import settings
from app.core.database import dispose_engine, engine, session_scope
from app.core.errors import AppError
from app.core.logging import configure_logging, get_logger, get_request_id
from app.core.pubsub import close_pubsub, get_pubsub

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Note there is no `create_all()` here. The schema is owned entirely by
    # Alembic; running both meant the application and the migration history
    # could disagree - which is exactly what happened before.
    logger.info(
        "Starting CanteenX API",
        extra={
            "environment": settings.environment.value,
            "payments_enabled": settings.payments_enabled,
            "uploads_enabled": settings.uploads_enabled,
        },
    )
    get_pubsub()
    yield
    await close_pubsub()
    await dispose_engine()
    logger.info("CanteenX API stopped")


app = FastAPI(
    title="CanteenX API",
    version="2.0.0",
    lifespan=lifespan,
    docs_url=None if settings.environment.is_production else "/api/docs",
    redoc_url=None,
    openapi_url=None if settings.environment.is_production else "/api/openapi.json",
)

# Order matters: middleware added last runs first. Request ids must exist
# before anything logs, and CORS must wrap the CSRF rejection so the browser
# is allowed to read the 403 rather than reporting an opaque network error.
app.add_middleware(CSRFMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "x-csrf-token", "x-request-id"],
    expose_headers=["x-request-id"],
)
app.add_middleware(RequestContextMiddleware)


@app.exception_handler(AppError)
async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.http_status,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "requestId": get_request_id(),
            }
        },
    )


async def graphql_session(
    websocket: WebSocket = None,  # type: ignore[assignment]
) -> AsyncIterator[AsyncSession | None]:
    """Per-request session for HTTP; none at all for WebSocket.

    A dependency resolved on a WebSocket route is held for the *entire*
    connection. Yielding a pooled session there means every open subscription
    permanently occupies a database connection, and the pool is exhausted after
    a handful of subscribers - which takes the whole API down, not just
    real-time. Subscriptions open short-lived sessions via `context.db()`.
    """
    if websocket is not None:
        yield None
        return

    async with session_scope() as session:
        yield session


async def get_context(
    # These must be *bare* annotations with a None default, not `X | None`.
    # FastAPI recognises Request/WebSocket/Response by exact annotation; wrap
    # them in a union and it tries to build a Pydantic field instead, and fails
    # at import time.
    request: Request = None,  # type: ignore[assignment]
    websocket: WebSocket = None,  # type: ignore[assignment]
    response: Response = None,  # type: ignore[assignment]
    session: AsyncSession | None = Depends(graphql_session),
) -> GraphQLContext:
    """Build the context for both transports.

    FastAPI injects `request` on HTTP routes and `websocket` on the
    subscription route - never both. Declaring only `request`, with no default,
    made every WebSocket handshake fail with a TypeError before the connection
    was established, so no subscription could ever deliver.
    """
    return await build_context(request or websocket, response, session)


graphql_router: GraphQLRouter = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=settings.graphiql_enabled,
    subscription_protocols=[GRAPHQL_TRANSPORT_WS_PROTOCOL, GRAPHQL_WS_PROTOCOL],
)

app.include_router(graphql_router, prefix="/api/graphql")
app.include_router(payments.router)
app.include_router(uploads.router)


@app.get("/api/health", tags=["ops"])
async def health() -> dict[str, str]:
    """Liveness plus a real database round-trip.

    A health check that never touches the database will happily report healthy
    while every actual request fails on a dead connection pool.
    """
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    except Exception as exc:
        logger.error("Health check failed", exc_info=exc)
        return {"status": "degraded", "database": "unreachable"}

    return {"status": "healthy", "database": "ok"}


@app.get("/api/awake", tags=["ops"], include_in_schema=False)
async def awake() -> Response:
    """Cheap keep-alive for the Render free-tier cron. Does no database work."""
    return Response(status_code=204)
