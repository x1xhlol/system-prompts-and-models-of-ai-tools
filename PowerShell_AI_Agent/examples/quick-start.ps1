# PowerShell AI Agent - Quick Start Guide
# This script demonstrates how to use the PowerShell AI Agent

# Check PowerShell version
Write-Host "🔍 Checking PowerShell version..." -ForegroundColor Yellow
Write-Host "Current PowerShell version: $($PSVersionTable.PSVersion)" -ForegroundColor Cyan

if ($PSVersionTable.PSVersion.Major -lt 7) {
    Write-Host "⚠️  Warning: PowerShell AI Agent works best with PowerShell 7.0+" -ForegroundColor Yellow
    Write-Host "Download PowerShell 7 from: https://aka.ms/PSWindows" -ForegroundColor Cyan
}

# Import the main script
$scriptPath = Join-Path $PSScriptRoot "..\scripts\main.ps1"
if (Test-Path $scriptPath) {
    Write-Host "✅ Found main script: $scriptPath" -ForegroundColor Green
} else {
    Write-Host "❌ Main script not found. Please ensure the script is in the correct location." -ForegroundColor Red
    exit 1
}

# Example 1: Basic command processing
Write-Host "`n📋 Example 1: Basic Command Processing" -ForegroundColor Green
Write-Host "Running: Get-ChildItem" -ForegroundColor Cyan
& $scriptPath -Command "Get-ChildItem"

# Example 2: Voice-enabled command
Write-Host "`n📋 Example 2: Voice-Enabled Command" -ForegroundColor Green
Write-Host "Running: Show me the processes (with voice)" -ForegroundColor Cyan
& $scriptPath -Voice -Command "Show me the processes"

# Example 3: Autopilot mode
Write-Host "`n📋 Example 3: Autopilot Mode" -ForegroundColor Green
Write-Host "Running: Monitor system performance (with autopilot)" -ForegroundColor Cyan
& $scriptPath -Autopilot -Command "Monitor system performance"

# Example 4: Interactive mode
Write-Host "`n📋 Example 4: Interactive Mode" -ForegroundColor Green
Write-Host "Starting interactive mode..." -ForegroundColor Cyan
Write-Host "Type 'exit' to quit the interactive session" -ForegroundColor Yellow

# Start interactive mode
& $scriptPath

# Example 5: Advanced AI analysis
Write-Host "`n📋 Example 5: Advanced AI Analysis" -ForegroundColor Green

# Import AI module
$aiModulePath = Join-Path $PSScriptRoot "..\modules\AI-Integration.psm1"
if (Test-Path $aiModulePath) {
    Import-Module $aiModulePath -Force
    
    # Initialize AI module
    Initialize-AIModule
    
    # Test advanced analysis
    $commands = @(
        "Get-ChildItem -Path C:\ -Recurse -Filter *.txt",
        "Start-Process notepad",
        "Get-Process | Sort-Object CPU -Descending",
        "New-Item -ItemType Directory -Path C:\TestFolder",
        "Remove-Item -Path C:\TestFile.txt -Force"
    )
    
    foreach ($cmd in $commands) {
        Write-Host "`nAnalyzing: $cmd" -ForegroundColor Cyan
        $analysis = Invoke-AdvancedAIAnalysis -Command $cmd
        Write-Host "Intent: $($analysis.intent)" -ForegroundColor White
        Write-Host "Confidence: $($analysis.confidence)" -ForegroundColor White
        Write-Host "Complexity: $($analysis.complexity)" -ForegroundColor White
        Write-Host "Risk Level: $($analysis.riskLevel)" -ForegroundColor White
        Write-Host "Estimated Time: $($analysis.estimatedTime)" -ForegroundColor White
    }
}

# Example 6: Code generation
Write-Host "`n📋 Example 6: AI Code Generation" -ForegroundColor Green
if (Get-Command Invoke-AICodeGeneration -ErrorAction SilentlyContinue) {
    $prompt = "Create a function that monitors CPU usage and alerts when it's high"
    Write-Host "Generating code for: $prompt" -ForegroundColor Cyan
    
    $result = Invoke-AICodeGeneration -Prompt $prompt
    Write-Host "Generated Code:" -ForegroundColor Green
    Write-Host $result.code -ForegroundColor White
}

# Example 7: Code analysis
Write-Host "`n📋 Example 7: AI Code Analysis" -ForegroundColor Green
if (Get-Command Invoke-AICodeAnalysis -ErrorAction SilentlyContinue) {
    $testCode = @"
function Test-Function {
    param([string]`$param)
    
    Write-Host "Password: secret123"
    Invoke-Expression `$param
    
    return "result"
}
"@
    
    Write-Host "Analyzing code..." -ForegroundColor Cyan
    $analysis = Invoke-AICodeAnalysis -Code $testCode
    
    Write-Host "Quality: $($analysis.quality)" -ForegroundColor White
    Write-Host "Security: $($analysis.security)" -ForegroundColor White
    Write-Host "Complexity: $($analysis.complexity)" -ForegroundColor White
    
    if ($analysis.issues.Count -gt 0) {
        Write-Host "Issues found:" -ForegroundColor Yellow
        foreach ($issue in $analysis.issues) {
            Write-Host "  - $issue" -ForegroundColor Red
        }
    }
    
    if ($analysis.suggestions.Count -gt 0) {
        Write-Host "Suggestions:" -ForegroundColor Yellow
        foreach ($suggestion in $analysis.suggestions) {
            Write-Host "  - $suggestion" -ForegroundColor Green
        }
    }
}

# Example 8: Memory system demonstration
Write-Host "`n📋 Example 8: Memory System" -ForegroundColor Green
Write-Host "The AI Agent maintains a memory system that learns from your interactions." -ForegroundColor Cyan
Write-Host "Memory entries are stored in: .\data\memory.json" -ForegroundColor White

# Example 9: Configuration
Write-Host "`n📋 Example 9: Configuration" -ForegroundColor Green
Write-Host "Configuration is stored in: .\config\agent-config.json" -ForegroundColor Cyan
Write-Host "You can customize:" -ForegroundColor White
Write-Host "  - Voice recognition settings" -ForegroundColor White
Write-Host "  - Autopilot behavior" -ForegroundColor White
Write-Host "  - Memory system options" -ForegroundColor White
Write-Host "  - AI model preferences" -ForegroundColor White

# Example 10: Best practices
Write-Host "`n📋 Example 10: Best Practices" -ForegroundColor Green
Write-Host "✅ Use clear, specific commands" -ForegroundColor Green
Write-Host "✅ Start with simple tasks and increase complexity" -ForegroundColor Green
Write-Host "✅ Monitor autopilot actions and provide feedback" -ForegroundColor Green
Write-Host "✅ Use voice commands for hands-free operation" -ForegroundColor Green
Write-Host "✅ Review generated code before execution" -ForegroundColor Green
Write-Host "✅ Keep your PowerShell version updated" -ForegroundColor Green

# Summary
Write-Host "`n🎉 PowerShell AI Agent Quick Start Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Run: .\scripts\main.ps1 -Help" -ForegroundColor White
Write-Host "2. Try interactive mode: .\scripts\main.ps1" -ForegroundColor White
Write-Host "3. Enable voice: .\scripts\main.ps1 -Voice" -ForegroundColor White
Write-Host "4. Enable autopilot: .\scripts\main.ps1 -Autopilot" -ForegroundColor White
Write-Host "5. Customize configuration in .\config\agent-config.json" -ForegroundColor White

Write-Host "`nFor more information, see the README.md file." -ForegroundColor Yellow 