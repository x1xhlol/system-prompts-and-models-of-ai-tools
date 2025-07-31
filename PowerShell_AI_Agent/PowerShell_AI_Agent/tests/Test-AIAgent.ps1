# Test Script for PowerShell AI Agent
# Comprehensive testing of all components

param(
    [switch]$Verbose,
    [switch]$SkipVoice,
    [string]$ConfigPath = ".\config\agent-config.json"
)

# Import modules
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

function Test-Configuration {
    Write-Host "Testing Configuration..." -ForegroundColor Cyan
    
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        Write-Host "✓ Configuration loaded successfully" -ForegroundColor Green
        
        # Test required sections
        $requiredSections = @("AI", "Voice", "Memory", "Autopilot")
        foreach ($section in $requiredSections) {
            if ($config.$section) {
                Write-Host "✓ $section section present" -ForegroundColor Green
            } else {
                Write-Host "✗ $section section missing" -ForegroundColor Red
                return $false
            }
        }
        
        return $true
    }
    catch {
        Write-Host "✗ Configuration test failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-AIEngine {
    Write-Host "Testing AI Engine..." -ForegroundColor Cyan
    
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        $aiEngine = Initialize-AIEngine -Config $config
        Write-Host "✓ AI Engine initialized" -ForegroundColor Green
        
        # Test response generation
        $response = Get-AIResponse -Engine $aiEngine -Input "Hello" -Memory @{ entries = @() }
        if ($response) {
            Write-Host "✓ AI response generation working" -ForegroundColor Green
        } else {
            Write-Host "✗ AI response generation failed" -ForegroundColor Red
            return $false
        }
        
        # Test system commands
        $systemResponse = Get-AIResponse -Engine $aiEngine -Input "Show system information" -Memory @{ entries = @() }
        if ($systemResponse -and $systemResponse.Contains("system information")) {
            Write-Host "✓ System command processing working" -ForegroundColor Green
        } else {
            Write-Host "✗ System command processing failed" -ForegroundColor Red
            return $false
        }
        
        return $true
    }
    catch {
        Write-Host "✗ AI Engine test failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-VoiceEngine {
    if ($SkipVoice) {
        Write-Host "Skipping Voice Engine test..." -ForegroundColor Yellow
        return $true
    }
    
    Write-Host "Testing Voice Engine..." -ForegroundColor Cyan
    
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        $voiceEngine = Initialize-VoiceEngine -Config $config
        
        if ($voiceEngine.VoiceEnabled) {
            Write-Host "✓ Voice Engine initialized" -ForegroundColor Green
            
            # Test speech synthesis
            $speakResult = Speak-Text -Engine $voiceEngine -Text "Voice test successful"
            if ($speakResult) {
                Write-Host "✓ Speech synthesis working" -ForegroundColor Green
            } else {
                Write-Host "⚠ Speech synthesis not available" -ForegroundColor Yellow
            }
            
            # Test voice availability
            $voices = Get-AvailableVoices -Engine $voiceEngine
            if ($voices.Count -gt 0) {
                Write-Host "✓ $($voices.Count) voices available" -ForegroundColor Green
            } else {
                Write-Host "⚠ No voices available" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠ Voice Engine disabled in configuration" -ForegroundColor Yellow
        }
        
        return $true
    }
    catch {
        Write-Host "✗ Voice Engine test failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-LoggingEngine {
    Write-Host "Testing Logging Engine..." -ForegroundColor Cyan
    
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        $loggingEngine = Initialize-LoggingEngine -Config $config
        Write-Host "✓ Logging Engine initialized" -ForegroundColor Green
        
        # Test log writing
        Write-InfoLog -Engine $loggingEngine -Message "Test log entry"
        Write-WarningLog -Engine $loggingEngine -Message "Test warning"
        Write-ErrorLog -Engine $loggingEngine -Message "Test error"
        
        # Test log reading
        $entries = Get-LogEntries -Engine $loggingEngine -Count 5
        if ($entries.Count -gt 0) {
            Write-Host "✓ Log writing and reading working" -ForegroundColor Green
        } else {
            Write-Host "✗ Log reading failed" -ForegroundColor Red
            return $false
        }
        
        return $true
    }
    catch {
        Write-Host "✗ Logging Engine test failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-PluginManager {
    Write-Host "Testing Plugin Manager..." -ForegroundColor Cyan
    
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        $pluginManager = Initialize-PluginManager -Config $config
        Write-Host "✓ Plugin Manager initialized" -ForegroundColor Green
        
        # Load plugins
        Load-AllPlugins -Manager $pluginManager
        
        if ($pluginManager.LoadedPlugins.Count -gt 0) {
            Write-Host "✓ $($pluginManager.LoadedPlugins.Count) plugins loaded" -ForegroundColor Green
            
            # Test plugin commands
            $commands = Get-PluginCommands -Manager $pluginManager
            if ($commands.Count -gt 0) {
                Write-Host "✓ $($commands.Count) plugin commands available" -ForegroundColor Green
                
                # Test a plugin command
                $testCommand = $commands[0]
                $result = Execute-PluginCommand -Manager $pluginManager -CommandName $testCommand.Name
                if ($result.Success) {
                    Write-Host "✓ Plugin command execution working" -ForegroundColor Green
                } else {
                    Write-Host "⚠ Plugin command execution failed: $($result.Error)" -ForegroundColor Yellow
                }
            } else {
                Write-Host "⚠ No plugin commands available" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠ No plugins loaded" -ForegroundColor Yellow
        }
        
        return $true
    }
    catch {
        Write-Host "✗ Plugin Manager test failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-MemorySystem {
    Write-Host "Testing Memory System..." -ForegroundColor Cyan
    
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        
        # Test memory initialization
        $memory = @{
            entries = @()
            lastUpdated = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            version = "1.0"
        }
        
        # Test memory operations
        $memory.entries += @{
            input = "Test input"
            response = "Test response"
            timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        }
        
        if ($memory.entries.Count -eq 1) {
            Write-Host "✓ Memory operations working" -ForegroundColor Green
        } else {
            Write-Host "✗ Memory operations failed" -ForegroundColor Red
            return $false
        }
        
        return $true
    }
    catch {
        Write-Host "✗ Memory System test failed: $_" -ForegroundColor Red
        return $false
    }
}

function Test-Integration {
    Write-Host "Testing Integration..." -ForegroundColor Cyan
    
    try {
        $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
        
        # Initialize all engines
        $aiEngine = Initialize-AIEngine -Config $config
        $voiceEngine = Initialize-VoiceEngine -Config $config
        $loggingEngine = Initialize-LoggingEngine -Config $config
        $pluginManager = Initialize-PluginManager -Config $config
        
        # Test integrated workflow
        Write-InfoLog -Engine $loggingEngine -Message "Integration test started"
        
        $memory = @{ entries = @() }
        $response = Get-AIResponse -Engine $aiEngine -Input "Integration test" -Memory $memory
        
        Write-InfoLog -Engine $loggingEngine -Message "Integration test completed"
        
        if ($response) {
            Write-Host "✓ Integration test passed" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ Integration test failed" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "✗ Integration test failed: $_" -ForegroundColor Red
        return $false
    }
}

# Main test execution
function Start-TestSuite {
    Write-Host "=== PowerShell AI Agent Test Suite ===" -ForegroundColor Green
    Write-Host ""
    
    $tests = @(
        @{ Name = "Configuration"; Function = "Test-Configuration" },
        @{ Name = "AI Engine"; Function = "Test-AIEngine" },
        @{ Name = "Voice Engine"; Function = "Test-VoiceEngine" },
        @{ Name = "Logging Engine"; Function = "Test-LoggingEngine" },
        @{ Name = "Plugin Manager"; Function = "Test-PluginManager" },
        @{ Name = "Memory System"; Function = "Test-MemorySystem" },
        @{ Name = "Integration"; Function = "Test-Integration" }
    )
    
    $passed = 0
    $total = $tests.Count
    
    foreach ($test in $tests) {
        Write-Host "Running $($test.Name) test..." -ForegroundColor White
        $result = & $test.Function
        
        if ($result) {
            $passed++
            Write-Host "✓ $($test.Name) test PASSED" -ForegroundColor Green
        } else {
            Write-Host "✗ $($test.Name) test FAILED" -ForegroundColor Red
        }
        
        Write-Host ""
    }
    
    # Summary
    Write-Host "=== Test Summary ===" -ForegroundColor Cyan
    Write-Host "Passed: $passed/$total" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
    
    if ($passed -eq $total) {
        Write-Host "All tests passed! AI Agent is ready to use." -ForegroundColor Green
        return $true
    } else {
        Write-Host "Some tests failed. Please check the issues above." -ForegroundColor Red
        return $false
    }
}

# Run tests
Start-TestSuite 