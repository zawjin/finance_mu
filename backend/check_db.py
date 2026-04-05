import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    url = "mongodb+srv://finance_mu:KIDEWjxBv1TLLyWd@cluster0.xdlsefg.mongodb.net/FIN_MU?retryWrites=true&authSource=admin"
    client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=5000)
    try:
        db = client['FIN_MU']
        s = await db.spending.count_documents({})
        i = await db.investments.count_documents({})
        c = await db.categories.count_documents({})
        print(f"FRIDAY_STATUS: CONNECTED")
        print(f"FRIDAY_DATA: SPENDING={s}, INVESTMENTS={i}, CATEGORIES={c}")
    except Exception as e:
        print(f"FRIDAY_STATUS: ERROR")
        print(f"FRIDAY_ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test())
