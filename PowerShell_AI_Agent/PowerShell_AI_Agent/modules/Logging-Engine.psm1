# Logging Engine Module for PowerShell AI Agent
# Provides comprehensive logging capabilities

function Initialize-LoggingEngine {
    param(
        [hashtable]$Config,
        [string]$LogPath = ".\logs"
    )
    
    $engine = @{
        Config = $Config
        LogPath = $LogPath
        LogLevel = "Info"  # Debug, Info, Warning, Error
        MaxLogFiles = 10
        MaxLogSize = 10MB
    }
    
    # Ensure log directory exists
    if (!(Test-Path $LogPath)) {
        New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
    }
    
    # Create log file name with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd"
    $engine.LogFile = Join-Path $LogPath "ai-agent-$timestamp.log"
    
    Write-Verbose "Logging engine initialized. Log file: $($engine.LogFile)"
    return $engine
}

function Write-Log {
    param(
        [hashtable]$Engine,
        [string]$Message,
        [string]$Level = "Info",
        [hashtable]$Context = @{}
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = @{
        Timestamp = $timestamp
        Level = $Level
        Message = $Message
        Context = $Context
    }
    
    # Convert to JSON for structured logging
    $logLine = $logEntry | ConvertTo-Json -Compress
    
    try {
        Add-Content -Path $Engine.LogFile -Value $logLine -ErrorAction Stop
        
        # Also write to console with color coding
        $color = switch ($Level) {
            "Debug" { "Gray" }
            "Info" { "White" }
            "Warning" { "Yellow" }
            "Error" { "Red" }
            default { "White" }
        }
        
        Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
    }
    catch {
        Write-Warning "Failed to write to log file: $_"
    }
}

function Write-DebugLog {
    param(
        [hashtable]$Engine,
        [string]$Message,
        [hashtable]$Context = @{}
    )
    
    if ($Engine.LogLevel -eq "Debug") {
        Write-Log -Engine $Engine -Message $Message -Level "Debug" -Context $Context
    }
}

function Write-InfoLog {
    param(
        [hashtable]$Engine,
        [string]$Message,
        [hashtable]$Context = @{}
    )
    
    Write-Log -Engine $Engine -Message $Message -Level "Info" -Context $Context
}

function Write-WarningLog {
    param(
        [hashtable]$Engine,
        [string]$Message,
        [hashtable]$Context = @{}
    )
    
    Write-Log -Engine $Engine -Message $Message -Level "Warning" -Context $Context
}

function Write-ErrorLog {
    param(
        [hashtable]$Engine,
        [string]$Message,
        [hashtable]$Context = @{}
    )
    
    Write-Log -Engine $Engine -Message $Message -Level "Error" -Context $Context
}

function Get-LogEntries {
    param(
        [hashtable]$Engine,
        [int]$Count = 50,
        [string]$Level = $null,
        [string]$SearchTerm = $null
    )
    
    if (!(Test-Path $Engine.LogFile)) {
        return @()
    }
    
    try {
        $entries = Get-Content $Engine.LogFile | ForEach-Object {
            try {
                $entry = $_ | ConvertFrom-Json
                return $entry
            }
            catch {
                # Skip invalid JSON entries
                return $null
            }
        } | Where-Object { $null -ne $_ }
        
        # Filter by level if specified
        if ($Level) {
            $entries = $entries | Where-Object { $_.Level -eq $Level }
        }
        
        # Filter by search term if specified
        if ($SearchTerm) {
            $entries = $entries | Where-Object { $_.Message -match $SearchTerm }
        }
        
        # Return the most recent entries
        return $entries | Select-Object -Last $Count
    }
    catch {
        Write-Warning "Failed to read log entries: $_"
        return @()
    }
}

function Clear-LogFiles {
    param([hashtable]$Engine)
    
    try {
        # Get all log files
        $logFiles = Get-ChildItem -Path $Engine.LogPath -Filter "*.log" | Sort-Object LastWriteTime -Descending
        
        # Keep only the most recent files
        if ($logFiles.Count -gt $Engine.MaxLogFiles) {
            $filesToDelete = $logFiles | Select-Object -Skip $Engine.MaxLogFiles
            $filesToDelete | Remove-Item -Force
            
            Write-InfoLog -Engine $Engine -Message "Cleaned up $($filesToDelete.Count) old log files"
        }
        
        # Check log file size
        $currentLog = Get-Item $Engine.LogFile -ErrorAction SilentlyContinue
        if ($currentLog -and $currentLog.Length -gt $Engine.MaxLogSize) {
            # Archive current log and start new one
            $archiveName = $Engine.LogFile -replace "\.log$", "-$(Get-Date -Format 'HHmmss').log"
            Move-Item $Engine.LogFile $archiveName
            
            Write-InfoLog -Engine $Engine -Message "Log file archived: $archiveName"
        }
    }
    catch {
        Write-Warning "Failed to clean up log files: $_"
    }
}

function Export-LogReport {
    param(
        [hashtable]$Engine,
        [string]$OutputPath,
        [string]$Format = "CSV"
    )
    
    try {
        $entries = Get-LogEntries -Engine $Engine -Count 1000
        
        switch ($Format.ToLower()) {
            "CSV" {
                $entries | Export-Csv -Path $OutputPath -NoTypeInformation
            }
            "JSON" {
                $entries | ConvertTo-Json -Depth 3 | Set-Content $OutputPath
            }
            "HTML" {
                $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>AI Agent Log Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .debug { background-color: #f9f9f9; }
        .info { background-color: #e7f3ff; }
        .warning { background-color: #fff3cd; }
        .error { background-color: #f8d7da; }
    </style>
</head>
<body>
    <h1>AI Agent Log Report</h1>
    <table>
        <tr>
            <th>Timestamp</th>
            <th>Level</th>
            <th>Message</th>
        </tr>
"@
                
                foreach ($entry in $entries) {
                    $class = $entry.Level.ToLower()
                    $html += @"
        <tr class="$class">
            <td>$($entry.Timestamp)</td>
            <td>$($entry.Level)</td>
            <td>$($entry.Message)</td>
        </tr>
"@
                }
                
                $html += @"
    </table>
</body>
</html>
"@
                
                $html | Set-Content $OutputPath
            }
        }
        
        Write-InfoLog -Engine $Engine -Message "Log report exported to: $OutputPath"
        return $true
    }
    catch {
        Write-ErrorLog -Engine $Engine -Message "Failed to export log report: $_"
        return $false
    }
}

# Export functions
Export-ModuleMember -Function Initialize-LoggingEngine, Write-Log, Write-DebugLog, Write-InfoLog, Write-WarningLog, Write-ErrorLog, Get-LogEntries, Clear-LogFiles, Export-LogReport 