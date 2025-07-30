# PowerShell AI Integration Module
# Version: 1.0
# Provides advanced AI capabilities for PowerShell AI Agent

# Module metadata
$PSDefaultParameterValues['*:Verbose'] = $true

# AI Configuration
$script:AIConfig = @{
    Model = "gpt-4"
    Temperature = 0.7
    MaxTokens = 4000
    APIEndpoint = "https://api.openai.com/v1/chat/completions"
    APIKey = $env:OPENAI_API_KEY
}

# Initialize AI module
function Initialize-AIModule {
    param([hashtable]$Config = @{})
    
    try {
        # Merge provided config with defaults
        foreach ($key in $Config.Keys) {
            $script:AIConfig[$key] = $Config[$key]
        }
        
        # Validate API key
        if (-not $script:AIConfig.APIKey) {
            Write-Warning "OpenAI API key not found. Set OPENAI_API_KEY environment variable for full AI capabilities."
            return $false
        }
        
        Write-Host "✅ AI Integration module initialized successfully" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Error "Failed to initialize AI module: $_"
        return $false
    }
}

# Advanced AI analysis with multiple models
function Invoke-AdvancedAIAnalysis {
    param(
        [string]$Command,
        [hashtable]$Context = @{},
        [string]$Model = "gpt-4",
        [double]$Temperature = 0.7
    )
    
    try {
        # Enhanced intent recognition
        $analysis = @{
            intent = "unknown"
            confidence = 0.0
            suggestedActions = @()
            response = ""
            reasoning = ""
            complexity = "low"
            riskLevel = "low"
            estimatedTime = "1-5 minutes"
        }
        
        # Advanced pattern matching
        $commandLower = $Command.ToLower()
        
        # PowerShell-specific patterns
        $patterns = @{
            navigation = @(
                "get-childitem", "ls", "dir", "show", "list", "find", "search",
                "navigate", "browse", "explore", "what files", "what folders"
            )
            execution = @(
                "start", "run", "execute", "invoke", "launch", "begin",
                "start-process", "invoke-expression", "call", "trigger"
            )
            analysis = @(
                "analyze", "check", "review", "test", "examine", "inspect",
                "diagnose", "troubleshoot", "monitor", "watch", "observe"
            )
            creation = @(
                "create", "new", "add", "build", "make", "generate",
                "write", "compose", "develop", "construct", "establish"
            )
            modification = @(
                "modify", "change", "update", "edit", "alter", "transform",
                "convert", "adjust", "tune", "optimize", "improve"
            )
            deletion = @(
                "delete", "remove", "clear", "erase", "wipe", "purge",
                "uninstall", "clean", "trash", "discard"
            )
            security = @(
                "security", "secure", "protect", "encrypt", "firewall",
                "permissions", "access", "authentication", "authorization"
            )
            performance = @(
                "performance", "speed", "optimize", "efficient", "fast",
                "slow", "bottleneck", "resource", "cpu", "memory"
            )
        }
        
        # Determine intent and confidence
        $maxConfidence = 0.0
        $detectedIntent = "unknown"
        
        foreach ($intent in $patterns.Keys) {
            foreach ($pattern in $patterns[$intent]) {
                if ($commandLower -match $pattern) {
                    $confidence = [math]::Min(1.0, $pattern.Length / $commandLower.Length * 2)
                    if ($confidence -gt $maxConfidence) {
                        $maxConfidence = $confidence
                        $detectedIntent = $intent
                    }
                }
            }
        }
        
        $analysis.intent = $detectedIntent
        $analysis.confidence = $maxConfidence
        
        # Generate context-aware suggestions
        $suggestions = Get-ContextualSuggestions -Intent $detectedIntent -Command $Command -Context $Context
        $analysis.suggestedActions = $suggestions.actions
        $analysis.response = $suggestions.response
        $analysis.reasoning = $suggestions.reasoning
        
        # Determine complexity and risk
        $analysis.complexity = Get-ComplexityAssessment -Command $Command -Intent $detectedIntent
        $analysis.riskLevel = Get-RiskAssessment -Command $Command -Intent $detectedIntent
        $analysis.estimatedTime = Get-TimeEstimate -Complexity $analysis.complexity -Intent $detectedIntent
        
        return $analysis
    }
    catch {
        Write-Error "Failed to perform advanced AI analysis: $_"
        return @{
            intent = "error"
            confidence = 0.0
            suggestedActions = @()
            response = "Sorry, I encountered an error while analyzing your command."
            reasoning = "Error occurred during analysis"
            complexity = "unknown"
            riskLevel = "unknown"
            estimatedTime = "unknown"
        }
    }
}

