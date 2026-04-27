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
    # from datetime import datetime, timedelta
    # import random
    
    # # Only seed if collection is very small or empty to ensure persistence
    # if await db.categories.count_documents({}) < 5:
    #     await db.categories.delete_many({})
    #     await db.categories.insert_many([
    #         {"name": "Family care", "sub_categories": ["Parents", "Kids", "Gifts", "Events", "Pet Care"], "icon": "Heart", "color": "#ff3b30"},
    #         {"name": "Groceries", "sub_categories": ["Weekly Groceries", "Fruits/Veg", "Dairy", "Gourmet"], "icon": "ShoppingCart", "color": "#34c759"},
    #         {"name": "Healthcare", "sub_categories": ["Medicine", "Checkup", "Dental", "Vision", "Therapy"], "icon": "Stethoscope", "color": "#5856d6"},
    #         {"name": "Office", "sub_categories": ["Hardware", "Subscription", "Furniture", "Supplies"], "icon": "Briefcase", "color": "#af52de"},
    #         {"name": "Outside food", "sub_categories": ["Dinner Out", "Coffee", "Office Lunch", "Drinks"], "icon": "Utensils", "color": "#ff9500"},
    #         {"name": "Shopping", "sub_categories": ["Apparel", "Gadgets", "Personal Care", "Luxury"], "icon": "ShoppingBag", "color": "#0071e3"},
    #         {"name": "Transportation", "sub_categories": ["Fuel", "Uber/Taxi", "Maintenance", "Tolls"], "icon": "Car", "color": "#32ade6"},
    #         {"name": "Utilities", "sub_categories": ["Electricity", "Water", "High-speed Internet", "Mobile"], "icon": "Zap", "color": "#ffcc00"},
    #         {"name": "Leisure", "sub_categories": ["Movies", "Gaming", "Travel", "Hobby"], "icon": "Gamepad2", "color": "#ff2d55"}
    #     ])

    # if await db.investments.count_documents({}) == 0:
    #     await db.investments.insert_many([
    #         {"type": "Property", "name": "Vellore Villa", "value": 7500000, "date": "2023-10-12", "details": "4BHK Semi-furnished in prime residential area"},
    #         {"type": "Gold", "name": "Digital Gold Accumulation", "value": 420000, "date": "2024-05-20", "details": "Stored in secure custodial account"},
    #         {"type": "Cash", "name": "Liquid Emergency Fund", "value": 150000, "date": "2026-03-31", "details": "HDFC High-interest savings account"},
    #         {"type": "Property", "name": "Commercial Shop", "value": 3500000, "date": "2025-01-05", "details": "Rented to Retail Pharmacy"}
    #     ])

    # # Spending Seeding deactivated to allow for manual ledger management
    # # if await db.spending.count_documents({}) < 50:
    # #     ...
