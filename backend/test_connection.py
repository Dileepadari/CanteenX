#!/usr/bin/env python3
"""
Test Supabase PostgreSQL connection with SQLAlchemy
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import engine, SessionLocal
from sqlalchemy import text

def test_connection():
    """Test database connection and display info"""
    print("🔌 Testing Supabase PostgreSQL Connection...\n")
    
    try:
        # Test 1: Engine connection
        print("1️⃣ Testing engine connection...")
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"   ✅ Connected to PostgreSQL!")
            print(f"   📊 Version: {version[:50]}...\n")
            
        # Test 2: Session creation
        print("2️⃣ Testing session creation...")
        db = SessionLocal()
        try:
            result = db.execute(text("SELECT current_database(), current_user, inet_server_addr(), inet_server_port()"))
            db_name, user, host, port = result.fetchone()
            print(f"   ✅ Session created successfully!")
            print(f"   📁 Database: {db_name}")
            print(f"   👤 User: {user}")
            print(f"   🌐 Server: {host}:{port}\n")
        finally:
            db.close()
            
        # Test 3: Check connection pool
        print("3️⃣ Checking connection pool...")
        pool = engine.pool
        print(f"   📊 Pool size: {pool.size()}")
        print(f"   🔄 Checked out connections: {pool.checkedout()}")
        print(f"   ⚙️ Pool configuration:")
        print(f"      - pool_size: {engine.pool._pool.maxsize if hasattr(engine.pool, '_pool') else 'N/A'}")
        print(f"      - max_overflow: {engine.pool._max_overflow}")
        print(f"      - pool_recycle: {engine.pool._recycle}\n")
        
        # Test 4: List tables
        print("4️⃣ Listing existing tables...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """))
            tables = result.fetchall()
            if tables:
                print(f"   📋 Found {len(tables)} table(s):")
                for table in tables:
                    print(f"      - {table[0]}")
            else:
                print("   ℹ️ No tables found (run migrations to create tables)")
            print()
            
        print("=" * 60)
        print("✅ All connection tests PASSED!")
        print("=" * 60)
        print("\n💡 Next steps:")
        print("   1. Run migrations: cd backend && alembic upgrade head")
        print("   2. Start backend: uvicorn app.main:app --reload")
        print("   3. Access GraphQL: http://localhost:8000/graphql")
        
        return True
        
    except Exception as e:
        print("=" * 60)
        print("❌ Connection FAILED!")
        print("=" * 60)
        print(f"\n🐛 Error: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Check .env file exists in backend/")
        print("   2. Verify DATABASE_URL is correct")
        print("   3. Ensure Supabase project is active")
        print("   4. Check your internet connection")
        print("   5. Verify credentials are correct")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
