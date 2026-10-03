"""
RetailPulse AI - ML Preprocessing CLI Utility
Extracts, cleans, and engineers time-series lag and rolling statistical features from sales data.
"""

import os
import sys
import pandas as pd

# Add workspace to path
WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

from backend.app.utils.cleaner import DataCleaner
from backend.app.ml.engine import demand_forecaster

def main():
    sales_path = os.path.join(WORKSPACE_ROOT, "data", "sales.csv")
    if not os.path.exists(sales_path):
        print("sales.csv not found. Please run data generator first.")
        return

    print("Loading and cleaning sales data...")
    raw_df = pd.read_csv(sales_path)
    clean_df, report = DataCleaner.clean_sales_dataframe(raw_df)
    print(f"Data Quality Score: {report['quality_score']}% | Final Rows: {report['final_rows']}")

    # Feature engineering demonstration for P-101
    daily = demand_forecaster.prepare_daily_series(clean_df, product_id="P-101")
    featured = demand_forecaster.create_features(daily)
    print("Engineered Features Sample:")
    print(featured[["date", "quantity", "lag_1", "lag_7", "rolling_mean_7", "promotion_flag"]].tail(5))

if __name__ == "__main__":
    main()
