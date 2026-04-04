<# 
  Go-Live Gate — يستدعي الـ API بشكل صحيح من PowerShell.
  لا تلصق الرابط وحده في الطرفية؛ PowerShell لا يعامله كأمر HTTP.

  الاستخدام:
    cd salesflow-saas\backend
    .\scripts\go_live_gate.ps1
    .\scripts\go_live_gate.ps1 -BaseUrl "http://127.0.0.1:8000"
#>
param(
    [string]$BaseUrl = "http://localhost:8000"
)

$ErrorActionPreference = "Stop"
$uri = "$($BaseUrl.TrimEnd('/'))/api/v1/autonomous-foundation/integrations/go-live-gate"

Write-Host "GET $uri" -ForegroundColor Cyan

# curl.exe مدمج في Windows 10+ — يعرض الجسم حتى مع 403
$curl = Get-Command curl.exe -ErrorAction SilentlyContinue
if ($null -eq $curl) {
    Write-Host "curl.exe not found. Use:" -ForegroundColor Yellow
    Write-Host "  Invoke-RestMethod -Uri `"$uri`" -Method Get | ConvertTo-Json -Depth 12" -ForegroundColor Gray
    exit 2
}

$tmp = [System.IO.Path]::GetTempFileName()
try {
    $code = & curl.exe -sS -o $tmp -w "%{http_code}" -- "$uri"
    $raw = Get-Content -LiteralPath $tmp -Raw -Encoding utf8
} finally {
    Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
}

try {
    $json = $raw | ConvertFrom-Json
} catch {
    Write-Host "Invalid JSON response:" -ForegroundColor Red
    Write-Host $raw
    exit 3
}

$json | ConvertTo-Json -Depth 12

if ($code -eq "200" -and $json.launch_allowed -eq $true) {
    Write-Host "`nOK — Go-live gate: ALLOWED (HTTP 200, 100%)" -ForegroundColor Green
    exit 0
}

Write-Host "`nBLOCKED — HTTP $code — أصلح المتغيرات الناقصة (missing / blocked_reasons)." -ForegroundColor Red
exit 1
