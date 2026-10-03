import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_dashboard_summary():
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert "charts" in data
    assert data["kpis"]["revenue"] > 0
    assert data["kpis"]["orders"] > 0

def test_products_endpoint():
    res = client.get("/api/products")
    assert res.status_code == 200
    products = res.json()
    assert len(products) > 0
    assert any(p["product_id"] == "P-101" for p in products)

def test_inventory_endpoint():
    res = client.get("/api/inventory")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "kpis" in data
    assert len(data["items"]) > 0

def test_forecast_endpoint():
    res = client.get("/api/forecast/P-101?horizon=7")
    assert res.status_code == 200
    data = res.json()
    assert data["product_id"] == "P-101"
    assert len(data["forecast_points"]) == 7

def test_ai_ask_endpoint():
    res = client.post("/api/ai/ask", json={"question": "Which products are likely to run out next week?"})
    assert res.status_code == 200
    ans = res.json()
    assert "answer" in ans
    assert len(ans["suggested_actions"]) > 0
