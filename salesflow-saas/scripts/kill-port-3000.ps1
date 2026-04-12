# Free localhost:3000 (Next standalone / Playwright webServer). Run from salesflow-saas:
#   .\scripts\kill-port-3000.ps1
$ErrorActionPreference = "SilentlyContinue"
$conns = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $conns) {
    Write-Host "Port 3000 is free." -ForegroundColor DarkGray
    exit 0
}
$conns | ForEach-Object {
    try {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    } catch { }
}
Write-Host "Stopped process(es) listening on port 3000." -ForegroundColor Green
