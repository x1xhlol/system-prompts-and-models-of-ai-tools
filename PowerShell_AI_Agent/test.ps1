# Simple test script for PowerShell AI Agent
Write-Host "PowerShell AI Agent Test" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# Test basic functionality
Write-Host "Testing basic functionality..." -ForegroundColor Yellow

# Test configuration loading
$configPath = ".\config\agent-config.json"
if (Test-Path $configPath) {
    Write-Host "✅ Configuration file exists" -ForegroundColor Green
    $config = Get-Content $configPath | ConvertFrom-Json
    Write-Host "✅ Configuration loaded successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Configuration file not found" -ForegroundColor Red
}

# Test memory system
$memoryPath = ".\data\memory.json"
if (Test-Path $memoryPath) {
    Write-Host "✅ Memory file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Memory file not found" -ForegroundColor Red
}

# Test main script
$mainScript = ".\scripts\main.ps1"
if (Test-Path $mainScript) {
    Write-Host "✅ Main script exists" -ForegroundColor Green
} else {
    Write-Host "❌ Main script not found" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green 