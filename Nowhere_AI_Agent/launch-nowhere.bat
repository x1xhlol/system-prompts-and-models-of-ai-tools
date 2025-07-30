@echo off
echo.
echo ========================================
echo    🚀 Nowhere AI Agent Launcher
echo ========================================
echo.

echo 📁 Starting server in background...
cd backend
start /B node server.js

echo.
echo ⏳ Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Opening frontend...
start frontend/index.html

echo.
echo ✅ Nowhere AI Agent is now running!
echo.
echo 📍 Server: http://localhost:3001
echo 📍 Frontend: frontend/index.html
echo 📍 Health: http://localhost:3001/health
echo.
echo 🎯 Test the API:
echo    curl -X POST http://localhost:3001/api/v1/command -H "Content-Type: application/json" -d "{\"command\":\"analyze this code\"}"
echo.
echo Press any key to exit...
pause >nul 