import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Database Configuration - MATCHING ATLAS CLOUD URL
MONGO_URL = "mongodb+srv://finance_mu:KIDEWjxBv1TLLyWd@cluster0.xdlsefg.mongodb.net/admin?retryWrites=true&loadBalanced=false&replicaSet=atlas-2rctht-shard-0&readPreference=secondaryPreferred&srvServiceName=mongodb&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1"
DB_NAME = "FIN_MU"
COLLECTION_NAME = "private_lending"

# The USER's specific hard-coded registry to migrate to DB
LENDING_DATA = [
    { "borrower": "Term #1", "principal": 25000, "start_date": "2024-10-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 50000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #2", "principal": 18750, "start_date": "2024-11-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 37500, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #3", "principal": 19000, "start_date": "2024-12-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 38000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #4", "principal": 19250, "start_date": "2025-01-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 38500, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #5", "principal": 19500, "start_date": "2025-02-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 39000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #6", "principal": 19750, "start_date": "2025-03-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 39500, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #7", "principal": 20000, "start_date": "2025-04-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 40000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #8", "principal": 20500, "start_date": "2025-05-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 41000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #9", "principal": 21000, "start_date": "2025-06-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 42000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #10", "principal": 21500, "start_date": "2025-07-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 43000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #11", "principal": 22000, "start_date": "2025-08-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 44000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #12", "principal": 22500, "start_date": "2025-09-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 45000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #13", "principal": 23000, "start_date": "2024-10-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 46000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #14", "principal": 23500, "start_date": "2025-11-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 47000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #15", "principal": 24000, "start_date": "2025-12-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 48000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #16", "principal": 24250, "start_date": "2026-01-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 48500, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #17", "principal": 24500, "start_date": "2026-02-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 49000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #18", "principal": 24750, "start_date": "2026-03-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 49500, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #19", "principal": 25000, "start_date": "2026-04-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 25000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
    { "borrower": "Term #20", "principal": 25000, "start_date": "2026-05-01", "description": "Institutional Deposit", "category": "LOCAL_INVESTMENT", "fixed_valuation": 25000, "interest_rate": 0.065, "status": "ACTIVE", "interest_type": "SIMPLE" },
]

async def seed_lending():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    # Clear existing
    print(f"Purging existing records in {COLLECTION_NAME} on Atlas...")
    await collection.delete_many({})

    # Insert new data
    result = await collection.insert_many(LENDING_DATA)
    print(f"Successfully seeded {len(result.inserted_ids)} lending records.")

if __name__ == "__main__":
    asyncio.run(seed_lending())
