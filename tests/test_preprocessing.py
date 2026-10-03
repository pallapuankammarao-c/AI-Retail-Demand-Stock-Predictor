import pandas as pd
import numpy as np
from backend.app.utils.cleaner import DataCleaner

def test_data_cleaner_duplicates_and_negatives():
    raw_data = {
        "transaction_id": ["TX-1", "TX-1", "TX-2", "TX-3"],
        "date": ["2026-01-01 10:00:00", "2026-01-01 10:00:00", "2026-01-02 11:00:00", "invalid-date"],
        "product_id": ["P-101", "P-101", "P-102", "P-103"],
        "quantity": [2, 2, -5, 1],
        "unit_price": [1000.0, 1000.0, 500.0, 200.0],
        "discount": [50.0, 50.0, 0.0, 0.0]
    }
    df = pd.DataFrame(raw_data)
    cleaned_df, report = DataCleaner.clean_sales_dataframe(df)

    # 1 duplicate dropped, 1 invalid date dropped => 2 rows remaining
    assert len(cleaned_df) == 2
    assert report["duplicates_removed"] == 1
    assert report["invalid_dates_dropped"] == 1
    # Negative quantity in TX-2 should be fixed to 1
    tx2 = cleaned_df[cleaned_df["transaction_id"] == "TX-2"].iloc[0]
    assert tx2["quantity"] == 1
    assert tx2["revenue"] == 500.0

def test_data_cleaner_outliers():
    # Large outlier quantity
    raw_data = {
        "transaction_id": [f"TX-{i}" for i in range(50)],
        "date": ["2026-01-01 10:00:00"] * 50,
        "product_id": ["P-101"] * 50,
        "quantity": [1] * 49 + [500],  # 500 is extreme outlier
        "unit_price": [100.0] * 50
    }
    df = pd.DataFrame(raw_data)
    cleaned_df, report = DataCleaner.clean_sales_dataframe(df)
    assert report["outliers_adjusted"] >= 1
    assert cleaned_df["quantity"].max() < 500
