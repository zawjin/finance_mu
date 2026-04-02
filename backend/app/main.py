from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.core.database import init_db
from app.api.endpoints import router as api_router
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

# 4. Handle initialization
@app.on_event("startup")
async def startup_db_client():
    try:
        await init_db()
    except Exception as e:
        print(f"DATABASE STARTUP ERROR: {e}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
