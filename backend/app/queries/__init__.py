from app.queries.canteen_queries import queries as c_queries
from app.queries.menu_queries import queries as m_queries
from app.queries.user_queries import queries as u_queries
from app.queries.order_queries import queries as o_queries
from app.queries.cart_queries import queries as cart_queries
from app.services.create import queries as user_queries

queries = [
    *c_queries,
    *m_queries, 
    *u_queries,
    *o_queries,
    *cart_queries,
    *user_queries
]

# Add mutations if they're used in your schema
# mutations = [*cart_mutations]

print("Queries loaded:", queries)