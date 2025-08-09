from fastapi import Depends, HTTPException, status, Cookie, Request, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from database import user_collection, admin_collection
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import auth, credentials
from config import FIREBASE_CREDENTIALS_PATH, JWT_SECRET_KEY
import jwt
import os
import secrets
from bson.objectid import ObjectId

security = HTTPBearer(auto_error=False)


# JWT configuration
SECRET_KEY = JWT_SECRET_KEY
ALGORITHM = "HS256"

# Initialize Firebase Admin SDK (add this)
cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)

firebase_admin.initialize_app(cred)

# Authentication header
API_KEY_HEADER = APIKeyHeader(name="Authorization", auto_error=False)

async def get_current_user(token: str = Depends(API_KEY_HEADER)):
    if not token:
        raise HTTPException(
            status_code=401,
            detail="No authorization token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if token.lower().startswith('bearer '):
        token = token.split(' ')[1]
    
    try:
        # Verify Firebase ID token instead of comparing raw UIDs
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        
        # Look for user in user_collection
        user = user_collection.find_one({"uid": uid})
        
        if not user:
            # User exists in Firebase but not in your database
            # You may want to create the user or handle this case
            raise HTTPException(
                status_code=401,
                detail="User not found in database",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
        
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid ID token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=401, 
            detail="Expired ID token", 
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    
async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    """Simple admin authentication that checks for a valid JWT token in the Authorization header"""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
        
    try:
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized as admin"
            )
            
        return payload
        
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_optional(
    authorization: Optional[str] = Header(None)
) -> Optional[Dict[str, Any]]:
    """
    Get the current user if authenticated, return None if not.
    This is used for endpoints where authentication is optional.
    """
    if not authorization:
        return None
    
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None