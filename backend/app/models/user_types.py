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
    profilePicture: Optional[str] = None
    preferred_payment: Optional[str] = None
    isVegetarian: Optional[bool] = False
    notifPrefs: Optional[List[str]] = None
