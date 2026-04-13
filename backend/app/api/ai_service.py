from fastapi import APIRouter
from app.core.database import db
import json
from httpx import AsyncClient
from collections import defaultdict
from datetime import datetime, timedelta

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"

async def get_llama_insights(prompt_text: str):
    print(prompt_text)
    payload = {
        "model": "llama3:latest",
        "prompt": prompt_text,
        "stream": False
    }

    try:
        async with AsyncClient() as client:
            response = await client.post(OLLAMA_URL, json=payload, timeout=90.0)
            if response.status_code == 200:
                resp_json = response.json()
                raw_text = resp_json.get("response", "{}")
                # Strip markdown code fences
                clean = raw_text.strip()
                for fence in ["```json", "```JSON", "```"]:
                    clean = clean.replace(fence, "")
                clean = clean.strip()
                return json.loads(clean)
    except Exception as e:
        print(f"LLM Error: {e}")
        return None


@router.get("/analyze")
async def get_ai_analysis():
    # ── FETCH ALL DATA ─────────────────────────────────────────────────────
    spending_docs = await db.spending.find().to_list(2000)
    reserves_docs = await db.reserves.find().to_list(200)
    investments_docs = await db.investments.find({}, {"_id": 0}).to_list(500)
    debts_docs = await db.debts.find({}, {"_id": 0}).to_list(200)

    # ── SPENDING AUDIT LIST ────────────────────────────────────────────────
    # Last 3 months of spending grouped by category
    three_months_ago = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    recent_spending = [s for s in spending_docs if (s.get("date") or "") >= three_months_ago]

    cat_totals = defaultdict(float)
    for s in recent_spending:
        cat_totals[s.get("category", "Other")] += float(s.get("amount") or 0) - float(s.get("recovered") or 0)

    audit_list = [{"category": k, "total_net": round(v, 2)} for k, v in
                  sorted(cat_totals.items(), key=lambda x: -x[1])]

    # Detailed individual records for exactly this month
    current_month_str = datetime.now().strftime("%Y-%m")
    this_month_spending = [s for s in spending_docs if (s.get("date") or "").startswith(current_month_str)]
    detailed_this_month = [
        {
            "date": s.get("date", ""),
            "description": s.get("description", "No details"),
            "category": s.get("category", "Other"),
            "amount": round(float(s.get("amount") or 0) - float(s.get("recovered") or 0), 2)
        } for s in this_month_spending
    ]
    detailed_this_month = [x for x in detailed_this_month if x["amount"] > 0]

    # Additional detailed logs for Health and Shopping (last 3 months) for deep insights
    target_categories = ["Healthcare", "Health", "Shopping", "Online food", "Outside food"]
    focused_spending = [s for s in recent_spending if s.get("category") in target_categories]
    detailed_focused = [
        {
            "date": s.get("date", ""),
            "description": s.get("description", "No details"),
            "category": s.get("category", "Other"),
            "amount": round(float(s.get("amount") or 0) - float(s.get("recovered") or 0), 2)
        } for s in focused_spending
    ]
    detailed_focused = [x for x in detailed_focused if x["amount"] > 0]

    # Approximate monthly income from summary (net monthly spending as proxy if no income field)
    # Use reserves bank balances as savings proxy
    bank_reserves = [r for r in reserves_docs if r.get("account_type") in ("BANK", "WALLET", "CASH")]
    credit_cards = [r for r in reserves_docs if r.get("account_type") == "CREDIT_CARD"]

    total_savings = sum(float(r.get("balance") or 0) for r in bank_reserves)
    total_credit_outstanding = sum(float(r.get("balance") or 0) for r in credit_cards)

    monthly_spend_avg = round(
        sum(cat_totals.values()) / 3, 2
    ) if cat_totals else 0

    # Debts list
    debt_list = [
        {
            "name": d.get("name", "Unknown"),
            "amount": float(d.get("amount") or 0),
            "interest_rate": d.get("interest_rate") or d.get("rate", "N/A"),
            "emi": d.get("emi") or d.get("monthly_payment", "N/A"),
            "tenure": d.get("tenure") or d.get("months_remaining", "N/A"),
        }
        for d in debts_docs
    ]

    # Investments list
    inv_by_type = defaultdict(float)
    detailed_investments = []
    
    for inv in investments_docs:
        t = inv.get("type", "Other")
        qty = float(inv.get("quantity") or 0)
        price = float(inv.get("current_price") or inv.get("buy_price") or 0)
        val = qty * price
        
        # Fallback to direct 'value' if qty/price are missing (e.g. Local Investment or EPFO)
        if val == 0:
            val = float(inv.get("value") or 0)
            
        inv_by_type[t] += val
        detailed_investments.append({
            "name": inv.get("name", "Unknown"),
            "type": t,
            "value": round(val, 2)
        })

    investments_list = [{"type": k, "value": round(v, 2)} for k, v in inv_by_type.items()]
    total_investment = sum(i["value"] for i in investments_list)

    # Receivables: settled=False spending with recovered > 0 gap (simplification)
    # Use cards outstanding as proxy receivable metric
    receivable_approx = round(total_credit_outstanding, 2)

    # ── BUILD PROMPT ───────────────────────────────────────────────────────
    prompt = f"""You are a professional financial advisor and risk analyst.
Analyze the user's complete financial situation based on the data provided.

=== USER DATA ===

Monthly Income: Estimated based on spending patterns (~₹{monthly_spend_avg * 1.3:,.2f} estimated, actual not disclosed)

Expenses (last 3 months by category):
{json.dumps(audit_list, indent=2)}

Detailed Spending Logs (This month's individual records):
{json.dumps(detailed_this_month, indent=2) if detailed_this_month else "No individual records this month."}

Focused Detailed Logs (Healthcare, Shopping, Food - Last 3 Months):
{json.dumps(detailed_focused, indent=2) if detailed_focused else "No focused category records."}

Debts:
{json.dumps(debt_list, indent=2) if debt_list else "No formal debts recorded."}

Investments:
Summary by Type:
{json.dumps(investments_list, indent=2) if investments_list else "No investments recorded."}

Detailed Individual Asset List:
{json.dumps(detailed_investments, indent=2) if detailed_investments else "No individual assets."}

Total Investment Value: ₹{total_investment:,.2f}

Credit Card Outstanding (Receivables):
₹{receivable_approx:,.2f}

Savings (Bank + Wallet + Cash):
₹{total_savings:,.2f}

=== TASK ===

1. Cash Flow Analysis
   - Monthly surplus / deficit
   - Expense ratio (% of estimated income)

2. Risk Analysis
   - Debt risk level (Low / Medium / High)
   - Emergency fund status (adequate = 6 months expenses)

3. Debt Strategy
   - Which debt to close first (priority order)
   - Suggest repayment plan

4. Investment Analysis
   - Asset allocation breakdown
   - Overexposed / under-diversified areas

5. Optimization Suggestions
   - Where to reduce expenses
   - How to increase savings

6. Category-Specific Spending Advice
   - Based on the expenses log AND focused detailed logs above, give actionable advice for reducing spending in healthcare, shopping, and food.
   - For Health/Healthcare: Provide specific practical advice on how to save money (e.g., insurance, generic medicines) based on the detailed logs.
   - For Shopping: Detail how to avoid impulse purchases and save based on what they bought.
   - Tell the user how to avoid unnecessary spending in these specific categories and save money effectively.

7. Action Plan (VERY IMPORTANT)
   - Give exactly 5 clear steps user should take immediately

8. Final Score
   - Financial Health Score (0–100)
   - Short explanation (2 sentences)

Important Rules:
- Be practical and realistic
- Do not assume missing data
- If data is insufficient, clearly say it
- Prefer conservative advice
- All monetary values in Indian Rupees (INR)

Response must be ONLY valid JSON. No text before or after. Structure EXACTLY:
{{
  "cash_flow": {{
    "monthly_surplus_deficit": "...",
    "expense_ratio": "..."
  }},
  "risk": {{
    "debt_risk_level": "Low|Medium|High",
    "emergency_fund_status": "..."
  }},
  "debt_strategy": {{
    "priority_order": ["debt name 1", "debt name 2"],
    "repayment_plan": "..."
  }},
  "investment_analysis": {{
    "asset_allocation": "...",
    "concerns": "..."
  }},
  "optimization": {{
    "reduce_expenses": "...",
    "increase_savings": "..."
  }},
  "category_advice": [
    {{"category": "...", "advice": "..."}}
  ],
  "action_plan": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ...",
    "Step 4: ...",
    "Step 5: ..."
  ],
  "score": 72,
  "score_explanation": "..."
}}
"""

    # ── CALL LLM ────────────────────────────────────────────────────────────
    insights = await get_llama_insights(prompt)

    # ── FALLBACK METRICS ────────────────────────────────────────────────────
    score = 60
    if total_savings > (monthly_spend_avg * 6): score += 15
    if total_credit_outstanding < (total_savings * 0.3): score += 10
    if total_investment > 0: score += 10
    if not debts_docs: score += 5
    score = min(100, max(0, int(score)))

    status = "ELITE" if score > 85 else "SECURE" if score > 65 else "CAUTION" if score > 40 else "CRITICAL"

    if insights:
        return {
            "score": insights.get("score", score),
            "status": status,
            "cash_flow": insights.get("cash_flow", {}),
            "risk": insights.get("risk", {}),
            "debt_strategy": insights.get("debt_strategy", {}),
            "investment_analysis": insights.get("investment_analysis", {}),
            "optimization": insights.get("optimization", {}),
            "category_advice": insights.get("category_advice", []),
            "action_plan": insights.get("action_plan", []),
            "score_explanation": insights.get("score_explanation", ""),
            "metrics": {
                "total_savings": total_savings,
                "total_investment": total_investment,
                "credit_outstanding": total_credit_outstanding,
                "monthly_avg_spend": monthly_spend_avg,
            }
        }
    else:
        # Graceful fallback without LLM
        return {
            "score": score,
            "status": status,
            "cash_flow": {
                "monthly_surplus_deficit": f"Estimated monthly spend: ₹{monthly_spend_avg:,.2f}",
                "expense_ratio": "Unable to compute – income data not available."
            },
            "risk": {
                "debt_risk_level": "Medium" if total_credit_outstanding > 0 else "Low",
                "emergency_fund_status": f"₹{total_savings:,.2f} saved. {'Adequate' if total_savings > monthly_spend_avg * 6 else 'Needs improvement'} (target: 6 months)."
            },
            "debt_strategy": {
                "priority_order": [d["name"] for d in sorted(debt_list, key=lambda x: float(x.get("interest_rate") if str(x.get("interest_rate")).replace('.','',1).isdigit() else 0), reverse=True)],
                "repayment_plan": "Close highest interest rate debts first (Avalanche method)."
            },
            "investment_analysis": {
                "asset_allocation": ", ".join([f'{i["type"]}: ₹{i["value"]:,.0f}' for i in investments_list]) or "No investment data.",
                "concerns": "Diversification data insufficient."
            },
            "optimization": {
                "reduce_expenses": f'Top spend: {audit_list[0]["category"] if audit_list else "N/A"}. Review and reduce by 15%.',
                "increase_savings": "Automate a fixed monthly SIP into liquid mutual funds."
            },
            "category_advice": [
                {"category": audit_list[0]["category"] if audit_list else "Top Category", "advice": "Set a strict monthly limit and avoid impulse purchases here."}
            ],
            "action_plan": [
                "Step 1: Build a 6-month emergency fund in a high-yield savings account.",
                "Step 2: Clear all credit card outstanding immediately to avoid high interest.",
                "Step 3: Set up an auto-debit SIP of ₹5,000/month into an index fund.",
                "Step 4: Review and cut your top expense category by 20%.",
                "Step 5: Review all active debts and close the highest-interest one first."
            ],
            "score_explanation": f"Financial score of {score}/100. {'Good liquidity buffer detected.' if total_savings > 0 else 'Critical: no liquid savings detected.'}",
            "metrics": {
                "total_savings": total_savings,
                "total_investment": total_investment,
                "credit_outstanding": total_credit_outstanding,
                "monthly_avg_spend": monthly_spend_avg,
            }
        }
