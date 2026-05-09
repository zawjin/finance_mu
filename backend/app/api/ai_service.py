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

        # ── ANOMALY DETECTION (3x Daily Avg) ──────────────────────────────────
        anomalies = []
        for s in today_spending:
            if get_net(s) > daily_avg * 3:
                anomalies.append({
                    "description": s.get("description"),
                    "amount": get_net(s),
                    "factor": round(get_net(s) / daily_avg, 1)
                })
        
        # ── RECURRING DETECTION (Pattern Scan) ────────────────────────────────
        recurring_suggestions = []
        desc_map = defaultdict(list)
        for s in spending_docs:
            if s.get("description"):
                desc_map[s["description"].lower().strip()].append(s)
        
        for desc, logs in desc_map.items():
            if len(logs) >= 2:
                logs.sort(key=lambda x: x.get("date", ""))
                # Check for ~30 day intervals
                dates = [datetime.strptime(l["date"], "%Y-%m-%d") for l in logs if l.get("date")]
                if len(dates) >= 2:
                    intervals = [(dates[i] - dates[i-1]).days for i in range(1, len(dates))]
                    is_monthly = all(25 <= inv <= 35 for inv in intervals)
                    same_amount = all(abs(get_net(l) - get_net(logs[0])) < 10 for l in logs)
                    
                    if is_monthly and same_amount:
                        # Check if already in fixed expenses
                        exists = any(f.get("description", "").lower() == desc for f in fixed_expenses)
                        if not exists:
                            recurring_suggestions.append({
                                "description": logs[0]["description"],
                                "amount": get_net(logs[0]),
                                "category": logs[0].get("category", "General")
                            })

        # ── SPENDING FORECAST (BURN RATE) ─────────────────────────────────────
        days_in_month = (datetime(now.year, now.month % 12 + 1, 1) - timedelta(days=1)).day
        burn_rate_daily = monthly_total / now.day
        forecasted_total = burn_rate_daily * days_in_month
        forecast_status = "OVER" if forecasted_total > monthly_avg else "ON_TRACK"
        
        # ── 1. DAILY AUDIT (10 POINTS - MIXED TAMIL) ──────────────────────────
        daily_points = []
        
        # P1: Anomaly Alert
        if anomalies:
            for a in anomalies:
                daily_points.append({"type": "danger", "text": f"Anomaly Alert! '{a['description']}' ₹{a['amount']:,.0f} spent. இது சராசரியை விட {a['factor']} மடங்கு அதிகம்! கவனிங்க!"})
        elif today_total > daily_avg * 1.5: 
            daily_points.append({"type": "warn", "text": f"Spending spike! ₹{today_total:,.0f} today. சராசரியை விட அதிகம், கவனிக்கவும்!"})
        elif today_total == 0: 
            daily_points.append({"type": "success", "text": "Perfect Discipline: இன்று ₹0 செலவு. Super, இதையே தொடருங்கள்!"})
        else: 
            daily_points.append({"type": "info", "text": "Stable Velocity: இன்றைய செலவு கட்டுப்பாட்டில் உள்ளது. நன்று!"})
        
        # P2: Recurring Suggestion
        if recurring_suggestions:
            for r in recurring_suggestions:
                daily_points.append({"type": "info", "text": f"Recurring Alert: '{r['description']}' (₹{r['amount']:,.0f}) மாதாந்திர செலவாக தெரிகிறது. இதை Fixed Expenses-ல் சேர்க்கலாமா?"})

        # P3: Forecast
        daily_points.append({
            "type": "warn" if forecast_status == "OVER" else "info",
            "text": f"Forecast: உங்கள் தற்போதைய செலவு வேகத்தில் பார்த்தால் இந்த மாத இறுதியில் ₹{forecasted_total:,.0f} செலவாகும். {'கட்டுப்படுத்தவும்!' if forecast_status == 'OVER' else 'நல்லது!'}"
        })

        # P3: Health
        health_score = int((len(health_logs) / len(health_habits) * 100)) if health_habits else 100
        if health_score < 50: 
            daily_points.append({"type": "danger", "text": "Health Deficit: உடற்பயிற்சி/பழக்கவழக்கங்கள் முக்கியம். Health-ல் கவனம் செலுத்துங்கள்!"})
        else: 
            daily_points.append({"type": "success", "text": "Vitality High: ஆரோக்கிய பழக்கவழக்கங்கள் சிறப்பாக உள்ளது. தொடரவும்!"})
        
        # P4: Top Category
        top_cat = sorted(cat_totals_3m.items(), key=lambda x: -x[1])[0][0] if cat_totals_3m else "General"
        daily_points.append({"type": "info", "text": f"Focus Area: {top_cat} செலவுகள் அதிகம். இதை குறைத்தால் சேமிப்பு கூடும்!"})
        
        # P5: Office/Work
        office_today = sum(get_net(s) for s in today_spending if s.get("category") == "Office")
        if office_today > 0: 
            daily_points.append({"type": "warn", "text": f"Office Leak: ₹{office_today:,.0f} spent. ஆபிஸ் செலவுகளை குறைக்க முயற்சி செய்யுங்கள்."})
        else:
            daily_points.append({"type": "success", "text": "Work Discipline: இன்று ஆபிஸ் செலவுகள் ஏதும் இல்லை. அருமை!"})
        
        # P6: Runway
        daily_points.append({"type": "info", "text": f"Safety Buffer: உங்களிடம் {runway} மாதங்களுக்கு தேவையான பணம் உள்ளது."})

        # P7: Food
        food_monthly = cat_totals_3m.get("Food", 0)
        if food_monthly > monthly_avg * 0.3:
            daily_points.append({"type": "warn", "text": "Food Matrix: உணவக செலவுகள் அதிகமாக உள்ளது. வீட்டு உணவை உண்ணுங்கள்!"})
        else:
            daily_points.append({"type": "info", "text": "Food Check: உணவு செலவுகள் சீராக உள்ளது."})

        # P8: Fixed Costs
        if len(unpaid_fixed) > 0:
            daily_points.append({"type": "warn", "text": f"Bill Alert: {len(unpaid_fixed)} பில்கள் இன்னும் நிலுவையில் உள்ளன. உடனே கவனிக்கவும்!"})
        else:
            daily_points.append({"type": "success", "text": "Fixed Matrix: அனைத்து பில்களும் செலுத்தப்பட்டன. நிம்மதி!"})

        # P9: Savings Mission
        goals_docs = await db.goals.find({"status": "ACTIVE"}).to_list(10)
        if goals_docs:
            for g in goals_docs:
                rem = g['target_amount'] - g['current_amount']
                daily_points.append({"type": "info", "text": f"Goal Vision: {g['name']} இலக்கை அடைய இன்னும் ₹{rem:,.0f} தேவை. சீக்கிரம் முடிப்போம்!"})
        else:
            daily_points.append({"type": "info", "text": "Savings Goal: ஒரு சேமிப்பு இலக்கை உருவாக்குங்கள். கனவை நோக்கி பயணியுங்கள்!"})
        
        # P10: Split Tracker
        pending_splits = [s for s in spending_docs if s.get("is_split") and s.get("split_status") == "PENDING"]
        if pending_splits:
            total_pending = sum(s.get("split_amount", 0) for s in pending_splits)
            daily_points.append({"type": "info", "text": f"Split Matrix: மற்றவர்களிடமிருந்து வர வேண்டிய ₹{total_pending:,.0f} நிலுவையில் உள்ளது. ஞாபகப்படுத்தவும்!"})

        # P11: Mission
        daily_points.append({"type": "info", "text": "Today's Mission: நாளை வரை ₹100-க்கு மேல் செலவு செய்யாமல் இருக்க முடியுமா? Challenge!"})

        # ── WEEKLY & MONTHLY (ENHANCED) ───────────────────────────────────────
        weekly_points = [
            f"Weekly Volume: இந்த வாரம் ₹{weekly_total:,.0f} செலவு.",
            "செலவு கட்டுப்பாட்டில் உள்ளது." if weekly_total < (monthly_avg / 4) else "இந்த வாரம் பட்ஜெட் மீறப்பட்டுள்ளது.",
            f"Top Leak: {top_cat} is your biggest leak this week.",
            f"Reserve Pulse: Liquidity ₹{total_liquidity:,.0f} ஆக உள்ளது."
        ]
        monthly_points = [
            f"Monthly Matrix: ₹{monthly_total:,.0f} spent. (சராசரி: ₹{monthly_avg:,.0f})",
            f"Month-End Projection: ₹{forecasted_total:,.0f}",
            f"Fixed Obligation: ₹{total_fixed_monthly:,.0f} மாத செலவுகள்.",
            "பட்ஜெட் பாதுகாப்பாக உள்ளது." if monthly_total < monthly_avg else "பட்ஜெட் அபாய கட்டத்தில் உள்ளது!"
        ]

        score = int(min(100, max(0, 70 + (runway * 5) - (today_total/max(1, daily_avg) * 10))))

        return {
            "daily": {
                "score": score,
                "points": daily_points,
                "status": "SECURE" if score > 70 else "CAUTION",
                "anomalies": anomalies,
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
                "forecasted": forecasted_total,
                "fixed_coverage": round((total_liquidity / (total_fixed_monthly + 1)) * 100),
                "points": monthly_points
            },
            "neural_meta": {
                "archetype": "GROWTH AGGRESSOR" if (total_liquidity < 100000) else "TACTICAL GUARDIAN",
                "wealth_10yr": round(monthly_avg * 0.25 * 230, 2),
                "tamil_summary": f"Neural Audit v2: Detected {len(anomalies)} anomalies today."
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
