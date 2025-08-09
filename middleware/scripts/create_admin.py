import argparse
import getpass
import sys
import os
import secrets
from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId

# Add the parent directory to Python path so we can import from project
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import MONGO_URI

def create_admin(email, password=None):
    """Create or promote a user to admin status"""
    
    # Connect to MongoDB
    client = MongoClient(MONGO_URI)
    db = client.codease
    users_collection = db.admin
    
    # Check if user exists
    user = users_collection.find_one({"email": email})
    
    if user:
        # User exists, promote to admin
        if password:
            # We're using direct password comparison for simplicity
            # In a production app, you should hash passwords with bcrypt or similar
            result = users_collection.update_one(
                {"email": email},
                {"$set": {"is_admin": True, "status": "active", "password": password}}
            )
        else:
            result = users_collection.update_one(
                {"email": email},
                {"$set": {"is_admin": True, "status": "active"}}
            )
        
        print(f"User {email} updated and promoted to admin")
    else:
        # Create new admin user
        if not password:
            raise ValueError("Password required for new user")
        
        new_user = {
            "email": email,
            "password": password,  # Should be hashed in production
            "is_admin": True,
            "status": "active",
            "credits": 0,
            "created_at": datetime.utcnow()
        }
        users_collection.insert_one(new_user)
        print(f"Created new admin user: {email}")
    
    client.close()
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create or promote a user to admin status")
    parser.add_argument("email", help="Email address of the user to promote")
    parser.add_argument("--password", help="Set password (if omitted, will prompt or keep existing)")
    args = parser.parse_args()
    
    password = args.password
    if not password:
        client = MongoClient(MONGO_URI)
        db = client.codease
        users_collection = db.admin
        
        user = users_collection.find_one({"email": args.email})
        client.close()
        
        if not user:
            password = getpass.getpass("Enter password for new admin: ")
    
    create_admin(args.email, password)