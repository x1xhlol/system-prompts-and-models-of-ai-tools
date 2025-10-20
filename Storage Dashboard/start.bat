@echo off
REM Storage Dashboard Start Script for Windows

echo ================================
echo Storage Dashboard Startup
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed
    pause
    exit /b 1
)

echo Python version:
python --version
echo.

REM Navigate to backend directory
cd backend

REM Check if requirements are installed
echo Checking dependencies...
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
) else (
    echo Dependencies already installed
)

echo.
echo ================================
echo Starting Storage Dashboard...
echo ================================
echo.
echo Access the dashboard at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the Flask application
python app.py
