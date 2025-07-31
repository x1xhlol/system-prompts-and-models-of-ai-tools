# PowerShell AI Agent - Main Script
# Version: 1.0
# Built for PowerShell 7.0+ with .NET 8.0

param(
    [string]$Command = "",
    [switch]$Voice,
    [switch]$Autopilot,
    [switch]$Help,
    [string]$ConfigPath = ".\config\agent-config.json"
)

# Import required modules
$ErrorActionPreference = "Stop"

# Check PowerShell version
if ($PSVersionTable.PSVersion.Major -lt 7) {
    Write-Error "PowerShell AI Agent requires PowerShell 7.0 or higher. Current version: $($PSVersionTable.PSVersion)"
    exit 1
}

# Global variables
$script:SpeechRecognizer = $null
$script:SpeechSynthesizer = $null
$script:AutopilotEnabled = $false

# Load configuration
function Load-Configuration {
    param([string]$ConfigPath)
    
    try {
        if (Test-Path $ConfigPath) {
            $config = Get-Content $ConfigPath | ConvertFrom-Json
            return $config
        } else {
            # Default configuration
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
            
            # Create config directory if it doesn't exist
            $configDir = Split-Path $ConfigPath -Parent
            if (!(Test-Path $configDir)) {
                New-Item -ItemType Directory -Path $configDir -Force | Out-Null
            }
            
            # Save default configuration
            $defaultConfig | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath
            return $defaultConfig
        }
    }
    catch {
        Write-Error "Failed to load configuration: $_"
        exit 1
    }
}

# Initialize memory system
function Initialize-MemorySystem {
    param([object]$Config)
    
    try {
        $memoryPath = $Config.Memory.PersistencePath
        $memoryDir = Split-Path $memoryPath -Parent
        
        if (!(Test-Path $memoryDir)) {
            New-Item -ItemType Directory -Path $memoryDir -Force | Out-Null
        }
        
        if (!(Test-Path $memoryPath)) {
            @{
                entries = @()
                lastUpdated = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                version = "1.0"
            } | ConvertTo-Json -Depth 10 | Set-Content $memoryPath
        }
        
        return $memoryPath
    }
    catch {
        Write-Error "Failed to initialize memory system: $_"
        return $null
    }
}

# Memory management functions
function Add-MemoryEntry {
    param(
        [string]$Type,
        [string]$Content,
        [string]$Context = "",
        [string]$MemoryPath
    )
    
    try {
        $memory = Get-Content $MemoryPath | ConvertFrom-Json
        
        $newEntry = @{
            id = [guid]::NewGuid().ToString()
            type = $Type
            content = $Content
            context = $Context
            timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            version = "1.0"
        }
        
        $memory.entries += $newEntry
        
        # Limit memory entries
        if ($memory.entries.Count -gt 1000) {
            $memory.entries = $memory.entries | Select-Object -Last 1000
        }
        
        $memory.lastUpdated = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        $memory | ConvertTo-Json -Depth 10 | Set-Content $MemoryPath
        
        return $newEntry.id
    }
    catch {
        Write-Error "Failed to add memory entry: $_"
        return $null
    }
}

function Get-MemoryEntries {
    param(
        [string]$Type = "",
        [string]$MemoryPath,
        [int]$Limit = 10
    )
    
    try {
        $memory = Get-Content $MemoryPath | ConvertFrom-Json
        
        if ($Type) {
            $entries = $memory.entries | Where-Object { $_.type -eq $Type }
        } else {
            $entries = $memory.entries
        }
        
        return $entries | Select-Object -Last $Limit
    }
    catch {
        Write-Error "Failed to retrieve memory entries: $_"
        return @()
    }
}

# Voice processing functions
function Initialize-VoiceRecognition {
    param([object]$Config)
    
    try {
        # Check if speech recognition is available
        $speechAssembly = [System.Reflection.Assembly]::LoadWithPartialName("System.Speech")
        if ($speechAssembly) {
            $script:SpeechRecognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
            $script:SpeechSynthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
            
            # Configure speech recognizer
            $grammar = New-Object System.Speech.Recognition.GrammarBuilder
            $grammar.AppendDictation()
            $script:SpeechRecognizer.LoadGrammar($grammar)
            
            # Set recognition sensitivity
            $script:SpeechRecognizer.SetInputToDefaultAudioDevice()
            
            Write-Host "✅ Voice recognition initialized successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Warning "Speech recognition not available. Voice features will be disabled."
            return $false
        }
    }
    catch {
        Write-Warning "Failed to initialize voice recognition: $_"
        return $false
    }
}

