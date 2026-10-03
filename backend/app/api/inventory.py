from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import pandas as pd
from backend.app.database.connection import get_db
from backend.app.models.schema import ProductModel, InventoryModel, SaleModel
from backend.app.services.inventory_intelligence import InventoryIntelligence

router = APIRouter(prefix="/inventory", tags=["Inventory"])

def get_analyzed_inventory_list(db: Session) -> List[dict]:
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

    sales_records = db.query(SaleModel.product_id, SaleModel.date, SaleModel.quantity, SaleModel.cost).all()
    sales_df = pd.DataFrame([{"product_id": s[0], "date": s[1], "quantity": s[2], "cost": s[3]} for s in sales_records])

    items = []
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
        items.append(analyzed)

    return items, sales_df

@router.get("")
def list_inventory(
    search: Optional[str] = None,
    category: Optional[str] = None,
    risk: Optional[str] = None,
    supplier: Optional[str] = None,
    warehouse: Optional[str] = None,
    db: Session = Depends(get_db)
):
    items, sales_df = get_analyzed_inventory_list(db)
    kpis = InventoryIntelligence.calculate_inventory_kpis(items, sales_df)

    filtered = items
    if search:
        s = search.lower()
        filtered = [i for i in filtered if s in i["product_name"].lower() or s in i["product_id"].lower()]
    if category and category != "all":
        filtered = [i for i in filtered if i["category"].lower() == category.lower()]
    if risk and risk != "all":
        filtered = [i for i in filtered if i["risk"].lower() == risk.lower()]
    if supplier and supplier != "all":
        filtered = [i for i in filtered if i["supplier"].lower() == supplier.lower()]
    if warehouse and warehouse != "all":
        filtered = [i for i in filtered if i["warehouse"].lower() == warehouse.lower()]

    categories = sorted(list(set(i["category"] for i in items)))
    suppliers = sorted(list(set(i["supplier"] for i in items)))
    warehouses = sorted(list(set(i["warehouse"] for i in items)))

    return {
        "items": filtered,
        "kpis": kpis,
        "filter_options": {
            "categories": categories,
            "suppliers": suppliers,
            "warehouses": warehouses,
            "risks": ["HEALTHY", "LOW STOCK", "CRITICAL", "OVERSTOCK"]
        }
    }

@router.put("/reorder/{product_id}")
def update_stock(product_id: str, quantity: int = Query(..., ge=1), db: Session = Depends(get_db)):
    inv = db.query(InventoryModel).filter(InventoryModel.product_id == product_id).first()
    if not inv:
        return {"error": "Inventory record not found"}
    inv.current_stock += quantity
    db.commit()
    return {"message": f"Successfully received {quantity} units for {inv.product_name}", "current_stock": inv.current_stock}
