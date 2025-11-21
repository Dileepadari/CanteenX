from typing import Any
from strawberry.permission import BasePermission
from strawberry.types import Info
from sqlalchemy.orm import Session

# You might need your models for more complex checks
# from app.models.user import User

class IsAuthenticated(BasePermission):
    """
    Checks if a user is authenticated.

    This is the base permission for most protected resolvers. It verifies that
    a user object exists in the GraphQL context, which is populated by the
    AuthMiddleware.
    """
    message = "User is not authenticated. Please log in to proceed."

    def has_permission(self, source: Any, info: Info, **kwargs) -> bool:
        """The core permission check."""
        user = info.context.get("user")
        return user is not None
    
    # The `on_unauthorized` method is INTENTIONALLY REMOVED.
    # By default, Strawberry raises a PermissionDenied error, which is the
    # correct and secure behavior. It populates the `errors` array in the
    # GraphQL response, which clients are expected to handle. Overriding this
    # to return `None` can hide security failures and cause confusing downstream errors.


class IsAdmin(IsAuthenticated):
    """
    Checks if a user is authenticated AND has the 'admin' role.

    Inherits from IsAuthenticated, so it implicitly performs the login check first.
    """
    message = "Admin privileges are required to perform this action."

    def has_permission(self, source: Any, info: Info, **kwargs) -> bool:
        # First, run the check from the parent class to ensure the user is logged in.
        if not super().has_permission(source, info, **kwargs):
            return False
        
        # If authenticated, proceed to check the user's role.
        user = info.context["user"]
        return user.role == "admin"


class IsAdminOrSelf(IsAuthenticated):
    """
    Checks if a user is an admin OR is accessing their own resource.

    This is a common pattern for mutations like `updateUser` or queries like
    `getUserOrders`, where an admin can see anyone's data, but a regular
    user can only see their own.

    This permission expects the resolver to have a `user_id` argument that
    identifies the target resource owner.
    """
    message = "You do not have permission to access or modify this resource."

    def has_permission(self, source: Any, info: Info, **kwargs) -> bool:
        # First, ensure the user is authenticated.
        if not super().has_permission(source, info, **kwargs):
            return False

        user = info.context["user"]

        # An admin can always proceed.
        if user.role == "admin":
            return True

        # Check if the user is accessing their own resource.
        # It relies on the resolver's argument name being 'user_id'.
        target_user_id = kwargs.get("user_id")
        # Normalize both sides to strings to avoid type-mismatch (int vs uuid str)
        if target_user_id and str(user.id) == str(target_user_id):
            return True
        
        # If neither condition is met, deny permission.
        return False