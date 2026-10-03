from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, HTMLResponse
from sqlalchemy.orm import Session
import pandas as pd
import io
from datetime import datetime
from backend.app.database.connection import get_db
from backend.app.models.schema import ProductModel, InventoryModel, SaleModel, AlertModel
from backend.app.services.inventory_intelligence import InventoryIntelligence
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.ai_recommendation_engine import AIRecommendationEngine

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/export/csv/{report_type}")
def export_csv_report(report_type: str, db: Session = Depends(get_db)):
    output = io.StringIO()
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

    if report_type == "sales":
        records = db.query(SaleModel).limit(5000).all()
        data = [
            {
                "Transaction_ID": s.transaction_id,
                "Date": s.date.strftime("%Y-%m-%d %H:%M"),
                "Product_ID": s.product_id,
                "Product_Name": s.product_name,
                "Category": s.category,
                "Store_Name": s.store_name,
                "Region": s.region,
                "Quantity": s.quantity,
                "Unit_Price": s.unit_price,
                "Discount": s.discount,
                "Revenue": s.revenue,
                "Cost": s.cost,
                "Profit": s.profit,
                "Payment_Method": s.payment_method
            }
            for s in records
        ]
        df = pd.DataFrame(data)
        df.to_csv(output, index=False)
        filename = f"retailpulse_sales_{timestamp}.csv"

    elif report_type == "inventory":
        products = db.query(ProductModel).all()
        inv_map = {i.product_id: i for i in db.query(InventoryModel).all()}
        sales_records = db.query(SaleModel.product_id, SaleModel.date, SaleModel.quantity, SaleModel.cost).all()
        sales_df = pd.DataFrame([{"product_id": s[0], "date": s[1], "quantity": s[2], "cost": s[3]} for s in sales_records])

        rows = []
        for p in products:
            inv = inv_map.get(p.product_id)
            analyzed = InventoryIntelligence.analyze_product_inventory(
                {"product_id": p.product_id, "product_name": p.product_name, "category": p.category, "cost_price": p.cost_price, "selling_price": p.selling_price, "supplier": p.supplier, "lead_time_days": p.lead_time_days},
                {"current_stock": inv.current_stock if inv else 0, "lead_time_days": inv.lead_time_days if inv else 7, "warehouse": inv.warehouse if inv else "WH-Central"},
                sales_df
            )
            rows.append(analyzed)
        df = pd.DataFrame(rows)
        df.to_csv(output, index=False)
        filename = f"retailpulse_inventory_{timestamp}.csv"

    elif report_type == "alerts":
        alerts = db.query(AlertModel).all()
        data = [
            {
                "ID": a.id,
                "Type": a.alert_type,
                "Severity": a.severity,
                "Product_Name": a.product_name,
                "Title": a.title,
                "Message": a.message,
                "Impact": a.impact,
                "Recommended_Action": a.recommended_action,
                "Status": a.status,
                "Created_At": a.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for a in alerts
        ]
        df = pd.DataFrame(data)
        df.to_csv(output, index=False)
        filename = f"retailpulse_alerts_{timestamp}.csv"

    else:
        raise HTTPException(status_code=400, detail=f"Invalid report type: {report_type}")

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/intelligence-report", response_class=HTMLResponse)
def get_retail_intelligence_report(db: Session = Depends(get_db)):
    """
    Renders an executive-grade printable Retail Intelligence Report (Print to PDF ready).
    """
    sales_records = db.query(SaleModel).all()
    sales_df = pd.DataFrame([
        {"revenue": s.revenue, "profit": s.profit, "quantity": s.quantity, "date": s.date, "product_id": s.product_id, "category": s.category, "store_name": s.store_name}
        for s in sales_records
    ])
    kpis = AnalyticsService.get_sales_kpis(sales_df)

    products = db.query(ProductModel).all()
    inv_map = {i.product_id: i for i in db.query(InventoryModel).all()}
    analyzed_items = []
    for p in products:
        inv = inv_map.get(p.product_id)
        analyzed = InventoryIntelligence.analyze_product_inventory(
            {"product_id": p.product_id, "product_name": p.product_name, "category": p.category, "cost_price": p.cost_price, "selling_price": p.selling_price, "supplier": p.supplier, "lead_time_days": p.lead_time_days},
            {"current_stock": inv.current_stock if inv else 0, "lead_time_days": inv.lead_time_days if inv else 7, "warehouse": inv.warehouse if inv else "WH-Central"},
            sales_df
        )
        analyzed_items.append(analyzed)

    inv_kpis = InventoryIntelligence.calculate_inventory_kpis(analyzed_items, sales_df)
    recs = AIRecommendationEngine.generate_product_recommendations(analyzed_items, sales_df)
    critical_items = [i for i in analyzed_items if i["risk"] == "CRITICAL"]

    crit_rows = "".join(f"""
        <tr>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:600;">{i['product_name']}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">{i['category']}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#ef4444;font-weight:bold;">{i['current_stock']} units</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">{i['daily_demand']}/day</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#dc2626;">{i['days_remaining']} days</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#10b981;">+{i['recommended_order']} units</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;">{i['supplier']}</td>
        </tr>
    """ for i in critical_items)

    rec_cards = "".join(f"""
        <div style="background:#f8fafc;border-left:4px solid {'#ef4444' if r['severity']=='CRITICAL' else ('#f59e0b' if r['severity']=='WARNING' else '#3b82f6')};padding:14px;margin-bottom:12px;border-radius:4px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <strong style="color:#0f172a;font-size:15px;">{r['product_name']} &bull; {r['badge']}</strong>
                <span style="font-size:12px;color:#64748b;">Current Stock: {r['current_stock']}</span>
            </div>
            <p style="margin:4px 0;color:#334155;font-size:13px;"><strong>Problem:</strong> {r['problem']}</p>
            <p style="margin:4px 0;color:#475569;font-size:13px;"><strong>Impact:</strong> {r['predicted_impact']}</p>
            <p style="margin:4px 0;color:#0369a1;font-size:13px;"><strong>Action:</strong> {r['recommended_action']}</p>
        </div>
    """ for r in recs[:5])

    now_str = datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC")

    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>RetailPulse AI - Executive Intelligence Report</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.5; }}
            .header {{ display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }}
            .kpi-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }}
            .kpi-card {{ background: #f1f5f9; padding: 16px; border-radius: 8px; border: 1px solid #cbd5e1; }}
            .kpi-title {{ font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }}
            .kpi-val {{ font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }}
            th {{ background: #0f172a; color: white; padding: 10px; text-align: left; }}
            .btn-print {{ background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; }}
            @media print {{
                .no-print {{ display: none; }}
                body {{ margin: 15px; }}
            }}
        </style>
    </head>
    <body>
        <div class="no-print" style="margin-bottom:20px;display:flex;justify-content:flex-end;">
            <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>

        <div class="header">
            <div>
                <h1 style="margin:0;font-size:28px;color:#0f172a;">🛒 RetailPulse AI</h1>
                <p style="margin:4px 0 0;color:#0284c7;font-weight:600;">Executive Retail Intelligence, Demand Forecasting & Inventory Report</p>
            </div>
            <div style="text-align:right;">
                <span style="font-size:12px;color:#64748b;">Generated:</span><br>
                <strong>{now_str}</strong>
            </div>
        </div>

        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-title">Total Revenue</div>
                <div class="kpi-val">₹{kpis['total_revenue']/1e6:.2f}M</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-title">Total Profit</div>
                <div class="kpi-val">₹{kpis['total_profit']/1e6:.2f}M</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-title">Inventory Value</div>
                <div class="kpi-val">₹{inv_kpis['total_inventory_value']/1e6:.2f}M</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-title">Critical Stockout Risk</div>
                <div class="kpi-val" style="color:#ef4444;">{inv_kpis['critical_stockout_risk']} Items</div>
            </div>
        </div>

        <h2 style="font-size:18px;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin-top:20px;">🚨 Priority Stockout & Replenishment Matrix</h2>
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Daily Demand</th>
                    <th>Depletion Horizon</th>
                    <th>Recommended Order</th>
                    <th>Supplier</th>
                </tr>
            </thead>
            <tbody>
                {crit_rows}
            </tbody>
        </table>

        <h2 style="font-size:18px;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin-top:30px;">🤖 AI Strategic Inventory Recommendations</h2>
        {rec_cards}

        <footer style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:15px;color:#94a3b8;font-size:12px;text-align:center;">
            Generated autonomously by RetailPulse AI Platform &bull; Cloud Analytics & Demand Forecasting Suite
        </footer>
    </body>
    </html>
    """
    return HTMLResponse(content=html)
