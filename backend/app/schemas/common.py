import strawberry
from typing import List, Optional

@strawberry.input
class CustomizationsInput:
    size: Optional[str] 
    additions: Optional[List[str]] 
    removals: Optional[List[str]] 
    notes: Optional[str] 

@strawberry.type
class CustomizationsResponse:
    size: Optional[str]
    additions: Optional[List[str]]
    removals: Optional[List[str]]
    notes: Optional[str] 