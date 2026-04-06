from fastapi import APIRouter
from app.core.database import db
import json
from httpx import AsyncClient

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"

async def get_llama_insights(data_summary):
    prompt = f"""
    You are an Elite Financial Strategist AI. Analyze the following user financial data and provide a concise, high-impact strategic report.
    DATA: {json.dumps(data_summary)}
    
    Provide:
    1. A single sentence 'analysis' (Wealth status summary).
    2. One 'warning' (Specific leakage or risk).
    3. One 'command' (Next logical financial action).
    4. One 'forecast' (Future growth projection).
    
    Response must be ONLY JSON. NO OTHER TEXT.
    Structure:
    {{
        "analysis": "...",
        "warning": "...",
        "command": "...",
        "forecast": "..."
    }}
    """
    
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }
    
    try:
        async with AsyncClient() as client:
            response = await client.post(OLLAMA_URL, json=payload, timeout=30.0)
            if response.status_code == 200:
                resp_json = response.json()
                raw_text = resp_json.get("response", "{}")
                # Strip markdown code blocks if any
                clean_text = raw_text.strip().replace("```json", "").replace("```", "")
                return json.loads(clean_text)
    except Exception as e:
        print(f"Llama 3 Error: {e}")
        return None

@router.get("/analyze")
async def get_ai_analysis():
    spending = await db.spending.find().to_list(1000)
    reserves = await db.reserves.find().to_list(1000)
    
    # 1. COMPUTE CORE METRICS
    total_spending = sum(s.get("amount", 0) for s in spending)
    total_assets = sum(i.get("balance", 0) for i in reserves if i.get("account_type") != "CREDIT_CARD")
    total_liabilities = sum(i.get("balance", 0) for i in reserves if i.get("account_type") == "CREDIT_CARD")
    net_worth = total_assets - total_liabilities
    
    # Format Summary for AI
    data_summary = {
        "total_spending": total_spending,
        "total_assets": total_assets,
        "total_debts": total_liabilities,
        "net_worth": net_worth,
        "categories": list(set(s.get("category") for s in spending))[:10]
    }

    # 2. GET LLAMA BRAIN
    llama_insights = await get_llama_insights(data_summary)

    # 3. SCORE CALIBRATION
    score = 70
    if total_liabilities > (total_assets * 0.4): score -= 25
    if total_assets > (total_spending * 5): score += 20

    # Calculate Runway (Months of survival)
    avg_monthly_burn = total_spending / (len(spending)/30 if spending else 1) or 1
    runway = total_assets / avg_monthly_burn
    
    # JSON doesn't support Infinity/NaN. Clip at 99.9 for UI perfection.
    safe_runway = min(99.9, runway) if runway != float('inf') else 99.9
    safe_efficiency = min(10.0, total_assets / (total_spending + 1))

    # 4. FINAL RESPONSE
    return {
        "score": min(100, max(0, int(score))),
        "status": "ELITE" if score > 85 else "SECURE" if score > 65 else "CRITICAL",
        "current_state": llama_insights.get("analysis") if llama_insights else f"Net worth at ₹{net_worth:,.2f}.",
        "avoid_unwanted": llama_insights.get("warning") if llama_insights else "High liability ratio detected.",
        "control_spending": llama_insights.get("command") if llama_insights else "Clear credit card outstandings.",
        "future_savings": llama_insights.get("forecast") if llama_insights else "Projected asset growth: 12% p.a.",
        "metrics": {
            "net_worth": net_worth,
            "debt_ratio": round((total_liabilities / (total_assets + 1)) * 100, 2),
            "efficiency_index": round(safe_efficiency, 1),
            "safety_runway": round(safe_runway, 1)
        }
    }
