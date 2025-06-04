import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

from database import engine
from models import Base, User

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_db():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if demo user exists
        demo_user = db.query(User).filter(User.email == "demo@k8sdash.com").first()
        
        if not demo_user:
            # Create demo user
            hashed_password = get_password_hash("demo123")
            demo_user = User(
                email="demo@k8sdash.com",
                name="Demo User",
                hashed_password=hashed_password,
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            logger.info("Demo user created successfully.")
        else:
            logger.info("Demo user already exists.")
            
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Seeding database...")
    seed_db()
    logger.info("Database seeding completed.") 