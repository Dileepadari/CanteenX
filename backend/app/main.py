from fastapi import FastAPI
from fastapi.routing import APIRouter
from strawberry.fastapi import GraphQLRouter
import strawberry

@strawberry.type
class Query:
    hello: str = "Hello from GraphQL!"

graphql_schema = strawberry.Schema(query=Query)
graphql_app = GraphQLRouter(schema=graphql_schema)

app = FastAPI()

# GraphQL endpoint
api_router = APIRouter()
api_router.include_router(graphql_app, prefix="/graphql")
app.include_router(api_router, prefix="/api")

# REST endpoint
@app.get("/api/")
async def read_root():
    return {"message": "Hello from REST!"}