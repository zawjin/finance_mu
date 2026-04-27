import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.getcwd())

from app.core.config import settings

async def check_users():
    print(f"Connecting to: {settings.DB_NAME}")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DB_NAME]
    
    try:
        users = await db.users.find().to_list(10)
        print(f"Users found: {len(users)}")
        for u in users:
            print(f"Username: {u.get('username')}, Role ID: {u.get('role_id')}")
        
        roles = await db.roles.find().to_list(10)
        print(f"\nRoles found: {len(roles)}")
        for r in roles:
            print(f"Role: {r.get('role_name')}, ID: {r.get('_id')}")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(check_users())
