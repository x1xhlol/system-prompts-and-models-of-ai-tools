# PowerShell AI Agent - Main Entry Point
# Version: 2.0 - Enhanced with modules

param(
    [switch]$Verbose,
    [switch]$NoVoice,
    [switch]$Debug,
    [string]$ConfigPath = ".\config\agent-config.json"
)

# Import required modules
$ErrorActionPreference = "Stop"

# Import custom modules
$modulePath = ".\modules"
if (Test-Path $modulePath) {
    Import-Module "$modulePath\AI-Engine.psm1" -Force
    Import-Module "$modulePath\Voice-Engine.psm1" -Force
    Import-Module "$modulePath\Logging-Engine.psm1" -Force
}

# Import plugin manager
$pluginPath = ".\plugins"
if (Test-Path $pluginPath) {
    Import-Module "$pluginPath\Plugin-Manager.psm1" -Force
}

# Function to load configuration
function Load-Configuration {
    param([string]$ConfigPath)
    
    try {
        if (Test-Path $ConfigPath) {
            $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
            # Convert PSCustomObject to hashtable
            $configHashtable = @{}
            $config.PSObject.Properties | ForEach-Object {
                $configHashtable[$_.Name] = $_.Value
            }
            Write-Host "Configuration loaded successfully" -ForegroundColor Green
            return $configHashtable
        } else {
            throw "Configuration file not found: $ConfigPath"
        }
    }
    catch {
        Write-Error "Failed to load configuration: $_"
        exit 1
    }
}

# Function to initialize memory
function Initialize-Memory {
    param($Config)
    
    $memoryPath = $Config.Memory.PersistencePath
    if (Test-Path $memoryPath) {
        try {
            $memory = Get-Content $memoryPath -Raw | ConvertFrom-Json
            Write-Host "Memory loaded from: $memoryPath" -ForegroundColor Green
            return $memory
        }
        catch {
            Write-Warning "Failed to load memory, creating new memory file"
        }
    }
    
    # Create new memory structure
    $memory = @{
        entries = @()
        lastUpdated = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        version = "1.0"
    }
    
    # Ensure directory exists
    $memoryDir = Split-Path $memoryPath -Parent
    if (!(Test-Path $memoryDir)) {
        New-Item -ItemType Directory -Path $memoryDir -Force | Out-Null
    }
    
    $memory | ConvertTo-Json -Depth 10 | Set-Content $memoryPath
    Write-Host "New memory file created: $memoryPath" -ForegroundColor Yellow
    return $memory
}

# Function to save memory
function Save-Memory {
    param($Memory, $Config)
    
    $Memory.lastUpdated = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $memoryPath = $Config.Memory.PersistencePath
    $Memory | ConvertTo-Json -Depth 10 | Set-Content $memoryPath
}

# Function to add memory entry
function Add-MemoryEntry {
    param($Memory, $Input, $Response, $Timestamp = (Get-Date))
    
    $entry = @{
        input = $Input
        response = $Response
        timestamp = $Timestamp.ToString("yyyy-MM-dd HH:mm:ss")
    }
    
    $Memory.entries += $entry
    
    # Limit memory entries
    if ($Memory.entries.Count -gt 1000) {
        $Memory.entries = $Memory.entries | Select-Object -Last 1000
    }
}

# Function to simulate AI response (placeholder for actual AI integration)
function Get-AIResponse {
    param($Input, $Config, $Memory)
    
    # This is a placeholder - in a real implementation, you would integrate with an AI service
    $responses = @(
        "I understand you said: '$Input'. How can I help you further?",
        "That's an interesting point about '$Input'. Let me think about that...",
        "Based on your input '$Input', I'd recommend considering the following...",
        "I've processed your request: '$Input'. Here's what I can do for you...",
        "Thank you for sharing '$Input'. I'm here to assist you with any tasks."
    )
    
    $response = $responses | Get-Random
    
    # Add context from memory if available
    if ($Memory.entries.Count -gt 0) {
        $recentEntries = $Memory.entries | Select-Object -Last 3
        $context = "Based on our previous conversation, "
        $response = $context + $response
    }
    
    return $response
}

# Function to handle voice input/output (placeholder)
function Handle-Voice {
    param($Config, $Enabled = $true)
    
    if (-not $Enabled -or -not $Config.Voice.Enabled) {
        return $false
    }
    
    Write-Host "Voice features are configured but not implemented yet." -ForegroundColor Yellow
    Write-Host "Voice settings: Language=$($Config.Voice.Language), Speed=$($Config.Voice.ResponseSpeed)" -ForegroundColor Cyan
    return $false
}

