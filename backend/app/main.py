from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
import strawberry

@strawberry.type
class Query:
    hello: str = "Welcome to Smart Canteen API"

graphql_schema = strawberry.Schema(query=Query)
graphql_app = GraphQLRouter(graphql_schema)

app = FastAPI()
app.include_router(graphql_app, prefix="/graphql")
