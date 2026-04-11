# FRIDAY Finance Dashboard 📊

A premium personal finance management system built with **FastAPI** (Python) and **React** (Vite). It features real-time analytics for spending, investment tracking (Gold, Property, etc.), and custom category management.

<!-- uvicorn app.main:app --reload --port 8001 -->
<!-- npm run dev -->

## Features
- **Overview Dashboard**: Visual analytics with charts (Spending Trends & Asset Allocation).
- **Spending Tracker**: Log daily expenses with categories.
- **Investment Management**: Track assets like Gold and Property.
- **Category Manager**: Customize your expense tags.
- **Auto-Seeding**: Comes pre-loaded with sample data upon first run.

## Tech Stack
- **Frontend**: React, Vite, Chart.js, Framer Motion, Lucide Icons, Vanilla CSS.
- **Backend**: FastAPI, Motor (Async MongoDB), Pydantic.
- **Database**: MongoDB (Localhost).

## Project Structure
- `/backend`: Python FastAPI server.
- `/frontend`: React client with Vite.

## How to Run

### 1. Prerequisites
- MongoDB running on `localhost:27017`.
- Python 3.10+
- Node.js 18+

### 2. Start Backend
```bash
cd backend
python3 main.py
```
*The server will run at http://localhost:8000*

### 3. Start Frontend
```bash
cd frontend
npm run dev
```
*The dashboard will run at http://localhost:5173*

## Dashboard Design
The dashboard uses a premium **Slate Dark Theme** with glassmorphism effects and smooth Framer Motion transitions.


You are a professional financial advisor and risk analyst.

Analyze the user's complete financial situation based on the data provided.

=== USER DATA ===

Monthly Income: {INCOME}

Expenses:
- all list {Audit_LIST}

Debts:
{DEBT_LIST}
(Include interest rate, EMI, tenure)

Investments:
{INVESTMENTS_LIST}
(Stocks, mutual funds, gold, etc.)

Receivables (money to receive):
{RECEIVABLES}

Savings: {SAVINGS}

=== TASK ===

1. Cash Flow Analysis
- Monthly surplus / deficit
- Expense ratio (% of income)

2. Risk Analysis
- Debt risk level (Low / Medium / High)
- Emergency fund status

3. Debt Strategy
- Which debt to close first (priority order)
- Suggest repayment plan

4. Investment Analysis
- Asset allocation breakdown
- Overexposed / under-diversified areas

5. Optimization Suggestions
- Where to reduce expenses
- How to increase savings

6. Action Plan (VERY IMPORTANT)
- Give 5 clear steps user should take immediately

7. Final Score
- Financial Health Score (0–100)
- Short explanation

Important Rules:
- Be practical and realistic
- Do not assume missing data
- If data is insufficient, clearly say it
- Prefer conservative advice



Monthly Income: 80000

Fixed Expenses: 30000
Variable Expenses: 20000

Debts:
- Personal Loan: 3L @ 14%, EMI 9000
- Credit Card: 50k @ 36%

Investments:
- Mutual Fund: 2L
- Stocks: 1L

Receivables:
- Friend owes: 20k

Savings: 50000