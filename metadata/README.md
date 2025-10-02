# 📊 Metadata Directory

This directory contains structured JSON metadata for all AI coding tools in the repository.

## 📋 Purpose

Metadata files provide:
- **Structured data** for programmatic access
- **Consistent format** across all tools
- **Search and filtering** capabilities
- **API-friendly** information
- **Version tracking** and history

## 🗂️ File Structure

Each tool has a corresponding JSON file:
```
metadata/
  ├── cursor.json
  ├── github-copilot.json
  ├── claude-code.json
  ├── windsurf.json
  └── ...
```

## 📄 Metadata Schema

```json
{
  "name": "Tool Name",
  "slug": "tool-name",
  "type": "IDE Plugin | CLI Tool | Web Platform | Autonomous Agent",
  "status": "active | beta | deprecated",
  "description": "Brief description of the tool",
  "version": {
    "current": "1.0.0",
    "lastUpdated": "2025-01-02",
    "history": [
      {
        "version": "1.0.0",
        "date": "2025-01-02",
        "changes": "Initial release"
      }
    ]
  },
  "pricing": {
    "model": "free | freemium | paid | enterprise",
    "tiers": [
      {
        "name": "Free",
        "price": "$0/month",
        "features": ["Feature 1", "Feature 2"]
      }
    ]
  },
  "models": {
    "primary": "GPT-4 | Claude 3.5 Sonnet | etc.",
    "supported": ["Model 1", "Model 2"],
    "customizable": true
  },
  "features": {
    "codeGeneration": true,
    "codeCompletion": true,
    "chatInterface": true,
    "agentMode": false,
    "parallelExecution": false,
    "memorySystem": false,
    "todoTracking": false,
    "gitIntegration": true,
    "multiFileEditing": true,
    "testGeneration": false
  },
  "platforms": {
    "vscode": true,
    "jetbrains": false,
    "web": false,
    "cli": false,
    "standalone": false
  },
  "languages": {
    "supported": ["Python", "JavaScript", "TypeScript", "Java", "C++"],
    "optimized": ["Python", "JavaScript"]
  },
  "integrations": {
    "github": true,
    "gitlab": false,
    "bitbucket": false,
    "jira": false
  },
  "security": {
    "secretDetection": true,
    "privateMode": false,
    "localModel": false,
    "dataRetention": "30 days"
  },
  "patterns": {
    "conciseness": "high | medium | low",
    "parallelTools": true,
    "subAgents": false,
    "verificationGates": true,
    "todoSystem": false
  },
  "documentation": {
    "folder": "Cursor Prompts",
    "files": {
      "systemPrompt": "Agent Prompt.txt",
      "tools": "Agent Tools.json",
      "readme": "README.md"
    },
    "hasMultipleVersions": true,
    "versions": ["v1.0", "v1.2", "Agent"]
  },
  "links": {
    "website": "https://cursor.com",
    "docs": "https://docs.cursor.com",
    "github": "https://github.com/...",
    "pricing": "https://cursor.com/pricing"
  },
  "tags": [
    "IDE",
    "VS Code",
    "Agent",
    "Multi-file",
    "Premium"
  ],
  "metrics": {
    "promptTokens": 5000,
    "toolsCount": 15,
    "securityRules": 25,
    "concisenesScore": 85
  },
  "analysis": {
    "strengths": ["Feature 1", "Feature 2"],
    "weaknesses": ["Limitation 1"],
    "uniqueFeatures": ["Unique 1"],
    "bestFor": ["Use case 1", "Use case 2"]
  }
}
```

## 🔍 Usage Examples

### Python
```python
import json

# Load metadata
with open('metadata/cursor.json') as f:
    tool = json.load(f)

# Check features
if tool['features']['agentMode']:
    print(f"{tool['name']} has agent mode!")

# Filter by price
free_tools = [
    json.load(open(f'metadata/{f}'))
    for f in os.listdir('metadata')
    if json.load(open(f'metadata/{f}'))['pricing']['model'] == 'free'
]
```

### JavaScript
```javascript
const fs = require('fs');

// Load all metadata
const tools = fs.readdirSync('metadata')
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(`metadata/${f}`)));

// Find IDE plugins
const idePlugins = tools.filter(t => t.type === 'IDE Plugin');

// Sort by pricing
const sorted = tools.sort((a, b) => 
  a.pricing.tiers[0].price.localeCompare(b.pricing.tiers[0].price)
);
```

### PowerShell
```powershell
# Load metadata
$cursor = Get-Content "metadata/cursor.json" | ConvertFrom-Json

# Check features
if ($cursor.features.agentMode) {
    Write-Host "$($cursor.name) has agent mode!"
}

# Get all tools
$tools = Get-ChildItem "metadata/*.json" | ForEach-Object {
    Get-Content $_.FullName | ConvertFrom-Json
}

# Filter by type
$idePlugins = $tools | Where-Object { $_.type -eq "IDE Plugin" }
```

## 📊 Generating Metadata

### Manual Creation
Create JSON files following the schema above.

### Automated Generation
Use the metadata generation script:
```bash
python scripts/generate-metadata.py --tool cursor
```

### Bulk Update
Update all metadata files:
```bash
python scripts/generate-metadata.py --all
```

## ✅ Validation

Validate metadata against schema:
```bash
python scripts/validate-metadata.py
```

Checks:
- [ ] Required fields present
- [ ] Valid JSON format
- [ ] Correct data types
- [ ] Valid enum values
- [ ] Links are accessible
- [ ] Files exist in repository

## 🔄 Keeping Updated

### When to Update Metadata:
- Tool releases new version
- Pricing changes
- New features added
- Prompts updated
- Integration added/removed

### Update Process:
1. Edit JSON file
2. Update `version.lastUpdated`
3. Add entry to `version.history`
4. Run validation
5. Commit changes

## 📈 Statistics

Current metadata files: 31 (to be created)

### Coverage by Type:
- IDE Plugins: 11 tools
- CLI Tools: 6 tools
- Web Platforms: 8 tools
- Autonomous Agents: 5 tools
- Other: 1 tool

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on:
- Adding new metadata files
- Updating existing metadata
- Schema changes
- Validation requirements

## 📚 Resources

- [JSON Schema](https://json-schema.org/)
- [Metadata Best Practices](../BEST_PRACTICES.md)
- [Tool Documentation](../)

---

*Last Updated: 2025-01-02*
