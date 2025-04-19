from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import time
import logging

# Set up logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# PostgreSQL connection URL
# Replace user, password, host, port, dbname as per your config or Docker Compose setup
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://admin:password@db:5432/smartcanteen"


# Create SQLAlchemy engine with connection pooling and retry settings
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # Test connections before using them
    pool_recycle=3600,   # Recycle connections after 1 hour
    connect_args={"connect_timeout": 15}  # 15 second timeout
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()