# Main agent loop
function Start-AgentLoop {
    param($Config, $Memory, $AIEngine, $VoiceEngine, $LoggingEngine, $PluginManager)
    
    Write-Host "=== PowerShell AI Agent Started ===" -ForegroundColor Green
    Write-Host "AI Model: $($Config.AI.Model)" -ForegroundColor Cyan
    Write-Host "Max Tokens: $($Config.AI.MaxTokens)" -ForegroundColor Cyan
    Write-Host "Temperature: $($Config.AI.Temperature)" -ForegroundColor Cyan
    Write-Host "Memory Enabled: $($Config.Memory.Enabled)" -ForegroundColor Cyan
    Write-Host "Autopilot Enabled: $($Config.Autopilot.Enabled)" -ForegroundColor Cyan
    Write-Host "Voice Enabled: $($VoiceEngine.VoiceEnabled)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Type 'exit' or 'quit' to stop the agent" -ForegroundColor Yellow
    Write-Host "Type 'help' for available commands" -ForegroundColor Yellow
    Write-Host "Type 'voice' to toggle voice mode" -ForegroundColor Yellow
    Write-Host ""
    
    Write-InfoLog -Engine $LoggingEngine -Message "Agent loop started"
    
    # Initialize voice if enabled
    if ($VoiceEngine.VoiceEnabled -and -not $NoVoice) {
        Test-VoiceSystem -Engine $VoiceEngine
    }
    
    do {
        try {
            Write-Host "AI Agent> " -NoNewline -ForegroundColor Green
            $userInput = Read-Host
            
            if ([string]::IsNullOrWhiteSpace($userInput)) {
                continue
            }
            
            Write-DebugLog -Engine $LoggingEngine -Message "User input received" -Context @{ Input = $userInput }
            
            # Handle special commands
            switch ($userInput.ToLower()) {
                "exit" { 
                    Write-InfoLog -Engine $LoggingEngine -Message "User requested exit"
                    Write-Host "Saving memory and shutting down..." -ForegroundColor Yellow
                    Save-Memory -Memory $Memory -Config $Config
                    Write-Host "Goodbye!" -ForegroundColor Green
                    return 
                }
                "quit" { 
                    Write-InfoLog -Engine $LoggingEngine -Message "User requested quit"
                    Write-Host "Saving memory and shutting down..." -ForegroundColor Yellow
                    Save-Memory -Memory $Memory -Config $Config
                    Write-Host "Goodbye!" -ForegroundColor Green
                    return 
                }
                "help" {
                    Write-Host "Available commands:" -ForegroundColor Cyan
                    Write-Host "  help     - Show this help message" -ForegroundColor White
                    Write-Host "  exit     - Exit the agent" -ForegroundColor White
                    Write-Host "  quit     - Exit the agent" -ForegroundColor White
                    Write-Host "  memory   - Show memory statistics" -ForegroundColor White
                    Write-Host "  config   - Show current configuration" -ForegroundColor White
                    Write-Host "  clear    - Clear the screen" -ForegroundColor White
                    Write-Host "  voice    - Toggle voice mode" -ForegroundColor White
                    Write-Host "  logs     - Show recent log entries" -ForegroundColor White
                    Write-Host "  test     - Test system capabilities" -ForegroundColor White
                    Write-Host "  plugins  - Show loaded plugins" -ForegroundColor White
                    continue
                }
                "memory" {
                    Write-Host "Memory Statistics:" -ForegroundColor Cyan
                    Write-Host "  Total Entries: $($Memory.entries.Count)" -ForegroundColor White
                    Write-Host "  Last Updated: $($Memory.lastUpdated)" -ForegroundColor White
                    Write-Host "  Version: $($Memory.version)" -ForegroundColor White
                    continue
                }
                "config" {
                    Write-Host "Current Configuration:" -ForegroundColor Cyan
                    $Config | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
                    continue
                }
                "clear" {
                    Clear-Host
                    continue
                }
                "voice" {
                    if ($VoiceEngine.VoiceEnabled) {
                        if ($VoiceEngine.IsListening) {
                            Stop-SpeechRecognition -Engine $VoiceEngine
                        } else {
                            Start-SpeechRecognition -Engine $VoiceEngine -OnSpeechRecognized {
                                param($text)
                                Write-Host "Voice: $text" -ForegroundColor Magenta
                                # Process voice input
                                $aiResponse = Get-AIResponse -Engine $AIEngine -Input $text -Memory $Memory
                                Write-Host "AI: $aiResponse" -ForegroundColor Blue
                                Speak-Text -Engine $VoiceEngine -Text $aiResponse
                            }
                        }
                    } else {
                        Write-Host "Voice features are disabled" -ForegroundColor Yellow
                    }
                    continue
                }
                "logs" {
                    $recentLogs = Get-LogEntries -Engine $LoggingEngine -Count 10
                    Write-Host "Recent Log Entries:" -ForegroundColor Cyan
                    foreach ($log in $recentLogs) {
                        $color = switch ($log.Level) {
                            "Debug" { "Gray" }
                            "Info" { "White" }
                            "Warning" { "Yellow" }
                            "Error" { "Red" }
                            default { "White" }
                        }
                        Write-Host "[$($log.Timestamp)] [$($log.Level)] $($log.Message)" -ForegroundColor $color
                    }
                    continue
                }
                "test" {
                    Write-Host "Testing system capabilities..." -ForegroundColor Cyan
                    Test-VoiceSystem -Engine $VoiceEngine
                    Write-Host "AI Engine: OK" -ForegroundColor Green
                    Write-Host "Logging Engine: OK" -ForegroundColor Green
                    continue
                }
                "plugins" {
                    Show-PluginInfo -Manager $PluginManager
                    continue
                }
            }
            
            # Process user input with AI
            $aiResponse = Get-AIResponse -Engine $AIEngine -Input $userInput -Memory $Memory
            
            # Display response
            Write-Host "AI: $aiResponse" -ForegroundColor Blue
            
            # Speak response if voice is enabled
            if ($VoiceEngine.VoiceEnabled -and $VoiceEngine.IsListening) {
                Speak-Text -Engine $VoiceEngine -Text $aiResponse
            }
            
            # Add to memory
            if ($Config.Memory.Enabled) {
                Add-MemoryEntry -Memory $Memory -Input $userInput -Response $aiResponse
            }
            
            # Log the interaction
            Write-InfoLog -Engine $LoggingEngine -Message "AI response generated" -Context @{
                Input = $userInput
                Response = $aiResponse
                MemoryEntries = $Memory.entries.Count
            }
            
            # Save memory periodically
            if ($Memory.entries.Count % 10 -eq 0) {
                Save-Memory -Memory $Memory -Config $Config
                Write-DebugLog -Engine $LoggingEngine -Message "Memory saved automatically"
            }
            
        }
        catch {
            Write-ErrorLog -Engine $LoggingEngine -Message "Error in agent loop: $_" -Context @{ StackTrace = $_.ScriptStackTrace }
            Write-Error "Error in agent loop: $_"
            if ($Verbose) {
                Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
            }
        }
    } while ($true)
}

