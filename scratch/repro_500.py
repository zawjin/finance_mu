import httpx
import asyncio

async def test_variants():
    base_url = "http://localhost:8001/api/health/habits"
    payloads = [
        # Normal
        {"name": "Valid Habit", "duration": 10, "type": "Daily", "frequency_days": ["Monday"]},
        # Missing frequency_days (schema has default [])
        {"name": "No Days", "duration": 5, "type": "Weekly"},
        # Null duration
        {"name": "Null Duration", "duration": None, "type": "Daily"},
        # Extra fields
        {"name": "Extra field", "duration": 1, "type": "Daily", "bogus": "field"},
    ]
    
    async with httpx.AsyncClient() as client:
        for p in payloads:
            try:
                print(f"Testing payload: {p}")
                response = await client.post(base_url, json=p, timeout=5.0)
                print(f"Status: {response.status_code}")
                if response.status_code == 500:
                    print(f"ERROR 500 BODY: {response.text}")
                else:
                    print(f"Success: {response.json()}")
            except Exception as e:
                print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_variants())
