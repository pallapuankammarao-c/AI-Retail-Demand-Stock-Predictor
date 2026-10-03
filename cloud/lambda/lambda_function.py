"""
RetailPulse AI - AWS Lambda Serverless Handler
Converts FastAPI ASGI requests to AWS Lambda & API Gateway proxy events via Mangum.
"""

from mangum import Mangum
from backend.app.main import app

# Handler called by AWS Lambda
handler = Mangum(app, lifespan="off")