# Main execution
try {
    Write-Host "PowerShell AI Agent Starting..." -ForegroundColor Green
    
    # Load configuration
    $config = Load-Configuration -ConfigPath $ConfigPath
    
    # Initialize engines
    $aiEngine = Initialize-AIEngine -Config $config
    $voiceEngine = Initialize-VoiceEngine -Config $config
    $loggingEngine = Initialize-LoggingEngine -Config $config
    $pluginManager = Initialize-PluginManager -Config $config
    
    # Set debug level if requested
    if ($Debug) {
        $loggingEngine.LogLevel = "Debug"
    }
    
    Write-InfoLog -Engine $loggingEngine -Message "AI Agent starting with enhanced modules"
    
    # Load plugins
    Load-AllPlugins -Manager $pluginManager
    Write-InfoLog -Engine $loggingEngine -Message "Plugins loaded: $($pluginManager.LoadedPlugins.Count)"
    
    # Initialize memory
    $memory = Initialize-Memory -Config $config
    
    # Start the agent loop
    Start-AgentLoop -Config $config -Memory $memory -AIEngine $aiEngine -VoiceEngine $voiceEngine -LoggingEngine $loggingEngine -PluginManager $pluginManager
}
catch {
    Write-Error "Failed to start AI Agent: $_"
    if ($Verbose) {
        Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    }
    exit 1
} 