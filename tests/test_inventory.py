import pandas as pd
from backend.app.services.inventory_intelligence import InventoryIntelligence

def test_inventory_calculations_critical():
    prod = {
        "product_id": "P-101",
        "product_name": "Wireless Headphones",
        "category": "Electronics",
        "cost_price": 4000.0,
        "selling_price": 7000.0,
        "supplier": "AuraTech",
        "lead_time_days": 7
    }
    inv = {
        "current_stock": 40,
        "reorder_level": 150,
        "reorder_quantity": 200,
        "warehouse": "WH-Central"
    }
    # Simulate daily demand of ~20 units/day
    sales_records = []
    for d in range(1, 30):
        sales_records.append({
            "product_id": "P-101",
            "date": f"2026-01-{d:02d} 12:00:00",
            "quantity": 20,
            "cost": 80000.0
        })
    sales_df = pd.DataFrame(sales_records)

    result = InventoryIntelligence.analyze_product_inventory(prod, inv, sales_df)
    
    assert result["daily_demand"] == 20.0
    assert result["days_remaining"] == 2.0  # 40 / 20 = 2 days
    assert result["risk"] == "CRITICAL"
    assert result["recommended_order"] > 0
    assert result["reorder_level"] > 140

def test_inventory_calculations_overstock():
    prod = {
        "product_id": "P-103",
        "product_name": "Bluetooth Speaker",
        "category": "Electronics",
        "cost_price": 1800.0,
        "selling_price": 3500.0,
        "supplier": "AuraTech",
        "lead_time_days": 5
    }
    inv = {
        "current_stock": 900,
        "warehouse": "WH-Central"
    }
    sales_records = []
    for d in range(1, 30):
        sales_records.append({
            "product_id": "P-103",
            "date": f"2026-01-{d:02d} 12:00:00",
            "quantity": 10,
            "cost": 18000.0
        })
    sales_df = pd.DataFrame(sales_records)

    result = InventoryIntelligence.analyze_product_inventory(prod, inv, sales_df)
    assert result["daily_demand"] == 10.0
    assert result["days_remaining"] == 90.0
    assert result["risk"] == "OVERSTOCK"
