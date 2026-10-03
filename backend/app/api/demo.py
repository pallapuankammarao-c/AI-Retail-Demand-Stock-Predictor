from fastapi import APIRouter
from backend.app.database.seed_data import seed_database

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/launch")
def launch_demo_mode():
    """
    One-click instant demo mode:
    Re-seeds realistic demo sales data, calculates inventory metrics, and triggers alerts.
    """
    seed_database(force=True)
    return {
        "status": "ready",
        "message": "Demo mode initialized successfully with 66,000+ sales transactions, 20 products, 8 stores, and active AI intelligence recommendations.",
        "dataset_ready": True
    }
