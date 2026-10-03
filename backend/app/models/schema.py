from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

Base = declarative_base()

# --- SQLAlchemy Models ---

class ProductModel(Base):
    __tablename__ = "products"

    product_id = Column(String(50), primary_key=True, index=True)
    product_name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    brand = Column(String(100))
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    supplier = Column(String(150))
    lead_time_days = Column(Integer, default=7)
    
    inventory = relationship("InventoryModel", back_populates="product", uselist=False)
    sales = relationship("SaleModel", back_populates="product")

class StoreModel(Base):
    __tablename__ = "stores"

    store_id = Column(String(50), primary_key=True, index=True)
    store_name = Column(String(150), nullable=False)
    region = Column(String(100), nullable=False, index=True)
    weight = Column(Float, default=1.0)
    sales = relationship("SaleModel", back_populates="store")

class InventoryModel(Base):
    __tablename__ = "inventory"

    product_id = Column(String(50), ForeignKey("products.product_id"), primary_key=True)
    product_name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    current_stock = Column(Integer, default=0)
    reorder_level = Column(Integer, default=50)
    reorder_quantity = Column(Integer, default=100)
    supplier = Column(String(150))
    lead_time_days = Column(Integer, default=7)
    warehouse = Column(String(100), default="WH-Central")
    updated_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("ProductModel", back_populates="inventory")

class SaleModel(Base):
    __tablename__ = "sales"

    transaction_id = Column(String(50), primary_key=True, index=True)
    date = Column(DateTime, nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.product_id"), index=True)
    product_name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    store_id = Column(String(50), ForeignKey("stores.store_id"), index=True)
    store_name = Column(String(150), nullable=False)
    region = Column(String(100), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    revenue = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    customer_id = Column(String(50), index=True)
    payment_method = Column(String(50))

    product = relationship("ProductModel", back_populates="sales")
    store = relationship("StoreModel", back_populates="sales")

class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_type = Column(String(50), nullable=False)  # stockout, demand_spike, overstock, sales_drop
    severity = Column(String(20), default="warning")  # critical, high, medium, low
    product_id = Column(String(50), nullable=True)
    product_name = Column(String(200), nullable=True)
    category = Column(String(100), nullable=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    impact = Column(String(255), nullable=True)
    recommended_action = Column(Text, nullable=True)
    status = Column(String(20), default="active")  # active, read, dismissed, resolved
    created_at = Column(DateTime, default=datetime.utcnow)

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="manager")
    created_at = Column(DateTime, default=datetime.utcnow)


# --- Pydantic Schemas ---

class ProductBase(BaseModel):
    product_id: str
    product_name: str
    category: str
    brand: Optional[str] = None
    cost_price: float
    selling_price: float
    supplier: Optional[str] = None
    lead_time_days: int = 7

class ProductOut(ProductBase):
    class Config:
        from_attributes = True

class InventoryItemOut(BaseModel):
    product_id: str
    product_name: str
    category: str
    current_stock: int
    daily_demand: float
    days_remaining: float
    reorder_level: int
    risk: str  # HEALTHY, LOW STOCK, CRITICAL, OVERSTOCK
    recommended_order: int
    supplier: str
    lead_time_days: int
    warehouse: str
    inventory_value: float

class AlertOut(BaseModel):
    id: int
    alert_type: str
    severity: str
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    title: str
    message: str
    impact: Optional[str] = None
    recommended_action: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ForecastRequest(BaseModel):
    product_id: str
    store_id: Optional[str] = None
    horizon_days: int = Field(default=7, ge=7, le=30)
    model_type: Optional[str] = "random_forest"  # random_forest, gradient_boosting

class ForecastDayPoint(BaseModel):
    date: str
    predicted_demand: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    product_id: str
    product_name: str
    category: str
    horizon_days: int
    historical_daily_avg: float
    current_stock: int
    total_predicted_demand: float
    expected_shortage_or_excess: float
    risk_level: str
    recommended_action: str
    forecast_points: List[ForecastDayPoint]
    model_metrics: Dict[str, Any]

class ChatQuestionRequest(BaseModel):
    question: str

class ChatAnswerResponse(BaseModel):
    answer: str
    insights: List[Dict[str, Any]] = []
    suggested_actions: List[str] = []
