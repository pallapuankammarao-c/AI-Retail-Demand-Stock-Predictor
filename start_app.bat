@echo off
title RetailPulse AI - Production Launcher
echo ========================================================
echo   Starting RetailPulse AI Platform
echo   "Predict Demand. Prevent Stockouts. Optimize Inventory."
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Checking Python environment and database...
python -c "from backend.app.database.seed_data import seed_database; seed_database(force=False)"

echo [2/2] Launching RetailPulse AI Server on http://localhost:8000 ...
start "" "http://localhost:8000"

python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
pause
