from fastapi import FastAPI
from fastapi.routing import APIRouter
from strawberry.fastapi import GraphQLRouter
import strawberry
from strawberry.tools import create_type

from app.queries import queries
from app.mutations.menu_mutations import mutations as menu_mutations
from app.mutations.user_mutations import mutations as user_mutations
from app.mutations.order_mutations import mutations as order_mutations
from app.mutations.canteen_mutations import mutations as canteen_mutations

Query = create_type("Query", queries)
Mutation = create_type("Mutation", [
    *menu_mutations,
    *user_mutations,
    *order_mutations,
    *canteen_mutations
])
graphql_schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema=graphql_schema)

app = FastAPI()

# GraphQL endpoint
api_router = APIRouter()
api_router.include_router(graphql_app, prefix="/graphql")
app.include_router(api_router, prefix="/api")

# REST endpoint
@app.get("/api/hello")
async def read_root():
    return {"message": "Hello from REST!"}
