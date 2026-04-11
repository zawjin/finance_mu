from fastapi import APIRouter, HTTPException
from app.models.schemas import SpendingItem, InvestmentItem, CategorySchema, DebtItem, ReserveItem, YearlyExpenseItem, PrivateLendingItem
from app.core.database import db
from bson import ObjectId
import urllib.request
import json
import httpx
from datetime import datetime
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
    # For credit card payments, default to unsettled until bill is paid
    if item.payment_method == "CARD":
        item.is_settled = False
    result = await db.spending.insert_one(item.dict(exclude={"id"}))
    # Auto-deduct from reserve if a payment source is linked
    if item.payment_source_id:
        try:
            target_reserve = await db.reserves.find_one({"_id": ObjectId(item.payment_source_id)})
            if target_reserve:
                adj = -float(item.amount)
                await db.reserves.update_one(
                    {"_id": ObjectId(item.payment_source_id)},
                    {"$inc": {"balance": round(adj, 2)}}
                )
        except Exception as e:
            print(f"Reserve deduction error: {e}")
    return {"id": str(result.inserted_id)}

@router.put("/spending/{item_id}")
async def update_spending(item_id: str, item: SpendingItem):
    old_item = await db.spending.find_one({"_id": ObjectId(item_id)})
    if not old_item:
        return {"error": "Not found"}

    # Calculate net changes for balance reconciliation
    # 1. Total spent change: new_amount - old_amount
    # 2. Total recovered change: new_recovered - old_recovered
    # Total account adjustment = -(amount_change) + (recovered_change)
    
    amt_diff = float(item.amount) - float(old_item.get("amount", 0))
    rec_diff = float(item.recovered) - float(old_item.get("recovered", 0))
    
    # Update the record
    await db.spending.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict(exclude={"id"})})
    
    # Reconcile with Reserve if applicable
    source_id = item.payment_source_id or old_item.get("payment_source_id")
    if source_id:
        try:
            target_reserve = await db.reserves.find_one({"_id": ObjectId(source_id)})
            if target_reserve:
                adj = -amt_diff + rec_diff
                await db.reserves.update_one(
                    {"_id": ObjectId(source_id)},
                    {"$inc": {"balance": round(adj, 2)}}
                )
        except Exception as e:
            print(f"Reconciliation error: {e}")

    return {"status": "ok"}

@router.delete("/spending/{item_id}")
async def delete_spending(item_id: str):
    old_item = await db.spending.find_one({"_id": ObjectId(item_id)})
    if not old_item:
        return {"error": "Not found"}

    # Calculate net refund: amount - recovered
    # For liquid: balance + net_refund
    # For card: balance - net_refund (reducing outstanding)
    net_refund = float(old_item.get("amount", 0)) - float(old_item.get("recovered", 0))
    source_id = old_item.get("payment_source_id")

    if source_id:
        try:
            adj = net_refund
            await db.reserves.update_one(
                {"_id": ObjectId(source_id)},
                {"$inc": {"balance": round(adj, 2)}}
            )
        except Exception as e:
            print(f"Delete refund error: {e}")

    await db.spending.delete_one({"_id": ObjectId(item_id)})
    return {"status": "ok"}

@router.get("/investments")
async def get_investments():
    cursor = db.investments.find().sort("date", -1)
    return [format_doc(doc) async for doc in cursor]

@router.post("/investments")
async def add_investment(item: InvestmentItem):
    result = await db.investments.insert_one(item.dict(exclude={"id"}))
    # Auto-deduct from reserve if a payment source is linked
    if item.payment_source_id:
        try:
            target_reserve = await db.reserves.find_one({"_id": ObjectId(item.payment_source_id)})
            if target_reserve:
                adjustment = -float(item.value)
                await db.reserves.update_one(
                    {"_id": ObjectId(item.payment_source_id)},
                    {"$inc": {"balance": round(adjustment, 2)}}
                )
        except Exception as e:
            print(f"Reserve deduction error: {e}")
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

# YEARLY FIXED EXPENSES ENDPOINTS
@router.get("/yearly-expenses")
async def get_yearly_expenses():
    cursor = db.yearly_expenses.find().sort("name", 1)
    return [format_doc(doc) async for doc in cursor]

