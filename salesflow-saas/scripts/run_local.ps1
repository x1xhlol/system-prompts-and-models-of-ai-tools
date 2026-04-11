<#
  Run Dealix locally: backend (8000) + frontend (3000) in new windows.
  Requires: Python 3 with deps, Node.js, npm install in frontend.
#>
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

if (-not (Test-Path $backend)) { throw "backend folder not found: $backend" }

Write-Host "Starting backend: uvicorn app.main:app --reload --port 8000" -ForegroundColor Cyan
Start-Process powershell -WorkingDirectory $backend -ArgumentList @(
  "-NoExit", "-Command",
  "`$env:PYTHONIOENCODING='utf-8'; py -3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
)

if (Test-Path $frontend) {
  Write-Host "Starting frontend: npm run dev (port 3000)" -ForegroundColor Cyan
  Start-Process powershell -WorkingDirectory $frontend -ArgumentList @(
    "-NoExit", "-Command", "npm run dev"
  )
}

Write-Host "`nURLs:" -ForegroundColor Green
Write-Host "  API docs: http://127.0.0.1:8000/api/docs"
Write-Host "  Health:   http://127.0.0.1:8000/api/v1/health"
Write-Host "  Frontend: http://localhost:3000"
