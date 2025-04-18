"""
Standalone script to initialize the database.
Run this with Python directly from the backend directory.
"""

import sys
import os

# Add the parent directory to the path so app module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.mock_data import initialize_mock_data
from app.core.database import Base, engine

def main():
    print("Initializing database...")
    
    # First, create all tables
    Base.metadata.create_all(bind=engine)
    print("Tables created.")
    
    # Then add mock data
    initialize_mock_data()
    print("Database initialization complete.")

if __name__ == "__main__":
    main() 