@router.post("/yearly-expenses")
async def add_yearly_expense(item: YearlyExpenseItem):
    result = await db.yearly_expenses.insert_one(item.dict(exclude={"id"}))
    return {"id": str(result.inserted_id)}

@router.put("/yearly-expenses/{item_id}")
async def update_yearly_expense(item_id: str, item: YearlyExpenseItem):
    await db.yearly_expenses.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict(exclude={"id"})})
    return {"status": "ok"}

@router.delete("/yearly-expenses/{item_id}")
async def delete_yearly_expense(item_id: str):
    await db.yearly_expenses.delete_one({"_id": ObjectId(item_id)})
    return {"status": "ok"}

# RESERVES / LIQUIDITY ENDPOINTS
@router.get("/reserves")
async def get_reserves():
    cursor = db.reserves.find().sort("account_name", 1)
    return [format_doc(doc) async for doc in cursor]

@router.post("/reserves")
async def add_reserve(item: ReserveItem):
    result = await db.reserves.insert_one(item.dict(exclude={"id"}))
    return {"id": str(result.inserted_id)}

@router.put("/reserves/{item_id}")
async def update_reserve(item_id: str, item: ReserveItem):
    await db.reserves.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict(exclude={"id"})})
    return {"status": "ok"}

@router.delete("/reserves/{item_id}")
async def delete_reserve(item_id: str):
    await db.reserves.delete_one({"_id": ObjectId(item_id)})
    return {"status": "ok"}

# PRIVATE LENDING REGISTRY ENDPOINTS
@router.get("/private-lending")
async def get_private_lending():
    cursor = db.private_lending.find().sort("start_date", -1)
    items = []
    async for doc in cursor:
        items.append(format_doc(doc))
    return items

@router.post("/private-lending")
async def add_private_lending(item: PrivateLendingItem):
    result = await db.private_lending.insert_one(item.dict(exclude={"id"}))
    return {"id": str(result.inserted_id)}

@router.put("/private-lending/{item_id}")
async def update_private_lending(item_id: str, item: PrivateLendingItem):
    await db.private_lending.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict(exclude={"id"})})
    return {"status": "ok"}

@router.delete("/private-lending/{item_id}")
async def delete_private_lending(item_id: str):
    await db.private_lending.delete_one({"_id": ObjectId(item_id)})
    return {"status": "ok"}

@router.get("/summary")
async def get_summary():
    spending = await db.spending.find().to_list(2000)
    investments = await db.investments.find().to_list(100)
    debt = await db.debt.find().to_list(500)
    reserves = await db.reserves.find().to_list(100)
    lending = await db.private_lending.find().to_list(100)
    
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
        
        # Legacy Local Investment Logic in Investments Collection
        if t == 'Local Investment' and (qty is None or buy is None) and val > 0 and item.get('date'):
            try:
                acq_date = datetime.strptime(item['date'], '%Y-%m-%d')
                days_diff = (datetime.now() - acq_date).days
                val = float(val) + (float(val) * 0.065 * (days_diff / 365.25))
            except: pass
            
        total_invested_value += item_invested
        if t not in investment_breakdown: investment_breakdown[t] = {"current": 0.0, "invested": 0.0, "withdrawn": 0.0}
        investment_breakdown[t]["current"] += float(net_val)
        investment_breakdown[t]["invested"] += float(item_invested)
        investment_breakdown[t]["withdrawn"] += float(w_total)

    # PRIVATE LENDING INTEGRATION
    total_lending_live = 0.0
    total_lending_principal = 0.0
    for item in lending:
        principal = float(item.get("principal", 0))
        rate = float(item.get("interest_rate", 0.065))
        start_str = item.get("start_date")
        status = item.get("status", "ACTIVE")
        
        if status == "SETTLED":
            w_total = float(item.get("settled_amount", 0))
            total_withdrawn += w_total
            total_invested_value += principal
            
            if "Private Lending" not in investment_breakdown: 
                investment_breakdown["Private Lending"] = {"current": 0.0, "invested": 0.0, "withdrawn": 0.0}
            investment_breakdown["Private Lending"]["invested"] += principal
            investment_breakdown["Private Lending"]["withdrawn"] += w_total
            continue

        try:
            start_date = datetime.strptime(start_str, '%Y-%m-%d')
            days_diff = (datetime.now() - start_date).days
            years = days_diff / 365.25
            
            annual_rate = item.get("interest_rate", 21.9)
            daily_factor = (annual_rate / 100) / 365.25

            if item.get("fixed_valuation") is not None:
                live_val = float(item["fixed_valuation"])
            else:
                live_val = principal + (principal * daily_factor * days_diff)






                
            total_lending_live += live_val
            total_lending_principal += principal
            total_active_value += live_val
            total_invested_value += principal

            if "Private Lending" not in investment_breakdown: 
                investment_breakdown["Private Lending"] = {"current": 0.0, "invested": 0.0, "withdrawn": 0.0}
            investment_breakdown["Private Lending"]["current"] += live_val
            investment_breakdown["Private Lending"]["invested"] += principal
        except: pass
        
    for t in investment_breakdown:
        curr = investment_breakdown[t]["current"]
        inv = investment_breakdown[t]["invested"]
        investment_breakdown[t]["profit_pct"] = ((curr + investment_breakdown[t]["withdrawn"] - inv) / inv * 100) if inv > 0 else 0.0

    # Debt Summary
    total_owed_to_me = sum(d.get("amount", 0) for d in debt if d.get("direction") == "OWED_TO_ME" and d.get("status") != "SETTLED")
    total_i_owe = sum(d.get("amount", 0) for d in debt if d.get("direction") == "I_OWE" and d.get("status") != "SETTLED")

    # Reserve Summary (Net Liquidity Tracking)
    total_reserves = 0.0
    for r in reserves:
        bal = float(r.get("balance", 0.0))
        total_reserves += bal

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
        "debt_liabilities": total_i_owe,
        "total_reserves": total_reserves,
        "lending_active_value": total_lending_live
    }


