import strawberry

from app.queries.canteen_queries import CanteenQueries
from app.queries.cart_queries import CartQueries
from app.queries.complaint_queries import ComplaintQueries
from app.queries.menu_queries import MenuQueries
from app.queries.order_queries import OrderQueries
from app.queries.payment_queries import PaymentQueries
from app.queries.user_queries import UserQueries
from app.queries.admin_queries import AdminQueries

from app.mutations.auth_mutations import AuthMutations
from app.mutations.cart_mutations import CartMutations
from app.mutations.canteen_mutations import CanteenMutations
from app.mutations.complaint_mutations import ComplaintMutations
from app.mutations.menu_mutations import MenuMutations
from app.mutations.order_mutations import OrderMutations
from app.mutations.user_mutations import UserMutations
from app.mutations.admin_user_mutations import AdminUserMutations

@strawberry.type
class Query(
    CanteenQueries,
    CartQueries,
    ComplaintQueries,
    MenuQueries,
    OrderQueries,
    UserQueries,
    PaymentQueries,
    AdminQueries,
):
    """
    The root query type for the GraphQL schema.
    It inherits and combines all individual query resolver classes.
    """
    pass


@strawberry.type
class Mutation(
    AuthMutations,
    CartMutations,
    CanteenMutations,
    ComplaintMutations,
    MenuMutations,
    OrderMutations,
    UserMutations,
    AdminUserMutations,
):
    """
    The root mutation type for the GraphQL schema.
    It inherits and combines all individual mutation resolver classes.
    """
    pass


# The final schema object that will be used by the GraphQL router.
# Ensure model GraphQL types are evaluated so Strawberry can resolve lazy references.
# Importing the model modules executes their Strawberry type definitions.
import app.models.user  # defines UserType
import app.models.canteen
import app.models.order
import app.models.menu_item
import app.models.cart
import app.models.payment
import app.models.complaints

# The final schema object that will be used by the GraphQL router.
schema = strawberry.Schema(query=Query, mutation=Mutation)
