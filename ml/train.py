"""
RetailPulse AI - Model Training & Evaluation CLI Utility
Trains Random Forest and Gradient Boosting regressors across catalog products and compares MAE, RMSE, MAPE, and R2.
"""

import os
import sys
import pandas as pd

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from backend.app.ml.engine import demand_forecaster

def main():
    sales_path = os.path.join(WORKSPACE_ROOT, "data", "sales.csv")
    products_path = os.path.join(WORKSPACE_ROOT, "data", "products.csv")

    sales_df = pd.read_csv(sales_path)
    prod_df = pd.read_csv(products_path)

    print("=" * 60)
    print("Training Demand Forecasting Models for Top Catalog Products")
    print("=" * 60)

    for _, p in prod_df.head(5).iterrows():
        pid = p["product_id"]
        pname = p["product_name"]
        print(f"\nTraining models for: {pname} ({pid})...")
        metrics = demand_forecaster.train_models_for_product(sales_df, pid)
        print(f"  Best Model: {metrics['best_model']}")
        print(f"  Random Forest   -> MAE: {metrics['rf_metrics']['mae']}, RMSE: {metrics['rf_metrics']['rmse']}, MAPE: {metrics['rf_metrics']['mape']}%, R2: {metrics['rf_metrics']['r2']}")
        print(f"  Gradient Boost  -> MAE: {metrics['gb_metrics']['mae']}, RMSE: {metrics['gb_metrics']['rmse']}, MAPE: {metrics['gb_metrics']['mape']}%, R2: {metrics['gb_metrics']['r2']}")

if __name__ == "__main__":
    main()
