# Voice Engine Module for PowerShell AI Agent
# Provides speech recognition and text-to-speech capabilities

function Initialize-VoiceEngine {
    param(
        [hashtable]$Config
    )
    
    $engine = @{
        Config = $Config
        SpeechSynthesizer = $null
        SpeechRecognizer = $null
        IsListening = $false
        VoiceEnabled = $Config.Voice.Enabled
        Language = $Config.Voice.Language
        ResponseSpeed = $Config.Voice.ResponseSpeed
        RecognitionSensitivity = $Config.Voice.RecognitionSensitivity
    }
    
    # Initialize speech synthesizer
    try {
        Add-Type -AssemblyName System.Speech
        $engine.SpeechSynthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
        
        # Configure speech synthesizer
        $engine.SpeechSynthesizer.Rate = Get-SpeechRate -Speed $Config.Voice.ResponseSpeed
        $engine.SpeechSynthesizer.Volume = 100
        
        Write-Verbose "Speech synthesizer initialized successfully"
    }
    catch {
        Write-Warning "Failed to initialize speech synthesizer: $_"
        $engine.VoiceEnabled = $false
    }
    
    return $engine
}

function Get-SpeechRate {
    param([string]$Speed)
    
    switch ($Speed.ToLower()) {
        "slow" { return -2 }
        "normal" { return 0 }
        "fast" { return 2 }
        "veryfast" { return 4 }
        default { return 0 }
    }
}

function Speak-Text {
    param(
        [hashtable]$Engine,
        [string]$Text
    )
    
    if (-not $Engine.VoiceEnabled -or $null -eq $Engine.SpeechSynthesizer) {
        return $false
    }
    
    try {
        $Engine.SpeechSynthesizer.SpeakAsync($Text)
        return $true
    }
    catch {
        Write-Warning "Failed to speak text: $_"
        return $false
    }
}

function Start-SpeechRecognition {
    param(
        [hashtable]$Engine,
        [scriptblock]$OnSpeechRecognized
    )
    
    if (-not $Engine.VoiceEnabled) {
        return $false
    }
    
    try {
        # Create speech recognition engine
        $grammar = New-Object System.Speech.Recognition.DictationGrammar
        $Engine.SpeechRecognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
        $Engine.SpeechRecognizer.LoadGrammar($grammar)
        
        # Set recognition sensitivity
        $Engine.SpeechRecognizer.SpeechRecognized += {
            param($sender, $e)
            if ($e.Result.Confidence -ge $Engine.RecognitionSensitivity) {
                $OnSpeechRecognized.Invoke($e.Result.Text)
            }
        }
        
        $Engine.SpeechRecognizer.SetInputToDefaultAudioDevice()
        $Engine.SpeechRecognizer.RecognizeAsync()
        $Engine.IsListening = $true
        
        Write-Host "Voice recognition started. Speak now..." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Warning "Failed to start speech recognition: $_"
        return $false
    }
}

function Stop-SpeechRecognition {
    param([hashtable]$Engine)
    
    if ($Engine.IsListening -and $null -ne $Engine.SpeechRecognizer) {
        try {
            $Engine.SpeechRecognizer.RecognizeAsyncStop()
            $Engine.SpeechRecognizer.Dispose()
            $Engine.SpeechRecognizer = $null
            $Engine.IsListening = $false
            
            Write-Host "Voice recognition stopped." -ForegroundColor Yellow
            return $true
        }
        catch {
            Write-Warning "Failed to stop speech recognition: $_"
            return $false
        }
    }
    
    return $false
}

function Get-AvailableVoices {
    param([hashtable]$Engine)
    
    if ($null -eq $Engine.SpeechSynthesizer) {
        return @()
    }
    
    try {
        return $Engine.SpeechSynthesizer.GetInstalledVoices() | ForEach-Object {
            @{
                Name = $_.VoiceInfo.Name
                Culture = $_.VoiceInfo.Culture
                Gender = $_.VoiceInfo.Gender
                Age = $_.VoiceInfo.Age
            }
        }
    }
    catch {
        Write-Warning "Failed to get available voices: $_"
        return @()
    }
}

function Set-Voice {
    param(
        [hashtable]$Engine,
        [string]$VoiceName
    )
    
    if ($null -eq $Engine.SpeechSynthesizer) {
        return $false
    }
    
    try {
        $voices = Get-AvailableVoices -Engine $Engine
        $selectedVoice = $voices | Where-Object { $_.Name -eq $VoiceName }
        
        if ($selectedVoice) {
            $Engine.SpeechSynthesizer.SelectVoice($VoiceName)
            Write-Host "Voice changed to: $VoiceName" -ForegroundColor Green
            return $true
        }
        else {
            Write-Warning "Voice '$VoiceName' not found"
            return $false
        }
    }
    catch {
        Write-Warning "Failed to set voice: $_"
        return $false
    }
}

function Test-VoiceSystem {
    param([hashtable]$Engine)
    
    Write-Host "Testing voice system..." -ForegroundColor Cyan
    
    # Test speech synthesis
    if ($null -ne $Engine.SpeechSynthesizer) {
        Write-Host "Speech synthesizer: OK" -ForegroundColor Green
        Speak-Text -Engine $Engine -Text "Voice system is working correctly."
    }
    else {
        Write-Host "Speech synthesizer: FAILED" -ForegroundColor Red
    }
    
    # Test speech recognition
    if ($Engine.VoiceEnabled) {
        Write-Host "Speech recognition: Available" -ForegroundColor Green
    }
    else {
        Write-Host "Speech recognition: Disabled" -ForegroundColor Yellow
    }
    
    # Show available voices
    $voices = Get-AvailableVoices -Engine $Engine
    if ($voices.Count -gt 0) {
        Write-Host "Available voices:" -ForegroundColor Cyan
        $voices | ForEach-Object {
            Write-Host "  - $($_.Name) ($($_.Culture))" -ForegroundColor White
        }
    }
}

# Export functions
Export-ModuleMember -Function Initialize-VoiceEngine, Speak-Text, Start-SpeechRecognition, Stop-SpeechRecognition, Get-AvailableVoices, Set-Voice, Test-VoiceSystem 