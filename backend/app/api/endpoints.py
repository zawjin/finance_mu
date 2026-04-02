from fastapi import APIRouter
from app.models.schemas import SpendingItem, InvestmentItem, CategorySchema
from app.core.database import db

router = APIRouter()

# Helper to format MongoDB objects
def format_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@router.get("/spending")
async def get_spending():
    cursor = db.spending.find().sort("date", -1)
    return [format_doc(doc) async for doc in cursor]

@router.post("/spending")
async def add_spending(item: SpendingItem):
    result = await db.spending.insert_one(item.dict(exclude={"id"}))
    return {"id": str(result.inserted_id)}

@router.get("/investments")
async def get_investments():
    cursor = db.investments.find().sort("date", -1)
    return [format_doc(doc) async for doc in cursor]

from bson import ObjectId

@router.get("/categories")
async def get_categories():
    cursor = db.categories.find().sort("name", 1)
    return [format_doc(doc) async for doc in cursor]

@router.post("/categories")
async def add_category(cat: CategorySchema):
    await db.categories.insert_one(cat.dict())
    return {"status": "ok"}

@router.put("/categories/{cat_id}")
async def update_category(cat_id: str, cat: CategorySchema):
    await db.categories.update_one({"_id": ObjectId(cat_id)}, {"$set": cat.dict()})
    return {"status": "ok"}

@router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str):
    await db.categories.delete_one({"_id": ObjectId(cat_id)})
    return {"status": "ok"}

@router.get("/summary")
async def get_summary():
    spending = await db.spending.find().to_list(2000)
    investments = await db.investments.find().to_list(100)
    
    total_spending = sum(item["amount"] for item in spending)
    total_investment = sum(item["value"] for item in investments)
    
    monthly_spending = {}
    category_spending = {}
    daily_spending = {}
    investment_breakdown = {}
    
    for item in spending:
        m = item["date"][:7] # YYYY-MM
        d = item["date"] # YYYY-MM-DD
        cat = item["category"]
        monthly_spending[m] = monthly_spending.get(m, 0) + item["amount"]
        category_spending[cat] = category_spending.get(cat, 0) + item["amount"]
        daily_spending[d] = daily_spending.get(d, 0) + item["amount"]
        
    for item in investments:
        t = item["type"]
        investment_breakdown[t] = investment_breakdown.get(t, 0) + item["value"]
        
    return {
        "total_spending": total_spending,
        "total_investment": total_investment,
        "monthly_spending": monthly_spending,
        "category_spending": category_spending,
        "daily_spending": daily_spending,
        "investment_breakdown": investment_breakdown
    }
