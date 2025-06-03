#!/usr/bin/env python
"""Database initialization script"""

import logging
from db import engine, SQLALCHEMY_DATABASE_URL
from models import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """Initialize database tables"""
    try:
        logger.info(f"Connecting to database: {SQLALCHEMY_DATABASE_URL}")
        
        # Test database connection
        with engine.connect() as conn:
            logger.info("Database connection successful")
        
        # Create all tables
        logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    init_db() 