# Get contextual suggestions based on intent
function Get-ContextualSuggestions {
    param(
        [string]$Intent,
        [string]$Command,
        [hashtable]$Context
    )
    
    $suggestions = @{
        actions = @()
        response = ""
        reasoning = ""
    }
    
    switch ($Intent) {
        "navigation" {
            $suggestions.actions = @(
                "Get-ChildItem -Path . -Recurse",
                "Get-ChildItem -Path . -Filter *.ps1",
                "Get-Process | Sort-Object CPU -Descending",
                "Get-Service | Where-Object { $_.Status -eq 'Running' }",
                "Get-Command -Module Microsoft.PowerShell.Core"
            )
            $suggestions.response = "I'll help you navigate the system. Here are some useful navigation commands:"
            $suggestions.reasoning = "User wants to explore or find information in the system"
        }
        "execution" {
            $suggestions.actions = @(
                "Start-Process notepad",
                "Invoke-Expression 'Get-Date'",
                "Start-Service -Name 'Spooler'",
                "& 'C:\Program Files\Application\app.exe'",
                "powershell.exe -Command 'Get-Process'"
            )
            $suggestions.response = "I'll help you execute commands and processes. Here are some execution options:"
            $suggestions.reasoning = "User wants to run or start something"
        }
        "analysis" {
            $suggestions.actions = @(
                "Get-Process | Sort-Object CPU -Descending | Select-Object -First 10",
                "Get-Service | Where-Object { $_.Status -eq 'Stopped' }",
                "Test-Path -Path 'C:\Windows\System32'",
                "Get-EventLog -LogName Application -Newest 10",
                "Get-WmiObject -Class Win32_ComputerSystem"
            )
            $suggestions.response = "I'll help you analyze the system. Here are some analysis commands:"
            $suggestions.reasoning = "User wants to examine or investigate something"
        }
        "creation" {
            $suggestions.actions = @(
                "New-Item -ItemType Directory -Path 'C:\NewFolder'",
                "New-Item -ItemType File -Path 'C:\NewFile.txt'",
                "New-Object System.Collections.ArrayList",
                "Add-Content -Path 'C:\Log.txt' -Value 'New entry'",
                "New-Guid"
            )
            $suggestions.response = "I'll help you create new items. Here are some creation commands:"
            $suggestions.reasoning = "User wants to make or build something new"
        }
        "modification" {
            $suggestions.actions = @(
                "Set-Content -Path 'C:\File.txt' -Value 'New content'",
                "Add-Content -Path 'C:\File.txt' -Value 'Additional content'",
                "Rename-Item -Path 'C:\OldName.txt' -NewName 'C:\NewName.txt'",
                "Move-Item -Path 'C:\Source' -Destination 'C:\Destination'",
                "Copy-Item -Path 'C:\Source' -Destination 'C:\Destination' -Recurse"
            )
            $suggestions.response = "I'll help you modify existing items. Here are some modification commands:"
            $suggestions.reasoning = "User wants to change or update something"
        }
        "deletion" {
            $suggestions.actions = @(
                "Remove-Item -Path 'C:\FileToDelete.txt' -Force",
                "Remove-Item -Path 'C:\FolderToDelete' -Recurse -Force",
                "Clear-Content -Path 'C:\FileToClear.txt'",
                "Stop-Process -Name 'ProcessName' -Force",
                "Stop-Service -Name 'ServiceName' -Force"
            )
            $suggestions.response = "I'll help you remove items. Here are some deletion commands:"
            $suggestions.reasoning = "User wants to delete or remove something"
        }
        "security" {
            $suggestions.actions = @(
                "Get-Acl -Path 'C:\SecureFolder'",
                "Set-Acl -Path 'C:\SecureFolder' -AclObject $acl",
                "Get-LocalUser",
                "Get-LocalGroup",
                "Test-NetConnection -ComputerName 'server' -Port 80"
            )
            $suggestions.response = "I'll help you with security-related tasks. Here are some security commands:"
            $suggestions.reasoning = "User wants to work with security features"
        }
        "performance" {
            $suggestions.actions = @(
                "Get-Process | Sort-Object CPU -Descending | Select-Object -First 10",
                "Get-Counter -Counter '\Processor(_Total)\% Processor Time'",
                "Get-Counter -Counter '\Memory\Available MBytes'",
                "Get-WmiObject -Class Win32_Processor",
                "Get-WmiObject -Class Win32_PhysicalMemory"
            )
            $suggestions.response = "I'll help you monitor and optimize performance. Here are some performance commands:"
            $suggestions.reasoning = "User wants to work with performance monitoring"
        }
        default {
            $suggestions.actions = @(
                "Get-Help about_*",
                "Get-Command -Module Microsoft.PowerShell.Core",
                "Get-Module -ListAvailable",
                "Get-Process | Select-Object -First 5",
                "Get-Service | Select-Object -First 5"
            )
            $suggestions.response = "I understand your request. Here are some general PowerShell commands:"
            $suggestions.reasoning = "General command or unclear intent"
        }
    }
    
    return $suggestions
}

