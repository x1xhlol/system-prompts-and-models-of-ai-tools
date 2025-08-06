# Unified AI Platform Deployment Script
# This script helps deploy and manage the Unified AI Platform

param(
    [string]$Action = "start",
    [int]$Port = 3000
)

Write-Host "🚀 Unified AI Platform Deployment Script" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

function Start-Platform {
    Write-Host "Starting Unified AI Platform..." -ForegroundColor Green
    
    # Kill any existing node processes
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Host "✓ Stopped existing processes" -ForegroundColor Green
    } catch {
        Write-Host "No existing processes found" -ForegroundColor Yellow
    }
    
    # Start the platform
    Start-Process -FilePath "node" -ArgumentList "src/simple-server.js" -WindowStyle Hidden
    
    # Wait for startup
    Start-Sleep -Seconds 3
    
    # Test the platform
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Platform started successfully!" -ForegroundColor Green
            Write-Host "🌐 Web Interface: http://localhost:$Port" -ForegroundColor Cyan
            Write-Host "📊 Health Check: http://localhost:$Port/health" -ForegroundColor Cyan
            Write-Host "🎯 Demo: http://localhost:$Port/api/v1/demo" -ForegroundColor Cyan
            Write-Host "🔧 API Docs: http://localhost:$Port/api/v1/capabilities" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "❌ Failed to start platform" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Stop-Platform {
    Write-Host "Stopping Unified AI Platform..." -ForegroundColor Yellow
    
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Host "✅ Platform stopped successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to stop platform" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-Platform {
    Write-Host "Testing Unified AI Platform..." -ForegroundColor Blue
    
    $endpoints = @(
        @{Name="Health Check"; URL="/health"},
        @{Name="Demo"; URL="/api/v1/demo"},
        @{Name="Tools"; URL="/api/v1/tools"},
        @{Name="Capabilities"; URL="/api/v1/capabilities"}
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$Port$($endpoint.URL)" -Method GET -TimeoutSec 5
            Write-Host "✅ $($endpoint.Name): $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "❌ $($endpoint.Name): Failed" -ForegroundColor Red
        }
    }
}

function Show-Status {
    Write-Host "Platform Status:" -ForegroundColor Blue
    
    try {
        $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($processes) {
            Write-Host "✅ Platform is running" -ForegroundColor Green
            Write-Host "Processes: $($processes.Count)" -ForegroundColor Cyan
            
            # Test health endpoint
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -Method GET -TimeoutSec 5
                $health = $response.Content | ConvertFrom-Json
                Write-Host "Status: $($health.status)" -ForegroundColor Green
                Write-Host "Uptime: $([math]::Round($health.uptime, 2)) seconds" -ForegroundColor Cyan
            } catch {
                Write-Host "❌ Health check failed" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Platform is not running" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error checking status" -ForegroundColor Red
    }
}

function Show-Help {
    Write-Host "Usage: .\deploy.ps1 [-Action action] [-Port port]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Cyan
    Write-Host "  start    - Start the platform" -ForegroundColor White
    Write-Host "  stop     - Stop the platform" -ForegroundColor White
    Write-Host "  restart  - Restart the platform" -ForegroundColor White
    Write-Host "  test     - Test all endpoints" -ForegroundColor White
    Write-Host "  status   - Show platform status" -ForegroundColor White
    Write-Host "  help     - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\deploy.ps1 start" -ForegroundColor White
    Write-Host "  .\deploy.ps1 stop" -ForegroundColor White
    Write-Host "  .\deploy.ps1 test" -ForegroundColor White
    Write-Host "  .\deploy.ps1 -Action start -Port 3001" -ForegroundColor White
}

# Main execution
switch ($Action.ToLower()) {
    "start" {
        Start-Platform
    }
    "stop" {
        Stop-Platform
    }
    "restart" {
        Stop-Platform
        Start-Sleep -Seconds 2
        Start-Platform
    }
    "test" {
        Test-Platform
    }
    "status" {
        Show-Status
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
        Write-Host "Use 'help' action to see available options" -ForegroundColor Yellow
    }
} 