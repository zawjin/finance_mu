import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), "app"))
sys.path.append(os.getcwd())

from app.core.config import settings
import certifi

async def main():
    print(f"Connecting to {settings.DB_NAME}...")
    client = AsyncIOMotorClient(settings.MONGODB_URL, tlsCAFile=certifi.where())
    db = client[settings.DB_NAME]
    
    users_count = await db.users.count_documents({})
    roles_count = await db.roles.count_documents({})
    
    print(f"Total Users: {users_count}")
    print(f"Total Roles: {roles_count}")
    
    if users_count > 0:
        async for user in db.users.find():
            print(f"Found User: {user.get('username')}")
    else:
        print("No users found.")

if __name__ == "__main__":
    asyncio.run(main())
