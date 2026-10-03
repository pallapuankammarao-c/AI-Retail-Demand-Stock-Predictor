"""
Automated Data Validation & Preprocessing Pipeline
Handles:
- Missing values (imputation or filtering)
- Duplicate records removal
- Invalid dates parsing & normalization
- Negative quantities & prices correction
- Missing product IDs handling
- Outliers detection & handling (IQR method)
- Price/Cost integrity checks
"""

import pandas as pd
import numpy as np
from datetime import datetime
from typing import Tuple, Dict, Any

class DataCleaner:
    @staticmethod
    def clean_sales_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        initial_count = len(df)
        report = {
            "initial_rows": initial_count,
            "duplicates_removed": 0,
            "missing_ids_dropped": 0,
            "negative_quantities_fixed": 0,
            "invalid_dates_dropped": 0,
            "outliers_adjusted": 0,
            "final_rows": 0,
            "quality_score": 100.0
        }

        # 1. Deduplicate records
        dups = df.duplicated(subset=["transaction_id"]) if "transaction_id" in df.columns else df.duplicated()
        dup_count = int(dups.sum())
        if dup_count > 0:
            df = df.drop_duplicates(subset=["transaction_id"] if "transaction_id" in df.columns else None)
            report["duplicates_removed"] = dup_count

        # 2. Filter missing product_id
        if "product_id" in df.columns:
            missing_ids = df["product_id"].isna() | (df["product_id"].astype(str).str.strip() == "")
            missing_count = int(missing_ids.sum())
            if missing_count > 0:
                df = df[~missing_ids]
                report["missing_ids_dropped"] = missing_count

        # 3. Clean and parse dates
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")
            invalid_dates = df["date"].isna()
            inv_date_count = int(invalid_dates.sum())
            if inv_date_count > 0:
                df = df[~invalid_dates]
                report["invalid_dates_dropped"] = inv_date_count

        # 4. Correct negative or zero quantities
        if "quantity" in df.columns:
            df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(1)
            neg_q = df["quantity"] <= 0
            neg_count = int(neg_q.sum())
            if neg_count > 0:
                df.loc[neg_q, "quantity"] = 1
                report["negative_quantities_fixed"] = neg_count
            df["quantity"] = df["quantity"].astype(int)

        # 5. Price & Cost integrity
        if "unit_price" in df.columns:
            df["unit_price"] = pd.to_numeric(df["unit_price"], errors="coerce").abs()
            df["unit_price"] = df["unit_price"].fillna(df["unit_price"].median())

        if "cost" in df.columns and "unit_price" in df.columns:
            df["cost"] = pd.to_numeric(df["cost"], errors="coerce").abs()
            # If cost > unit_price * quantity unexpectedly due to corrupted raw data, sanity bound it
            unit_cost = df["cost"] / df["quantity"]
            bad_cost = unit_cost > df["unit_price"]
            if bad_cost.sum() > 0:
                df.loc[bad_cost, "cost"] = (df.loc[bad_cost, "unit_price"] * 0.65) * df.loc[bad_cost, "quantity"]

        # 6. Recalculate revenue, profit, discount
        if "discount" in df.columns:
            df["discount"] = pd.to_numeric(df["discount"], errors="coerce").fillna(0.0).abs()
        else:
            df["discount"] = 0.0

        if "revenue" not in df.columns or df["revenue"].isna().any():
            df["revenue"] = (df["unit_price"] * df["quantity"]) - df["discount"]
        else:
            df["revenue"] = pd.to_numeric(df["revenue"], errors="coerce").fillna(
                (df["unit_price"] * df["quantity"]) - df["discount"]
            )

        if "cost" in df.columns:
            df["profit"] = df["revenue"] - df["cost"]
        else:
            df["profit"] = df["revenue"] * 0.35

        # 7. Outliers detection & capping on quantity (IQR method)
        if "quantity" in df.columns and len(df) > 10:
            q25 = df["quantity"].quantile(0.25)
            q75 = df["quantity"].quantile(0.75)
            iqr = q75 - q25
            upper_limit = max(10, q75 + 3.0 * iqr)
            outliers = df["quantity"] > upper_limit
            outlier_count = int(outliers.sum())
            if outlier_count > 0:
                df.loc[outliers, "quantity"] = int(upper_limit)
                report["outliers_adjusted"] = outlier_count

        report["final_rows"] = len(df)
        issues_found = (
            report["duplicates_removed"]
            + report["missing_ids_dropped"]
            + report["negative_quantities_fixed"]
            + report["invalid_dates_dropped"]
            + report["outliers_adjusted"]
        )
        if initial_count > 0:
            report["quality_score"] = round(max(50.0, 100.0 - (issues_found / initial_count * 100)), 2)

        return df, report
