from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import pandas as pd
from datetime import datetime, timedelta
from backend.app.database.connection import get_db
from backend.app.models.schema import ProductModel, InventoryModel, SaleModel
from backend.app.services.inventory_intelligence import InventoryIntelligence
from backend.app.ml.engine import demand_forecaster

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProductModel)
    if search:
        query = query.filter(ProductModel.product_name.ilike(f"%{search}%") | ProductModel.product_id.ilike(f"%{search}%"))
    if category and category != "all":
        query = query.filter(ProductModel.category == category)

    products = query.all()
    inv_map = {i.product_id: i.current_stock for i in db.query(InventoryModel).all()}

    return [
        {
            "product_id": p.product_id,
            "product_name": p.product_name,
            "category": p.category,
            "brand": p.brand,
            "cost_price": p.cost_price,
            "selling_price": p.selling_price,
            "margin_pct": round(((p.selling_price - p.cost_price) / p.selling_price) * 100, 1),
            "supplier": p.supplier,
            "lead_time_days": p.lead_time_days,
            "current_stock": inv_map.get(p.product_id, 0)
        }
        for p in products
    ]

@router.get("/{product_id}")
def get_product_details(product_id: str, db: Session = Depends(get_db)):
    prod = db.query(ProductModel).filter(ProductModel.product_id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    inv = db.query(InventoryModel).filter(InventoryModel.product_id == product_id).first()
    sales = db.query(SaleModel).filter(SaleModel.product_id == product_id).all()

    sales_df = pd.DataFrame([
        {
            "product_id": s.product_id,
            "date": s.date,
            "quantity": s.quantity,
            "unit_price": s.unit_price,
            "revenue": s.revenue,
            "cost": s.cost,
            "profit": s.profit,
            "discount": s.discount,
            "store_id": s.store_id
        }
        for s in sales
    ])

    prod_dict = {
        "product_id": prod.product_id,
        "product_name": prod.product_name,
        "category": prod.category,
        "brand": prod.brand,
        "cost_price": prod.cost_price,
        "selling_price": prod.selling_price,
        "supplier": prod.supplier,
        "lead_time_days": prod.lead_time_days
    }
    inv_dict = {
        "current_stock": inv.current_stock if inv else 0,
        "reorder_level": inv.reorder_level if inv else 50,
        "reorder_quantity": inv.reorder_quantity if inv else 100,
        "supplier": inv.supplier if inv else prod.supplier,
        "lead_time_days": inv.lead_time_days if inv else prod.lead_time_days,
        "warehouse": inv.warehouse if inv else "WH-Central"
    }

    intelligence = InventoryIntelligence.analyze_product_inventory(prod_dict, inv_dict, sales_df)

    # Historical 30 days daily sales
    sales_df["day"] = pd.to_datetime(sales_df["date"]).dt.strftime("%Y-%m-%d")
    daily_hist = sales_df.groupby("day").agg(
        quantity=("quantity", "sum"),
        revenue=("revenue", "sum"),
        profit=("profit", "sum")
    ).reset_index().sort_values("day").tail(30).to_dict(orient="records")

    # Forecast next 14 days
    fc = demand_forecaster.forecast_demand(sales_df, product_id, horizon_days=14)

    # AI Inventory Advisor Text
    total_pred = sum(p["predicted_demand"] for p in fc["forecast_points"])
    shortage_excess = intelligence["current_stock"] - total_pred
    
    if intelligence["risk"] == "CRITICAL":
        ai_advice = f"CRITICAL STOCK ALERT: Sustained demand velocity ({intelligence['daily_demand']} units/day) will deplete current inventory ({intelligence['current_stock']} units) in ~{intelligence['days_remaining']} days. Recommended action: Place expedited order of {intelligence['recommended_order']} units from {prod.supplier}."
    elif intelligence["risk"] == "LOW STOCK":
        ai_advice = f"REORDER ADVISOR: Stock is approaching reorder threshold. 14-day forecasted demand is {int(total_pred)} units. Recommended action: Increase inventory by {intelligence['recommended_order']} units."
    elif intelligence["risk"] == "OVERSTOCK":
        ai_advice = f"CAPITAL OPTIMIZATION: Current stock of {intelligence['current_stock']} units substantially exceeds 30-day forecast. Recommended action: Freeze purchase orders and activate a promotional campaign to free up working capital."
    else:
        ai_advice = f"HEALTHY INVENTORY: Inventory levels are in optimal alignment with forecast velocity. Recommended action: Maintain standard schedule reorders."

    return {
        "product": prod_dict,
        "inventory": inv_dict,
        "intelligence": intelligence,
        "historical_sales_30d": daily_hist,
        "forecast_14d": fc["forecast_points"],
        "model_metrics": fc.get("model_metrics", {}),
        "ai_inventory_advisor": {
            "summary": ai_advice,
            "risk": intelligence["risk"],
            "recommended_units": intelligence["recommended_order"],
            "days_buffer": intelligence["days_remaining"]
        }
    }
