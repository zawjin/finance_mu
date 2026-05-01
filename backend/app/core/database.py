from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

import certifi

# HIGH-RESILIENCE DATABASE LINK
client = AsyncIOMotorClient(
    settings.MONGODB_URL, 
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000, # Fail fast if cloud is blocked
    connectTimeoutMS=5000
)
db = client[settings.DB_NAME]

async def init_db():
    from app.core.security import get_password_hash
    
    # 1. Initialize Roles
    role_id = None
    existing_role = await db.roles.find_one({"role_name": "Super Admin"})
    
    if not existing_role:
        super_admin_role = {
            "role_name": "Super Admin",
            "permissions": [
                {"module_name": "Dashboard", "can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
                {"module_name": "User Management", "can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
                {"module_name": "Role Management", "can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
                {"module_name": "Settings", "can_view": True, "can_create": True, "can_edit": True, "can_delete": True},
            ]
        }
        result = await db.roles.insert_one(super_admin_role)
        role_id = str(result.inserted_id)
        print("AUTH SYSTEM: Super Admin role created.")
    else:
        role_id = str(existing_role["_id"])

    # 2. Create Initial Super Admin User
    if await db.users.count_documents({"username": "admin"}) == 0:
        await db.users.insert_one({
            "username": "admin",
            "password": get_password_hash("admin123"),
            "mobile": "0000000000",
            "role_id": role_id,
            "status": "ACTIVE"
        })
        print("AUTH SYSTEM: Default Super Admin created (admin / admin123)")
    # Database seeded and ready
