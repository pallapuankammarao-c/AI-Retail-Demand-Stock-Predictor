import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "RetailPulse AI"
    TAGLINE: str = "Predict Demand. Prevent Stockouts. Optimize Inventory."
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./retailpulse.db")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "retailpulse-hackathon-super-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Cloud / AWS Config (mockable locally)
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "retailpulse-ai-cloud-storage")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    IS_LOCAL_DEMO: bool = True

settings = Settings()
