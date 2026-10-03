from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd
from backend.app.database.connection import get_db
from backend.app.models.schema import StoreModel, SaleModel

router = APIRouter(prefix="/stores", tags=["Stores"])

@router.get("")
def list_stores(db: Session = Depends(get_db)):
    stores = db.query(StoreModel).all()
    sales = db.query(SaleModel.store_id, SaleModel.revenue, SaleModel.profit, SaleModel.quantity).all()
    
    sales_df = pd.DataFrame([{"store_id": s[0], "revenue": s[1], "profit": s[2], "quantity": s[3]} for s in sales])
    
    store_metrics = {}
    if not sales_df.empty:
        agg = sales_df.groupby("store_id").agg(
            revenue=("revenue", "sum"),
            profit=("profit", "sum"),
            units=("quantity", "sum"),
            orders=("store_id", "count")
        ).reset_index()
        for _, row in agg.iterrows():
            store_metrics[row["store_id"]] = {
                "revenue": round(float(row["revenue"]), 2),
                "profit": round(float(row["profit"]), 2),
                "units": int(row["units"]),
                "orders": int(row["orders"]),
                "margin_pct": round((float(row["profit"]) / float(row["revenue"])) * 100, 1) if row["revenue"] > 0 else 0.0
            }

    result = []
    for s in stores:
        m = store_metrics.get(s.store_id, {"revenue": 0.0, "profit": 0.0, "units": 0, "orders": 0, "margin_pct": 0.0})
        result.append({
            "store_id": s.store_id,
            "store_name": s.store_name,
            "region": s.region,
            "weight": s.weight,
            **m
        })

    result.sort(key=lambda x: x["revenue"], reverse=True)
    return result
