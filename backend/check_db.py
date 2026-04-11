import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.finance_db
    cursor = db.reserves.find({"account_type": "CREDIT_CARD"})
    async for doc in cursor:
        print(doc)
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
