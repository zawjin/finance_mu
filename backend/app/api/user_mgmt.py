from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import db
from app.api.auth import get_current_user
from app.models.schemas import UserSchema, RoleSchema, UserResponse
from bson import ObjectId
from typing import List
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["User Management"])

# Helper to check permissions
def check_permission(user: dict, module: str, action: str):
    if not user.get("role"):
        raise HTTPException(status_code=403, detail="No role assigned")
    
    role = user["role"]
    if role["role_name"] == "Super Admin":
        return True
        
    permissions = role.get("permissions", [])
    for p in permissions:
        if p["module_name"] == module:
            if p.get(f"can_{action}"):
                return True
    
    raise HTTPException(status_code=403, detail=f"Insufficient permissions for {module}:{action}")

# --- ROLE MANAGEMENT ---

@router.get("/roles", response_model=List[RoleSchema])
async def get_roles(current_user: dict = Depends(get_current_user)):
    check_permission(current_user, "Role Management", "view")
    roles = await db.roles.find().to_list(100)
    for r in roles:
        r["_id"] = str(r["_id"])
    return roles

@router.post("/roles", response_model=RoleSchema)
async def create_role(role: RoleSchema, current_user: dict = Depends(get_current_user)):
    check_permission(current_user, "Role Management", "create")
    new_role = role.dict(exclude={"id"})
    result = await db.roles.insert_one(new_role)
    new_role["_id"] = str(result.inserted_id)
    return new_role

@router.put("/roles/{role_id}", response_model=RoleSchema)
async def update_role(role_id: str, role: RoleSchema, current_user: dict = Depends(get_current_user)):
    check_permission(current_user, "Role Management", "edit")
    update_data = role.dict(exclude={"id"})
    await db.roles.update_one({"_id": ObjectId(role_id)}, {"$set": update_data})
    update_data["_id"] = role_id
    return update_data

@router.delete("/roles/{role_id}")
async def delete_role(role_id: str, current_user: dict = Depends(get_current_user)):
    check_permission(current_user, "Role Management", "delete")
    await db.roles.delete_one({"_id": ObjectId(role_id)})
    return {"status": "success"}

# --- USER MANAGEMENT ---

@router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(get_current_user)):
    check_permission(current_user, "User Management", "view")
    users = await db.users.find().to_list(100)
    for u in users:
        u["_id"] = str(u["_id"])
        if u.get("role_id"):
            role = await db.roles.find_one({"_id": ObjectId(u["role_id"])})
            if role:
                role["_id"] = str(role["_id"])
                u["role"] = role
    return users

@router.post("/users", response_model=UserResponse)
async def create_user(user: UserSchema, current_user: dict = Depends(get_current_user)):
    check_permission(current_user, "User Management", "create")
    new_user = user.dict(exclude={"id"})
    if new_user.get("password"):
        new_user["password"] = get_password_hash(new_user["password"])
    result = await db.users.insert_one(new_user)
    new_user["_id"] = str(result.inserted_id)
    
    if new_user.get("role_id"):
        role = await db.roles.find_one({"_id": ObjectId(new_user["role_id"])})
        if role:
            role["_id"] = str(role["_id"])
            new_user["role"] = role
            
    return new_user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user: UserSchema, current_user: dict = Depends(get_current_user)):
    check_permission(current_user, "User Management", "edit")
    update_data = user.dict(exclude={"id", "password"})
    if user.password:
        update_data["password"] = get_password_hash(user.password)
    
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    if updated_user:
        updated_user["_id"] = str(updated_user["_id"])
        if updated_user.get("role_id"):
            role = await db.roles.find_one({"_id": ObjectId(updated_user["role_id"])})
            if role:
                role["_id"] = str(role["_id"])
                updated_user["role"] = role
    return updated_user
