from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from backend.app.database.connection import get_db
from backend.app.models.schema import AlertModel

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("")
def list_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AlertModel)
    if status and status != "all":
        query = query.filter(AlertModel.status == status)
    if severity and severity != "all":
        query = query.filter(AlertModel.severity == severity)
    if alert_type and alert_type != "all":
        query = query.filter(AlertModel.alert_type == alert_type)

    alerts = query.order_by(AlertModel.created_at.desc()).all()

    # Status counts
    all_alerts = db.query(AlertModel).all()
    active_count = sum(1 for a in all_alerts if a.status == "active")
    critical_count = sum(1 for a in all_alerts if a.severity == "critical" and a.status == "active")

    return {
        "alerts": [
            {
                "id": a.id,
                "alert_type": a.alert_type,
                "severity": a.severity,
                "product_id": a.product_id,
                "product_name": a.product_name,
                "category": a.category,
                "title": a.title,
                "message": a.message,
                "impact": a.impact,
                "recommended_action": a.recommended_action,
                "status": a.status,
                "created_at": a.created_at.isoformat()
            }
            for a in alerts
        ],
        "total_active": active_count,
        "critical_count": critical_count
    }

@router.patch("/{alert_id}/status")
def update_alert_status(alert_id: int, status: str = Query(..., regex="^(active|read|dismissed|resolved)$"), db: Session = Depends(get_db)):
    alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = status
    db.commit()
    return {"message": f"Alert #{alert_id} marked as {status}", "id": alert_id, "status": status}

@router.post("/resolve-all")
def resolve_all_alerts(db: Session = Depends(get_db)):
    db.query(AlertModel).filter(AlertModel.status == "active").update({"status": "resolved"})
    db.commit()
    return {"message": "All active alerts marked as resolved"}
