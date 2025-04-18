import strawberry
from typing import Optional

@strawberry.type
class UserType:
    id: str
    name: str
    email: str
    role: str
    profile_picture: Optional[str] = None
    preferred_payment: Optional[str] = None
