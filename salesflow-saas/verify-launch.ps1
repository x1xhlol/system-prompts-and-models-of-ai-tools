# Thin wrapper: always resolves paths from salesflow-saas root.
# Examples:
#   .\verify-launch.ps1 -HttpCheck -SoftReady
#   .\verify-launch.ps1 -HttpOnly -BaseUrl "http://127.0.0.1:8001"
& "$PSScriptRoot\scripts\grand_launch_verify.ps1" @args
