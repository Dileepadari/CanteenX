from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import time
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# PostgreSQL connection URL - Read from environment variable
# Fallback to local docker setup if DATABASE_URL is not set
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://admin:password@db:5432/smartcanteen"
)

# For Supabase, you can also construct the URL from individual components
if not os.getenv("DATABASE_URL"):
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "postgres")
    
    if all([db_user, db_password, db_host]):
        SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        logger.info(f"Using constructed database URL with host: {db_host}")

logger.info(f"Connecting to database at: {SQLALCHEMY_DATABASE_URL.split('@')[1] if '@' in SQLALCHEMY_DATABASE_URL else 'unknown'}")

# Create SQLAlchemy engine with connection pooling optimized for Supabase
# Supabase free tier has connection limits, so we use conservative pool settings
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # Test connections before using them
    pool_recycle=300,    # Recycle connections after 5 minutes (important for Supabase)
    pool_size=5,         # Maximum number of connections to keep in pool (conservative for free tier)
    max_overflow=2,      # Allow up to 2 connections beyond pool_size if needed
    connect_args={
        "connect_timeout": 10,  # 10 second connection timeout
        "options": "-c timezone=utc"  # Set timezone to UTC
    }
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