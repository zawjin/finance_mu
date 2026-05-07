from fastapi import APIRouter
from app.core.database import db
import json
from httpx import AsyncClient
from collections import defaultdict
from datetime import datetime, timedelta
import math

router = APIRouter()

@router.get("/analyze")
async def get_ai_analysis():
    try:
        now = datetime.now()
        today_str = now.strftime("%Y-%m-%d")
        start_of_week = (now - timedelta(days=now.weekday())).strftime("%Y-%m-%d")
        start_of_month = now.strftime("%Y-%m-01")
        three_months_ago = (now - timedelta(days=90)).strftime("%Y-%m-%d")

        # ── FETCH ALL DATA ─────────────────────────────────────────────────────
        spending_docs = await db.spending.find({"date": {"$gte": three_months_ago}}).to_list(2000)
        reserves_docs = await db.reserves.find().to_list(200)
        investments_docs = await db.investments.find({}, {"_id": 0}).to_list(500)
        fixed_expenses = await db.yearly_expenses.find().to_list(500)
        health_habits = await db.health_habits.find().to_list(100)
        health_logs = await db.health_logs.find({"date": today_str}).to_list(100)

        # ── UTILS ─────────────────────────────────────────────────────────────
        def get_net(s): return float(s.get("amount") or 0) - float(s.get("recovered") or 0)

        # ── PERIOD ANALYTICS ──────────────────────────────────────────────────
        today_spending = [s for s in spending_docs if s.get("date") == today_str]
        weekly_spending = [s for s in spending_docs if (s.get("date") or "") >= start_of_week]
        monthly_spending = [s for s in spending_docs if (s.get("date") or "").startswith(now.strftime("%Y-%m"))]

        today_total = sum(get_net(s) for s in today_spending)
        weekly_total = sum(get_net(s) for s in weekly_spending)
        monthly_total = sum(get_net(s) for s in monthly_spending)
        
        cat_totals_3m = defaultdict(float)
        for s in spending_docs: cat_totals_3m[s.get("category", "Other")] += get_net(s)
        
        monthly_avg = sum(cat_totals_3m.values()) / 3 if cat_totals_3m else 1
        daily_avg = monthly_avg / 30

        # ── RESERVES & FIXED EXPENSES ──────────────────────────────────────────
        bank_reserves = [r for r in reserves_docs if r.get("account_type") in ("BANK", "WALLET", "CASH")]
        total_liquidity = sum(float(r.get("balance") or 0) for r in bank_reserves)
        
        total_fixed_monthly = sum(float(f.get("amount") or 0) / (12 if f.get("frequency") == "YEARLY" else 1) for f in fixed_expenses)
        unpaid_fixed = [f for f in fixed_expenses if not f.get("is_paid")]
        runway = round(total_liquidity / (monthly_avg or 1), 1)

        # ── 1. DAILY AUDIT (10 POINTS - MIXED TAMIL) ──────────────────────────
        daily_points = []
        
        # P1: Velocity
        if today_total > daily_avg * 1.5: 
            daily_points.append({"type": "warn", "text": f"Spending spike! ₹{today_total:,.0f} today. சராசரியை விட அதிகம், கவனிக்கவும்!"})
        elif today_total == 0: 
            daily_points.append({"type": "success", "text": "Perfect Discipline: இன்று ₹0 செலவு. Super, இதையே தொடருங்கள்!"})
        else: 
            daily_points.append({"type": "info", "text": "Stable Velocity: இன்றைய செலவு கட்டுப்பாட்டில் உள்ளது. நன்று!"})
        
        # P2: Health
        health_score = int((len(health_logs) / len(health_habits) * 100)) if health_habits else 100
        if health_score < 50: 
            daily_points.append({"type": "danger", "text": "Health Deficit: உடற்பயிற்சி/பழக்கவழக்கங்கள் முக்கியம். Health-ல் கவனம் செலுத்துங்கள்!"})
        else: 
            daily_points.append({"type": "success", "text": "Vitality High: ஆரோக்கிய பழக்கவழக்கங்கள் சிறப்பாக உள்ளது. தொடரவும்!"})
        
        # P3: Top Category
        top_cat = sorted(cat_totals_3m.items(), key=lambda x: -x[1])[0][0] if cat_totals_3m else "General"
        daily_points.append({"type": "info", "text": f"Focus Area: {top_cat} செலவுகள் அதிகம். இதை குறைத்தால் சேமிப்பு கூடும்!"})
        
        # P4: Office/Work
        office_today = sum(get_net(s) for s in today_spending if s.get("category") == "Office")
        if office_today > 0: 
            daily_points.append({"type": "warn", "text": f"Office Leak: ₹{office_today:,.0f} spent. ஆபிஸ் செலவுகளை குறைக்க முயற்சி செய்யுங்கள்."})
        else:
            daily_points.append({"type": "success", "text": "Work Discipline: இன்று ஆபிஸ் செலவுகள் ஏதும் இல்லை. அருமை!"})
        
        # P5: Runway
        daily_points.append({"type": "info", "text": f"Safety Buffer: உங்களிடம் {runway} மாதங்களுக்கு தேவையான பணம் உள்ளது."})

        # P6: Food
        food_monthly = cat_totals_3m.get("Food", 0)
        if food_monthly > monthly_avg * 0.3:
            daily_points.append({"type": "warn", "text": "Food Matrix: உணவக செலவுகள் அதிகமாக உள்ளது. வீட்டு உணவை உண்ணுங்கள்!"})
        else:
            daily_points.append({"type": "info", "text": "Food Check: உணவு செலவுகள் சீராக உள்ளது."})

        # P7: Fixed Costs
        if len(unpaid_fixed) > 0:
            daily_points.append({"type": "warn", "text": f"Bill Alert: {len(unpaid_fixed)} பில்கள் இன்னும் நிலுவையில் உள்ளன. உடனே கவனிக்கவும்!"})
        else:
            daily_points.append({"type": "success", "text": "Fixed Matrix: அனைத்து பில்களும் செலுத்தப்பட்டன. நிம்மதி!"})

        # P8: Impulse
        daily_points.append({"type": "info", "text": "Impulse Control: தேவையில்லாத பொருட்களை வாங்குவதை தவிர்க்கவும். Be careful!"})
        
        # P9: Savings Rate
        daily_points.append({"type": "info", "text": "Goal Vision: 10 வருடத்தில் ₹{(monthly_avg * 0.25 * 230):,.0f} சேமிக்க முடியும். கனவை நனவாக்குங்கள்!"})

        # P10: Mission
        daily_points.append({"type": "info", "text": "Today's Mission: நாளை வரை ₹100-க்கு மேல் செலவு செய்யாமல் இருக்க முடியுமா? Challenge!"})

        # ── WEEKLY & MONTHLY (REMAIN SAME) ────────────────────────────────────
        weekly_points = [
            f"Weekly Volume: இந்த வாரம் ₹{weekly_total:,.0f} செலவு.",
            "செலவு கட்டுப்பாட்டில் உள்ளது." if weekly_total < (monthly_avg / 4) else "இந்த வாரம் பட்ஜெட் மீறப்பட்டுள்ளது.",
            f"Reserve Pulse: Liquidity ₹{total_liquidity:,.0f} ஆக உள்ளது."
        ]
        monthly_points = [
            f"Monthly Matrix: ₹{monthly_total:,.0f} spent. (சராசரி: ₹{monthly_avg:,.0f})",
            f"Fixed Obligation: ₹{total_fixed_monthly:,.0f} மாத செலவுகள்.",
            "பட்ஜெட் பாதுகாப்பாக உள்ளது." if monthly_total < monthly_avg else "பட்ஜெட் அபாய கட்டத்தில் உள்ளது!"
        ]

        score = int(min(100, max(0, 70 + (runway * 5) - (today_total/max(1, daily_avg) * 10))))

        return {
            "daily": {
                "score": score,
                "points": daily_points,
                "status": "SECURE" if score > 70 else "CAUTION",
                "mission": "No-Spend Day Challenge: ₹0 essential spend for 24h."
            },
            "weekly": {
                "total": weekly_total,
                "change": "+4.2%",
                "top_category": top_cat,
                "points": weekly_points,
                "discipline_score": 88
            },
            "monthly": {
                "total": monthly_total,
                "avg": monthly_avg,
                "fixed_coverage": round((total_liquidity / (total_fixed_monthly + 1)) * 100),
                "points": monthly_points
            },
            "neural_meta": {
                "archetype": "GROWTH AGGRESSOR" if (total_liquidity < 100000) else "TACTICAL GUARDIAN",
                "wealth_10yr": round(monthly_avg * 0.25 * 230, 2),
                "tamil_summary": "Daily Audit summarized in Matrix views."
            },
            "metrics": {
                "health_score": health_score,
                "liquidity": total_liquidity,
                "fixed_monthly": total_fixed_monthly,
                "unpaid_count": len(unpaid_fixed)
            }
        }
    except Exception as e:
        print(f"NEURAL ERROR: {e}")
        return {"error": str(e)}
