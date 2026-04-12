# Stops processes listening on TCP port 3000 (fixes Playwright webServer "port already in use").
# Run from salesflow-saas: .\scripts\kill-port-3000.ps1
$ErrorActionPreference = "SilentlyContinue"
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Write-Host "Port 3000 cleared (if anything was listening)." -ForegroundColor DarkGray
