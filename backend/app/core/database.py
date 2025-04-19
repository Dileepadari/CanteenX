from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.base import Base  # Import Base from the new module

# SQLite connection URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./smart_canteen.db"

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()