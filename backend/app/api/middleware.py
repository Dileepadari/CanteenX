"""HTTP middleware: request correlation ids and CSRF protection."""

from __future__ import annotations

import time

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.core.logging import get_logger, set_request_id
from app.core.security import (
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
    REFRESH_COOKIE_NAME,
    csrf_tokens_match,
)

logger = get_logger(__name__)

#: Endpoints that legitimately receive cookieless cross-origin POSTs.
CSRF_EXEMPT_PATHS: frozenset[str] = frozenset(
    {
        "/api/payments/webhook",  # authenticated by Razorpay's HMAC signature
        "/api/health",
        "/api/awake",
    }
)

_SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "TRACE"})


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Attach a correlation id and log one structured line per request."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        request_id = set_request_id(request.headers.get("x-request-id"))
        started = time.perf_counter()

        response = await call_next(request)

        duration_ms = round((time.perf_counter() - started) * 1000, 2)
        response.headers["x-request-id"] = request_id

        # Health checks fire every few seconds on Render; logging them buries
        # everything else.
        if request.url.path not in ("/api/health", "/api/awake"):
            logger.info(
                "request",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status": response.status_code,
                    "duration_ms": duration_ms,
                },
            )
        return response


class CSRFMiddleware(BaseHTTPMiddleware):
    """Double-submit CSRF check for cookie-authenticated state changes.

    Cookie auth plus `allow_credentials=True` and no CSRF token is a
    cross-site request forgery hole: any page could POST a GraphQL mutation to
    the API and the browser would attach the session cookie. The check only
    applies when the request actually authenticates via cookie - bearer-token
    callers are not vulnerable and are skipped.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if self._requires_csrf(request):
            cookie = request.cookies.get(CSRF_COOKIE_NAME)
            header = request.headers.get(CSRF_HEADER_NAME)
            if not csrf_tokens_match(cookie, header):
                logger.warning(
                    "Rejected request failing CSRF check",
                    extra={"path": request.url.path},
                )
                return JSONResponse(
                    status_code=403,
                    content={
                        "error": {
                            "code": "csrf_failed",
                            "message": "Missing or invalid CSRF token.",
                        }
                    },
                )

        return await call_next(request)

    @staticmethod
    def _requires_csrf(request: Request) -> bool:
        if request.method in _SAFE_METHODS:
            return False
        if request.url.path in CSRF_EXEMPT_PATHS:
            return False

        # Only cookie-bearing requests are forgeable. A caller presenting a
        # bearer token had to read it from somewhere a cross-site page cannot.
        has_auth_cookie = any(
            name in request.cookies for name in ("access_token", REFRESH_COOKIE_NAME)
        )
        return has_auth_cookie
