import strawberry
from typing import List, Optional
from app.models.user import User
from app.core.database import get_db

@strawberry.type
class UserMutationResponse:
    success: bool
    message: str
    userId: Optional[str] = None
    token: Optional[str] = None

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
                password=password,  # Just store password directly as placeholder
                favoriteCanteens=[],
                recentOrders=[]
            )
            db.add(new_user)
            db.commit()
            return UserMutationResponse(
                success=True,
                message="User created successfully",
                userId=str(new_user.id)
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
        userId: str,
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
                userId=str(user.id)
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
        userId: str,
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
                userId=str(user.id)
            )
        except Exception as e:
            db.rollback()
            return UserMutationResponse(
                success=False,
                message=f"Failed to update favorite canteens: {str(e)}"
            )

    @strawberry.mutation
    def update_user(
        self,
        userId: str,
        name: Optional[str] = None,
        email: Optional[str] = None,
        password: Optional[str] = None,
        role: Optional[str] = None,
        upi_id: Optional[str] = None,
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
                
            if password:
                user.password = password
            if role:
                user.role = role
            if upi_id:
                user.upi_id = upi_id
                
            db.commit()
            return UserMutationResponse(
                success=True,
                message="Profile updated successfully",
                userId=str(user.id)
            )
        except Exception as e:
            db.rollback()
            return UserMutationResponse(
                success=False,
                message=f"Failed to update profile: {str(e)}"
            )

    @strawberry.mutation
    def delete_user(
        self,
        userId: str,
    ) -> UserMutationResponse:
        """Delete user"""
        db = next(get_db())
        user = db.query(User).filter(User.id == userId).first()
        
        if not user:
            return UserMutationResponse(success=False, message="User not found")
            
        try:
            db.delete(user)
            db.commit()
            return UserMutationResponse(
                success=True,
                message="User deleted successfully",
                userId=str(user.id)
            )
        except Exception as e:
            db.rollback()
            return UserMutationResponse(
                success=False,
                message=f"Failed to delete user: {str(e)}"
            )

# Export the mutation fields
mutations = [
    strawberry.field(name="createUser", resolver=UserMutation.create_user),
    strawberry.field(name="updateUserProfile", resolver=UserMutation.update_user_profile),
    strawberry.field(name="updateFavoriteCanteens", resolver=UserMutation.update_favorite_canteens),
    strawberry.field(name="updateUser", resolver=UserMutation.update_user),
    strawberry.field(name="deleteUser", resolver=UserMutation.delete_user),
]