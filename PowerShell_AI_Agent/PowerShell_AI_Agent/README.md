# PowerShell AI Agent

A comprehensive, modular PowerShell-based AI agent with advanced capabilities including voice interaction, plugin system, and comprehensive logging.

## Features

- **Modular Architecture**: AI Engine, Voice Engine, Logging Engine, and Plugin Manager
- **Advanced AI Processing**: Intent recognition, system commands, and contextual responses
- **Voice Integration**: Speech recognition and text-to-speech capabilities
- **Plugin System**: Extensible architecture with custom plugin support
- **Comprehensive Logging**: Structured logging with multiple output formats
- **Memory Persistence**: Intelligent conversation memory with context awareness
- **System Integration**: Built-in system monitoring and management commands
- **Interactive CLI**: Rich command-line interface with color-coded output

## Quick Start

1. **Run the agent:**
   ```powershell
   .\Start-AIAgent.ps1
   ```

2. **Available commands:**
   - `help` - Show available commands
   - `exit` or `quit` - Exit the agent
   - `memory` - Show memory statistics
   - `config` - Show current configuration
   - `clear` - Clear the screen
   - `voice` - Toggle voice mode
   - `logs` - Show recent log entries
   - `test` - Test system capabilities
   - `plugins` - Show loaded plugins

## Configuration

The agent uses `config/agent-config.json` for settings:

- **AI**: Model settings (gpt-4, tokens, temperature)
- **Voice**: Speech recognition and synthesis settings
- **Memory**: Persistence and storage settings
- **Autopilot**: Autonomous operation settings

## Project Structure

```
PowerShell_AI_Agent/
├── Start-AIAgent.ps1    # Main entry point
├── config/
│   └── agent-config.json # Configuration file
├── data/
│   └── memory.json      # Conversation memory
├── logs/                # Log files
├── modules/             # PowerShell modules
│   ├── AI-Engine.psm1   # AI processing engine
│   ├── Voice-Engine.psm1 # Voice recognition/synthesis
│   └── Logging-Engine.psm1 # Comprehensive logging
├── plugins/             # Extensions
│   ├── Plugin-Manager.psm1 # Plugin management system
│   └── System-Tools.ps1 # Example system tools plugin
├── scripts/             # Utility scripts
└── tests/               # Test files
│   └── Test-AIAgent.ps1 # Comprehensive test suite
```

## Parameters

- `-Verbose`: Enable verbose error reporting
- `-NoVoice`: Disable voice features
- `-Debug`: Enable debug logging
- `-ConfigPath`: Specify custom config file path

## Example Usage

```powershell
# Basic run
.\Start-AIAgent.ps1

# With verbose logging
.\Start-AIAgent.ps1 -Verbose

# With debug logging
.\Start-AIAgent.ps1 -Debug

# Disable voice features
.\Start-AIAgent.ps1 -NoVoice

# Custom config file
.\Start-AIAgent.ps1 -ConfigPath ".\custom-config.json"

# Run test suite
.\tests\Test-AIAgent.ps1

# Run tests without voice
.\tests\Test-AIAgent.ps1 -SkipVoice
```

## Development

### Creating Plugins

Create new plugins in the `plugins/` directory:

```powershell
@{
    Name = "My Plugin"
    Version = "1.0"
    Description = "Description of your plugin"
    Commands = @(
        @{
            Name = "MyCommand"
            Description = "Description of the command"
            Function = {
                param([hashtable]$Parameters)
                # Your command logic here
                return "Command executed successfully"
            }
        }
    )
}
```

### Extending AI Engine

Modify `modules/AI-Engine.psm1` to add new capabilities:
- Add new intent patterns in `Analyze-UserIntent`
- Create new system commands in `Execute-SystemCommand`
- Extend response patterns in `Generate-ContextualResponse`

### Voice Integration

The voice engine supports:
- Speech synthesis with configurable speed and voice
- Speech recognition with confidence thresholds
- Multiple voice selection
- Voice testing and diagnostics

### Logging

The logging system provides:
- Structured JSON logging
- Multiple log levels (Debug, Info, Warning, Error)
- Log rotation and archiving
- Export capabilities (CSV, JSON, HTML)

## Requirements

- PowerShell 5.1 or higher
- Windows 10/11 (for voice features)
- Internet connection (for AI service integration) 