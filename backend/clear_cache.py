import asyncio
from app.core.database import db

async def clear():
    result = await db.daily_quote.delete_many({})
    print(f"Deleted {result.deleted_count} cached quotes from cloud DB FIN_MU")

asyncio.run(clear())
