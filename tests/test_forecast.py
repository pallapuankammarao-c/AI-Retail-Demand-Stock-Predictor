import pandas as pd
from datetime import datetime, timedelta
from backend.app.ml.engine import demand_forecaster

def test_ml_demand_forecast_and_metrics():
    # Generate 60 days of mock sales for a product
    records = []
    base_date = datetime(2026, 1, 1)
    for i in range(60):
        d = base_date + timedelta(days=i)
        dow = d.weekday()
        # Higher sales on weekend
        q = 25 if dow in [5, 6] else 18
        records.append({
            "product_id": "P-101",
            "date": d.strftime("%Y-%m-%d %H:%M:%S"),
            "quantity": q,
            "unit_price": 6999.0,
            "discount": 0.0,
            "revenue": q * 6999.0,
            "cost": q * 4200.0,
            "store_id": "ST-01"
        })
    df = pd.DataFrame(records)

    # Train and test forecast
    fc = demand_forecaster.forecast_demand(df, product_id="P-101", horizon_days=7, model_type="random_forest")
    assert fc["horizon_days"] == 7
    assert len(fc["forecast_points"]) == 7
    assert "predicted_demand" in fc["forecast_points"][0]
    assert fc["forecast_points"][0]["predicted_demand"] > 0
    assert "model_metrics" in fc
