from fastapi import FastAPI
from fastapi.routing import APIRouter
from strawberry.fastapi import GraphQLRouter
import strawberry
from strawberry.tools import create_type
from fastapi import Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.services import queries
from app.services.auth import Mutation
from app.core.database import Base, engine
from app.core.utils import create_default_user  # Updated import
from app.models import user
from app.queries import queries

Base.metadata.create_all(bind=engine)

# @strawberry.type
# class Query:
#     hello: str = "Hello from GraphQL!"

async def get_context(request: Request, response: Response):
    return {
        "request": request,
        "response": response,
    }

Query = create_type("Query", queries)
graphql_schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema=graphql_schema, context_getter = get_context)
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "https://frontend", "http://backend:8000", "http://frontend:8080"],  # Add frontend and backend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# GraphQL endpoint
api_router = APIRouter()
api_router.include_router(graphql_app, prefix="/graphql")
app.include_router(api_router, prefix="/api")

# REST endpoint
@app.get("/api/hello")
async def read_root():
    return {"message": "Hello from REST!"}

if __name__ == "__main__":
    import uvicorn
    # Create the default admin user
    create_default_user()
    # Run the app with HTTPS support
    uvicorn.run(app, host="0.0.0.0", port=8000, ssl_certfile="/path/to/certificate.crt", ssl_keyfile="/path/to/private.key")
