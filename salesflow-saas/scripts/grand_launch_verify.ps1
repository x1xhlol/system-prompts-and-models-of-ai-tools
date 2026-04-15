# Dealix grand launch: backend pytest, frontend lint + build, optional HTTP checks (API must be up).
# Run from salesflow-saas (this file lives in scripts\):
#   .\scripts\grand_launch_verify.ps1
#   .\scripts\grand_launch_verify.ps1 -HttpCheck -SoftReady
# Or from repo root: .\salesflow-saas\verify-launch.ps1 -HttpCheck
# From salesflow-saas\frontend: ..\scripts\grand_launch_verify.ps1 -HttpCheck
#
# -HttpOnly : only hit the API (py scripts/full_stack_launch_test.py --http-only); skips pytest/lint/build.
# -BaseUrl : sets DEALIX_BASE_URL for HTTP phase (e.g. http://127.0.0.1:8001 when 8000 runs an old build).
# -WithOpenApiGate : after lint/build, run OpenAPI + go-live + hardening + AI-quality gates (no uvicorn).

param(
    [switch]$HttpCheck,
    [switch]$SoftReady,
    [switch]$HttpOnly,
    [switch]$WithOpenApiGate,
    [string]$BaseUrl = ""
)

$ErrorActionPreference = "Stop"
if ($BaseUrl -ne "") {
    $env:DEALIX_BASE_URL = $BaseUrl.TrimEnd("/")
    Write-Host "Using DEALIX_BASE_URL=$($env:DEALIX_BASE_URL)" -ForegroundColor DarkGray
}
$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

if (-not (Test-Path (Join-Path $backend "app"))) {
    Write-Host "Backend not found at $backend - run from salesflow-saas: .\scripts\grand_launch_verify.ps1 or .\verify-launch.ps1" -ForegroundColor Red
    exit 1
}

if ($HttpOnly) {
    Write-Host "Dealix root: $root" -ForegroundColor DarkGray
    Write-Host "== HTTP only (API must be running on `$env:DEALIX_BASE_URL or http://127.0.0.1:8000) ==" -ForegroundColor Cyan
    Push-Location $backend
    try {
        $pyArgs = @("scripts/full_stack_launch_test.py", "--http-only")
        if ($SoftReady) { $pyArgs += "--soft-ready" }
        & py @pyArgs
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
    Write-Host "HTTP-only verify OK." -ForegroundColor Green
    exit 0
}

Write-Host "Dealix root: $root" -ForegroundColor DarkGray
Write-Host "== Backend: pytest ==" -ForegroundColor Cyan
Push-Location $backend
try {
    & py -m pytest tests -q --tb=line
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host "== Sync marketing -> frontend/public ==" -ForegroundColor Cyan
Push-Location $root
try {
    & node scripts/sync-marketing-to-public.cjs
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

Write-Host "== Frontend: lint ==" -ForegroundColor Cyan
Push-Location $frontend
try {
    & npm run lint
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "== Frontend: build ==" -ForegroundColor Cyan
    & npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

if ($WithOpenApiGate) {
    Write-Host "== OpenAPI vs frontend paths ==" -ForegroundColor Cyan
    Push-Location $root
    try {
        & py -3 scripts/verify_frontend_openapi_paths.py
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
    Write-Host "== Go-live gate (in-process, no server) ==" -ForegroundColor Cyan
    Push-Location $root
    try {
        & py -3 scripts/check_go_live_gate.py
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
    Write-Host "== Release hardening gate (env/docs/api contracts) ==" -ForegroundColor Cyan
    Push-Location $root
    try {
        & py -3 scripts/release_hardening_gate.py
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
    Write-Host "== AI quality gate (golden + endpoint) ==" -ForegroundColor Cyan
    Push-Location $root
    try {
        & py -3 scripts/ai_quality_gate.py
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
}

if ($HttpCheck) {
    Write-Host "== HTTP: full_stack_launch_test ==" -ForegroundColor Cyan
    Push-Location $backend
    try {
        $pyArgs = @("scripts/full_stack_launch_test.py")
        if ($SoftReady) { $pyArgs += "--soft-ready" }
        Write-Host 'Hint: cd backend; py -m uvicorn app.main:app --host 127.0.0.1 --port 8000' -ForegroundColor DarkGray
        & py @pyArgs
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
} else {
    Write-Host 'Skip HTTP. To verify API: .\scripts\grand_launch_verify.ps1 -HttpCheck' -ForegroundColor Yellow
}

Write-Host "Grand launch verify OK." -ForegroundColor Green
