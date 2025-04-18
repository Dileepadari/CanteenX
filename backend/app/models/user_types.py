import strawberry
from typing import Optional, List

@strawberry.type
class UserType:
    id: str
    name: str
    email: str
    role: str
    password: Optional[str] = None
    favoriteCanteens: Optional[List[int]] = None
    recentOrders: Optional[List[int]] = None
    profile_picture: Optional[str] = None
    preferred_payment: Optional[str] = None
    is_vegetarian: Optional[bool] = False
    notif_prefs: Optional[List[str]] = None
