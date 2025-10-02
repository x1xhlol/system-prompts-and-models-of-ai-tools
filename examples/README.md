# API Usage Examples

This directory contains example scripts demonstrating how to consume the AI Tools API in various programming languages.

## 📁 Available Examples

### 🐍 Python (`api-usage.py`)
Complete Python implementation with 10 practical examples.

**Requirements:**
- Python 3.7+
- No external dependencies (uses standard library only)

**Usage:**
```bash
python examples/api-usage.py
```

**Features:**
- Object-oriented API client class
- Type hints for better code completion
- Comprehensive error handling
- 10 practical examples

---

### 🟨 JavaScript/Node.js (`api-usage.js`)
Full JavaScript implementation for Node.js environments.

**Requirements:**
- Node.js 14+
- No external dependencies (uses built-in `fs` module)

**Usage:**
```bash
node examples/api-usage.js
```

**Features:**
- Modern async/await syntax
- Promise-based API
- Clean error handling
- 10 practical examples

---

### 💙 PowerShell (`api-usage.ps1`)
Native PowerShell implementation for Windows automation.

**Requirements:**
- PowerShell 5.1+ (Windows PowerShell) or PowerShell Core 7+
- No external dependencies

**Usage:**
```powershell
.\examples\api-usage.ps1
```

**Features:**
- PowerShell class-based design
- Colorized output
- Pipeline support
- 10 practical examples

---

## 🎯 Examples Included

All scripts demonstrate the following use cases:

1. **Get All Tools** - Fetch the complete tools index
2. **Get Specific Tool** - Retrieve detailed information for a single tool
3. **Get Tools by Type** - Group tools by category (IDE, CLI, Web, etc.)
4. **Get Tools by Pricing** - Group tools by pricing model (free, freemium, paid)
5. **Feature Adoption Matrix** - See which features are most common
6. **Repository Statistics** - Get aggregate stats across all tools
7. **Search Functionality** - Search tools by keyword
8. **Find Tools with Specific Features** - Filter by feature presence
9. **Find Free Tools** - Filter by pricing model
10. **Compare Two Tools** - Side-by-side comparison with unique features

---

## 🔌 Using the API in Your Projects

### Python
```python
from examples.api_usage import AIToolsAPI

api = AIToolsAPI()
tools = api.get_all_tools()
cursor = api.get_tool("cursor")
results = api.search("agent")
```

### JavaScript
```javascript
const { AIToolsAPI } = require('./examples/api-usage');

const api = new AIToolsAPI();
const tools = await api.getAllTools();
const cursor = await api.getTool('cursor');
const results = await api.search('agent');
```

### PowerShell
```powershell
. .\examples\api-usage.ps1

$api = [AIToolsAPI]::new()
$tools = $api.GetAllTools()
$cursor = $api.GetTool("cursor")
$results = $api.Search("agent")
```

---

## 🌐 Web Usage (Fetch API)

For client-side JavaScript (browser), use the Fetch API:

```javascript
// Fetch all tools
const response = await fetch('./api/index.json');
const data = await response.json();
console.log(data.tools);

// Fetch specific tool
const cursor = await fetch('./api/tools/cursor.json');
const cursorData = await cursor.json();
console.log(cursorData);

// Search
const searchIndex = await fetch('./api/search.json');
const searchData = await searchIndex.json();
const results = searchData.index.filter(tool =>
    tool.keywords.includes('agent')
);
```

---

## 📊 API Endpoints Reference

| Endpoint | Description | Size |
|----------|-------------|------|
| `/api/index.json` | All tools index | ~50 KB |
| `/api/tools/{slug}.json` | Individual tool details | ~5-10 KB |
| `/api/by-type.json` | Grouped by type | ~40 KB |
| `/api/by-pricing.json` | Grouped by pricing | ~40 KB |
| `/api/features.json` | Feature adoption matrix | ~30 KB |
| `/api/statistics.json` | Aggregate statistics | ~5 KB |
| `/api/search.json` | Optimized search index | ~20 KB |

**Total API Size:** ~200 KB (all endpoints combined)

---

## 🚀 Advanced Usage

### Caching API Responses

**Python:**
```python
import json
from functools import lru_cache

@lru_cache(maxsize=128)
def cached_get_tool(slug):
    with open(f'api/tools/{slug}.json') as f:
        return json.load(f)
```

**JavaScript:**
```javascript
const cache = new Map();

async function cachedGetTool(slug) {
    if (cache.has(slug)) return cache.get(slug);
    const tool = await api.getTool(slug);
    cache.set(slug, tool);
    return tool;
}
```

### Building Custom Queries

**Find all free IDE tools:**
```python
tools = api.get_all_tools()['tools']
free_ides = [
    tool for tool in tools
    if tool['type'] == 'ide' and tool['pricing'] == 'free'
]
```

**Get tools supporting a specific model:**
```javascript
const tools = (await api.getAllTools()).tools;
const gpt4Tools = tools.filter(tool =>
    tool.models.some(model => model.includes('GPT-4'))
);
```

---

## 📖 Additional Resources

- **[API README](../api/README.md)** - Complete API documentation
- **[Metadata Schema](../metadata/README.md)** - Data structure reference
- **[Implementation Summary](../IMPLEMENTATION_SUMMARY.md)** - Feature overview

---

## 🤝 Contributing

Have an example in another language? Contributions welcome!

Supported languages we'd love to see:
- Ruby
- Go
- Rust
- PHP
- Java
- C#
- TypeScript (with types)

See **[CONTRIBUTING.md](../CONTRIBUTING.md)** for guidelines.

---

## 📝 License

These examples are provided as-is for educational purposes.
Use them freely in your own projects!

---

*Last updated: October 2, 2025*
