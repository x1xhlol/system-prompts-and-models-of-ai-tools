# 🔄 Version Comparison Tool

**Compare different versions of system prompts to understand evolution**

## 📋 Overview

This tool helps you:
- **Compare prompt versions** (e.g., Cursor v1.0 vs v1.2 vs Agent)
- **Track changes** over time
- **Understand evolution** of AI coding tools
- **Identify patterns** in updates

## 🚀 Usage

### Command Line (PowerShell)
```powershell
# Compare two versions
python scripts/compare-versions.py --tool "Cursor Prompts" --v1 "Agent Prompt v1.0.txt" --v2 "Agent Prompt v1.2.txt"

# Compare all versions
python scripts/compare-versions.py --tool "Cursor Prompts" --all

# Generate HTML diff
python scripts/compare-versions.py --tool "Cursor Prompts" --v1 v1.0 --v2 v1.2 --html > diff.html
```

### Web Interface
```bash
# Start comparison server
python scripts/comparison-server.py

# Open in browser
# http://localhost:8000
```

## 📊 Comparison Methods

### 1. Side-by-Side Comparison
View files side by side with synchronized scrolling:
```
Version 1.0             |  Version 1.2
-----------------------|------------------------
Line 1: Old text       |  Line 1: New text
Line 2: Same           |  Line 2: Same
Line 3: Removed        |  
                       |  Line 3: Added
```

### 2. Unified Diff
Traditional diff format with +/- markers:
```diff
  Line 1: Same text
- Line 2: Old version
+ Line 2: New version
  Line 3: Same text
```

### 3. Word-Level Diff
Highlights changed words within lines:
```
Line 1: The quick <del>brown</del><ins>red</ins> fox
```

### 4. Statistics Summary
Quantitative analysis of changes:
```
Changes Summary:
- Lines added: 45
- Lines removed: 23
- Lines modified: 12
- Total changes: 80
- Similarity: 92.5%
```

## 🔍 Example Comparisons

### Cursor Prompt Evolution

**v1.0 → v1.2:**
- ✅ Added conciseness instructions
- ✅ Improved tool usage guidelines
- ✅ Added AGENTS.md context
- ❌ Removed verbose explanations

**v1.2 → Agent:**
- ✅ Added parallel execution support
- ✅ Added sub-agent delegation
- ✅ Added TODO tracking
- ✅ Enhanced memory system

### GitHub Copilot Evolution

**GPT-4 → GPT-4o:**
- ✅ Faster response times
- ✅ Better context understanding
- ✅ Improved code generation

**GPT-4o → GPT-5:**
- ✅ Multi-modal capabilities
- ✅ Better reasoning
- ✅ Longer context window

## 📈 Tracking Changes

### Key Metrics
- **Conciseness Score:** How brief instructions became
- **Security Rules:** Number of security guidelines
- **Tool Count:** Available tools/functions
- **Context Size:** Maximum context window
- **Response Length:** Average response size

### Evolution Patterns
1. **Trend toward conciseness** (2023-2025)
2. **More security rules** (increasing)
3. **Parallel execution** (emerging 2024)
4. **Sub-agents** (emerging late 2024)
5. **TODO tracking** (2024-2025)

## 🛠️ Tools & Scripts

### compare-versions.py
Main comparison script:
```python
import difflib
from pathlib import Path

def compare_files(file1, file2):
    with open(file1) as f1, open(file2) as f2:
        diff = difflib.unified_diff(
            f1.readlines(),
            f2.readlines(),
            fromfile=file1,
            tofile=file2
        )
        return ''.join(diff)
```

### comparison-server.py
Web interface for comparisons:
```python
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class ComparisonHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Serve comparison UI
        pass
    
    def do_POST(self):
        # Handle comparison requests
        pass
```

## 📊 HTML Diff Viewer

Generated HTML includes:
- Syntax highlighting
- Line numbers
- Change markers (+/-)
- Statistics panel
- Navigation between changes
- Copy buttons

