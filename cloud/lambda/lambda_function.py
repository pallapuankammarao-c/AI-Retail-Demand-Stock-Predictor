"""
RetailPulse AI - AWS Lambda Serverless Handler
Converts FastAPI ASGI requests to AWS Lambda & API Gateway proxy events via Mangum.
"""

import os
import sys

# Add project root to sys.path so backend modules resolve seamlessly in AWS Lambda & local environments
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    from mangum import Mangum
except ImportError:
    Mangum = None

from backend.app.main import app

# Handler called by AWS Lambda & AWS API Gateway
if Mangum is not None:
    handler = Mangum(app, lifespan="off")
else:
    def handler(event, context):
        raise RuntimeError("Mangum package is not installed. Run 'pip install mangum'.")
