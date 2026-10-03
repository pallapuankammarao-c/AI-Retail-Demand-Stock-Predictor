"""
RetailPulse AI - Analytics Service
Aggregates sales performance, revenue trends, profit margins, category performance,
store benchmarks, discount elasticity, and customer payment metrics.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List

class AnalyticsService:
    @staticmethod
    def get_sales_kpis(sales_df: pd.DataFrame) -> Dict[str, Any]:
        if sales_df.empty:
            return {
                "total_revenue": 0.0,
                "total_profit": 0.0,
                "total_orders": 0,
                "units_sold": 0,
                "average_order_value": 0.0,
                "profit_margin_pct": 0.0,
                "average_daily_sales": 0.0
            }

        total_rev = float(sales_df["revenue"].sum())
        total_prof = float(sales_df["profit"].sum())
        total_orders = int(len(sales_df))
        units_sold = int(sales_df["quantity"].sum())
        aov = round(total_rev / total_orders, 2) if total_orders > 0 else 0.0
        margin = round((total_prof / total_rev) * 100, 2) if total_rev > 0 else 0.0

        dates = pd.to_datetime(sales_df["date"])
        days_span = max(1, (dates.max() - dates.min()).days)
        avg_daily_sales = round(total_rev / days_span, 2)

        return {
            "total_revenue": round(total_rev, 2),
            "total_profit": round(total_prof, 2),
            "total_orders": total_orders,
            "units_sold": units_sold,
            "average_order_value": aov,
            "profit_margin_pct": margin,
            "average_daily_sales": avg_daily_sales
        }

    @staticmethod
    def get_revenue_trend(sales_df: pd.DataFrame, interval: str = "daily", days: int = 30) -> List[Dict[str, Any]]:
        if sales_df.empty:
            return []

        df = sales_df.copy()
        df["datetime"] = pd.to_datetime(df["date"])
        
        # Take the most recent 'days'
        max_date = df["datetime"].max()
        cutoff = max_date - timedelta(days=days)
        df = df[df["datetime"] >= cutoff]

        df["day"] = df["datetime"].dt.strftime("%Y-%m-%d")
        daily = df.groupby("day").agg(
            revenue=("revenue", "sum"),
            profit=("profit", "sum"),
            orders=("transaction_id", "count"),
            units=("quantity", "sum")
        ).reset_index().sort_values("day")

        return [
            {
                "date": row["day"],
                "revenue": round(float(row["revenue"]), 2),
                "profit": round(float(row["profit"]), 2),
                "orders": int(row["orders"]),
                "units": int(row["units"])
            }
            for _, row in daily.iterrows()
        ]

    @staticmethod
    def get_sales_by_category(sales_df: pd.DataFrame) -> List[Dict[str, Any]]:
        if sales_df.empty:
            return []

        cat_grp = sales_df.groupby("category").agg(
            revenue=("revenue", "sum"),
            profit=("profit", "sum"),
            units=("quantity", "sum"),
            orders=("transaction_id", "count")
        ).reset_index().sort_values("revenue", ascending=False)

        cat_grp["margin"] = (cat_grp["profit"] / cat_grp["revenue"]) * 100

        return [
            {
                "category": row["category"],
                "revenue": round(float(row["revenue"]), 2),
                "profit": round(float(row["profit"]), 2),
                "units": int(row["units"]),
                "orders": int(row["orders"]),
                "margin_pct": round(float(row["margin"]), 1)
            }
            for _, row in cat_grp.iterrows()
        ]

    @staticmethod
    def get_top_and_bottom_products(sales_df: pd.DataFrame, limit: int = 10) -> Dict[str, List[Dict[str, Any]]]:
        if sales_df.empty:
            return {"top_products": [], "bottom_products": []}

        prod_grp = sales_df.groupby(["product_id", "product_name", "category"]).agg(
            units=("quantity", "sum"),
            revenue=("revenue", "sum"),
            profit=("profit", "sum")
        ).reset_index()

        top = prod_grp.sort_values("revenue", ascending=False).head(limit)
        bottom = prod_grp.sort_values("revenue", ascending=True).head(limit)

        def format_rows(sub_df):
            return [
                {
                    "product_id": r["product_id"],
                    "product_name": r["product_name"],
                    "category": r["category"],
                    "units": int(r["units"]),
                    "revenue": round(float(r["revenue"]), 2),
                    "profit": round(float(r["profit"]), 2)
                }
                for _, r in sub_df.iterrows()
            ]

        return {
            "top_products": format_rows(top),
            "bottom_products": format_rows(bottom)
        }

    @staticmethod
    def get_regional_and_store_performance(sales_df: pd.DataFrame) -> Dict[str, Any]:
        if sales_df.empty:
            return {"by_store": [], "by_region": []}

        # Store breakdown
        store_grp = sales_df.groupby(["store_id", "store_name", "region"]).agg(
            revenue=("revenue", "sum"),
            profit=("profit", "sum"),
            orders=("transaction_id", "count"),
            units=("quantity", "sum")
        ).reset_index().sort_values("revenue", ascending=False)

        # Region breakdown
        reg_grp = sales_df.groupby("region").agg(
            revenue=("revenue", "sum"),
            profit=("profit", "sum"),
            orders=("transaction_id", "count"),
            units=("quantity", "sum")
        ).reset_index().sort_values("revenue", ascending=False)

        return {
            "by_store": [
                {
                    "store_id": r["store_id"],
                    "store_name": r["store_name"],
                    "region": r["region"],
                    "revenue": round(float(r["revenue"]), 2),
                    "profit": round(float(r["profit"]), 2),
                    "orders": int(r["orders"]),
                    "units": int(r["units"])
                }
                for _, r in store_grp.iterrows()
            ],
            "by_region": [
                {
                    "region": r["region"],
                    "revenue": round(float(r["revenue"]), 2),
                    "profit": round(float(r["profit"]), 2),
                    "orders": int(r["orders"]),
                    "units": int(r["units"])
                }
                for _, r in reg_grp.iterrows()
            ]
        }

    @staticmethod
    def get_discount_impact(sales_df: pd.DataFrame) -> Dict[str, Any]:
        if sales_df.empty:
            return {}

        df = sales_df.copy()
        df["has_discount"] = df["discount"] > 0

        promo_agg = df.groupby("has_discount").agg(
            revenue=("revenue", "sum"),
            orders=("transaction_id", "count"),
            units=("quantity", "sum"),
            profit=("profit", "sum")
        ).reset_index()

        promo_agg["aov"] = promo_agg["revenue"] / promo_agg["orders"]
        promo_agg["margin_pct"] = (promo_agg["profit"] / promo_agg["revenue"]) * 100

        result = {}
        for _, r in promo_agg.iterrows():
            key = "promotional" if r["has_discount"] else "standard"
            result[key] = {
                "revenue": round(float(r["revenue"]), 2),
                "orders": int(r["orders"]),
                "units": int(r["units"]),
                "profit": round(float(r["profit"]), 2),
                "aov": round(float(r["aov"]), 2),
                "margin_pct": round(float(r["margin_pct"]), 1)
            }
        return result
