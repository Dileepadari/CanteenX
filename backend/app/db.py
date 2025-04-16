import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

# Get database connection details from environment variables
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "smartcanteen")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "admin-pass")

@contextmanager
def get_db_connection():
    """
    Context manager for database connections.
    Automatically closes connection when done.
    """
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        yield conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise
    finally:
        if conn is not None:
            conn.close()

@contextmanager
def get_db_cursor(commit=True):
    """
    Context manager for database cursors.
    Automatically commits and closes cursor when done.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception as e:
            conn.rollback()
            print(f"Database transaction error: {e}")
            raise
        finally:
            cursor.close() 