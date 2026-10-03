"""
Database Seeder & Demo Reset Engine
Seeds products, stores, inventory, sales, and automated initial alerts into SQLite / PostgreSQL.
"""

import os
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.database.connection import SessionLocal, init_db
from backend.app.models.schema import ProductModel, StoreModel, InventoryModel, SaleModel, AlertModel
from backend.app.utils.cleaner import DataCleaner
from backend.app.services.inventory_intelligence import InventoryIntelligence
from backend.app.services.ai_recommendation_engine import AIRecommendationEngine

# Workspace root data directory
WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_DIR = os.path.join(WORKSPACE_ROOT, "data")

def seed_database(force: bool = False):
    """
    Seeds database from CSV files in /data. If tables are already populated and not force, skips.
    """
    init_db()
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        existing_products = db.query(ProductModel).count()
        if existing_products > 0 and not force:
            print(f"Database already contains {existing_products} products. Skipping seeding.")
            return

        print("Seeding database...")
        # 1. Clear existing data if force
        if force:
            db.query(AlertModel).delete()
            db.query(SaleModel).delete()
            db.query(InventoryModel).delete()
            db.query(StoreModel).delete()
            db.query(ProductModel).delete()
            db.commit()

        # 2. Load Products CSV
        prod_path = os.path.join(DATA_DIR, "products.csv")
        if not os.path.exists(prod_path):
            from data.generate_dataset import main as gen_data
            gen_data()

        prod_df = pd.read_csv(prod_path)
        for _, row in prod_df.iterrows():
            prod = ProductModel(
                product_id=row["product_id"],
                product_name=row["product_name"],
                category=row["category"],
                brand=row.get("brand", "Generic"),
                cost_price=float(row["cost_price"]),
                selling_price=float(row["selling_price"]),
                supplier=row.get("supplier", "Global Supplier"),
                lead_time_days=int(row.get("lead_time_days", 7))
            )
            db.add(prod)
        db.commit()
        print(f"Seeded {len(prod_df)} products.")

        # 3. Load Stores from STORES list
        from data.generate_dataset import STORES
        for s in STORES:
            st = StoreModel(
                store_id=s["id"],
                store_name=s["name"],
                region=s["region"],
                weight=s.get("weight", 1.0)
            )
            db.add(st)
        db.commit()
        print(f"Seeded {len(STORES)} stores.")

        # 4. Load Inventory CSV
        inv_path = os.path.join(DATA_DIR, "inventory.csv")
        inv_df = pd.read_csv(inv_path)
        for _, row in inv_df.iterrows():
            inv = InventoryModel(
                product_id=row["product_id"],
                product_name=row["product_name"],
                category=row["category"],
                current_stock=int(row["current_stock"]),
                reorder_level=int(row["reorder_level"]),
                reorder_quantity=int(row["reorder_quantity"]),
                supplier=row.get("supplier", "Global Supplier"),
                lead_time_days=int(row.get("lead_time_days", 7)),
                warehouse=row.get("warehouse", "WH-Central"),
                updated_at=datetime.utcnow()
            )
            db.add(inv)
        db.commit()
        print(f"Seeded {len(inv_df)} inventory items.")

        # 5. Load and Clean Sales CSV
        sales_path = os.path.join(DATA_DIR, "sales.csv")
        raw_sales_df = pd.read_csv(sales_path)
        clean_sales_df, clean_report = DataCleaner.clean_sales_dataframe(raw_sales_df)
        print(f"Cleaned sales dataset: Quality Score {clean_report['quality_score']}% (rows: {len(clean_sales_df)})")

        # Insert sales in batches for performance
        batch_size = 5000
        sales_to_insert = []
        for _, row in clean_sales_df.iterrows():
            sale = SaleModel(
                transaction_id=str(row["transaction_id"]),
                date=pd.to_datetime(row["date"]),
                product_id=str(row["product_id"]),
                product_name=str(row["product_name"]),
                category=str(row["category"]),
                store_id=str(row["store_id"]),
                store_name=str(row["store_name"]),
                region=str(row["region"]),
                quantity=int(row["quantity"]),
                unit_price=float(row["unit_price"]),
                discount=float(row.get("discount", 0.0)),
                revenue=float(row["revenue"]),
                cost=float(row["cost"]),
                profit=float(row["profit"]),
                customer_id=str(row.get("customer_id", "CUST-00000")),
                payment_method=str(row.get("payment_method", "Credit Card"))
            )
            sales_to_insert.append(sale)
            if len(sales_to_insert) >= batch_size:
                db.bulk_save_objects(sales_to_insert)
                db.commit()
                sales_to_insert = []

        if sales_to_insert:
            db.bulk_save_objects(sales_to_insert)
            db.commit()
        print(f"Seeded {len(clean_sales_df)} sales records.")

        # 6. Generate Initial Automated Alerts
        # Perform inventory intelligence analysis
        prod_list = prod_df.to_dict(orient="records")
        inv_map = {row["product_id"]: row.to_dict() for _, row in inv_df.iterrows()}
        analyzed_items = []
        for p in prod_list:
            inv_row = inv_map.get(p["product_id"], {})
            analyzed = InventoryIntelligence.analyze_product_inventory(p, inv_row, clean_sales_df)
            analyzed_items.append(analyzed)

        recs = AIRecommendationEngine.generate_product_recommendations(analyzed_items, clean_sales_df)
        for r in recs:
            alert_type = (
                "stockout" if r["type"] == "STOCKOUT_ALERT" else (
                    "overstock" if r["type"] == "OVERSTOCK_MITIGATION" else "demand_spike"
                )
            )
            severity = "critical" if r["severity"] == "CRITICAL" else ("warning" if r["severity"] == "WARNING" else "info")
            alert = AlertModel(
                alert_type=alert_type,
                severity=severity,
                product_id=r["product_id"],
                product_name=r["product_name"],
                category=r.get("category", "Retail"),
                title=f"{r['badge']}: {r['product_name']}",
                message=r["problem"],
                impact=r["predicted_impact"],
                recommended_action=r["recommended_action"],
                status="active",
                created_at=datetime.utcnow()
            )
            db.add(alert)
        db.commit()
        print(f"Generated {len(recs)} initial smart alerts.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database(force=True)
