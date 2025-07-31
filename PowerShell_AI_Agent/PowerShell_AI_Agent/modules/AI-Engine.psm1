# AI Engine Module for PowerShell AI Agent
# Provides AI response generation and integration capabilities

function Initialize-AIEngine {
    param(
        [hashtable]$Config
    )
    
    $engine = @{
        Config = $Config
        Context = @()
        ResponsePatterns = @{
            Greeting = @("Hello!", "Hi there!", "Greetings!", "Welcome!")
            Farewell = @("Goodbye!", "See you later!", "Take care!", "Until next time!")
            Confused = @("I'm not sure I understand.", "Could you clarify that?", "I need more information.")
            Helpful = @("I'd be happy to help!", "Let me assist you with that.", "I can help you with this.")
        }
        Skills = @{}
    }
    
    # Register built-in skills
    Register-AISkill -Engine $engine -Name "SystemInfo" -Function "Get-SystemInformation"
    Register-AISkill -Engine $engine -Name "FileOperations" -Function "Handle-FileOperations"
    Register-AISkill -Engine $engine -Name "ProcessManagement" -Function "Handle-ProcessOperations"
    
    return $engine
}

function Register-AISkill {
    param(
        [hashtable]$Engine,
        [string]$Name,
        [string]$Function
    )
    
    $Engine.Skills[$Name] = $Function
    Write-Verbose "Registered AI skill: $Name"
}

function Get-AIResponse {
    param(
        [hashtable]$Engine,
        [string]$Input,
        [hashtable]$Memory
    )
    
    # Analyze input for intent
    $intent = Analyze-UserIntent -Input $Input
    
    # Check for system commands
    if ($intent.Type -eq "SystemCommand") {
        return Execute-SystemCommand -Intent $intent -Engine $Engine
    }
    
    # Check for skill-based requests
    if ($intent.Type -eq "SkillRequest") {
        return Execute-SkillRequest -Intent $intent -Engine $Engine
    }
    
    # Generate contextual response
    $response = Generate-ContextualResponse -Input $Input -Intent $intent -Memory $Memory -Engine $Engine
    
    # Add to context
    $Engine.Context += @{
        Input = $Input
        Response = $response
        Intent = $intent
        Timestamp = Get-Date
    }
    
    # Limit context size
    if ($Engine.Context.Count -gt 10) {
        $Engine.Context = $Engine.Context | Select-Object -Last 10
    }
    
    return $response
}

function Analyze-UserIntent {
    param([string]$Input)
    
    $input = $Input.ToLower()
    
    # System commands
    if ($input -match "^(get|show|list|display)\s+(system|computer|info|information)") {
        return @{ Type = "SystemCommand"; Command = "SystemInfo"; Parameters = @{} }
    }
    
    if ($input -match "^(get|show|list|display)\s+(process|processes)") {
        return @{ Type = "SystemCommand"; Command = "ProcessList"; Parameters = @{} }
    }
    
    if ($input -match "^(kill|stop|terminate)\s+(process|processes)") {
        $processName = $input -replace "^(kill|stop|terminate)\s+(process|processes)\s+", ""
        return @{ Type = "SystemCommand"; Command = "KillProcess"; Parameters = @{ ProcessName = $processName } }
    }
    
    # File operations
    if ($input -match "^(list|show|dir|directory)\s+(files|files in|contents of)") {
        $path = $input -replace "^(list|show|dir|directory)\s+(files|files in|contents of)\s+", ""
        return @{ Type = "SystemCommand"; Command = "ListFiles"; Parameters = @{ Path = $path } }
    }
    
    # Greetings
    if ($input -match "^(hello|hi|hey|greetings)") {
        return @{ Type = "Greeting"; Command = "Greet"; Parameters = @{} }
    }
    
    # Farewells
    if ($input -match "^(goodbye|bye|see you|exit|quit)") {
        return @{ Type = "Farewell"; Command = "Farewell"; Parameters = @{} }
    }
    
    # Help requests
    if ($input -match "^(help|what can you do|capabilities)") {
        return @{ Type = "Help"; Command = "ShowHelp"; Parameters = @{} }
    }
    
    # Default to conversation
    return @{ Type = "Conversation"; Command = "Chat"; Parameters = @{} }
}

function Execute-SystemCommand {
    param(
        [hashtable]$Intent,
        [hashtable]$Engine
    )
    
    switch ($Intent.Command) {
        "SystemInfo" {
            $info = Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, TotalPhysicalMemory, CsProcessors
            return "Here's your system information:`n$($info | Format-Table | Out-String)"
        }
        "ProcessList" {
            $processes = Get-Process | Select-Object Name, Id, CPU, WorkingSet -First 10
            return "Top 10 processes by memory usage:`n$($processes | Format-Table | Out-String)"
        }
        "KillProcess" {
            $processName = $Intent.Parameters.ProcessName
            try {
                $processes = Get-Process -Name $processName -ErrorAction Stop
                $processes | Stop-Process -Force
                return "Successfully terminated $($processes.Count) process(es) named '$processName'"
            }
            catch {
                return "Error: Could not find or terminate process '$processName'"
            }
        }
        "ListFiles" {
            $path = $Intent.Parameters.Path
            if ([string]::IsNullOrWhiteSpace($path)) { $path = "." }
            
            try {
                $files = Get-ChildItem -Path $path | Select-Object Name, Length, LastWriteTime
                return "Files in '$path':`n$($files | Format-Table | Out-String)"
            }
            catch {
                return "Error: Could not list files in '$path'"
            }
        }
        default {
            return "I'm not sure how to handle that system command."
        }
    }
}

function Execute-SkillRequest {
    param(
        [hashtable]$Intent,
        [hashtable]$Engine
    )
    
    $skillName = $Intent.Command
    if ($Engine.Skills.ContainsKey($skillName)) {
        $functionName = $Engine.Skills[$skillName]
        return & $functionName -Parameters $Intent.Parameters
    }
    
    return "I don't have that skill available yet."
}

function Generate-ContextualResponse {
    param(
        [string]$Input,
        [hashtable]$Intent,
        [hashtable]$Memory,
        [hashtable]$Engine
    )
    
    switch ($Intent.Type) {
        "Greeting" {
            $greetings = $Engine.ResponsePatterns.Greeting
            return $greetings | Get-Random
        }
        "Farewell" {
            $farewells = $Engine.ResponsePatterns.Farewell
            return $farewells | Get-Random
        }
        "Help" {
            return @"
I can help you with various tasks:

System Commands:
- Get system information
- List processes
- Kill processes
- List files in directories

Conversation:
- Chat and respond to questions
- Remember our conversation history

Try asking me to:
- "Show system information"
- "List processes"
- "What can you do?"
"@
        }
        "Conversation" {
            # Generate contextual response based on input and memory
            $context = ""
            if ($Memory.entries.Count -gt 0) {
                $recentEntries = $Memory.entries | Select-Object -Last 3
                $context = "Based on our conversation, "
            }
            
            $responses = @(
                "I understand you're asking about '$Input'. Let me help you with that.",
                "That's an interesting point about '$Input'. I'd be happy to assist.",
                "Regarding '$Input', I can help you explore this further.",
                "I've processed your input about '$Input'. How can I best assist you?"
            )
            
            return $context + ($responses | Get-Random)
        }
        default {
            return "I'm processing your request: '$Input'. How can I help you further?"
        }
    }
}

# Export functions
Export-ModuleMember -Function Initialize-AIEngine, Get-AIResponse, Register-AISkill 