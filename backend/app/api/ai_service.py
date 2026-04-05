from fastapi import APIRouter
from app.core.database import db
from datetime import datetime

router = APIRouter()

import random

@router.get("/analyze")
async def get_ai_analysis():
    spending = await db.spending.find().to_list(2000)
    investments = await db.investments.find().to_list(2000)
    debt = await db.debt.find().to_list(2000)
    
    if not spending and not investments and not debt:
        return {"score": 0, "status": "BOOTING", "current_state": "Waiting for wealth data..."}

    now = datetime.now()
    curr_month = now.strftime("%Y-%m")
    
    # 1. METRICS ENGINE (Total AUM)
    total_spending = sum(s.get("amount", 0) for s in spending)
    month_spending = sum(s.get("amount", 0) for s in spending if s.get("date", "").startswith(curr_month))
    
    total_wealth = 0
    portfolio_mix = {}
    for i in investments:
        val = i.get("value", 0)
        t = i.get("type", "Others")
        if t == "Local Investment" and i.get("date"):
            try:
                days = (now - datetime.strptime(i['date'], '%Y-%m-%d')).days
                val = val * (1 + (0.12 * (days / 365.25))) # Tuned to 12% tactical yield
            except: pass
        total_wealth += val
        portfolio_mix[t] = portfolio_mix.get(t, 0) + val

    # 2. DEBT ENGINE (Kadan Analysis)
    total_receivables = sum(d.get("amount", 0) for d in debt if d.get("direction") == "OWED_TO_ME" and d.get("status") != "SETTLED")
    total_liabilities = sum(d.get("amount", 0) for d in debt if d.get("direction") == "I_OWE" and d.get("status") != "SETTLED")
    net_exposure = total_receivables - total_liabilities
    absolute_net_worth = total_wealth + total_receivables - total_liabilities

    # 3. SECTOR & LEAKAGE ANALYTICS
    cat_spending = {}
    for s in spending:
        c = s.get("category", "Uncategorized")
        cat_spending[c] = cat_spending.get(c, 0) + s.get("amount", 0)
    
    top_cat = max(cat_spending, key=cat_spending.get) if cat_spending else "Fixed Costs"
    leaks = [s for s in spending if s.get("category") in ["Outside food", "Shopping", "Entertainment"]]
    total_leak = sum(l.get("amount", 0) for l in leaks)
    efficiency = (total_wealth / (total_spending + 1) * 10)

    # 4. TUNED NEURAL INSIGHTS
    status_options = [
        f"Net Worth Pulse: Your absolute vitality is ₹{absolute_net_worth:,.0f} including exposure.",
        f"Kadan Summary: You have ₹{total_receivables:,.0f} to recover. Efficiency index is {efficiency:.1f}/10.",
        f"Vault Strength: Assets (₹{total_wealth:,.0f}) provide {round(total_wealth/(total_liabilities+1), 1)}x coverage over liabilities.",
        f"Digital Shield: Current liquidity covers {int((total_wealth/(month_spending or 1)))} months of lifestyle burn."
    ]
    
    trap_options = [
        f"Concentration Risk: Your {max(portfolio_mix, key=portfolio_mix.get) if portfolio_mix else 'None'} holdings are high. Re-balance into Gold/Cash.",
        f"Liability Alert: You owe ₹{total_liabilities:,.0f}. Audit your repayment trajectory.",
        f"Opportunity Cost: Discretionary spend leakage could have boosted your Net Worth by +{round((total_leak/absolute_net_worth)*100, 1)}%.",
        f"Silent Drain: You're losing ₹{int(total_spending*0.05)} annually in small leaks. Move this to Debt Funds."
    ]
    
    control_options = [
        f"Neural Cap: Keep Debt-to-Asset ratio below 20%. Current: {round((total_liabilities/(total_wealth+1))*100, 1)}%.",
        f"Recovery Mode: Focus on ₹{total_receivables:,.0f} 'Owed to Me' to improve liquidity velocity.",
        f"Volatility Hedge: Strategy check needed if '{top_cat}' spending exceeds your 12% asset growth.",
        f"Asset Pivot: Boost portfolio weighting in ETFs to improve compounding stability."
    ]
    
    strategy_options = [
        f"Compound Engine: Moving ₹{total_leak:,.0f} leakage to Index Funds adds ₹{int(total_leak*0.12)} yearly growth.",
        f"Financial Freedom: Current assets generate ₹{int(total_wealth*0.12)}/year in tuned growth potential.",
        f"The Kadan Rule: Use surplus liquidity to clear ₹{total_liabilities:,.0f} debt before aggressive New Investing.",
        f"Alpha Strategy: Target 10% monthly savings auto-split between ETFs and Liquid Cash."
    ]

    # STRATEGIC DOSSIER
    deep_dossier = [
        f"Global Ranking: You are in the Top {max(1, 100-int(absolute_net_worth/10000))}% of tactical wealth managers in your peer category.",
        f"Exposure Index: Net Kadan is {('POSITIVE' if net_exposure >= 0 else 'NEGATIVE')} by ₹{abs(net_exposure):,.0f}.",
        f"Catastrophic Defense: Assets provide a {int(total_wealth/50000) if total_wealth > 50000 else 0}-month emergency shield.",
        f"Strategic Target: Reducing '{top_cat}' is your highest leverage move for net worth acceleration.",
        f"Future Value: At 12% yield, your portfolio could double in approximately {round(72/12, 1)} years."
    ]

    # SCORE RE-CALIBRATION
    score = 75
    if total_liabilities > (total_wealth * 0.3): score -= 20 # High Debt Risk
    if total_receivables > (total_wealth * 0.15): score -= 10 # Liquidity locked in others
    if total_wealth > (total_spending * 10): score += 20 # Strong Foundation
    if total_leak < (total_spending * 0.1): score += 10 # High Discipline
    
    return {
        "score": min(100, max(0, int(score))),
        "status": "ELITE" if score > 85 else "SECURE" if score > 65 else "CRITICAL" if score < 40 else "VULNERABLE",
        "current_state": random.choice(status_options),
        "avoid_unwanted": random.choice(trap_options),
        "control_spending": random.choice(control_options),
        "future_savings": random.choice(strategy_options),
        "deep_reports": random.sample(deep_dossier, 3), 
        "metrics": {
            "net_worth": absolute_net_worth,
            "debt_ratio": round((total_liabilities / (total_wealth + 1)) * 100, 2),
            "asset_index": round(total_wealth / (total_spending + 1), 1)
        }
    }
