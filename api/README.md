# 🔌 API Documentation

*RESTful JSON API for AI Coding Tools data*

---

## 📋 Base URL

```
https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/
```

Or locally:
```
file:///path/to/repo/api/
```

---

## 📊 Endpoints

### 1. Tools Index
**Endpoint:** `/index.json`

Lists all available tools with basic information.

**Response:**
```json
{
  "version": "1.0",
  "generated": "2025-01-02T00:00:00",
  "count": 32,
  "tools": [
    {
      "slug": "cursor",
      "name": "Cursor",
      "type": "IDE Plugin",
      "description": "AI-powered code editor...",
      "status": "active"
    }
  ]
}
```

---

### 2. Tool Detail
**Endpoint:** `/tools/{slug}.json`

Get detailed information about a specific tool.

**Example:** `/tools/cursor.json`

**Response:**
```json
{
  "version": "1.0",
  "generated": "2025-01-02T00:00:00",
  "name": "Cursor",
  "slug": "cursor",
  "type": "IDE Plugin",
  "status": "active",
  "description": "...",
  "pricing": { ... },
  "features": { ... },
  "models": { ... }
}
```

---

### 3. By Type
**Endpoint:** `/by-type.json`

Tools grouped by type (IDE Plugin, CLI Tool, etc.).

**Response:**
```json
{
  "version": "1.0",
  "types": {
    "IDE Plugin": [
      { "slug": "cursor", "name": "Cursor", ... }
    ],
    "CLI Tool": [
      { "slug": "claude-code", "name": "Claude Code", ... }
    ]
  }
}
```

---

### 4. By Pricing
**Endpoint:** `/by-pricing.json`

Tools grouped by pricing model.

**Response:**
```json
{
  "pricing_models": {
    "free": [...],
    "freemium": [...],
    "paid": [...]
  }
}
```

---

### 5. Features Matrix
**Endpoint:** `/features.json`

Shows which tools have which features.

**Response:**
```json
{
  "features": {
    "agentMode": [
      { "slug": "cursor", "name": "Cursor" },
      { "slug": "claude-code", "name": "Claude Code" }
    ],
    "parallelExecution": [...]
  }
}
```

---

### 6. Statistics
**Endpoint:** `/statistics.json`

Aggregate statistics about all tools.

**Response:**
```json
{
  "total_tools": 32,
  "by_type": {
    "IDE Plugin": 11,
    "CLI Tool": 6,
    ...
  },
  "by_pricing": { ... },
  "feature_adoption": {
    "codeGeneration": 28,
    "agentMode": 15,
    ...
  },
  "most_common_features": [
    ["codeGeneration", 28],
    ["gitIntegration", 25],
    ...
  ]
}
```

---

### 7. Search Index
**Endpoint:** `/search.json`

Optimized index for search functionality.

**Response:**
```json
{
  "index": [
    {
      "slug": "cursor",
      "name": "Cursor",
      "type": "IDE Plugin",
      "description": "...",
      "tags": ["IDE", "Agent", "Premium"],
      "keywords": ["cursor", "ide", "agent", "premium"]
    }
  ]
}
```

---

## 🔍 Usage Examples

### JavaScript (Fetch API)
```javascript
// Get all tools
fetch('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/index.json')
  .then(res => res.json())
  .then(data => {
    console.log(`Found ${data.count} tools`);
    data.tools.forEach(tool => {
      console.log(`- ${tool.name} (${tool.type})`);
    });
  });

// Get specific tool
fetch('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/tools/cursor.json')
  .then(res => res.json())
  .then(tool => {
    console.log(tool.name);
    console.log(tool.description);
    console.log(tool.features);
  });

// Filter by type
fetch('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/by-type.json')
  .then(res => res.json())
  .then(data => {
    const idePlugins = data.types['IDE Plugin'];
    console.log(`IDE Plugins: ${idePlugins.length}`);
  });
```

---

### Python (requests)
```python
import requests

# Get all tools
response = requests.get('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/index.json')
data = response.json()
print(f"Found {data['count']} tools")

# Get specific tool
tool = requests.get('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/tools/cursor.json').json()
print(tool['name'])
print(tool['description'])

# Get statistics
stats = requests.get('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/statistics.json').json()
print(f"Total tools: {stats['total_tools']}")
print(f"By type: {stats['by_type']}")
```

---

### cURL
```bash
# Get all tools
curl https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/index.json

# Get specific tool
curl https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/tools/cursor.json

# Get statistics
curl https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/statistics.json

# Pretty print with jq
curl https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/index.json | jq '.'
```

---

## 🔧 Advanced Queries

### Filter Tools by Feature
```javascript
// Get all tools with agent mode
fetch('/api/features.json')
  .then(res => res.json())
  .then(data => {
    const agentTools = data.features.agentMode;
    console.log('Tools with Agent Mode:', agentTools);
  });
```

### Search Tools
```javascript
// Search for tools
const query = 'ide';
fetch('/api/search.json')
  .then(res => res.json())
  .then(data => {
    const results = data.index.filter(tool => 
      tool.keywords.some(keyword => keyword.includes(query.toLowerCase()))
    );
    console.log(`Found ${results.length} results for "${query}"`);
  });
```

### Get Free Tools
```javascript
// Get all free tools
fetch('/api/by-pricing.json')
  .then(res => res.json())
  .then(data => {
    const freeTools = data.pricing_models.free || [];
    console.log(`${freeTools.length} free tools available`);
  });
```

---

## 📊 Data Schema

### Tool Object
```typescript
interface Tool {
  name: string;
  slug: string;
  type: "IDE Plugin" | "CLI Tool" | "Web Platform" | "Autonomous Agent";
  status: "active" | "beta" | "deprecated";
  description: string;
  version: {
    current: string;
    lastUpdated: string;
    history: Array<{
      version: string;
      date: string;
      changes: string;
    }>;
  };
  pricing: {
    model: "free" | "freemium" | "paid" | "enterprise";
    tiers: Array<Tier>;
  };
  models: {
    primary: string;
    supported: string[];
    customizable: boolean;
  };
  features: {
    codeGeneration: boolean;
    codeCompletion: boolean;
    chatInterface: boolean;
    agentMode: boolean;
    parallelExecution: boolean;
    memorySystem: boolean;
    todoTracking: boolean;
    // ... more features
  };
  platforms: {
    vscode: boolean;
    jetbrains: boolean;
    web: boolean;
    cli: boolean;
    standalone: boolean;
  };
  patterns: {
    conciseness: "very-high" | "high" | "medium" | "low";
    parallelTools: boolean;
    subAgents: boolean;
    verificationGates: boolean;
    todoSystem: boolean;
  };
  links: {
    website: string | null;
    docs: string | null;
    github: string | null;
    pricing: string | null;
  };
  tags: string[];
  metrics: {
    promptTokens: number;
    toolsCount: number;
    securityRules: number;
    concisenessScore: number;
  };
}
```

---

## 🔄 Updates

API endpoints are regenerated automatically when:
- New tools are added
- Tool metadata is updated
- Features change

Check the `generated` field in each endpoint for the last update time.

---

## 📝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on:
- Adding new tools
- Updating metadata
- Improving API structure
- Adding new endpoints

---

## 📚 Resources

- [GitHub Repository](https://github.com/sahiixx/system-prompts-and-models-of-ai-tools)
- [Metadata Schema](../metadata/README.md)
- [Tool Documentation](../)

---

*Last Updated: 2025-10-02*  
*API Version: 1.0*
