import asyncio
import traceback

async def test():
    try:
        from app.api.ai_service import get_ai_analysis
        res = await get_ai_analysis()
        print("SUCCESS:", list(res.keys()))
    except Exception as e:
        traceback.print_exc()

asyncio.run(test())
