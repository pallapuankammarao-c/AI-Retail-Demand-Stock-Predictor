from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd
from backend.app.database.connection import get_db
from backend.app.models.schema import SaleModel, ProductModel, InventoryModel, AlertModel, StoreModel
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.inventory_intelligence import InventoryIntelligence

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # 1. Fetch sales for analytics
    # Fast aggregation via Pandas on sales table
    sales_records = db.query(SaleModel).all()
    sales_data = [
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
            "profit": s.profit
        }
        for s in sales_records
    ]
    sales_df = pd.DataFrame(sales_data)

    sales_kpis = AnalyticsService.get_sales_kpis(sales_df)

    # 2. Inventory Analysis
    products = db.query(ProductModel).all()
    inventories = db.query(InventoryModel).all()
    inv_map = {i.product_id: {
        "current_stock": i.current_stock,
        "reorder_level": i.reorder_level,
        "reorder_quantity": i.reorder_quantity,
        "supplier": i.supplier,
        "lead_time_days": i.lead_time_days,
        "warehouse": i.warehouse
    } for i in inventories}

    analyzed_inventory = []
    for p in products:
        p_dict = {
            "product_id": p.product_id,
            "product_name": p.product_name,
            "category": p.category,
            "cost_price": p.cost_price,
            "selling_price": p.selling_price,
            "supplier": p.supplier,
            "lead_time_days": p.lead_time_days
        }
        inv_dict = inv_map.get(p.product_id, {})
        analyzed = InventoryIntelligence.analyze_product_inventory(p_dict, inv_dict, sales_df)
        analyzed_inventory.append(analyzed)

    inv_kpis = InventoryIntelligence.calculate_inventory_kpis(analyzed_inventory, sales_df)

    # 3. Chart Data
    revenue_trend = AnalyticsService.get_revenue_trend(sales_df, days=30)
    category_sales = AnalyticsService.get_sales_by_category(sales_df)
    prod_extremes = AnalyticsService.get_top_and_bottom_products(sales_df, limit=5)
    regional_store = AnalyticsService.get_regional_and_store_performance(sales_df)

    # 4. Recent Alerts
    alerts = db.query(AlertModel).filter(AlertModel.status == "active").order_by(AlertModel.created_at.desc()).limit(5).all()
    alerts_data = [
        {
            "id": a.id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "product_name": a.product_name,
            "title": a.title,
            "message": a.message,
            "impact": a.impact,
            "recommended_action": a.recommended_action,
            "created_at": a.created_at.isoformat()
        }
        for a in alerts
    ]

    return {
        "kpis": {
            "revenue": sales_kpis["total_revenue"],
            "profit": sales_kpis["total_profit"],
            "orders": sales_kpis["total_orders"],
            "units_sold": sales_kpis["units_sold"],
            "low_stock_count": inv_kpis["low_stock_count"],
            "stockout_risk_count": inv_kpis["critical_stockout_risk"],
            "overstock_count": inv_kpis["overstock_count"],
            "inventory_value": inv_kpis["total_inventory_value"],
            "profit_margin_pct": sales_kpis["profit_margin_pct"],
            "average_daily_sales": sales_kpis["average_daily_sales"]
        },
        "charts": {
            "revenue_trend": revenue_trend,
            "category_sales": category_sales,
            "top_products": prod_extremes["top_products"],
            "stock_health_distribution": inv_kpis["stock_health_distribution"],
            "regional_performance": regional_store["by_region"],
            "store_performance": regional_store["by_store"]
        },
        "recent_alerts": alerts_data,
        "critical_items": [i for i in analyzed_inventory if i["risk"] in ["CRITICAL", "LOW STOCK"]][:4]
    }