# ELITE CHROME HEADERS FOR UPSTREAM RESILIENCE
CHROME_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json'
}

@router.get("/market-price")
async def get_market_price(ticker: str):
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=CHROME_HEADERS, verify=False) as client:
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
    async with httpx.AsyncClient(timeout=10.0, headers=CHROME_HEADERS, verify=False) as client:
        try:
            res = await client.get(f"{settings.MF_SEARCH_URL}{q}")
            return res.json()
        except: return []

@router.get("/mf-nav")
async def get_mf_nav(code: str):
    async with httpx.AsyncClient(timeout=10.0, headers=CHROME_HEADERS, verify=False) as client:
        try:
            res = await client.get(f"{settings.MF_LATEST_URL}{code}/latest")
            d = res.json()
            return {"nav": float(d['nav']), "scheme_name": d['meta']['scheme_name']}
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
@router.post("/sync-prices")
async def sync_all_prices():
    """Neural hub for background asset price auditing"""
    investments = await db.investments.find().to_list(1000)
    synced_count = 0
    for item in investments:
        try:
            ticker = item.get("ticker")
            asset_type = (item.get("type") or "").strip()
            asset_type_lower = asset_type.lower()
            
            if not ticker or not asset_type:
                continue

            # Universal Market Engine: Stocks & ETFs
            if "stock" in asset_type_lower or "etf" in asset_type_lower or "equity" in asset_type_lower:
                res = await get_market_price(ticker)
                if res and res.get("price", 0) > 0:
                    new_price = float(res["price"])
                    qty = float(item.get("quantity", 0))
                    # Only update if quantity is available to prevent zeroing out
                    if qty > 0:
                        new_val = new_price * qty
                        await db.investments.update_one(
                            {"_id": item["_id"]},
                            {"$set": {"current_price": new_price, "value": new_val}}
                        )
                        synced_count += 1
            
            # Universal NAV Engine: Mutual Funds & Debt Funds
            elif "mutual" in asset_type_lower or "fund" in asset_type_lower:
                res = await get_mf_nav(ticker)
                if res and res.get("nav", 0) > 0:
                    new_price = float(res["nav"])
                    qty = float(item.get("quantity", 0))
                    if qty > 0:
                        new_val = new_price * qty
                        await db.investments.update_one(
                            {"_id": item["_id"]},
                            {"$set": {"current_price": new_price, "value": new_val}}
                        )
                        synced_count += 1
        except Exception as e:
            print(f"SYNC ITEM ERROR [{item.get('name')}]: {e}")
    return {"status": "sync_task_completed", "updated_count": synced_count}

