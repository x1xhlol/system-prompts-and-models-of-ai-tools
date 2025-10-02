# 🤖 Metadata Generation Script

**Purpose:** Automatically generate or update metadata JSON files for AI coding tools.

## 🚀 Quick Start

```bash
# Generate metadata for a single tool
python scripts/generate-metadata.py --tool cursor

# Generate metadata for all tools
python scripts/generate-metadata.py --all

# Update existing metadata
python scripts/generate-metadata.py --update cursor

# Validate all metadata
python scripts/generate-metadata.py --validate
```

## 📋 Features

- **Automatic Detection:** Scans tool directories and extracts information
- **Smart Analysis:** Analyzes prompts for patterns and features
- **Version Tracking:** Detects multiple versions and tracks changes
- **Validation:** Ensures all required fields are present
- **Bulk Operations:** Process all tools at once

## 🔧 How It Works

### 1. Directory Scanning
Scans each tool directory for:
- System prompt files (`.txt`)
- Tool definition files (`.json`)
- README files
- Multiple versions

### 2. Content Analysis
Analyzes prompt content for:
- Conciseness patterns
- Security rules
- Tool capabilities
- Parallel execution support
- Memory systems
- TODO tracking

### 3. Feature Detection
Automatically detects:
- Code generation capabilities
- Agent mode support
- Multi-file editing
- Git integration
- Platform support

### 4. Metadata Generation
Creates JSON with:
- Basic information
- Version history
- Pricing (requires manual input)
- Feature flags
- Analysis and comparison

## 📖 Usage Guide

### Generate Single Tool
```bash
python scripts/generate-metadata.py --tool "Cursor Prompts"
```

Output: `metadata/cursor.json`

### Generate All Tools
```bash
python scripts/generate-metadata.py --all
```

Output: Creates/updates all metadata files

### Update Existing
```bash
python scripts/generate-metadata.py --update cursor --field pricing
```

### Validate
```bash
python scripts/generate-metadata.py --validate
```

Checks:
- Required fields present
- Valid JSON format
- Correct data types
- File references exist

## 🎯 Manual Fields

Some fields require manual input:

### Required Manual:
- `pricing.tiers` - Pricing information
- `links.website` - Official website
- `links.docs` - Documentation URL
- `marketPosition.userBase` - Estimated users

### Auto-Generated:
- `features.*` - Detected from prompts
- `patterns.*` - Analyzed from content
- `metrics.*` - Calculated from files
- `documentation.*` - Scanned from directory

## 📊 Output Format

Generated metadata follows the schema in `metadata/README.md`:

```json
{
  "name": "Tool Name",
  "slug": "tool-name",
  "type": "IDE Plugin | CLI Tool | Web Platform | Autonomous Agent",
  "status": "active",
  "version": { ... },
  "pricing": { ... },
  "models": { ... },
  "features": { ... },
  "platforms": { ... },
  "documentation": { ... },
  "analysis": { ... }
}
```

## 🔍 Analysis Algorithms

### Conciseness Detection
```python
def detect_conciseness(prompt_text):
    indicators = [
        "be concise",
        "brief",
        "minimal",
        "short",
        "terse"
    ]
    score = sum(1 for i in indicators if i in prompt_text.lower())
    return "very-high" if score >= 3 else "high" if score >= 2 else "medium"
```

### Feature Detection
```python
def detect_features(prompt_text, tools_json):
    features = {
        "agentMode": "agent" in prompt_text.lower(),
        "parallelExecution": "parallel" in prompt_text.lower(),
        "todoTracking": "todo" in prompt_text.lower() or "task list" in prompt_text.lower(),
        "memorySystem": "memory" in prompt_text.lower() or "context" in prompt_text.lower()
    }
    return features
```

### Tool Counting
```python
def count_tools(tools_json):
    if not tools_json:
        return 0
    data = json.load(open(tools_json))
    return len(data.get("functions", []))
```

## ⚙️ Configuration

### Config File: `scripts/metadata-config.json`

```json
{
  "autoDetect": true,
  "analyzePrompts": true,
  "generateMetrics": true,
  "validateOutput": true,
  "overwriteExisting": false,
  "requiredFields": [
    "name",
    "slug",
    "type",
    "status",
    "description"
  ],
  "optionalFields": [
    "pricing",
    "links",
    "marketPosition"
  ]
}
```

## 🛠️ Advanced Options

### Custom Template
```bash
python scripts/generate-metadata.py --tool cursor --template custom-template.json
```

### Specific Fields Only
```bash
python scripts/generate-metadata.py --tool cursor --fields features,patterns,metrics
```

### Dry Run
```bash
python scripts/generate-metadata.py --all --dry-run
```

Shows what would be generated without writing files.

### Debug Mode
```bash
python scripts/generate-metadata.py --tool cursor --debug
```

Shows detailed analysis and detection steps.

## 📝 Examples

### Example 1: New Tool
```bash
# Add new tool "NewIDE"
mkdir "NewIDE"
echo "System prompt..." > "NewIDE/prompt.txt"

# Generate metadata
python scripts/generate-metadata.py --tool "NewIDE"

# Review and edit
code metadata/newide.json

# Validate
python scripts/generate-metadata.py --validate metadata/newide.json
```

### Example 2: Update Pricing
```bash
# Edit metadata file
code metadata/cursor.json

# Update pricing section manually

# Validate changes
python scripts/generate-metadata.py --validate metadata/cursor.json
```

### Example 3: Bulk Update
```bash
# Update all metadata with latest patterns
python scripts/generate-metadata.py --all --refresh-patterns

# Regenerate metrics
python scripts/generate-metadata.py --all --refresh-metrics
```

## ✅ Validation Rules

### Required Fields:
- ✅ `name` - Tool name
- ✅ `slug` - URL-friendly identifier
- ✅ `type` - Tool category
- ✅ `status` - Active/beta/deprecated
- ✅ `description` - Brief summary

### Recommended Fields:
- ⚠️ `pricing` - Pricing information
- ⚠️ `models` - Supported AI models
- ⚠️ `features` - Feature flags
- ⚠️ `links.website` - Official website

### Optional Fields:
- 💡 `marketPosition` - Market analysis
- 💡 `analysis` - Strengths/weaknesses
- 💡 `tags` - Search tags

## 🐛 Troubleshooting

### Issue: "Tool directory not found"
**Solution:** Check directory name matches exactly
```bash
ls -la | grep -i "tool-name"
```

### Issue: "Invalid JSON format"
**Solution:** Validate JSON syntax
```bash
python -m json.tool metadata/tool.json
```

### Issue: "Missing required fields"
**Solution:** Check which fields are missing
```bash
python scripts/generate-metadata.py --validate --verbose
```

## 🤝 Contributing

When adding metadata:
1. Use the generation script
2. Manually fill pricing/links
3. Validate output
4. Test with API queries
5. Submit PR

## 📚 See Also

- [Metadata Schema](../metadata/README.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Validation Script](./validate.js)
- [Analysis Script](./analyze.js)

---

*Last Updated: 2025-01-02*  
*Part of the AI Coding Tools repository*
