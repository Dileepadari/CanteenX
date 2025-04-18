from fastapi import FastAPI
from fastapi.routing import APIRouter
from strawberry.fastapi import GraphQLRouter
import strawberry
from strawberry.tools import create_type
from fastapi import Request, Response

from app.services import queries
from app.services.auth import Mutation
from app.core.database import Base, engine
from app.models import user

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

# GraphQL endpoint
api_router = APIRouter()
api_router.include_router(graphql_app, prefix="/graphql")
app.include_router(api_router, prefix="/api")

# REST endpoint
@app.get("/api/hello")
async def read_root():
    return {"message": "Hello from REST!"}