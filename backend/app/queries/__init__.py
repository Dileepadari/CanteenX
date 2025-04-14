from app.queries.canteen_queries import queries as c_queries
from app.queries.menu_queries import queries as m_queries
from app.queries.user_queries import queries as u_queries

queries = [
    *c_queries,
    *m_queries, 
    *u_queries
]

print("Queries loaded:", queries)