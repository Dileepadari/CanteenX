"""
Script to initialize the database with tables and mock data.
Run this script to reset the database with fresh mock data.
"""

from app.mock_data import initialize_mock_data

if __name__ == "__main__":
    initialize_mock_data() 