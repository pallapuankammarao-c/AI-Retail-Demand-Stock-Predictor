"""
RetailPulse AI - FastAPI Application Entrypoint
"Predict Demand. Prevent Stockouts. Optimize Inventory."
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database.connection import init_db
from backend.app.database.seed_data import seed_database

# API Routers
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.sales import router as sales_router
from backend.app.api.inventory import router as inventory_router
from backend.app.api.products import router as products_router
from backend.app.api.forecast import router as forecast_router
from backend.app.api.alerts import router as alerts_router
from backend.app.api.ai_insights import router as ai_insights_router
from backend.app.api.stores import router as stores_router
from backend.app.api.reports import router as reports_router
from backend.app.api.upload import router as upload_router
from backend.app.api.demo import router as demo_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"Cloud-Based Retail Analytics, Demand Forecasting & Intelligent Inventory Management Platform. Tagline: {settings.TAGLINE}",
    version=settings.VERSION
)

# Enable CORS for frontend and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under settings.API_PREFIX (/api)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(sales_router, prefix=settings.API_PREFIX)
app.include_router(inventory_router, prefix=settings.API_PREFIX)
app.include_router(products_router, prefix=settings.API_PREFIX)
app.include_router(forecast_router, prefix=settings.API_PREFIX)
app.include_router(alerts_router, prefix=settings.API_PREFIX)
app.include_router(ai_insights_router, prefix=settings.API_PREFIX)
app.include_router(stores_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(upload_router, prefix=settings.API_PREFIX)
app.include_router(demo_router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def on_startup():
    init_db()
    # Check if database has data; if not, seed it automatically
    seed_database(force=False)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RetailPulse AI Engine",
        "database": "connected"
    }

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check if frontend/dist exists
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_frontend_root():
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"app": settings.PROJECT_NAME, "status": "online"}

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"app": settings.PROJECT_NAME, "status": "online"}
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "tagline": settings.TAGLINE,
            "version": settings.VERSION,
            "status": "online",
            "docs_url": "/docs"
        }