# Assess command complexity
function Get-ComplexityAssessment {
    param(
        [string]$Command,
        [string]$Intent
    )
    
    $complexity = "low"
    
    # Simple heuristics for complexity assessment
    if ($Command -match "foreach|while|for|if|else") {
        $complexity = "high"
    }
    elseif ($Command -match "get-childitem|get-process|get-service") {
        $complexity = "low"
    }
    elseif ($Command -match "invoke-expression|start-process|new-item") {
        $complexity = "medium"
    }
    elseif ($Command.Length -gt 100) {
        $complexity = "high"
    }
    
    return $complexity
}

# Assess command risk level
function Get-RiskAssessment {
    param(
        [string]$Command,
        [string]$Intent
    )
    
    $risk = "low"
    
    # Risk assessment based on command patterns
    if ($Command -match "remove-item|delete|format|clear") {
        $risk = "medium"
    }
    elseif ($Command -match "invoke-expression|iex|powershell.exe") {
        $risk = "high"
    }
    elseif ($Command -match "stop-process|kill|force") {
        $risk = "medium"
    }
    elseif ($Intent -eq "deletion") {
        $risk = "medium"
    }
    
    return $risk
}

# Estimate execution time
function Get-TimeEstimate {
    param(
        [string]$Complexity,
        [string]$Intent
    )
    
    switch ($Complexity) {
        "low" { return "1-5 minutes" }
        "medium" { return "5-15 minutes" }
        "high" { return "15-60 minutes" }
        default { return "unknown" }
    }
}

# AI-powered code generation
function Invoke-AICodeGeneration {
    param(
        [string]$Prompt,
        [string]$Language = "PowerShell",
        [hashtable]$Context = @{}
    )
    
    try {
        # Simulate AI code generation (in real implementation, call AI API)
        $generatedCode = @"
# Generated PowerShell code based on: $Prompt
# Generated on: $(Get-Date)

function Invoke-GeneratedFunction {
    param(
        [string]`$Parameter1,
        [int]`$Parameter2 = 0
    )
    
    try {
        Write-Host "Executing generated function..." -ForegroundColor Green
        
        # Add your custom logic here
        `$result = "Generated result for: `$Parameter1"
        
        return `$result
    }
    catch {
        Write-Error "Error in generated function: `$_"
        return `$null
    }
}

# Example usage
# Invoke-GeneratedFunction -Parameter1 "test" -Parameter2 42
"@
        
        return @{
            code = $generatedCode
            language = $Language
            confidence = 0.8
            suggestions = @("Add error handling", "Include parameter validation", "Add documentation")
        }
    }
    catch {
        Write-Error "Failed to generate code: $_"
        return @{
            code = "# Error: Failed to generate code"
            language = $Language
            confidence = 0.0
            suggestions = @("Check your prompt", "Try a simpler request")
        }
    }
}

# AI-powered code analysis
function Invoke-AICodeAnalysis {
    param(
        [string]$Code,
        [string]$Language = "PowerShell"
    )
    
    try {
        $analysis = @{
            quality = "good"
            issues = @()
            suggestions = @()
            complexity = "medium"
            maintainability = "good"
            security = "safe"
        }
        
        # Basic code analysis
        if ($Code -match "Write-Host.*password|password.*Write-Host") {
            $analysis.issues += "Potential security issue: Password logging detected"
            $analysis.security = "unsafe"
        }
        
        if ($Code -match "Invoke-Expression.*`$") {
            $analysis.issues += "Security risk: Dynamic code execution detected"
            $analysis.security = "unsafe"
        }
        
        if ($Code.Length -gt 1000) {
            $analysis.complexity = "high"
            $analysis.suggestions += "Consider breaking into smaller functions"
        }
        
        if (-not ($Code -match "param\(|function")) {
            $analysis.suggestions += "Consider adding parameter validation"
        }
        
        if (-not ($Code -match "try.*catch")) {
            $analysis.suggestions += "Consider adding error handling"
        }
        
        return $analysis
    }
    catch {
        Write-Error "Failed to analyze code: $_"
        return @{
            quality = "unknown"
            issues = @("Failed to analyze code")
            suggestions = @("Check code syntax")
            complexity = "unknown"
            maintainability = "unknown"
            security = "unknown"
        }
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-AIModule',
    'Invoke-AdvancedAIAnalysis',
    'Get-ContextualSuggestions',
    'Get-ComplexityAssessment',
    'Get-RiskAssessment',
    'Get-TimeEstimate',
    'Invoke-AICodeGeneration',
    'Invoke-AICodeAnalysis'
) 