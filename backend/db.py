from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use environment variable for database URL with fallback to SQLite for local development
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./test.db"  # Use SQLite for testing when not in Docker
)

# If using PostgreSQL, handle connection issues gracefully
if SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
    try:
        # Test connection
        test_engine = create_engine(SQLALCHEMY_DATABASE_URL)
        test_engine.connect()
    except Exception:
        # Fallback to SQLite for local testing
        SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 