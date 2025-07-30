@echo off
echo.
echo ========================================
echo    🚀 Nowhere AI Agent Setup
echo ========================================
echo.

echo 📁 Navigating to backend directory...
cd backend

echo.
echo 🔧 Creating environment file...
if not exist .env (
    copy env.example .env
    echo ✅ Environment file created from template
) else (
    echo ℹ️  Environment file already exists
)

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🚀 Starting Nowhere AI Agent server...
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🚀 Nowhere AI Agent                      ║
echo ║                                                              ║
echo ║  🌐 Server will run on: http://localhost:3001                    ║
echo ║  📡 WebSocket available at: ws://localhost:3001                ║
echo ║  📊 Health check: http://localhost:3001/health              ║
echo ║                                                              ║
echo ║  🎤 Voice Integration: Available                            ║
echo ║  🧠 Memory System: In-Memory                                ║
echo ║  🤖 Autopilot Mode: Available                               ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 📋 Next steps:
echo    1. Edit .env file to add your API keys (optional)
echo    2. Open frontend/index.html in your browser
echo    3. Test the API endpoints
echo.
echo 🎯 Example commands to test:
echo    curl -X POST http://localhost:3001/api/v1/command -H "Content-Type: application/json" -d "{\"command\":\"analyze this code\"}"
echo.
echo Press any key to start the server...
pause >nul

echo.
echo 🚀 Starting server...
node server.js 