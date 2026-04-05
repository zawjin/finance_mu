from fastapi import APIRouter, HTTPException
from app.models.schemas import SpendingItem, InvestmentItem, CategorySchema, DebtItem
from app.core.database import db
from bson import ObjectId
import urllib.request
import json
import httpx
from app.core.config import settings

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

@router.put("/spending/{item_id}")
async def update_spending(item_id: str, item: SpendingItem):
    await db.spending.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict(exclude={"id"})})
    return {"status": "ok"}

@router.delete("/spending/{item_id}")
async def delete_spending(item_id: str):
    await db.spending.delete_one({"_id": ObjectId(item_id)})
    return {"status": "ok"}

@router.get("/investments")
async def get_investments():
    cursor = db.investments.find().sort("date", -1)
    return [format_doc(doc) async for doc in cursor]

@router.post("/investments")
async def add_investment(item: InvestmentItem):
    result = await db.investments.insert_one(item.dict(exclude={"id"}))
    return {"id": str(result.inserted_id)}

@router.put("/investments/{item_id}")
async def update_investment(item_id: str, item: InvestmentItem):
    await db.investments.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict(exclude={"id"})})
    return {"status": "ok"}

@router.delete("/investments/{item_id}")
async def delete_investment(item_id: str):
    await db.investments.delete_one({"_id": ObjectId(item_id)})
    return {"status": "ok"}

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

# Asset Classes (Investment Categories)
@router.get("/asset_classes")
async def get_asset_classes():
    cursor = db.asset_classes.find().sort("name", 1)
    return [format_doc(doc) async for doc in cursor]

@router.post("/asset_classes")
async def add_asset_class(cat: CategorySchema):
    result = await db.asset_classes.insert_one(cat.dict())
    return {"id": str(result.inserted_id)}

@router.put("/asset_classes/{cat_id}")
async def update_asset_class(cat_id: str, cat: CategorySchema):
    await db.asset_classes.update_one({"_id": ObjectId(cat_id)}, {"$set": cat.dict()})
    return {"status": "ok"}

@router.delete("/asset_classes/{cat_id}")
async def delete_asset_class(cat_id: str):
    await db.asset_classes.delete_one({"_id": ObjectId(cat_id)})
    return {"status": "ok"}

# DEBT LEDGER ENDPOINTS
@router.get("/debt")
async def get_debt():
    cursor = db.debt.find().sort("date", -1)
    return [format_doc(doc) async for doc in cursor]

@router.post("/debt")
async def add_debt(item: DebtItem):
    result = await db.debt.insert_one(item.dict(exclude={"id"}))
    return {"id": str(result.inserted_id)}

@router.put("/debt/{item_id}")
async def update_debt(item_id: str, item: DebtItem):
    await db.debt.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict(exclude={"id"})})
    return {"status": "ok"}

@router.delete("/debt/{item_id}")
async def delete_debt(item_id: str):
    await db.debt.delete_one({"_id": ObjectId(item_id)})
    return {"status": "ok"}

@router.get("/summary")
async def get_summary():
    spending = await db.spending.find().to_list(2000)
    investments = await db.investments.find().to_list(100)
    debt = await db.debt.find().to_list(500)
    
    # Hardened Summary Logic
    total_spending = sum(item.get("amount", 0.0) for item in spending)
    
    total_active_value = 0.0
    total_withdrawn = 0.0
    total_invested_value = 0.0
    
    monthly_spending = {}
    category_spending = {}
    daily_spending = {}
    investment_breakdown = {}
    
    for item in spending:
        m = (item.get("date") or "2024-01")[:7] 
        d = item.get("date") or "2024-01-01"
        cat = item.get("category") or "General"
        val = item.get("amount", 0.0)
        monthly_spending[m] = monthly_spending.get(m, 0.0) + val
        category_spending[cat] = category_spending.get(cat, 0.0) + val
        daily_spending[d] = daily_spending.get(d, 0.0) + val
        
    for item in investments:
        t = item.get("type", "Others")
        val = float(item.get("value", 0.0))
        
        # Aggregate withdrawals for this specific item
        withdrawals = item.get("withdrawals", [])
        w_total = sum(float(w.get("amount", 0)) for w in withdrawals)
        total_withdrawn += w_total
        
        # Net Active Value (Current Value minus what we've already pulled out)
        net_val = val - w_total
        total_active_value += net_val
        
        qty = item.get("quantity")
        buy = item.get("buy_price")
        item_invested = (float(qty) * float(buy)) if (qty is not None and buy is not None) else float(val)
        
        if t == 'Local Investment' and (qty is None or buy is None) and val > 0 and item.get('date'):
            try:
                from datetime import datetime
                acq_date = datetime.strptime(item['date'], '%Y-%m-%d')
                days_diff = (datetime.now() - acq_date).days
                val = float(val) + (float(val) * 0.065 * (days_diff / 365.25))
            except: pass
            
        total_invested_value += item_invested
        if t not in investment_breakdown: investment_breakdown[t] = {"current": 0.0, "invested": 0.0, "withdrawn": 0.0}
        investment_breakdown[t]["current"] += float(net_val)
        investment_breakdown[t]["invested"] += float(item_invested)
        investment_breakdown[t]["withdrawn"] += float(w_total)
        
    for t in investment_breakdown:
        curr = investment_breakdown[t]["current"]
        inv = investment_breakdown[t]["invested"]
        investment_breakdown[t]["profit_pct"] = ((curr - inv) / inv * 100) if inv > 0 else 0.0

    # Debt Summary
    total_owed_to_me = sum(d.get("amount", 0) for d in debt if d.get("direction") == "OWED_TO_ME" and d.get("status") != "SETTLED")
    total_i_owe = sum(d.get("amount", 0) for d in debt if d.get("direction") == "I_OWE" and d.get("status") != "SETTLED")

    return {
        "total_spending": total_spending,
        "total_investment": total_active_value, 
        "total_invested": total_invested_value,
        "total_withdrawn": total_withdrawn,
        "overall_profit_pct": ((total_active_value + total_withdrawn - total_invested_value) / total_invested_value * 100) if total_invested_value > 0 else 0.0,
        "monthly_spending": monthly_spending,
        "category_spending": category_spending,
        "daily_spending": daily_spending,
        "investment_breakdown": investment_breakdown,
        "debt_receivables": total_owed_to_me,
        "debt_liabilities": total_i_owe
    }


