@echo off
title RetailPulse AI - Full Development Mode (Hot-Reload)
echo ========================================================
echo   Starting RetailPulse AI in Development Mode
echo   Backend: http://localhost:8000
echo   Frontend: http://localhost:5173
echo ========================================================
echo.

cd /d "%~dp0"

echo Starting Backend API...
start "RetailPulse Backend" cmd /k "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo Starting Frontend Dev Server...
cd frontend
start "" "http://localhost:5173"
call "C:\Program Files\nodejs\npm.cmd" run dev
