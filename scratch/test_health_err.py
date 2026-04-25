import httpx
import asyncio

async def test_post_habit():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:8001/api/health/habits",
                json={
                    "name": "Test Habit",
                    "duration": 10,
                    "type": "Daily",
                    "frequency_days": ["Monday"]
                },
                timeout=10.0
            )
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_post_habit())
