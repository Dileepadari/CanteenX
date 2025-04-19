# from app.services.auth import queries as login_queries
from app.services.create import queries as create_queries

queries = [
    # *login_queries,
    *create_queries
]

print("Queries loaded:", queries)