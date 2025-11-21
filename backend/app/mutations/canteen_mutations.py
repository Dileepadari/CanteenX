import strawberry
from datetime import datetime
from strawberry.types import Info
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from graphql import GraphQLError

from app.models.canteen import Canteen, CreateCanteenInput, CanteenMutationResponse, UpdateCanteenInput
from app.models.user import User

def _get_and_verify_user_role(db: Session, user_id: str, expected_role: str):
    """Fetches a user and raises an error if they don't have the expected role."""
    # Coerce user_id to string to avoid SQL type mismatch if an int is passed.
    user = db.query(User).filter(User.id == str(user_id)).first()
    if not user or user.role != expected_role:
        raise GraphQLError(f"Unauthorized: Only a user with role '{expected_role}' can perform this action.")
    return user

def _get_and_verify_canteen_owner(db: Session, canteen_id: int, user_id: str):
    """Fetches a canteen and raises an error if it's not found or the user is not the owner."""
    canteen = db.query(Canteen).filter(Canteen.id == canteen_id).first()
    if not canteen:
        raise GraphQLError("Canteen not found.")
    if canteen.userId != user_id:
        raise GraphQLError("Unauthorized: You are not the owner of this canteen.")
    return canteen

@strawberry.type
class CanteenMutations:
    @strawberry.mutation
    def create_canteen(self, info: Info, input: CreateCanteenInput) -> CanteenMutationResponse:
        """Create a new canteen. Requires admin privileges."""
        db: Session = info.context["db"]
        current_user_id = info.context["user"].id # Assuming current user is in context
        
        _get_and_verify_user_role(db, current_user_id, "admin")

        try:
            # Time validation
            datetime.strptime(input.open_time, "%H:%M")
            datetime.strptime(input.close_time, "%H:%M")
        except ValueError:
            raise GraphQLError("Invalid time format. Please use 'HH:MM'.")

        new_canteen = Canteen(
            name=input.name,
            location=input.location,
            phone=input.phone,
            openTime=input.open_time,
            closeTime=input.close_time,
            description=input.description,
            image=input.image,
            email=input.email,
            schedule=input.schedule,
            tags=input.tags,
            rating=0.0,
            isOpen=True,
            userId=input.user_id
        )

        try:
            db.add(new_canteen)
            db.commit()
            db.refresh(new_canteen)
        except IntegrityError:
            db.rollback()
            raise GraphQLError("A canteen with this phone number or email already exists.")
        except Exception as e:
            db.rollback()
            raise GraphQLError(f"Failed to create canteen: {e}")

        return CanteenMutationResponse(
            success=True,
            message="Canteen created successfully",
            canteen_id=new_canteen.id
        )

    @strawberry.mutation
    def update_canteen(self, info: Info, canteen_id: int, input: UpdateCanteenInput) -> CanteenMutationResponse:
        """Update canteen details. Requires canteen owner privileges."""
        db: Session = info.context["db"]
        current_user_id = info.context["user"].id

        canteen = _get_and_verify_canteen_owner(db, canteen_id, current_user_id)

        # Dynamically update fields that were provided
        for field, value in input.__dict__.items():
            if value is not strawberry.UNSET:
                # Map snake_case input fields to camelCase model fields if necessary
                model_field = field.replace('_', '')
                model_field = model_field[0] + model_field[1:].capitalize() if '_' in field else field
                if hasattr(canteen, model_field): # A simple mapping example
                    setattr(canteen, model_field, value)
                elif hasattr(canteen, field): # If model uses snake_case
                    setattr(canteen, field, value)

        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise GraphQLError(f"Failed to update canteen: {e}")

        return CanteenMutationResponse(
            success=True,
            message="Canteen updated successfully",
            canteen_id=canteen.id
        )

    @strawberry.mutation
    def delete_canteen(self, info: Info, canteen_id: int) -> CanteenMutationResponse:
        """Delete a canteen. Requires admin privileges."""
        db: Session = info.context["db"]
        current_user_id = info.context["user"].id

        _get_and_verify_user_role(db, current_user_id, "admin")
        
        canteen = db.query(Canteen).filter(Canteen.id == canteen_id).first()
        if not canteen:
            raise GraphQLError("Canteen not found.")
            
        try:
            db.delete(canteen)
            db.commit()
        except Exception as e:
            db.rollback()
            raise GraphQLError(f"Failed to delete canteen: {e}")

        return CanteenMutationResponse(
            success=True,
            message="Canteen deleted successfully"
        )
        
    @strawberry.mutation
    def update_canteen_status(self, info: Info, canteen_id: int, is_open: bool) -> CanteenMutationResponse:
        """Update canteen open/closed status. Requires canteen owner privileges."""
        db: Session = info.context["db"]
        current_user_id = info.context["user"].id

        canteen = _get_and_verify_canteen_owner(db, canteen_id, current_user_id)
        
        try:
            canteen.isOpen = is_open
            db.commit()
        except Exception as e:
            db.rollback()
            raise GraphQLError(f"Failed to update canteen status: {e}")

        return CanteenMutationResponse(
            success=True,
            message=f"Canteen status updated to {'open' if is_open else 'closed'}",
            canteen_id=canteen.id
        )