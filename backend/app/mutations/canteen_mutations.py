import strawberry
from typing import Optional
from datetime import time, datetime
from app.models.canteen import Canteen
from app.models.user import User
from app.core.database import get_db

@strawberry.type
class CanteenMutationResponse:
    success: bool
    message: str
    canteenId: Optional[int] = None

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_canteen(
        self,
        currUserId: int,
        userId:int,
        name: str,
        location: str,
        phone: str,
        openTime: str,  # Format: "HH:MM"
        closeTime: str,  # Format: "HH:MM"
        description: Optional[str] = None,
        image: Optional[str] = None
    ) -> CanteenMutationResponse:
        """Create a new canteen"""
        db = next(get_db())
        
        # Verify admin authorization
        user = db.query(User).filter(User.id == currUserId).first()
        if user.role != "admin":
            return CanteenMutationResponse(
                success=False,
                message="Unauthorized: Only admins can create canteens"
            )
        
        # Check if canteen with phone already exists
        if db.query(Canteen).filter(Canteen.phone == phone).first():
            return CanteenMutationResponse(
                success=False,
                message="Canteen with this phone already exists"
            )
            
        try:
            # Parse time strings
            try:
                dt = datetime.strptime(openTime, "%H:%M")
                openTime_obj = time(dt.hour, dt.minute)
                dt = datetime.strptime(closeTime, "%H:%M")
                closeTime_obj = time(dt.hour, dt.minute)
            except ValueError:
                return CanteenMutationResponse(
                    success=False,
                    message="Invalid time format. Use HH:MM format (e.g., '07:30')"
                )

            new_canteen = Canteen(
                name=name,
                location=location,
                phone=phone,
                openTime=openTime,
                closeTime=closeTime,
                description=description,
                image=image,
                rating=0.0,
                isOpen=True,
                userId=userId
            )
            db.add(new_canteen)
            db.commit()
            return CanteenMutationResponse(
                success=True,
                message="Canteen created successfully",
                canteenId=new_canteen.id
            )
        except Exception as e:
            db.rollback()
            return CanteenMutationResponse(
                success=False,
                message=f"Failed to create canteen: {str(e)}"
            )

    @strawberry.mutation
    def update_canteen(
        self,
        canteenId: int,
        userId: int,
        name: Optional[str] = None,
        location: Optional[str] = None,
        phone: Optional[str] = None,
        openTime: Optional[str] = None,
        closeTime: Optional[str] = None,
        description: Optional[str] = None,
        image: Optional[str] = None,
        isOpen: Optional[bool] = None
    ) -> CanteenMutationResponse:
        """Update canteen details"""
        db = next(get_db())
        canteen = db.query(Canteen).filter(Canteen.id == canteenId).first()
        
        if not canteen:
            return CanteenMutationResponse(success=False, message="Canteen not found")
            
        # Verify vendor authorization
        if canteen.userId != userId:
            return CanteenMutationResponse(
                success=False,
                message="Unauthorized: Only the canteen owner can update details"
            )
            
        try:
            if name: canteen.name = name
            if location: canteen.location = location
            if phone: canteen.phone = phone
            if openTime: canteen.openTime = openTime
            if closeTime: canteen.closeTime = closeTime
            if description is not None: canteen.description = description
            if image is not None: canteen.image = image
            if isOpen is not None: canteen.isOpen = isOpen
            
            db.commit()
            return CanteenMutationResponse(
                success=True,
                message="Canteen updated successfully",
                canteenId=canteen.id
            )
        except Exception as e:
            db.rollback()
            return CanteenMutationResponse(
                success=False,
                message=f"Failed to update canteen: {str(e)}"
            )

    @strawberry.mutation
    def delete_canteen(
        self,
        canteenId: int,
        currUserId:int,
    ) -> CanteenMutationResponse:
        """Delete a canteen"""
        db = next(get_db())
        
        # Verify admin authorization
        admin = db.query(User).filter(User.id == currUserId).first()
        if not admin or admin.role != "admin":
            return CanteenMutationResponse(
                success=False,
                message="Unauthorized: Only admins can delete canteens"
            )
            
        canteen = db.query(Canteen).filter(Canteen.id == canteenId).first()
        if not canteen:
            return CanteenMutationResponse(success=False, message="Canteen not found")
            
        try:
            db.delete(canteen)
            db.commit()
            return CanteenMutationResponse(
                success=True,
                message="Canteen deleted successfully"
            )
        except Exception as e:
            db.rollback()
            return CanteenMutationResponse(
                success=False,
                message=f"Failed to delete canteen: {str(e)}"
            )

    @strawberry.mutation
    def update_canteen_status(
        self,
        canteenId: int,
        isOpen: bool,
        userId: int,  # For authorization
    ) -> CanteenMutationResponse:
        """Update canteen open/closed status"""
        db = next(get_db())
        canteen = db.query(Canteen).filter(Canteen.id == canteenId).first()
        
        if not canteen:
            return CanteenMutationResponse(success=False, message="Canteen not found")
            
        # Verify vendor authorization
        if canteen.userId != userId:
            return CanteenMutationResponse(
                success=False,
                message="Unauthorized: Only the canteen owner can update status"
            )
            
        try:
            canteen.isOpen = isOpen
            db.commit()
            return CanteenMutationResponse(
                success=True,
                message=f"Canteen status updated to {'open' if isOpen else 'closed'}",
                canteenId=canteen.id
            )
        except Exception as e:
            db.rollback()
            return CanteenMutationResponse(
                success=False,
                message=f"Failed to update canteen status: {str(e)}"
            )

mutations = [
    strawberry.field(name="createCanteen", resolver=Mutation.create_canteen),
    strawberry.field(name="updateCanteen", resolver=Mutation.update_canteen),
    strawberry.field(name="deleteCanteen", resolver=Mutation.delete_canteen),
    strawberry.field(name="updateCanteenStatus", resolver=Mutation.update_canteen_status),
]