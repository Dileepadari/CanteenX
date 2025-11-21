import strawberry
from typing import Optional, List

from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

# ===================================================================
# 1. STRAWBERRY GRAPHQL OUTPUT TYPES (for Queries)
# ===================================================================

@strawberry.type
class SizeOption:
    """Represents a size option for a menu item (e.g., Small, Medium, Large)."""
    name: str
    price: float

@strawberry.type
class AdditionOption:
    """Represents an addition/extra for a menu item (e.g., Extra Cheese)."""
    name: str
    price: float

@strawberry.type
class CustomizationOptionsType:
    """Defines the available customization options for a menu item."""
    sizes: Optional[List[SizeOption]] = None
    additions: Optional[List[AdditionOption]] = None
    removals: Optional[List[str]] = None
    notes_allowed: Optional[bool] = False


@strawberry.type
class MenuItemType:
    """The MenuItem object as exposed through the GraphQL API (uses camelCase)."""
    id: int
    name: str
    price: float
    canteenId: int
    canteenName: Optional[str] = None # This will be populated from the relationship in the resolver
    description: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    rating: float = 0.0
    ratingCount: int = 0
    isAvailable: bool = True
    isFeatured: bool = False
    isPopular: bool = False
    preparationTime: int = 15
    customizationOptions: Optional[CustomizationOptionsType] = None
    # Backwards-compatible fields expected by the frontend (camelCase)
    isVegetarian: Optional[bool] = False
    isFeatured: Optional[bool] = False
    stockCount: int = 0

# ===================================================================
# 2. STRAWBERRY GRAPHQL INPUT TYPES (for Mutations)
# ===================================================================

@strawberry.input
class SizeOptionInput:
    """Input for defining a size option."""
    name: str
    price: float

@strawberry.input
class AdditionOptionInput:
    """Input for defining an addition/extra option."""
    name: str
    price: float

@strawberry.input
class CustomizationOptionsInput:
    """Input for providing the available customization options for a menu item."""
    sizes: Optional[List[SizeOptionInput]] = None
    additions: Optional[List[AdditionOptionInput]] = None
    removals: Optional[List[str]] = None
    notes_allowed: Optional[bool] = False

@strawberry.input
class CreateMenuItemInput:
    """Input for creating a new menu item (uses snake_case for Python consistency)."""
    name: str
    price: float
    canteen_id: int
    description: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_popular: Optional[bool] = False
    preparation_time: Optional[int] = 15
    customization_options: Optional[CustomizationOptionsInput] = None

@strawberry.input
class UpdateMenuItemInput:
    """Input for updating an existing menu item (all fields optional)."""
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_popular: Optional[bool] = None
    preparation_time: Optional[int] = None
    customization_options: Optional[CustomizationOptionsInput] = None

# ===================================================================
# 3. STRAWBERRY MUTATION RESPONSE TYPE
# ===================================================================

@strawberry.type
class MenuItemMutationResponse:
    """
    Standard response for menu item mutations.
    Returns the full menu item object on success.
    """
    success: bool
    message: str
    menu_item: Optional[MenuItemType] = None

# ===================================================================
# 4. SQLAlchemy DATABASE MODEL
# ===================================================================
    
class MenuItem(Base):
    """
    The SQLAlchemy model for a MenuItem (uses snake_case for table columns).
    """
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    image = Column(String, nullable=True)
    category = Column(String, nullable=True)
    
    # Foreign key to the canteen this item belongs to.
    canteen_id = Column(Integer, ForeignKey("canteens.id"), nullable=False)
    
    tags = Column(JSON, nullable=True)
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    
    is_available = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_popular = Column(Boolean, default=False)
    preparation_time = Column(Integer, default=15)  # in minutes
    
    # All customization options are stored in a single, flexible JSON column.
    customization_options = Column(JSON, nullable=True)
    stock_count = Column(Integer, default=0)
    
    # --- Relationships ---
    # The `Canteen` model should have a relationship: `menu_items = relationship("MenuItem", back_populates="canteen")`
    canteen = relationship("Canteen", back_populates="menu_items")

    # Backwards-compatible properties used by the GraphQL layer (camelCase fields)
    @property
    def isVegetarian(self) -> bool:
        # Some datasets may not have this column; default to False if absent
        return bool(getattr(self, "is_vegetarian", False))

    @property
    def isFeatured(self) -> bool:
        # 'featured' is similar to 'is_popular' in older data; fallback accordingly
        return bool(getattr(self, "is_featured", False) or getattr(self, "is_popular", False))

    @property
    def ratingCount(self) -> int:
        return int(getattr(self, "rating_count", 0))

    @property
    def canteenName(self) -> str:
        try:
            return self.canteen.name if self.canteen else None
        except Exception:
            return None
    
    # Additional camelCase accessors expected by GraphQL layer
    @property
    def canteenId(self) -> int:
        return int(getattr(self, "canteen_id", None)) if getattr(self, "canteen_id", None) is not None else None

    @property
    def isAvailable(self) -> bool:
        return bool(getattr(self, "is_available", False))

    @property
    def isPopular(self) -> bool:
        return bool(getattr(self, "is_popular", False))

    @property
    def preparationTime(self) -> int:
        return int(getattr(self, "preparation_time", 15) or 15)

    @property
    def customizationOptions(self):
        # Return the JSON column directly (may be None)
        return getattr(self, "customization_options", None)

    @property
    def stockCount(self) -> int:
        return int(getattr(self, "stock_count", 0) or 0)