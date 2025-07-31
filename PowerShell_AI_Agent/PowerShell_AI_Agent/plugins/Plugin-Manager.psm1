# Plugin Manager Module for PowerShell AI Agent
# Provides plugin loading and management capabilities

function Initialize-PluginManager {
    param(
        [hashtable]$Config,
        [string]$PluginPath = ".\plugins"
    )
    
    $manager = @{
        Config = $Config
        PluginPath = $PluginPath
        Plugins = @{}
        LoadedPlugins = @()
    }
    
    # Ensure plugin directory exists
    if (!(Test-Path $PluginPath)) {
        New-Item -ItemType Directory -Path $PluginPath -Force | Out-Null
    }
    
    Write-Verbose "Plugin manager initialized. Plugin path: $PluginPath"
    return $manager
}

function Load-Plugin {
    param(
        [hashtable]$Manager,
        [string]$PluginName
    )
    
    $pluginFile = Join-Path $Manager.PluginPath "$PluginName.ps1"
    
    if (!(Test-Path $pluginFile)) {
        Write-Warning "Plugin file not found: $pluginFile"
        return $false
    }
    
    try {
        # Load plugin script
        $pluginScript = Get-Content $pluginFile -Raw
        $plugin = Invoke-Expression $pluginScript
        
        # Validate plugin structure
        if (-not $plugin.Name -or -not $plugin.Version -or -not $plugin.Commands) {
            Write-Warning "Invalid plugin structure: $PluginName"
            return $false
        }
        
        # Register plugin
        $Manager.Plugins[$PluginName] = $plugin
        $Manager.LoadedPlugins += $PluginName
        
        Write-Host "Plugin loaded: $($plugin.Name) v$($plugin.Version)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Warning "Failed to load plugin $PluginName : $_"
        return $false
    }
}

function Load-AllPlugins {
    param([hashtable]$Manager)
    
    $pluginFiles = Get-ChildItem -Path $Manager.PluginPath -Filter "*.ps1" -Exclude "Plugin-Manager.psm1"
    
    foreach ($pluginFile in $pluginFiles) {
        $pluginName = $pluginFile.BaseName
        Load-Plugin -Manager $Manager -PluginName $pluginName
    }
    
    Write-Host "Loaded $($Manager.LoadedPlugins.Count) plugins" -ForegroundColor Green
}

function Get-PluginCommands {
    param([hashtable]$Manager)
    
    $commands = @()
    
    foreach ($plugin in $Manager.Plugins.Values) {
        foreach ($command in $plugin.Commands) {
            $commands += @{
                Name = $command.Name
                Description = $command.Description
                Plugin = $plugin.Name
                Function = $command.Function
            }
        }
    }
    
    return $commands
}

function Execute-PluginCommand {
    param(
        [hashtable]$Manager,
        [string]$CommandName,
        [hashtable]$Parameters = @{}
    )
    
    $commands = Get-PluginCommands -Manager $Manager
    $command = $commands | Where-Object { $_.Name -eq $CommandName }
    
    if ($command) {
        try {
            $result = & $command.Function -Parameters $Parameters
            return @{
                Success = $true
                Result = $result
                Plugin = $command.Plugin
            }
        }
        catch {
            return @{
                Success = $false
                Error = $_.Exception.Message
                Plugin = $command.Plugin
            }
        }
    }
    
    return @{
        Success = $false
        Error = "Command '$CommandName' not found"
    }
}

function Show-PluginInfo {
    param([hashtable]$Manager)
    
    Write-Host "Loaded Plugins:" -ForegroundColor Cyan
    
    if ($Manager.LoadedPlugins.Count -eq 0) {
        Write-Host "  No plugins loaded" -ForegroundColor Yellow
        return
    }
    
    foreach ($pluginName in $Manager.LoadedPlugins) {
        $plugin = $Manager.Plugins[$pluginName]
        Write-Host "  $($plugin.Name) v$($plugin.Version)" -ForegroundColor White
        Write-Host "    Description: $($plugin.Description)" -ForegroundColor Gray
        Write-Host "    Commands: $($plugin.Commands.Count)" -ForegroundColor Gray
        
        foreach ($command in $plugin.Commands) {
            Write-Host "      - $($command.Name): $($command.Description)" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# Export functions
Export-ModuleMember -Function Initialize-PluginManager, Load-Plugin, Load-AllPlugins, Get-PluginCommands, Execute-PluginCommand, Show-PluginInfo 