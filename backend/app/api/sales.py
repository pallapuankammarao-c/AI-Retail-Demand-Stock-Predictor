from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import pandas as pd
from backend.app.database.connection import get_db
from backend.app.models.schema import SaleModel
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/sales", tags=["Sales"])

def get_sales_dataframe(db: Session, category: Optional[str] = None, store_id: Optional[str] = None):
    query = db.query(SaleModel)
    if category and category != "all":
        query = query.filter(SaleModel.category == category)
    if store_id and store_id != "all":
        query = query.filter(SaleModel.store_id == store_id)
    
    records = query.all()
    if not records:
        return pd.DataFrame()

    data = [
        {
            "transaction_id": s.transaction_id,
            "date": s.date,
            "product_id": s.product_id,
            "product_name": s.product_name,
            "category": s.category,
            "store_id": s.store_id,
            "store_name": s.store_name,
            "region": s.region,
            "quantity": s.quantity,
            "unit_price": s.unit_price,
            "discount": s.discount,
            "revenue": s.revenue,
            "cost": s.cost,
            "profit": s.profit,
            "customer_id": s.customer_id,
            "payment_method": s.payment_method
        }
        for s in records
    ]
    return pd.DataFrame(data)

@router.get("")
def list_sales(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    category: Optional[str] = None,
    store_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SaleModel)
    if category and category != "all":
        query = query.filter(SaleModel.category == category)
    if store_id and store_id != "all":
        query = query.filter(SaleModel.store_id == store_id)
    if search:
        query = query.filter(SaleModel.product_name.ilike(f"%{search}%") | SaleModel.transaction_id.ilike(f"%{search}%"))

    total = query.count()
    records = query.order_by(SaleModel.date.desc()).offset((page - 1) * limit).limit(limit).all()

    items = [
        {
            "transaction_id": r.transaction_id,
            "date": r.date.strftime("%Y-%m-%d %H:%M"),
            "product_id": r.product_id,
            "product_name": r.product_name,
            "category": r.category,
            "store_name": r.store_name,
            "region": r.region,
            "quantity": r.quantity,
            "unit_price": r.unit_price,
            "discount": r.discount,
            "revenue": r.revenue,
            "profit": r.profit,
            "customer_id": r.customer_id,
            "payment_method": r.payment_method
        }
        for r in records
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/analytics")
def get_sales_analytics(
    category: Optional[str] = None,
    store_id: Optional[str] = None,
    days: int = Query(30, ge=7, le=365),
    db: Session = Depends(get_db)
):
    df = get_sales_dataframe(db, category, store_id)
    if df.empty:
        return {"kpis": {}, "revenue_trend": [], "by_category": [], "extremes": {}, "regional": {}, "discount_impact": {}}

    kpis = AnalyticsService.get_sales_kpis(df)
    trend = AnalyticsService.get_revenue_trend(df, days=days)
    by_cat = AnalyticsService.get_sales_by_category(df)
    extremes = AnalyticsService.get_top_and_bottom_products(df, limit=10)
    regional = AnalyticsService.get_regional_and_store_performance(df)
    discount = AnalyticsService.get_discount_impact(df)

    return {
        "kpis": kpis,
        "revenue_trend": trend,
        "by_category": by_cat,
        "top_10_products": extremes["top_products"],
        "bottom_10_products": extremes["bottom_products"],
        "store_performance": regional["by_store"],
        "regional_performance": regional["by_region"],
        "discount_impact": discount
    }
