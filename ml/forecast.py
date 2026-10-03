"""
RetailPulse AI - Demand Forecast Inference CLI Utility
Generates 7, 14, and 30-day recursive forecasts with confidence bounds.
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
    sales_df = pd.read_csv(sales_path)

    product_id = sys.argv[1] if len(sys.argv) > 1 else "P-101"
    horizon = int(sys.argv[2]) if len(sys.argv) > 2 else 7

    print(f"Generating {horizon}-day demand forecast for SKU {product_id}...")
    res = demand_forecaster.forecast_demand(sales_df, product_id, horizon_days=horizon)

    print(f"Historical Daily Average: {res['historical_daily_avg']} units/day")
    print(f"\n{horizon}-Day Point Forecasts:")
    for pt in res["forecast_points"]:
        print(f"  {pt['date']}: {pt['predicted_demand']} units (90% Conf: [{pt['lower_bound']} - {pt['upper_bound']}])")

if __name__ == "__main__":
    main()