### Example Output:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Version Comparison</title>
    <style>
        .added { background: #e6ffec; }
        .removed { background: #ffeef0; }
        .modified { background: #fff8c5; }
    </style>
</head>
<body>
    <div class="comparison">
        <!-- Diff content -->
    </div>
</body>
</html>
```

## 🔄 Automation

### Track All Changes
```bash
# Generate comparison for all tools with multiple versions
python scripts/batch-compare.py --all

# Output: comparison-reports/
```

### CI/CD Integration
```yaml
# .github/workflows/track-changes.yml
name: Track Prompt Changes
on: [push]
jobs:
  compare:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Compare versions
        run: python scripts/compare-versions.py --all
      - name: Upload report
        uses: actions/upload-artifact@v2
        with:
          name: comparison-report
          path: comparison-reports/
```

## 📚 Use Cases

### 1. Research
Study how prompts evolved:
```bash
python scripts/compare-versions.py \
  --tool "Cursor Prompts" \
  --timeline \
  --output research/cursor-evolution.md
```

### 2. Documentation
Document changes for users:
```bash
python scripts/compare-versions.py \
  --tool "Claude Code" \
  --v1 1.0 --v2 2.0 \
  --format markdown \
  --include-stats
```

### 3. Learning
Understand best practices:
```bash
# What changed in successful updates?
python scripts/analyze-changes.py \
  --pattern "conciseness|security|parallel"
```

## 🎯 Advanced Features

### Pattern Detection
Identify common changes:
```python
patterns = {
    'conciseness': ['be concise', 'brief', 'short'],
    'security': ['secret', 'api key', 'password'],
    'parallel': ['parallel', 'concurrent'],
    'agents': ['sub-agent', 'delegate']
}
```

### Similarity Analysis
Calculate similarity score:
```python
from difflib import SequenceMatcher

def similarity(text1, text2):
    return SequenceMatcher(None, text1, text2).ratio()
```

### Change Classification
Categorize changes:
- **Breaking:** Major changes
- **Feature:** New capabilities
- **Improvement:** Enhancements
- **Fix:** Bug fixes
- **Refactor:** Code reorganization

## 📖 API Documentation

### REST API
```bash
# Get available versions
GET /api/versions?tool=cursor

# Compare two versions
POST /api/compare
{
  "tool": "Cursor Prompts",
  "v1": "v1.0",
  "v2": "v1.2",
  "format": "json"
}

# Response
{
  "added": 45,
  "removed": 23,
  "modified": 12,
  "similarity": 0.925,
  "diff": "...",
  "stats": { ... }
}
```

### Python API
```python
from version_compare import VersionComparer

comparer = VersionComparer('Cursor Prompts')
result = comparer.compare('v1.0', 'v1.2')

print(f"Similarity: {result.similarity}")
print(f"Changes: {result.change_count}")
print(result.diff)
```

## 🔧 Configuration

### config.json
```json
{
  "comparison": {
    "ignore_whitespace": true,
    "context_lines": 3,
    "algorithm": "patience",
    "min_similarity": 0.5
  },
  "output": {
    "format": "html",
    "syntax_highlight": true,
    "line_numbers": true,
    "statistics": true
  }
}
```

## 📊 Sample Reports

### Cursor Evolution Report
```
Cursor Prompt Evolution Analysis
================================

Timeline: July 2024 - December 2024

v1.0 (Jul 2024):
- Basic chat and completion
- ~5000 tokens
- 15 security rules
- No agent mode

v1.2 (Aug 2024):
- Added composer mode
- ~6500 tokens (+30%)
- 20 security rules (+5)
- Basic agent features

Agent (Dec 2024):
- Full agent mode
- ~8500 tokens (+30%)
- 30 security rules (+10)
- Parallel execution
- Sub-agents
- TODO tracking

Key Improvements:
1. Conciseness +75%
2. Security +100%
3. Agent capabilities +500%
4. Context handling +200%
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on:
- Adding comparison algorithms
- Improving diff visualization
- Supporting new formats
- Optimizing performance

## 📚 Resources

- [Difflib Documentation](https://docs.python.org/3/library/difflib.html)
- [Git Diff Algorithm](https://git-scm.com/docs/git-diff)
- [Patience Diff](https://bramcohen.livejournal.com/73318.html)
- [Myers Diff Algorithm](http://www.xmailserver.org/diff2.pdf)

---

*Last Updated: 2025-01-02*  
*Part of the AI Coding Tools repository*
