import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "REDACTED_ROTATED_SECRET")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
JWT_SECRET = os.getenv("JWT_SECRET", "REDACTED_ROTATED_SECRET")

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "postgres")

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
