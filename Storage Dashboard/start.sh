#!/bin/bash

# Storage Dashboard Start Script

echo "================================"
echo "Storage Dashboard Startup"
echo "================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

echo "Python version: $(python3 --version)"
echo ""

# Navigate to backend directory
cd backend

# Check if requirements are installed
echo "Checking dependencies..."
if ! python3 -c "import flask" 2>/dev/null; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    echo "Dependencies already installed"
fi

echo ""
echo "================================"
echo "Starting Storage Dashboard..."
echo "================================"
echo ""
echo "Access the dashboard at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Flask application
python3 app.py
