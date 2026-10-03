from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import io
from backend.app.database.connection import get_db
from backend.app.models.schema import SaleModel
from backend.app.utils.cleaner import DataCleaner

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("")
async def upload_sales_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    try:
        raw_df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    clean_df, report = DataCleaner.clean_sales_dataframe(raw_df)

    # Insert cleaned records into database
    batch = []
    for _, row in clean_df.head(2000).iterrows():  # insert up to 2000 rows from upload
        sale = SaleModel(
            transaction_id=str(row.get("transaction_id", f"UP-{_}")),
            date=pd.to_datetime(row.get("date")),
            product_id=str(row.get("product_id")),
            product_name=str(row.get("product_name", "Uploaded Product")),
            category=str(row.get("category", "General")),
            store_id=str(row.get("store_id", "ST-01")),
            store_name=str(row.get("store_name", "Metro Flagship")),
            region=str(row.get("region", "North")),
            quantity=int(row.get("quantity", 1)),
            unit_price=float(row.get("unit_price", 100.0)),
            discount=float(row.get("discount", 0.0)),
            revenue=float(row.get("revenue", 100.0)),
            cost=float(row.get("cost", 60.0)),
            profit=float(row.get("profit", 40.0)),
            customer_id=str(row.get("customer_id", "CUST-000")),
            payment_method=str(row.get("payment_method", "Credit Card"))
        )
        batch.append(sale)

    if batch:
        db.bulk_save_objects(batch)
        db.commit()

    return {
        "success": True,
        "filename": file.filename,
        "data_cleaning_report": report,
        "rows_ingested": len(batch),
        "message": f"Successfully validated, cleaned, and ingested {len(batch)} records into RetailPulse AI."
    }
