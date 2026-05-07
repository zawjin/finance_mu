from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.core.database import init_db
from app.api.endpoints import router as api_router
from app.api.ai_service import router as ai_router
from app.api.auth import router as auth_router
from app.api.user_mgmt import router as user_router
from app.middleware.logging import RequestLoggingMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

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
app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(api_router, prefix="/api")
app.include_router(ai_router, prefix="/api/ai")

# 4. Serve Frontend Static Files
# We mount this LAST so it doesn't override /api routes
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")

if os.path.exists(static_dir):
    # Only mount assets if they exist
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    
    # Ensure uploads dir exists and mount it
    uploads_dir = os.path.join(static_dir, "uploads")
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Check if the requested path exists as a file in static
        file_path = os.path.join(static_dir, full_path)
        if full_path != "" and os.path.exists(file_path):
            return FileResponse(file_path)
        # Otherwise serve index.html for SPA routing
        return FileResponse(os.path.join(static_dir, "index.html"))

# Removed market_watcher scheduler as requested

@app.on_event("startup")
async def startup_db_client():
    try:
        await init_db()
        print("FRIDAY SYSTEM: Multi-threaded Async Core Active. Docs at /docs.")
    except Exception as e:
        print(f"DATABASE STARTUP ERROR: {e}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
