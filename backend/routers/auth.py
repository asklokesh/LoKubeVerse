from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from db import get_db
import crud
import schemas
from auth_service import AuthService

router = APIRouter(tags=["auth", "authentication"])
security = HTTPBearer()
auth_service = AuthService()

# Pydantic models
class UserLogin(schemas.UserLogin):
    pass

class UserRegister(schemas.UserRegister):
    pass

class TokenResponse(schemas.TokenResponse):
    pass

class UserResponse(schemas.UserResponse):
    pass

@router.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Login with username/email and password"""
    try:
        # Try to find user by username first, then by email
        user = crud.get_user_by_username(db, username)
        if not user:
            user = crud.get_user_by_email(db, username)
        
        if not user or not auth_service.verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials"
            )
        
        # Generate access token
        access_token = auth_service.create_access_token({"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
            "expires_in": 1440  # 24 hours in minutes
    }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/register", status_code=201)
async def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Create user using existing CRUD function
        user_create = schemas.UserCreate(email=user.email, password=user.password)
        db_user = crud.create_user(db, user_create)
        
        return {
            "message": "User registered successfully",
            "user_id": db_user.id,
            "email": db_user.email
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_me(
    credentials: str = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    try:
        # Extract token from credentials
        token = credentials.credentials
        payload = auth_service.decode_access_token(token)
        email = payload.get("sub")
        
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = crud.get_user_by_email(db, email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return schemas.UserResponse(
            user_id=user.id,
            username=user.username,
            email=user.email,
            permissions=[]  # TODO: Add actual permissions
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/logout")
async def logout():
    """Logout user (client should remove token)"""
    return {"message": "Logged out successfully"}

@router.get("/verify")
async def verify_token(credentials: str = Depends(security)):
    """Verify if token is valid"""
    try:
        token = credentials.credentials
        payload = auth_service.decode_access_token(token)
        
        if payload:
            return {"valid": True, "user": payload.get("sub")}
        else:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