function Start-VoiceRecognition {
    param([scriptblock]$OnRecognized)
    
    try {
        if ($script:SpeechRecognizer) {
            $script:SpeechRecognizer.SpeechRecognized += {
                param($sender, $e)
                $recognizedText = $e.Result.Text
                Write-Host "🎤 Recognized: $recognizedText" -ForegroundColor Cyan
                & $OnRecognized -RecognizedCommand $recognizedText
            }
            
            $script:SpeechRecognizer.RecognizeAsync()
            Write-Host "🎤 Voice recognition started. Speak your commands..." -ForegroundColor Green
        }
    }
    catch {
        Write-Error "Failed to start voice recognition: $_"
    }
}

function Stop-VoiceRecognition {
    try {
        if ($script:SpeechRecognizer) {
            $script:SpeechRecognizer.RecognizeAsyncStop()
            Write-Host "🎤 Voice recognition stopped" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Error "Failed to stop voice recognition: $_"
    }
}

# Autopilot functions
function Enable-AutopilotMode {
    param([object]$Config)
    
    try {
        $script:AutopilotEnabled = $true
        Write-Host "🤖 Autopilot mode enabled" -ForegroundColor Green
        Write-Host "  Autonomy Level: $($Config.Autopilot.AutonomyLevel)" -ForegroundColor Cyan
        Write-Host "  Risk Tolerance: $($Config.Autopilot.RiskTolerance)" -ForegroundColor Cyan
        Write-Host "  Max Concurrent Tasks: $($Config.Autopilot.MaxConcurrentTasks)" -ForegroundColor Cyan
    }
    catch {
        Write-Error "Failed to enable autopilot mode: $_"
    }
}

function Disable-AutopilotMode {
    param([object]$Config)
    
    try {
        $script:AutopilotEnabled = $false
        Write-Host "🤖 Autopilot mode disabled" -ForegroundColor Yellow
    }
    catch {
        Write-Error "Failed to disable autopilot mode: $_"
    }
}

# Command processing function
function Process-Command {
    param(
        [string]$Command,
        [object]$Config,
        [string]$MemoryPath
    )
    
    try {
        Write-Host "🔄 Processing command: $Command" -ForegroundColor Cyan
        
        # Add command to memory
        $memoryId = Add-MemoryEntry -Type "command" -Content $Command -MemoryPath $MemoryPath
        
        # Analyze command with AI
        $analysis = Invoke-AIAnalysis -Command $Command -Config $Config
        
        # Generate response
        $response = @"
🤖 PowerShell AI Agent Response
===============================

Command: $Command
Intent: $($analysis.intent)
Confidence: $($analysis.confidence)

$($analysis.response)

Suggested Actions:
$(($analysis.suggestedActions | ForEach-Object { "- $_" }) -join "`n")

Memory ID: $memoryId
"@
        
        Write-Host $response -ForegroundColor White
        
        # Speak response if voice is enabled
        if ($Config.Voice.Enabled) {
            Speak-Response -Text $analysis.response
        }
        
        # Execute suggested actions if autopilot is enabled
        if ($Config.Autopilot.Enabled) {
            Write-Host "🤖 Autopilot: Executing suggested actions..." -ForegroundColor Green
            foreach ($action in $analysis.suggestedActions) {
                try {
                    Write-Host "Executing: $action" -ForegroundColor Yellow
                    Invoke-Expression $action | Out-Null
                }
                catch {
                    Write-Warning "Failed to execute $action : $_"
                }
            }
        }
        
        return $analysis
    }
    catch {
        Write-Error "Failed to process command: $_"
        return $null
    }
}

# Main execution flow
function Main {
    param(
        [string]$Command,
        [switch]$Voice,
        [switch]$Autopilot,
        [switch]$Help,
        [string]$ConfigPath
    )
    
    # Show help if requested
    if ($Help) {
        Write-Host @"
PowerShell AI Agent - Help
==========================

Usage: .\main.ps1 [options]

Options:
  -Command <string>     Command to process
  -Voice               Enable voice recognition
  -Autopilot           Enable autopilot mode
  -Help                Show this help message
  -ConfigPath <string> Path to configuration file

Examples:
  .\main.ps1 -Command "Get-ChildItem"
  .\main.ps1 -Voice -Command "Show me the processes"
  .\main.ps1 -Autopilot -Command "Monitor system performance"

Features:
  - Voice recognition and synthesis
  - Autopilot mode for autonomous execution
  - Memory system for persistent learning
  - AI-powered command analysis
  - Cross-platform PowerShell 7 support
"@ -ForegroundColor Cyan
        return
    }
    
    # Load configuration
    Write-Host "🔧 Loading configuration..." -ForegroundColor Yellow
    $config = Load-Configuration -ConfigPath $ConfigPath
    
    # Initialize memory system
    Write-Host "🧠 Initializing memory system..." -ForegroundColor Yellow
    $memoryPath = Initialize-MemorySystem -Config $config
    
    # Initialize voice recognition if requested
    if ($Voice -or $config.Voice.Enabled) {
        Write-Host "🎤 Initializing voice recognition..." -ForegroundColor Yellow
        $voiceEnabled = Initialize-VoiceRecognition -Config $config
        if ($voiceEnabled) {
            $config.Voice.Enabled = $true
        }
    }
    
    # Enable autopilot mode if requested
    if ($Autopilot -or $config.Autopilot.Enabled) {
        Write-Host "🤖 Enabling autopilot mode..." -ForegroundColor Yellow
        Enable-AutopilotMode -Config $config
    }
    
    # Process command if provided
    if ($Command) {
        Process-Command -Command $Command -Config $config -MemoryPath $memoryPath
    }
    # Start interactive mode if no command provided
    else {
        Write-Host "🚀 PowerShell AI Agent started in interactive mode" -ForegroundColor Green
        Write-Host "Type 'exit' to quit, 'help' for assistance" -ForegroundColor Cyan
        
        # Start voice recognition if enabled
        if ($config.Voice.Enabled) {
            Start-VoiceRecognition -OnRecognized {
                param([string]$RecognizedCommand)
                Process-Command -Command $RecognizedCommand -Config $config -MemoryPath $memoryPath
            }
        }
        
        # Interactive command loop
        while ($true) {
            try {
                $userCommand = Read-Host "`nPowerShell AI Agent>"
                
                if ($userCommand.ToLower() -eq "exit") {
                    break
                }
                elseif ($userCommand.ToLower() -eq "help") {
                    Write-Host "Available commands:" -ForegroundColor Cyan
                    Write-Host "  help                    - Show this help" -ForegroundColor White
                    Write-Host "  exit                    - Exit the agent" -ForegroundColor White
                    Write-Host "  voice on/off           - Toggle voice recognition" -ForegroundColor White
                    Write-Host "  autopilot on/off       - Toggle autopilot mode" -ForegroundColor White
                    Write-Host "  memory show            - Show recent memory entries" -ForegroundColor White
                    Write-Host "  memory clear           - Clear memory" -ForegroundColor White
                    Write-Host "  status                 - Show system status" -ForegroundColor White
                    Write-Host "  any PowerShell command - Process with AI analysis" -ForegroundColor White
                }
                elseif ($userCommand.ToLower() -match "voice on") {
                    Initialize-VoiceRecognition -Config $config
                    Start-VoiceRecognition -OnRecognized {
                        param([string]$RecognizedCommand)
                        Process-Command -Command $RecognizedCommand -Config $config -MemoryPath $memoryPath
                    }
                }
                elseif ($userCommand.ToLower() -match "voice off") {
                    Stop-VoiceRecognition
                }
                elseif ($userCommand.ToLower() -match "autopilot on") {
                    Enable-AutopilotMode -Config $config
                }
                elseif ($userCommand.ToLower() -match "autopilot off") {
                    Disable-AutopilotMode -Config $config
                }
                elseif ($userCommand.ToLower() -eq "memory show") {
                    $entries = Get-MemoryEntries -MemoryPath $memoryPath -Limit 5
                    Write-Host "Recent memory entries:" -ForegroundColor Green
                    foreach ($entry in $entries) {
                        Write-Host "  [$($entry.timestamp)] $($entry.type): $($entry.content)" -ForegroundColor White
                    }
                }
                elseif ($userCommand.ToLower() -eq "memory clear") {
                    @{ entries = @(); lastUpdated = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"); version = "1.0" } | 
                        ConvertTo-Json -Depth 10 | Set-Content $memoryPath
                    Write-Host "Memory cleared" -ForegroundColor Green
                }
                elseif ($userCommand.ToLower() -eq "status") {
                    Write-Host "System Status:" -ForegroundColor Green
                    Write-Host "  PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor White
                    Write-Host "  Voice Recognition: $($config.Voice.Enabled)" -ForegroundColor White
                    Write-Host "  Autopilot Mode: $($config.Autopilot.Enabled)" -ForegroundColor White
                    Write-Host "  Memory Entries: $(($entries = Get-MemoryEntries -MemoryPath $memoryPath).Count)" -ForegroundColor White
                }
                else {
                    Process-Command -Command $userCommand -Config $config -MemoryPath $memoryPath
                }
            }
            catch {
                Write-Error "Error processing command: $_"
            }
        }
        
        # Cleanup
        if ($config.Voice.Enabled) {
            Stop-VoiceRecognition
        }
    }
    
    Write-Host "PowerShell AI Agent shutting down..." -ForegroundColor Green
}


# Execute main function with parameters
Main -Command $Command -Voice $Voice -Autopilot $Autopilot -Help $Help -ConfigPath $ConfigPath
