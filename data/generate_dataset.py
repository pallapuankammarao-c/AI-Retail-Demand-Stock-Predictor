"""
RetailPulse AI - Realistic Retail Dataset Generator
Generates:
1. products.csv (Product Master Catalog)
2. inventory.csv (Current Warehouse Stock & Lead Times)
3. sales.csv (50,000+ realistic transaction records with seasonality, promotions, and trends)
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

random.seed(42)
np.random.seed(42)

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

PRODUCTS = [
    {"id": "P-101", "name": "Wireless Headphones", "category": "Electronics", "brand": "SonicWave", "cost": 4200.0, "price": 6999.0, "supplier": "AuraTech Global", "lead_time": 7, "base_daily": 22},
    {"id": "P-102", "name": "Laptop Bag", "category": "Accessories", "brand": "UrbanFlex", "cost": 1100.0, "price": 2499.0, "supplier": "Venture Leathercraft", "lead_time": 5, "base_daily": 32},
    {"id": "P-103", "name": "Bluetooth Speaker", "category": "Electronics", "brand": "BassBoom", "cost": 1800.0, "price": 3499.0, "supplier": "AuraTech Global", "lead_time": 6, "base_daily": 10},
    {"id": "P-104", "name": "Smart Watch Ultra", "category": "Electronics", "brand": "PulseWear", "cost": 8500.0, "price": 14999.0, "supplier": "TitanMicro Tech", "lead_time": 8, "base_daily": 18},
    {"id": "P-105", "name": "Ergonomic Office Chair", "category": "Furniture", "brand": "OrthoDesk", "cost": 7200.0, "price": 12999.0, "supplier": "ComfortLine Corp", "lead_time": 14, "base_daily": 8},
    {"id": "P-106", "name": "RGB Gaming Mouse", "category": "Accessories", "brand": "ViperTech", "cost": 950.0, "price": 1999.0, "supplier": "TitanMicro Tech", "lead_time": 5, "base_daily": 25},
    {"id": "P-107", "name": "Air Purifier Pro", "category": "Home Appliances", "brand": "AeroPure", "cost": 5500.0, "price": 9999.0, "supplier": "Apex Appliances", "lead_time": 10, "base_daily": 12},
    {"id": "P-108", "name": "Mechanical Keyboard", "category": "Accessories", "brand": "KeyCraft", "cost": 2100.0, "price": 4299.0, "supplier": "TitanMicro Tech", "lead_time": 6, "base_daily": 19},
    {"id": "P-109", "name": "Espresso Coffee Maker", "category": "Home Appliances", "brand": "CafféElite", "cost": 4800.0, "price": 8499.0, "supplier": "Apex Appliances", "lead_time": 9, "base_daily": 14},
    {"id": "P-110", "name": "USB-C Multi-Hub", "category": "Accessories", "brand": "ConnectX", "cost": 650.0, "price": 1499.0, "supplier": "AuraTech Global", "lead_time": 4, "base_daily": 30},
    {"id": "P-111", "name": "Stainless Steel Bottle 1L", "category": "Lifestyle", "brand": "HydroPeak", "cost": 350.0, "price": 899.0, "supplier": "PureElements Ltd", "lead_time": 4, "base_daily": 35},
    {"id": "P-112", "name": "Non-Slip Yoga Mat", "category": "Lifestyle", "brand": "ZenCore", "cost": 500.0, "price": 1299.0, "supplier": "PureElements Ltd", "lead_time": 5, "base_daily": 16},
    {"id": "P-113", "name": "Noise Cancelling Earbuds", "category": "Electronics", "brand": "SonicWave", "cost": 2800.0, "price": 4999.0, "supplier": "AuraTech Global", "lead_time": 7, "base_daily": 26},
    {"id": "P-114", "name": "Adjustable Standing Desk", "category": "Furniture", "brand": "OrthoDesk", "cost": 14000.0, "price": 24999.0, "supplier": "ComfortLine Corp", "lead_time": 18, "base_daily": 5},
    {"id": "P-115", "name": "Ceramic Electric Kettle", "category": "Home Appliances", "brand": "CafféElite", "cost": 1200.0, "price": 2299.0, "supplier": "Apex Appliances", "lead_time": 6, "base_daily": 20},
    {"id": "P-116", "name": "4K Ultra-Wide Monitor", "category": "Electronics", "brand": "ViewMaster", "cost": 18500.0, "price": 29999.0, "supplier": "TitanMicro Tech", "lead_time": 12, "base_daily": 7},
    {"id": "P-117", "name": "Wireless Charging Pad", "category": "Accessories", "brand": "ConnectX", "cost": 700.0, "price": 1699.0, "supplier": "AuraTech Global", "lead_time": 5, "base_daily": 24},
    {"id": "P-118", "name": "Smart LED Desk Lamp", "category": "Home Appliances", "brand": "LumiGlow", "cost": 1400.0, "price": 2799.0, "supplier": "Apex Appliances", "lead_time": 6, "base_daily": 15},
    {"id": "P-119", "name": "Heavy-Duty Backpack", "category": "Accessories", "brand": "UrbanFlex", "cost": 1300.0, "price": 2999.0, "supplier": "Venture Leathercraft", "lead_time": 7, "base_daily": 17},
    {"id": "P-120", "name": "Fitness Tracking Band", "category": "Electronics", "brand": "PulseWear", "cost": 1600.0, "price": 3199.0, "supplier": "TitanMicro Tech", "lead_time": 6, "base_daily": 21},
]

STORES = [
    {"id": "ST-01", "name": "Metro Flagship", "region": "North", "weight": 1.4},
    {"id": "ST-02", "name": "Downtown Tech Center", "region": "West", "weight": 1.3},
    {"id": "ST-03", "name": "Suburbia Mega Mall", "region": "North", "weight": 1.1},
    {"id": "ST-04", "name": "Tech Park Hub", "region": "South", "weight": 1.5},
    {"id": "ST-05", "name": "Riverside Plaza", "region": "East", "weight": 0.9},
    {"id": "ST-06", "name": "Airport Galleria", "region": "West", "weight": 1.0},
    {"id": "ST-07", "name": "Central Grand Galleria", "region": "Central", "weight": 1.25},
    {"id": "ST-08", "name": "Coastal Bay Mall", "region": "South", "weight": 0.85},
]

PAYMENT_METHODS = ["Credit Card", "UPI", "Net Banking", "Debit Card", "Cash on Delivery"]
WAREHOUSES = ["WH-Central", "WH-North", "WH-West", "WH-South"]

def generate_products_df():
    rows = []
    for p in PRODUCTS:
        rows.append({
            "product_id": p["id"],
            "product_name": p["name"],
            "category": p["category"],
            "brand": p["brand"],
            "cost_price": p["cost"],
            "selling_price": p["price"],
            "supplier": p["supplier"],
            "lead_time_days": p["lead_time"]
        })
    return pd.DataFrame(rows)

def generate_inventory_df():
    """
    Generate inventory with realistic stocks:
    - Wireless Headphones (P-101): ~84 units (Critical / High Stockout Risk)
    - Laptop Bag (P-102): ~180 units (Low stock / Stockout in ~5 days)
    - Bluetooth Speaker (P-103): ~820 units (Overstock / 500+ excess)
    - Others calibrated for healthy, low, or critical
    """
    rows = []
    stock_overrides = {
        "P-101": 84,   # Critical
        "P-102": 180,  # Low Stock / Expected shortage
        "P-103": 820,  # Overstock
        "P-104": 62,   # Critical
        "P-105": 95,   # Healthy
        "P-106": 320,  # Healthy
        "P-107": 45,   # Low Stock
        "P-108": 210,  # Healthy
        "P-109": 580,  # Overstock
        "P-110": 110,  # Low Stock
        "P-111": 750,  # Overstock
        "P-112": 140,  # Healthy
        "P-113": 75,   # Critical
        "P-114": 40,   # Healthy
        "P-115": 230,  # Healthy
        "P-116": 35,   # Low Stock
        "P-117": 195,  # Healthy
        "P-118": 160,  # Healthy
        "P-119": 85,   # Low Stock
        "P-120": 260,  # Healthy
    }

    for p in PRODUCTS:
        current_stock = stock_overrides.get(p["id"], random.randint(120, 350))
        daily_demand = p["base_daily"]
        reorder_level = int(daily_demand * p["lead_time"] * 1.5)  # Reorder level includes buffer
        reorder_qty = int(daily_demand * 14)  # 2 weeks supply

        rows.append({
            "product_id": p["id"],
            "product_name": p["name"],
            "category": p["category"],
            "current_stock": current_stock,
            "reorder_level": reorder_level,
            "reorder_quantity": reorder_qty,
            "supplier": p["supplier"],
            "lead_time_days": p["lead_time"],
            "warehouse": random.choice(WAREHOUSES)
        })
    return pd.DataFrame(rows)

def generate_sales_data(target_records=52000):
    """
    Generates over 50,000 realistic sales transaction records spanning 365 days.
    Simulates:
    - Weekly seasonality (weekends have +35% traffic)
    - Monthly promotions (e.g. End of month sales, Diwali/Black Friday festival surge in Q4)
    - Product-specific baseline demand
    - Store multipliers
    - Realistic margins, discount levels, payment types
    """
    print(f"Generating realistic sales dataset (~{target_records} records)...")
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)

    records = []
    tx_id_counter = 100001

    # Pre-generate dates
    days_span = (end_date - start_date).days
    all_dates = [start_date + timedelta(days=d) for d in range(days_span)]

    # Product map
    prod_map = {p["id"]: p for p in PRODUCTS}

    # Generate transactions day by day to preserve natural time sequence
    for cur_date in all_dates:
        is_weekend = cur_date.weekday() >= 5
        day_of_month = cur_date.day
        month = cur_date.month

        # Seasonal multiplier (October-December peak holiday surge)
        season_mult = 1.35 if month in [10, 11, 12] else (1.15 if month in [5, 6] else 1.0)
        weekend_mult = 1.35 if is_weekend else 1.0
        # Promo spikes (e.g. 1st of month, mid-month festival, 25-28th)
        has_promo = (day_of_month in [1, 2, 14, 15, 26, 27]) or (month in [11, 12] and cur_date.weekday() == 4)
        promo_mult = 1.45 if has_promo else 1.0

        daily_scale = season_mult * weekend_mult * promo_mult

        # Target 120-170 transactions per day
        base_tx_count = int(random.normalvariate(135, 15) * daily_scale)
        base_tx_count = max(40, base_tx_count)

        for _ in range(base_tx_count):
            store = random.choices(STORES, weights=[s["weight"] for s in STORES])[0]
            # Select product based on baseline demand
            prod = random.choices(PRODUCTS, weights=[p["base_daily"] for p in PRODUCTS])[0]

            # Quantity (usually 1-3, occasionally larger for accessories/bottles)
            if prod["category"] == "Accessories" or prod["category"] == "Lifestyle":
                qty = np.random.choice([1, 2, 3, 4], p=[0.55, 0.28, 0.12, 0.05])
            elif prod["category"] == "Furniture":
                qty = 1
            else:
                qty = np.random.choice([1, 2, 3], p=[0.75, 0.20, 0.05])

            unit_price = prod["price"]
            cost_unit = prod["cost"]

            # Discount logic: 0%, 5%, 10%, 15%, 20%
            if has_promo:
                discount_pct = np.random.choice([0.10, 0.15, 0.20, 0.25], p=[0.35, 0.35, 0.20, 0.10])
            else:
                discount_pct = np.random.choice([0.0, 0.05, 0.10], p=[0.65, 0.25, 0.10])

            discount_amt = round(unit_price * qty * discount_pct, 2)
            revenue = round((unit_price * qty) - discount_amt, 2)
            total_cost = round(cost_unit * qty, 2)
            profit = round(revenue - total_cost, 2)

            customer_num = random.randint(1001, 8500)
            customer_id = f"CUST-{customer_num:05d}"
            payment = random.choices(PAYMENT_METHODS, weights=[0.40, 0.35, 0.10, 0.10, 0.05])[0]

            # Transaction timestamp
            hour = random.randint(9, 21)
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            tx_time = cur_date.replace(hour=hour, minute=minute, second=second)

            records.append({
                "transaction_id": f"TX-{tx_id_counter}",
                "date": tx_time.strftime("%Y-%m-%d %H:%M:%S"),
                "product_id": prod["id"],
                "product_name": prod["name"],
                "category": prod["category"],
                "store_id": store["id"],
                "store_name": store["name"],
                "region": store["region"],
                "quantity": int(qty),
                "unit_price": round(unit_price, 2),
                "discount": discount_amt,
                "revenue": revenue,
                "cost": total_cost,
                "profit": profit,
                "customer_id": customer_id,
                "payment_method": payment
            })
            tx_id_counter += 1

            if len(records) >= target_records and cur_date == all_dates[-1]:
                break

    df = pd.DataFrame(records)
    print(f"Generated {len(df)} sales transactions.")
    return df

def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    products_df = generate_products_df()
    products_path = os.path.join(DATA_DIR, "products.csv")
    products_df.to_csv(products_path, index=False)
    print(f"Saved products catalog to {products_path} ({len(products_df)} products)")

    inventory_df = generate_inventory_df()
    inventory_path = os.path.join(DATA_DIR, "inventory.csv")
    inventory_df.to_csv(inventory_path, index=False)
    print(f"Saved inventory snapshot to {inventory_path} ({len(inventory_df)} items)")

    sales_df = generate_sales_data(target_records=52000)
    sales_path = os.path.join(DATA_DIR, "sales.csv")
    sales_df.to_csv(sales_path, index=False)
    print(f"Saved sales dataset to {sales_path} ({len(sales_df)} rows, size: ~{os.path.getsize(sales_path)/(1024*1024):.2f} MB)")

if __name__ == "__main__":
    main()
