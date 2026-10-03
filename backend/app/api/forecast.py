from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import pandas as pd
from backend.app.database.connection import get_db
from backend.app.models.schema import ProductModel, InventoryModel, SaleModel, StoreModel, ForecastRequest
from backend.app.ml.engine import demand_forecaster
from backend.app.services.inventory_intelligence import InventoryIntelligence

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("/options")
def get_forecast_options(db: Session = Depends(get_db)):
    products = db.query(ProductModel).all()
    stores = db.query(StoreModel).all()
    categories = sorted(list(set(p.category for p in products)))

    return {
        "products": [{"id": p.product_id, "name": p.product_name, "category": p.category} for p in products],
        "stores": [{"id": s.store_id, "name": s.store_name, "region": s.region} for s in stores],
        "categories": categories,
        "horizons": [7, 14, 30],
        "models": [
            {"id": "random_forest", "name": "Random Forest Regressor"},
            {"id": "gradient_boosting", "name": "Gradient Boosting Regressor"}
        ]
    }

@router.get("/{product_id}")
def get_product_forecast(
    product_id: str,
    store_id: Optional[str] = "all",
    horizon: int = Query(7, ge=7, le=30),
    model_type: str = Query("random_forest", regex="^(random_forest|gradient_boosting)$"),
    db: Session = Depends(get_db)
):
    prod = db.query(ProductModel).filter(ProductModel.product_id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    inv = db.query(InventoryModel).filter(InventoryModel.product_id == product_id).first()
    current_stock = inv.current_stock if inv else 100

    # Fetch sales
    sales_query = db.query(SaleModel).filter(SaleModel.product_id == product_id)
    if store_id and store_id != "all":
        sales_query = sales_query.filter(SaleModel.store_id == store_id)
    sales_rows = sales_query.all()

    sales_df = pd.DataFrame([
        {
            "product_id": s.product_id,
            "date": s.date,
            "quantity": s.quantity,
            "unit_price": s.unit_price,
            "discount": s.discount,
            "revenue": s.revenue,
            "cost": s.cost,
            "store_id": s.store_id
        }
        for s in sales_rows
    ])

    if sales_df.empty:
        raise HTTPException(status_code=400, detail="Insufficient transaction records for this product.")

    fc_result = demand_forecaster.forecast_demand(
        sales_df,
        product_id=product_id,
        store_id=store_id if store_id != "all" else None,
        horizon_days=horizon,
        model_type=model_type
    )

    total_pred = sum(p["predicted_demand"] for p in fc_result["forecast_points"])
    shortage_or_excess = round(current_stock - total_pred, 1)

    daily_avg = fc_result["historical_daily_avg"]
    lead_time = prod.lead_time_days or 7
    days_left = round(current_stock / max(0.5, daily_avg), 1)

    if days_left <= lead_time or shortage_or_excess < 0:
        risk_level = "CRITICAL"
        action = f"Immediate reorder of {max(50, int(total_pred * 1.5 - current_stock))} units needed to prevent stockout in {days_left} days."
    elif days_left <= lead_time * 2.0:
        risk_level = "LOW STOCK"
        action = f"Plan purchase order for {max(30, int(total_pred * 1.2 - current_stock))} units."
    elif days_left > 40:
        risk_level = "OVERSTOCK"
        action = f"Excess inventory of {int(current_stock - total_pred)} units. Launch clearance/promo campaign."
    else:
        risk_level = "HEALTHY"
        action = "Stock levels optimal for forecasted velocity."

    # Historical demand series (last 21 days) for chart
    sales_df["day"] = pd.to_datetime(sales_df["date"]).dt.strftime("%Y-%m-%d")
    hist_daily = sales_df.groupby("day")["quantity"].sum().reset_index().tail(21).to_dict(orient="records")

    return {
        "product_id": prod.product_id,
        "product_name": prod.product_name,
        "category": prod.category,
        "store_id": store_id,
        "horizon_days": horizon,
        "historical_daily_avg": daily_avg,
        "current_stock": current_stock,
        "total_predicted_demand": round(total_pred, 1),
        "expected_shortage_or_excess": shortage_or_excess,
        "is_shortage": shortage_or_excess < 0,
        "risk_level": risk_level,
        "recommended_action": action,
        "historical_series": hist_daily,
        "forecast_points": fc_result["forecast_points"],
        "model_metrics": fc_result.get("model_metrics", {}),
        "active_model": "Random Forest Regressor" if model_type == "random_forest" else "Gradient Boosting Regressor"
    }

@router.post("")
def create_custom_forecast(req: ForecastRequest, db: Session = Depends(get_db)):
    return get_product_forecast(
        product_id=req.product_id,
        store_id=req.store_id or "all",
        horizon=req.horizon_days,
        model_type=req.model_type or "random_forest",
        db=db
    )
