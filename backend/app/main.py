import os
import uvicorn
from fastapi import FastAPI, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from sqlalchemy.orm import Session

# Import the core components of your application
from app.core.database import Base, engine, get_db
from app.schema import schema
from app.helpers.middleware import AuthMiddleware

# Ensure all models are imported so SQLAlchemy mappers and Strawberry types are
# registered before creating tables and building the GraphQL schema.
import app.models.user
import app.models.canteen
import app.models.order
import app.models.menu_item
import app.models.cart
import app.models.payment
import app.models.complaints
import app.helpers.payment as payment_helpers
import app.helpers.dev_helpers as dev_helpers

# Best Practice Note: In a production application, you would typically use a migration
# tool like Alembic to manage your database schema instead of `create_all`.
# This line is great for development and testing.
Base.metadata.create_all(bind=engine)

# CRITICAL FIX: The context getter now uses FastAPI's dependency injection system
# to provide a database session to every single GraphQL resolver.
async def get_context(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    This function creates the context dictionary that is available to all GraphQL resolvers.
    It includes:
    - The FastAPI request and response objects.
    - The authenticated user (populated by the AuthMiddleware).
    - A SQLAlchemy database session for database operations.
    """
    return {
        "request": request,
        "response": response,
        "user": request.scope.get("user", None),
        "db": db  # This is the crucial line that makes all our refactored resolvers work.
    }

# Initialize the GraphQL router with the schema and the corrected context getter.
IS_PROD = os.getenv("ENV", "").lower() == "production"
# When ENV=production:
# - GraphiQL playground is disabled (graphiql=False)
# - Introspection is disabled via schema config in schema.py (if supported by installed Strawberry version)
# Set ENV=production in your process environment for deployment to enforce these hardening measures.
graphql_app = GraphQLRouter(
    schema=schema,
    context_getter=get_context,
    graphiql=not IS_PROD  # Disable GraphiQL playground in production
)

# Initialize the main FastAPI application.
app = FastAPI()

# Add your custom authentication middleware first to populate `request.scope["user"]`.
app.add_middleware(AuthMiddleware)

# Add CORS middleware to allow your frontend to communicate with the API.
# Best Practice Note: In production, these origins should be loaded from environment variables.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:3000",
        "https://smartcanteen.dileepadari.dev",
        "https://canteen-x-kappa.vercel.app",
    ],  # tighten wildcard domains in production; expand only if necessary
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],  # GraphQL typically needs only POST + preflight
    allow_headers=["Authorization", "Content-Type"],
)

# Include the GraphQL router in your FastAPI application.
app.include_router(graphql_app, prefix="/api/graphql")

# Include REST payment endpoints (initiate/verify) used by the frontend demo checkout
app.include_router(payment_helpers.router)
app.include_router(dev_helpers.router)

@app.get("/api/hello")
async def read_root():
    """A simple REST endpoint for health checks or basic info."""
    return {"message": "Hello from the Canteen Management API!"}

# a route to make backend awake on render.com use options for less latency
@app.get("/api/awake")
async def awake():
    return Response(status_code=200)

@app.get("/api/health")
async def health_check():
    """A simple health check endpoint."""
    return {"status": "healthy"}

# Standard entrypoint for running the application with uvicorn.
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)