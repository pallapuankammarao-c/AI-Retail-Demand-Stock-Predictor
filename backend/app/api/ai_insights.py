from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import pandas as pd
from backend.app.database.connection import get_db
from backend.app.models.schema import ProductModel, InventoryModel, SaleModel, ChatQuestionRequest, ChatAnswerResponse
from backend.app.services.inventory_intelligence import InventoryIntelligence
from backend.app.services.ai_recommendation_engine import AIRecommendationEngine

router = APIRouter(prefix="/ai", tags=["AI Insights"])

def fetch_data_context(db: Session):
    products = db.query(ProductModel).all()
    inventories = db.query(InventoryModel).all()
    inv_map = {i.product_id: {
        "current_stock": i.current_stock,
        "reorder_level": i.reorder_level,
        "reorder_quantity": i.reorder_quantity,
        "supplier": i.supplier,
        "lead_time_days": i.lead_time_days,
        "warehouse": i.warehouse
    } for i in inventories}

    sales = db.query(SaleModel).all()
    sales_df = pd.DataFrame([
        {
            "product_id": s.product_id,
            "product_name": s.product_name,
            "category": s.category,
            "date": s.date,
            "quantity": s.quantity,
            "revenue": s.revenue,
            "cost": s.cost,
            "profit": s.profit,
            "discount": s.discount,
            "store_id": s.store_id,
            "store_name": s.store_name,
            "region": s.region,
            "transaction_id": s.transaction_id
        }
        for s in sales
    ])

    analyzed_items = []
    for p in products:
        p_dict = {
            "product_id": p.product_id,
            "product_name": p.product_name,
            "category": p.category,
            "cost_price": p.cost_price,
            "selling_price": p.selling_price,
            "supplier": p.supplier,
            "lead_time_days": p.lead_time_days
        }
        inv_dict = inv_map.get(p.product_id, {})
        analyzed = InventoryIntelligence.analyze_product_inventory(p_dict, inv_dict, sales_df)
        analyzed_items.append(analyzed)

    return sales_df, analyzed_items

@router.get("/insights")
def get_automated_insights(db: Session = Depends(get_db)):
    sales_df, analyzed_items = fetch_data_context(db)
    insights = AIRecommendationEngine.generate_automated_insights(sales_df, analyzed_items)
    recommendations = AIRecommendationEngine.generate_product_recommendations(analyzed_items, sales_df)
    
    return {
        "insights": insights,
        "recommendations": recommendations[:6],
        "summary": {
            "total_insights": len(insights),
            "critical_stockouts": sum(1 for i in analyzed_items if i["risk"] == "CRITICAL"),
            "overstocked_items": sum(1 for i in analyzed_items if i["risk"] == "OVERSTOCK")
        }
    }

@router.post("/ask", response_model=ChatAnswerResponse)
def ask_retailpulse_ai(req: ChatQuestionRequest, db: Session = Depends(get_db)):
    sales_df, analyzed_items = fetch_data_context(db)
    result = AIRecommendationEngine.answer_user_query(req.question, sales_df, analyzed_items)
    return result
