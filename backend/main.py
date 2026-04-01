from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, date, timedelta
import uvicorn
import os
import random

app = FastAPI(title="FRIDAY Enterprise Finance API")

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Configuration
MONGODB_URL = "mongodb://localhost:27017/?retryWrites=true&loadBalanced=false&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&3t.uriVersion=3&3t.connection.name=gold_pm_data&3t.alwaysShowAuthDB=true&3t.alwaysShowDBFromUserRole=true"
client = AsyncIOMotorClient(MONGODB_URL)
db = client.finance_db

# Models
class SpendingItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    date: str # ISO Format YYYY-MM-DD
    amount: float
    category: str
    sub_category: str
    description: str # The 'Details' field

class InvestmentItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    type: str # Gold, Property, Cash, etc.
    name: str # The asset title
    value: float
    date: str
    details: str # Historical or metadata

class CategorySchema(BaseModel):
    name: str
    sub_categories: List[str] = []

# Helper to format MongoDB objects
def format_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# Endpoints
@app.get("/api/spending")
async def get_spending():
    cursor = db.spending.find().sort("date", -1)
    return [format_doc(doc) async for doc in cursor]

@app.post("/api/spending")
async def add_spending(item: SpendingItem):
    result = await db.spending.insert_one(item.dict(exclude={"id"}))
    return {"id": str(result.inserted_id)}

@app.get("/api/investments")
async def get_investments():
    cursor = db.investments.find().sort("date", -1)
    return [format_doc(doc) async for doc in cursor]

@app.get("/api/categories")
async def get_categories():
    cursor = db.categories.find().sort("name", 1)
    return [format_doc(doc) async for doc in cursor]

@app.post("/api/categories")
async def add_category(cat: CategorySchema):
    await db.categories.insert_one(cat.dict())
    return {"status": "ok"}

@app.get("/api/summary")
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

# Comprehensive Initialization
@app.on_event("startup")
async def startup_db_client():
    # Only seed if collection is very small or empty to ensure persistence
    if await db.categories.count_documents({}) < 5:
        await db.categories.delete_many({})
        await db.categories.insert_many([
            {"name": "Family care", "sub_categories": ["Parents", "Kids", "Gifts", "Events", "Pet Care"]},
            {"name": "Groceries", "sub_categories": ["Weekly Groceries", "Fruits/Veg", "Dairy", "Gourmet"]},
            {"name": "Healthcare", "sub_categories": ["Medicine", "Checkup", "Dental", "Vision", "Therapy"]},
            {"name": "Office", "sub_categories": ["Hardware", "Subscription", "Furniture", "Supplies"]},
            {"name": "Outside food", "sub_categories": ["Dinner Out", "Coffee", "Office Lunch", "Drinks"]},
            {"name": "Shopping", "sub_categories": ["Apparel", "Gadgets", "Personal Care", "Luxury"]},
            {"name": "Transportation", "sub_categories": ["Fuel", "Uber/Taxi", "Maintenance", "Tolls"]},
            {"name": "Utilities", "sub_categories": ["Electricity", "Water", "High-speed Internet", "Mobile"]},
            {"name": "Leisure", "sub_categories": ["Movies", "Gaming", "Travel", "Hobby"]}
        ])

    if await db.investments.count_documents({}) == 0:
        await db.investments.insert_many([
            {"type": "Property", "name": "Vellore Villa", "value": 7500000, "date": "2023-10-12", "details": "4BHK Semi-furnished in prime residential area"},
            {"type": "Gold", "name": "Digital Gold Accumulation", "value": 420000, "date": "2024-05-20", "details": "Stored in secure custodial account"},
            {"type": "Cash", "name": "Liquid Emergency Fund", "value": 150000, "date": "2026-03-31", "details": "HDFC High-interest savings account"},
            {"type": "Property", "name": "Commercial Shop", "value": 3500000, "date": "2025-01-05", "details": "Rented to Retail Pharmacy"}
        ])

    if await db.spending.count_documents({}) < 50:
        await db.spending.delete_many({})
        spending_list = []
        now = datetime.now()
        # Seed 5 years of history (coarse for older years, detailed for latest)
        for i in range(1800): # ~5 years
            day = now - timedelta(days=i)
            # Probability decreases for older years to save space but keep "Years" active
            prob = 0.3 if i > 365 else 1.0 
            if random.random() < prob:
                for _ in range(random.randint(1, 2)):
                    cat = random.choice([
                        ("Groceries", "Weekly Groceries", "Past Mall Visit"),
                        ("Outside food", "Dinner Out", "Family Restaurant"),
                        ("Transportation", "Fuel", "Gas Station"),
                        ("Utilities", "Electricity", "Utility Corp"),
                        ("Shopping", "Apparel", "Fashion Store"),
                        ("Healthcare", "Medicine", "Health Center"),
                        ("Family care", "Gifts", "Gift Shop")
                    ])
                    spending_list.append({
                        "date": day.strftime("%Y-%m-%d"),
                        "amount": round(random.uniform(200, 3500), 2),
                        "category": cat[0],
                        "sub_category": cat[1],
                        "description": f"{cat[2]} - HIST-{day.year}"
                    })
        await db.spending.insert_many(spending_list)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
