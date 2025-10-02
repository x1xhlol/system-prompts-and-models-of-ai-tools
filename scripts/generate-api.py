#!/usr/bin/env python3
"""
API Endpoint Generator
Creates JSON API endpoints for programmatic access to tool data
"""

import os
import json
from pathlib import Path
from datetime import datetime

class APIGenerator:
    def __init__(self, repo_path):
        self.repo_path = Path(repo_path)
        self.api_dir = self.repo_path / 'api'
        self.metadata_dir = self.repo_path / 'metadata'
        
    def load_metadata(self):
        """Load all metadata files"""
        metadata = []
        
        if not self.metadata_dir.exists():
            return metadata
        
        for file in self.metadata_dir.glob('*.json'):
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    metadata.append(data)
            except Exception as e:
                print(f"Warning: Could not load {file}: {e}")
        
        return metadata
    
    def generate_tools_index(self, metadata):
        """Generate API endpoint for all tools"""
        return {
            'version': '1.0',
            'generated': datetime.now().isoformat(),
            'count': len(metadata),
            'tools': [
                {
                    'slug': tool['slug'],
                    'name': tool['name'],
                    'type': tool['type'],
                    'description': tool.get('description', ''),
                    'status': tool.get('status', 'unknown')
                }
                for tool in metadata
            ]
        }
    
    def generate_tool_detail(self, tool):
        """Generate detailed API endpoint for a single tool"""
        return {
            'version': '1.0',
            'generated': datetime.now().isoformat(),
            **tool
        }
    
    def generate_by_type(self, metadata):
        """Generate API endpoints grouped by tool type"""
        by_type = {}
        
        for tool in metadata:
            tool_type = tool.get('type', 'Other')
            if tool_type not in by_type:
                by_type[tool_type] = []
            by_type[tool_type].append({
                'slug': tool['slug'],
                'name': tool['name'],
                'description': tool.get('description', '')
            })
        
        return {
            'version': '1.0',
            'generated': datetime.now().isoformat(),
            'types': by_type
        }
    
    def generate_by_pricing(self, metadata):
        """Generate API endpoints grouped by pricing model"""
        by_pricing = {}
        
        for tool in metadata:
            pricing_model = tool.get('pricing', {}).get('model', 'unknown')
            if pricing_model not in by_pricing:
                by_pricing[pricing_model] = []
            by_pricing[pricing_model].append({
                'slug': tool['slug'],
                'name': tool['name'],
                'type': tool['type']
            })
        
        return {
            'version': '1.0',
            'generated': datetime.now().isoformat(),
            'pricing_models': by_pricing
        }
    
    def generate_features_matrix(self, metadata):
        """Generate feature comparison matrix"""
        features = {}
        
        for tool in metadata:
            tool_features = tool.get('features', {})
            for feature, enabled in tool_features.items():
                if feature not in features:
                    features[feature] = []
                if enabled:
                    features[feature].append({
                        'slug': tool['slug'],
                        'name': tool['name']
                    })
        
        return {
            'version': '1.0',
            'generated': datetime.now().isoformat(),
            'features': features
        }
    
    def generate_statistics(self, metadata):
        """Generate statistics endpoint"""
        types = {}
        pricing = {}
        total_features = {}
        
        for tool in metadata:
            # Count by type
            tool_type = tool.get('type', 'Other')
            types[tool_type] = types.get(tool_type, 0) + 1
            
            # Count by pricing
            pricing_model = tool.get('pricing', {}).get('model', 'unknown')
            pricing[pricing_model] = pricing.get(pricing_model, 0) + 1
            
            # Count features
            for feature, enabled in tool.get('features', {}).items():
                if enabled:
                    total_features[feature] = total_features.get(feature, 0) + 1
        
        return {
            'version': '1.0',
            'generated': datetime.now().isoformat(),
            'total_tools': len(metadata),
            'by_type': types,
            'by_pricing': pricing,
            'feature_adoption': total_features,
            'most_common_features': sorted(
                total_features.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
        }
    
    def generate_search_index(self, metadata):
        """Generate search index for quick lookups"""
        index = []
        
        for tool in metadata:
            index.append({
                'slug': tool['slug'],
                'name': tool['name'],
                'type': tool['type'],
                'description': tool.get('description', ''),
                'tags': tool.get('tags', []),
                'keywords': [
                    tool['name'].lower(),
                    tool['slug'],
                    tool['type'].lower(),
                    *[tag.lower() for tag in tool.get('tags', [])]
                ]
            })
        
        return {
            'version': '1.0',
            'generated': datetime.now().isoformat(),
            'index': index
        }
    
    def generate_all(self):
        """Generate all API endpoints"""
        print("🚀 Generating API endpoints...\n")
        
        # Create API directory
        self.api_dir.mkdir(exist_ok=True)
        
        # Load metadata
        print("📊 Loading metadata...")
        metadata = self.load_metadata()
        print(f"   Found {len(metadata)} tools\n")
        
        endpoints = [
            ('index.json', self.generate_tools_index(metadata), 'Tools index'),
            ('by-type.json', self.generate_by_type(metadata), 'Grouped by type'),
            ('by-pricing.json', self.generate_by_pricing(metadata), 'Grouped by pricing'),
            ('features.json', self.generate_features_matrix(metadata), 'Feature matrix'),
            ('statistics.json', self.generate_statistics(metadata), 'Statistics'),
            ('search.json', self.generate_search_index(metadata), 'Search index'),
        ]
        
        # Generate endpoints
        print("📝 Generating endpoints:")
        for filename, data, description in endpoints:
            output_path = self.api_dir / filename
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"   ✓ {filename} - {description}")
        
        # Generate individual tool endpoints
        print("\n📝 Generating individual tool endpoints:")
        tools_dir = self.api_dir / 'tools'
        tools_dir.mkdir(exist_ok=True)
        
        for tool in metadata:
            slug = tool['slug']
            output_path = tools_dir / f"{slug}.json"
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(self.generate_tool_detail(tool), f, indent=2, ensure_ascii=False)
            print(f"   ✓ {slug}.json")
        
        # Generate API documentation
        print("\n📄 Generating API documentation...")
        self.generate_api_docs(metadata)
        print("   ✓ README.md")
        
        print(f"\n✅ Generated {len(endpoints) + len(metadata) + 1} API endpoints")
        print(f"📁 API directory: {self.api_dir}\n")
        
        self.print_usage_examples()
    
    def generate_api_docs(self, metadata):
        """Generate API documentation"""
        docs = f"""# 🔌 API Documentation

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
{{
  "version": "1.0",
  "generated": "2025-01-02T00:00:00",
  "count": {len(metadata)},
  "tools": [
    {{
      "slug": "cursor",
      "name": "Cursor",
      "type": "IDE Plugin",
      "description": "AI-powered code editor...",
      "status": "active"
    }}
  ]
}}
```

---

### 2. Tool Detail
**Endpoint:** `/tools/{{slug}}.json`

Get detailed information about a specific tool.

**Example:** `/tools/cursor.json`

**Response:**
```json
{{
  "version": "1.0",
  "generated": "2025-01-02T00:00:00",
  "name": "Cursor",
  "slug": "cursor",
  "type": "IDE Plugin",
  "status": "active",
  "description": "...",
  "pricing": {{ ... }},
  "features": {{ ... }},
  "models": {{ ... }}
}}
```

---

### 3. By Type
**Endpoint:** `/by-type.json`

Tools grouped by type (IDE Plugin, CLI Tool, etc.).

**Response:**
```json
{{
  "version": "1.0",
  "types": {{
    "IDE Plugin": [
      {{ "slug": "cursor", "name": "Cursor", ... }}
    ],
    "CLI Tool": [
      {{ "slug": "claude-code", "name": "Claude Code", ... }}
    ]
  }}
}}
```

---

### 4. By Pricing
**Endpoint:** `/by-pricing.json`

Tools grouped by pricing model.

**Response:**
```json
{{
  "pricing_models": {{
    "free": [...],
    "freemium": [...],
    "paid": [...]
  }}
}}
```

---

### 5. Features Matrix
**Endpoint:** `/features.json`

Shows which tools have which features.

**Response:**
```json
{{
  "features": {{
    "agentMode": [
      {{ "slug": "cursor", "name": "Cursor" }},
      {{ "slug": "claude-code", "name": "Claude Code" }}
    ],
    "parallelExecution": [...]
  }}
}}
```

---

### 6. Statistics
**Endpoint:** `/statistics.json`

Aggregate statistics about all tools.

**Response:**
```json
{{
  "total_tools": {len(metadata)},
  "by_type": {{
    "IDE Plugin": 11,
    "CLI Tool": 6,
    ...
  }},
  "by_pricing": {{ ... }},
  "feature_adoption": {{
    "codeGeneration": 28,
    "agentMode": 15,
    ...
  }},
  "most_common_features": [
    ["codeGeneration", 28],
    ["gitIntegration", 25],
    ...
  ]
}}
```

---

### 7. Search Index
**Endpoint:** `/search.json`

Optimized index for search functionality.

**Response:**
```json
{{
  "index": [
    {{
      "slug": "cursor",
      "name": "Cursor",
      "type": "IDE Plugin",
      "description": "...",
      "tags": ["IDE", "Agent", "Premium"],
      "keywords": ["cursor", "ide", "agent", "premium"]
    }}
  ]
}}
```

---

## 🔍 Usage Examples

### JavaScript (Fetch API)
```javascript
// Get all tools
fetch('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/index.json')
  .then(res => res.json())
  .then(data => {{
    console.log(`Found ${{data.count}} tools`);
    data.tools.forEach(tool => {{
      console.log(`- ${{tool.name}} (${{tool.type}})`);
    }});
  }});

// Get specific tool
fetch('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/tools/cursor.json')
  .then(res => res.json())
  .then(tool => {{
    console.log(tool.name);
    console.log(tool.description);
    console.log(tool.features);
  }});

// Filter by type
fetch('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/by-type.json')
  .then(res => res.json())
  .then(data => {{
    const idePlugins = data.types['IDE Plugin'];
    console.log(`IDE Plugins: ${{idePlugins.length}}`);
  }});
```

---

### Python (requests)
```python
import requests

# Get all tools
response = requests.get('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/index.json')
data = response.json()
print(f"Found {{data['count']}} tools")

# Get specific tool
tool = requests.get('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/tools/cursor.json').json()
print(tool['name'])
print(tool['description'])

# Get statistics
stats = requests.get('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/statistics.json').json()
print(f"Total tools: {{stats['total_tools']}}")
print(f"By type: {{stats['by_type']}}")
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
  .then(data => {{
    const agentTools = data.features.agentMode;
    console.log('Tools with Agent Mode:', agentTools);
  }});
```

### Search Tools
```javascript
// Search for tools
const query = 'ide';
fetch('/api/search.json')
  .then(res => res.json())
  .then(data => {{
    const results = data.index.filter(tool => 
      tool.keywords.some(keyword => keyword.includes(query.toLowerCase()))
    );
    console.log(`Found ${{results.length}} results for "${{query}}"`);
  }});
```

### Get Free Tools
```javascript
// Get all free tools
fetch('/api/by-pricing.json')
  .then(res => res.json())
  .then(data => {{
    const freeTools = data.pricing_models.free || [];
    console.log(`${{freeTools.length}} free tools available`);
  }});
```

---

## 📊 Data Schema

### Tool Object
```typescript
interface Tool {{
  name: string;
  slug: string;
  type: "IDE Plugin" | "CLI Tool" | "Web Platform" | "Autonomous Agent";
  status: "active" | "beta" | "deprecated";
  description: string;
  version: {{
    current: string;
    lastUpdated: string;
    history: Array<{{
      version: string;
      date: string;
      changes: string;
    }}>;
  }};
  pricing: {{
    model: "free" | "freemium" | "paid" | "enterprise";
    tiers: Array<Tier>;
  }};
  models: {{
    primary: string;
    supported: string[];
    customizable: boolean;
  }};
  features: {{
    codeGeneration: boolean;
    codeCompletion: boolean;
    chatInterface: boolean;
    agentMode: boolean;
    parallelExecution: boolean;
    memorySystem: boolean;
    todoTracking: boolean;
    // ... more features
  }};
  platforms: {{
    vscode: boolean;
    jetbrains: boolean;
    web: boolean;
    cli: boolean;
    standalone: boolean;
  }};
  patterns: {{
    conciseness: "very-high" | "high" | "medium" | "low";
    parallelTools: boolean;
    subAgents: boolean;
    verificationGates: boolean;
    todoSystem: boolean;
  }};
  links: {{
    website: string | null;
    docs: string | null;
    github: string | null;
    pricing: string | null;
  }};
  tags: string[];
  metrics: {{
    promptTokens: number;
    toolsCount: number;
    securityRules: number;
    concisenessScore: number;
  }};
}}
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

*Last Updated: {datetime.now().strftime("%Y-%m-%d")}*  
*API Version: 1.0*
"""
        
        with open(self.api_dir / 'README.md', 'w', encoding='utf-8') as f:
            f.write(docs)
    
    def print_usage_examples(self):
        """Print usage examples"""
        print("📖 Usage Examples:")
        print()
        print("  JavaScript:")
        print("    fetch('./api/index.json')")
        print("      .then(res => res.json())")
        print("      .then(data => console.log(data));")
        print()
        print("  Python:")
        print("    import json")
        print("    with open('api/index.json') as f:")
        print("      data = json.load(f)")
        print()
        print("  cURL:")
        print("    curl https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/index.json")
        print()


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate API endpoints for tool data')
    parser.add_argument('--repo', default='.', help='Repository path')
    
    args = parser.parse_args()
    
    generator = APIGenerator(args.repo)
    generator.generate_all()


if __name__ == '__main__':
    main()
