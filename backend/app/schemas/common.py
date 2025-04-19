import strawberry
from typing import List, Optional

@strawberry.input
class CustomizationsInput:
    size: Optional[str] = None
    additions: Optional[List[str]] = None
    removals: Optional[List[str]] = None
    notes: Optional[str] = None

@strawberry.type
class CustomizationsResponse:
    size: Optional[str]
    additions: Optional[List[str]]
    removals: Optional[List[str]]
    notes: Optional[str] 