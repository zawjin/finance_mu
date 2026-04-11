import asyncio
from app.core.database import db
from datetime import datetime

# The USER's specific hard-coded registry - using Card Number as a Multiplier
LENDING_DATA = [
    { "card_number": "2", "borrower": "Term #1", "principal": 25000, "start_date": "2024-10-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #2", "principal": 18750, "start_date": "2024-11-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #3", "principal": 19000, "start_date": "2024-12-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #4", "principal": 19250, "start_date": "2025-01-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #5", "principal": 19500, "start_date": "2025-02-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #6", "principal": 19750, "start_date": "2025-03-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #7", "principal": 20000, "start_date": "2025-04-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #8", "principal": 20500, "start_date": "2025-05-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #9", "principal": 21000, "start_date": "2025-06-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #10", "principal": 21500, "start_date": "2025-07-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #11", "principal": 22000, "start_date": "2025-08-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #12", "principal": 22500, "start_date": "2025-09-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #13", "principal": 23000, "start_date": "2024-10-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #14", "principal": 23500, "start_date": "2025-11-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #15", "principal": 24000, "start_date": "2025-12-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #16", "principal": 24250, "start_date": "2026-01-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #17", "principal": 24500, "start_date": "2026-02-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "2", "borrower": "Term #18", "principal": 24750, "start_date": "2026-03-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "1", "borrower": "Term #19", "principal": 25000, "start_date": "2026-04-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "card_number": "1", "borrower": "Term #20", "principal": 25000, "start_date": "2026-05-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
]

async def seed():
    print("Purging existing private_lending collection...")
    await db.private_lending.delete_many({})
    print("Seeding NEW data with Multipliers in Card Number field...")
    result = await db.private_lending.insert_many(LENDING_DATA)
    print(f"DONE! Seeded {len(result.inserted_ids)} records.")

if __name__ == "__main__":
    asyncio.run(seed())
