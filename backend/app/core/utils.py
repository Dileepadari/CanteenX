from app.models.user import User
from app.core.database import SessionLocal
from passlib.hash import bcrypt

def create_default_user():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.name == "admin").first():
            admin_user = User(
                name="admin",
                password=bcrypt.hash("admin"),
                role="admin",
                email="admin@smartcanteen.com",
            )
            db.add(admin_user)
            db.commit()
            print("Default admin user created.")
        else:
            print("Default admin user already exists.")
    finally:
        db.close()
