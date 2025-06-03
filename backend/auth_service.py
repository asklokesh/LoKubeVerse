from datetime import datetime, timedelta, UTC
from typing import Optional, Dict, Any
import jwt
import hashlib
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext

JWT_SECRET = "your-super-secret-jwt-key-change-in-production"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Authentication service for handling JWT tokens and user auth"""
    
    # Mock user database - replace with real database in production
    MOCK_USERS = {
        "admin": {
            "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
            "permissions": ["cluster:read", "cluster:write", "namespace:read", 
                          "namespace:write", "workload:read", "workload:write"],
            "user_id": "admin-001",
            "email": "admin@k8sdash.com"
        },
        "developer": {
            "password_hash": hashlib.sha256("dev123".encode()).hexdigest(),
            "permissions": ["cluster:read", "namespace:read", "workload:read"],
            "user_id": "dev-001", 
            "email": "dev@k8sdash.com"
        },
        "viewer": {
            "password_hash": hashlib.sha256("view123".encode()).hexdigest(),
            "permissions": ["cluster:read"],
            "user_id": "view-001",
            "email": "viewer@k8sdash.com"
        }
    }
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against stored hash using bcrypt"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(UTC) + expires_delta
        else:
            expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "iat": datetime.now(UTC)})
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with username and password"""
        if username not in self.MOCK_USERS:
            return None
        stored_hash = self.MOCK_USERS[username]["password_hash"]
        if self.verify_password(password, stored_hash):
            return self.MOCK_USERS[username]
        return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user data by username"""
        return self.MOCK_USERS.get(username)
    
    def register_user(self, username: str, password: str, email: str) -> Dict[str, Any]:
        """Register new user - simple implementation"""
        if username in self.MOCK_USERS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        password_hash = self.hash_password(password)
        user_id = f"{username}-{len(self.MOCK_USERS) + 1:03d}"
        
        self.MOCK_USERS[username] = {
            "password_hash": password_hash,
            "permissions": ["cluster:read"],  # Default permissions
            "user_id": user_id,
            "email": email
        }
        
        return {
            "user_id": user_id,
            "username": username,
            "email": email,
            "message": "User registered successfully"
        }
    
    def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
        """FastAPI dependency to get current authenticated user"""
        return self.verify_token(credentials.credentials)
    
    def decode_access_token(self, token: str) -> Dict[str, Any]:
        """Decode and validate JWT access token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