# ELITE CHROME HEADERS FOR UPSTREAM RESILIENCE
CHROME_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json'
}

@router.get("/market-price")
async def get_market_price(ticker: str):
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=CHROME_HEADERS) as client:
        try:
            # Screener.in Check
            res = await client.get(f"{settings.SCREENER_BASE_URL}{ticker.upper()}/")
            html = res.text
            if 'Current Price' in html:
                pre = html.split('Current Price')[1]
                price = pre.split('<span class="number">')[1].split('</span>')[0].replace(',', '').strip()
                return {"ticker": ticker, "price": float(price), "source": "Screener.in"}
        except: pass
            
        try:
            # Yahoo Fallback
            y_ticker = ticker if "." in ticker else f"{ticker}.NS"
            res = await client.get(f"{settings.YAHOO_FINANCE_URL}{y_ticker.upper()}")
            data = res.json()
            return {"ticker": ticker, "price": data['chart']['result'][0]['meta']['regularMarketPrice'], "source": "Yahoo"}
        except:
            return {"ticker": ticker, "price": 0.0, "source": "SYNC_FAILED"}

@router.get("/mf-search")
async def search_mutual_fund(q: str):
    async with httpx.AsyncClient(timeout=10.0, headers=CHROME_HEADERS) as client:
        try:
            res = await client.get(f"{settings.MF_SEARCH_URL}{q}")
            return res.json()
        except: return []

@router.get("/mf-nav")
async def get_mf_nav(code: str):
    async with httpx.AsyncClient(timeout=10.0, headers=CHROME_HEADERS) as client:
        try:
            res = await client.get(f"{settings.MF_LATEST_URL}{code}/latest")
            d = res.json()
            return {"nav": float(d['data'][0]['nav']), "scheme_name": d['meta']['scheme_name']}
        except: return {"nav": 0.0, "scheme_name": "API_TIMEOUT"}

@router.get("/ai-insights")
async def get_ai_insights():
    try:
        # Fetch all data for analysis
        spending = await db.spending.find().to_list(1000)
        investments = await db.investments.find().to_list(1000)
        
        # 1. Total Wealth calculation
        total_assets = sum(i.get('value', 0) for i in investments)
        
        # 2. Portfolio Mix Analysis
        mix = {}
        for i in investments:
            t = i.get('type')
            mix[t] = mix.get(t, 0) + i.get('value', 0)
            
        # 3. Intelligence Generation
        insights = []
        
        # Tip 1: Portfolio Concentration Check
        stocks_val = mix.get('Stocks', 0)
        if total_assets > 0:
            if stocks_val > (total_assets * 0.7):
                insights.append({
                    "title": "AGGRESSIVE CONCENTRATION",
                    "desc": "Your Stock exposure is high (70%+). Consider diversifying into Gold or Property.",
                    "type": "risk"
                })
            else:
                insights.append({
                    "title": "BALANCED ALLOCATION",
                    "desc": "Your asset diversification is healthy and ready for long-term growth.",
                    "type": "success"
                })
        
        return insights
    except Exception as e:
        print(f"AI ERROR: {e}")
        return []

# NEW: MARKET ENGINE MANIFEST
async def sync_all_prices():
    """Neural hub for background asset price auditing"""
    investments = await db.investments.find().to_list(1000)
    for item in investments:
        try:
            ticker = item.get("ticker")
            asset_type = item.get("type")
            
            if ticker and asset_type in ["Stocks", "ETFs"]:
                # Logic for Stock Price Fetch
                pass # Sync logic goes here internally
            elif asset_type == "Mutual Funds" and item.get("sub_category") and item["sub_category"] != "-":
                # Logic for MF Nav Fetch
                pass
        except Exception as e:
            print(f"SYNC ITEM ERROR: {e}")
    return {"status": "sync_task_triggered"}
