from app.mutations.menu_mutations import mutations as menu_mutations
from app.mutations.cart_mutations import mutations as cart_mutations
from app.mutations.order_mutations import mutations as order_mutations

mutations = [
    *menu_mutations,
    *cart_mutations,
    *order_mutations,
]