import strawberry
from typing import List, Optional
from app.models.user import User
from app.core.database import get_db

@strawberry.type
class UserMutationResponse:
    success: bool
    message: str
    userId: Optional[int] = None

@strawberry.type
class UserMutation:
    @strawberry.mutation
    def create_user(
        self,
        name: str,
        email: str,
        password: str = "password",  # Default password, not actually used
        role: str = "student",
    ) -> UserMutationResponse:
        """Create a new user"""
        db = next(get_db())
        
        # Check if user already exists
        if db.query(User).filter(User.email == email).first():
            return UserMutationResponse(
                success=False,
                message="User with this email already exists"
            )
            
        try:
            # Simple storage of password as placeholder
            new_user = User(
                name=name,
                email=email,
                role=role,
                hashed_password=password,  # Just store password directly as placeholder
                favoriteCanteens=[],
                recentOrders=[]
            )
            db.add(new_user)
            db.commit()
            return UserMutationResponse(
                success=True,
                message="User created successfully",
                userId=new_user.id
            )
        except Exception as e:
            db.rollback()
            return UserMutationResponse(
                success=False,
                message=f"Failed to create user: {str(e)}"
            )

    @strawberry.mutation
    def update_user_profile(
        self,
        userId: int,
        name: Optional[str] = None,
        email: Optional[str] = None,
    ) -> UserMutationResponse:
        """Update user profile"""
        db = next(get_db())
        user = db.query(User).filter(User.id == userId).first()
        
        if not user:
            return UserMutationResponse(success=False, message="User not found")
            
        try:
            if name:
                user.name = name
            if email and email != user.email:
                # Check if email is already taken
                if db.query(User).filter(User.email == email).first():
                    return UserMutationResponse(
                        success=False,
                        message="Email is already taken"
                    )
                user.email = email
                
            db.commit()
            return UserMutationResponse(
                success=True,
                message="Profile updated successfully",
                userId=user.id
            )
        except Exception as e:
            db.rollback()
            return UserMutationResponse(
                success=False,
                message=f"Failed to update profile: {str(e)}"
            )

    @strawberry.mutation
    def update_favorite_canteens(
        self,
        userId: int,
        canteenIds: List[int],
    ) -> UserMutationResponse:
        """Update user's favorite canteens"""
        db = next(get_db())
        user = db.query(User).filter(User.id == userId).first()
        
        if not user:
            return UserMutationResponse(success=False, message="User not found")
            
        try:
            user.favoriteCanteens = canteenIds
            db.commit()
            return UserMutationResponse(
                success=True,
                message="Favorite canteens updated successfully",
                userId=user.id
            )
        except Exception as e:
            db.rollback()
            return UserMutationResponse(
                success=False,
                message=f"Failed to update favorite canteens: {str(e)}"
            )

    @strawberry.mutation
    def deactivate_user(
        self,
        userId: int,
        adminId: int,  # For authorization
    ) -> UserMutationResponse:
        """Deactivate a user account"""
        db = next(get_db())
        
        # Verify admin
        admin = db.query(User).filter(User.id == adminId).first()
        if not admin or admin.role != "admin":
            return UserMutationResponse(
                success=False,
                message="Unauthorized: Only admins can deactivate users"
            )
            
        user = db.query(User).filter(User.id == userId).first()
        if not user:
            return UserMutationResponse(success=False, message="User not found")
            
        try:
            user.isActive = False
            db.commit()
            return UserMutationResponse(
                success=True,
                message="User deactivated successfully",
                userId=user.id
            )
        except Exception as e:
            db.rollback()
            return UserMutationResponse(
                success=False,
                message=f"Failed to deactivate user: {str(e)}"
            )

# Export the mutation fields
mutations = [
    strawberry.field(name="createUser", resolver=UserMutation.create_user),
    strawberry.field(name="updateUserProfile", resolver=UserMutation.update_user_profile),
    strawberry.field(name="updateFavoriteCanteens", resolver=UserMutation.update_favorite_canteens),
    strawberry.field(name="deactivateUser", resolver=UserMutation.deactivate_user),
]