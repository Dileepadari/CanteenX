from fastapi import FastAPI
from fastapi.routing import APIRouter
from fastapi.middleware.cors import CORSMiddleware
import strawberry
from strawberry.fastapi import GraphQLRouter

from .queries.order_queries import OrdersQuery, OrdersMutation

@strawberry.type
class Query(OrdersQuery):
    @strawberry.field
    def hello(self) -> str:
        return "Hello from GraphQL!"

@strawberry.type
class Mutation(OrdersMutation):
    pass

graphql_schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQLRouter(schema=graphql_schema)

app = FastAPI(title="Smart Canteen API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GraphQL endpoint
api_router = APIRouter()
api_router.include_router(graphql_app, prefix="/graphql")
app.include_router(api_router, prefix="/api")

# REST endpoint
@app.get("/api/hello")
async def read_root():
    return {"message": "Hello from REST!"}