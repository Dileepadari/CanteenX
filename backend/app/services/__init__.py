# from app.services.auth import queries as login_queries
from app.services.create import queries as create_queries
from app.services.cas import mutations as cas_mutations

queries = [
    # *login_queries,
    *create_queries
]





mutations = [
    *cas_mutations
]
print("Queries loaded:", queries)