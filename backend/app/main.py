from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.core.database import init_db
from app.api.endpoints import router as api_router
from app.api.ai_service import router as ai_router
from app.middleware.logging import RequestLoggingMiddleware

app = FastAPI(title=settings.PROJECT_NAME)

# 1. Add Custom Middleware (e.g. Logging Request Time)
app.add_middleware(RequestLoggingMiddleware)

# 2. Add standard CORS Middleware for React Support
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Register our split endpoints 
app.include_router(api_router, prefix="/api")
app.include_router(ai_router, prefix="/api/ai")

import asyncio
from app.api.endpoints import sync_all_prices

# 4. Neural Background Sync Job
async def market_watcher():
    """Deferred auto-sync of all market prices to avoid startup bottleneck"""
    # Delay initial sync by 20s to allow API and /docs to serve instantly
    await asyncio.sleep(20)
    
    while True:
        try:
            print("FRIDAY BACKGROUND: Engaging Market Sync Engine...")
            await sync_all_prices()
            print("FRIDAY BACKGROUND: Neural Sync Complete.")
        except Exception as e:
            print(f"BACKGROUND ERROR: {e}")
        await asyncio.sleep(86400) # Sync once every 24 hours

@app.on_event("startup")
async def startup_db_client():
    try:
        await init_db()
        # Launch Market Watcher as a deferred task
        asyncio.create_task(market_watcher())
        print("FRIDAY SYSTEM: Multi-threaded Async Core Active. Docs at /docs.")
    except Exception as e:
        print(f"DATABASE STARTUP ERROR: {e}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
