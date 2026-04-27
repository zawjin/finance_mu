import asyncio
import os
import sys

# Add the backend directory to sys.path
sys.path.append(os.getcwd())

from app.core.database import init_db

async def run_seed():
    print("Manually triggering init_db()...")
    await init_db()
    print("Done.")

if __name__ == "__main__":
    asyncio.run(run_seed())
