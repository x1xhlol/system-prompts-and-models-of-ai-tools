# PowerShell AI Agent - Installation Script
# This script installs and configures the PowerShell AI Agent

param(
    [switch]$Force,
    [switch]$SkipDependencies,
    [switch]$Verbose,
    [string]$InstallPath = ".\PowerShell_AI_Agent"
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to check PowerShell version
function Test-PowerShellVersion {
    Write-Host "Checking PowerShell version..." -ForegroundColor Yellow
    Write-Host "Current version: $($PSVersionTable.PSVersion)" -ForegroundColor Cyan
    
    if ($PSVersionTable.PSVersion.Major -lt 7) {
        Write-Host "Warning: PowerShell AI Agent works best with PowerShell 7.0+" -ForegroundColor Yellow
        Write-Host "Download PowerShell 7 from: https://aka.ms/PSWindows" -ForegroundColor Cyan
        
        if (-not $Force) {
            Write-Host "Continuing with current PowerShell version..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "PowerShell version is compatible" -ForegroundColor Green
    }
}

# Function to create directory structure
function New-DirectoryStructure {
    param([string]$BasePath)
    
    Write-Host "Creating directory structure..." -ForegroundColor Yellow
    
    $directories = @(
        "scripts",
        "modules", 
        "config",
        "data",
        "logs",
        "examples",
        "tests",
        "plugins"
    )
    
    foreach ($dir in $directories) {
        $path = Join-Path $BasePath $dir
        if (!(Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
            Write-Host "  Created: $path" -ForegroundColor Green
        } else {
            Write-Host "  Exists: $path" -ForegroundColor Cyan
        }
    }
}

# Function to configure execution policy
function Set-ExecutionPolicy {
    Write-Host "Configuring execution policy..." -ForegroundColor Yellow
    
    $currentPolicy = Get-ExecutionPolicy
    Write-Host "Current execution policy: $currentPolicy" -ForegroundColor Cyan
    
    if ($currentPolicy -eq "Restricted") {
        Write-Host "Execution policy is restricted. Setting to RemoteSigned..." -ForegroundColor Yellow
        try {
            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
            Write-Host "Execution policy updated to RemoteSigned" -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to update execution policy. You may need to run as administrator." -ForegroundColor Yellow
        }
    } else {
        Write-Host "Execution policy is already permissive" -ForegroundColor Green
    }
}

# Function to create configuration files
function New-ConfigurationFiles {
    param([string]$BasePath)
    
    Write-Host "Creating configuration files..." -ForegroundColor Yellow
    
    # Create default configuration if it doesn't exist
    $configPath = Join-Path $BasePath "config\agent-config.json"
    if (!(Test-Path $configPath)) {
        $defaultConfig = @{
            Voice = @{
                Enabled = $true
                RecognitionSensitivity = 0.8
                ResponseSpeed = "normal"
                Language = "en-US"
            }
            Autopilot = @{
                Enabled = $false
                AutonomyLevel = "medium"
                ConfirmationThreshold = "high"
                RiskTolerance = "low"
            }
            Memory = @{
                Enabled = $true
                MaxEntries = 1000
                PersistencePath = ".\data\memory.json"
            }
            AI = @{
                Model = "gpt-4"
                Temperature = 0.7
                MaxTokens = 4000
            }
        }
        
        $defaultConfig | ConvertTo-Json -Depth 10 | Set-Content $configPath
        Write-Host "Created default configuration" -ForegroundColor Green
    }
    
    # Create memory file
    $memoryPath = Join-Path $BasePath "data\memory.json"
    if (!(Test-Path $memoryPath)) {
        @{
            entries = @()
            lastUpdated = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            version = "1.0"
        } | ConvertTo-Json -Depth 10 | Set-Content $memoryPath
        Write-Host "Created memory file" -ForegroundColor Green
    }
}

# Function to display usage instructions
function Show-UsageInstructions {
    param([string]$BasePath)
    
    Write-Host "`nUsage Instructions:" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    
    Write-Host "`nQuick Start:" -ForegroundColor Green
    Write-Host "1. Start the agent: .\scripts\main.ps1" -ForegroundColor White
    Write-Host "2. With voice: .\scripts\main.ps1 -Voice" -ForegroundColor White
    Write-Host "3. With autopilot: .\scripts\main.ps1 -Autopilot" -ForegroundColor White
    Write-Host "4. Get help: .\scripts\main.ps1 -Help" -ForegroundColor White
    
    Write-Host "`nConfiguration:" -ForegroundColor Green
    Write-Host "Edit: $BasePath\config\agent-config.json" -ForegroundColor White
    Write-Host "Memory: $BasePath\data\memory.json" -ForegroundColor White
    Write-Host "Logs: $BasePath\logs\" -ForegroundColor White
    
    Write-Host "`nDocumentation:" -ForegroundColor Green
    Write-Host "README: $BasePath\README.md" -ForegroundColor White
    Write-Host "PowerShell 7: https://aka.ms/PSWindows" -ForegroundColor White
}

# Main installation function
function Install-PowerShellAI {
    param(
        [switch]$Force,
        [switch]$SkipDependencies,
        [switch]$Verbose,
        [string]$InstallPath
    )
    
    Write-Host "PowerShell AI Agent Installation" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    # Check PowerShell version
    Test-PowerShellVersion
    
    # Create installation directory
    if (!(Test-Path $InstallPath)) {
        New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
        Write-Host "Created installation directory: $InstallPath" -ForegroundColor Green
    }
    
    # Create directory structure
    New-DirectoryStructure -BasePath $InstallPath
    
    # Configure execution policy
    Set-ExecutionPolicy
    
    # Create configuration files
    New-ConfigurationFiles -BasePath $InstallPath
    
    # Show usage instructions
    Show-UsageInstructions -BasePath $InstallPath
    
    Write-Host "`nInstallation completed successfully!" -ForegroundColor Green
    Write-Host "You can now use the PowerShell AI Agent." -ForegroundColor Cyan
}

# Execute installation
try {
    Install-PowerShellAI -Force:$Force -SkipDependencies:$SkipDependencies -Verbose:$Verbose -InstallPath $InstallPath
}
catch {
    Write-Host "Installation failed: $_" -ForegroundColor Red
    exit 1
}
