# Unified AI Platform - Simple Deployment Script

param(
    [string]$Action = "start"
)

Write-Host "🚀 Unified AI Platform Deployment" -ForegroundColor Cyan

if ($Action -eq "start") {
    Write-Host "Starting platform..." -ForegroundColor Green
    Start-Process -FilePath "node" -ArgumentList "src/simple-server.js" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "✅ Platform started at http://localhost:3000" -ForegroundColor Green
}
elseif ($Action -eq "stop") {
    Write-Host "Stopping platform..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Platform stopped" -ForegroundColor Green
}
elseif ($Action -eq "test") {
    Write-Host "Testing endpoints..." -ForegroundColor Blue
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET
        Write-Host "✅ Health check: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Health check failed" -ForegroundColor Red
    }
}
elseif ($Action -eq "status") {
    Write-Host "Platform status:" -ForegroundColor Blue
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "✅ Platform is running" -ForegroundColor Green
        Write-Host "🌐 Web Interface: http://localhost:3000" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Platform is not running" -ForegroundColor Red
    }
}
else {
    Write-Host "Usage: .\deploy-simple.ps1 [start|stop|test|status]" -ForegroundColor Yellow
} 