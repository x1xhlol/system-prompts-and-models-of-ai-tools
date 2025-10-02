#!/usr/bin/env python3
"""
Example: Consuming the AI Tools API with Python

This script demonstrates various ways to interact with the
system-prompts-and-models-of-ai-tools API endpoints.
"""

import json
from pathlib import Path
from typing import Dict, List, Any


class AIToolsAPI:
    """Simple client for the AI Tools API."""
    
    def __init__(self, api_base_path: str = "api"):
        """Initialize the API client with the base path to API files."""
        self.api_base = Path(api_base_path)
    
    def get_all_tools(self) -> Dict[str, Any]:
        """Get all tools from the index."""
        with open(self.api_base / "index.json") as f:
            return json.load(f)
    
    def get_tool(self, slug: str) -> Dict[str, Any]:
        """Get a specific tool by slug."""
        with open(self.api_base / "tools" / f"{slug}.json") as f:
            return json.load(f)
    
    def get_by_type(self) -> Dict[str, Any]:
        """Get tools grouped by type."""
        with open(self.api_base / "by-type.json") as f:
            return json.load(f)
    
    def get_by_pricing(self) -> Dict[str, Any]:
        """Get tools grouped by pricing."""
        with open(self.api_base / "by-pricing.json") as f:
            return json.load(f)
    
    def get_features(self) -> Dict[str, Any]:
        """Get feature adoption matrix."""
        with open(self.api_base / "features.json") as f:
            return json.load(f)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get aggregate statistics."""
        with open(self.api_base / "statistics.json") as f:
            return json.load(f)
    
    def search(self, query: str) -> List[Dict[str, Any]]:
        """Search tools by keyword."""
        with open(self.api_base / "search.json") as f:
            search_data = json.load(f)
        
        query_lower = query.lower()
        results = []
        
        for tool in search_data["index"]:
            # Search in keywords, name, and description
            if (query_lower in " ".join(tool["keywords"]).lower() or
                query_lower in tool["name"].lower() or
                query_lower in tool["description"].lower()):
                results.append(tool)
        
        return results


def main():
    """Demonstrate API usage with various examples."""
    
    # Initialize API client
    api = AIToolsAPI()
    
    print("🚀 AI Tools API - Python Examples\n")
    print("=" * 60)
    
    # Example 1: Get all tools
    print("\n📊 Example 1: Get All Tools")
    print("-" * 60)
    all_tools = api.get_all_tools()
    print(f"Total tools: {len(all_tools['tools'])}")
    print(f"Generated: {all_tools['generated']}")
    print(f"\nFirst 3 tools:")
    for tool in all_tools["tools"][:3]:
        # Note: index.json has minimal info; use get_tool() for full details
        print(f"  - {tool['name']} ({tool['type']}) - Status: {tool['status']}")
    
    # Example 2: Get a specific tool
    print("\n🎯 Example 2: Get Specific Tool (Cursor)")
    print("-" * 60)
    cursor = api.get_tool("cursor")
    print(f"Name: {cursor['name']}")
    print(f"Type: {cursor['type']}")
    print(f"Description: {cursor['description']}")
    
    # Features is a dict with boolean values
    features = cursor.get('features', {})
    if isinstance(features, dict):
        features_list = [k for k, v in features.items() if v]
        print(f"Features: {len(features_list)} enabled")
        print(f"  Examples: {', '.join(features_list[:5])}")
    
    # Models is also a dict
    models = cursor.get('models', {})
    if isinstance(models, dict):
        supported = models.get('supported', [])
        print(f"Models: {len(supported)} supported")
        print(f"  Primary: {models.get('primary', 'N/A')}")
        print(f"  Examples: {', '.join(supported[:3])}")
    
    # Example 3: Get tools by type
    print("\n📁 Example 3: Get Tools by Type")
    print("-" * 60)
    by_type = api.get_by_type()
    for tool_type, tools in by_type.get("types", {}).items():
        print(f"{tool_type}: {len(tools)} tools")
        print(f"  Examples: {', '.join([t['name'] for t in tools[:3]])}")
    
    # Example 4: Get tools by pricing
    print("\n💰 Example 4: Get Tools by Pricing")
    print("-" * 60)
    by_pricing = api.get_by_pricing()
    for pricing, tools in by_pricing.get("pricing_models", {}).items():
        print(f"{pricing}: {len(tools)} tools")
    
    # Example 5: Get feature matrix
    print("\n🔧 Example 5: Feature Adoption Matrix")
    print("-" * 60)
    features = api.get_features()
    features_dict = features.get('features', {})
    print(f"Total features tracked: {len(features_dict)}")
    print("\nMost common features:")
    # Features is a dict where values are lists of tools
    sorted_features = sorted(features_dict.items(), key=lambda x: len(x[1]), reverse=True)
    for feature_name, tools_list in sorted_features[:5]:
        adoption_rate = (len(tools_list) / len(all_tools["tools"])) * 100
        print(f"  - {feature_name}: {len(tools_list)} tools ({adoption_rate:.1f}%)")
    
    # Example 6: Get statistics
    print("\n📈 Example 6: Repository Statistics")
    print("-" * 60)
    stats = api.get_statistics()
    print(f"Total tools: {stats['total_tools']}")
    
    # Most common type
    by_type = stats.get('by_type', {})
    if by_type:
        most_common_type = max(by_type.items(), key=lambda x: x[1])
        print(f"\nMost common type: {most_common_type[0]} ({most_common_type[1]} tools)")
    
    # Top features
    print(f"\nTop 5 features:")
    for feature, count in stats.get("most_common_features", [])[:5]:
        adoption = (count / stats['total_tools']) * 100
        print(f"  - {feature}: {count} tools ({adoption:.1f}%)")
    
    # Example 7: Search functionality
    print("\n🔍 Example 7: Search for 'agent' tools")
    print("-" * 60)
    search_results = api.search("agent")
    print(f"Found {len(search_results)} tools matching 'agent':")
    for result in search_results[:5]:
        print(f"  - {result['name']} ({result['type']})")
    
    # Example 8: Find tools by type (IDE Plugin)
    print("\n🎨 Example 8: Find IDE Plugin Tools")
    print("-" * 60)
    all_tools_list = api.get_all_tools()["tools"]
    ide_tools = [tool for tool in all_tools_list if tool["type"] == "IDE Plugin"]
    print(f"Found {len(ide_tools)} IDE Plugin tools:")
    for tool in ide_tools[:5]:
        print(f"  - {tool['name']}")
    
    # Example 9: Get full details for a tool
    print("\n💵 Example 9: Get Full Tool Details")
    print("-" * 60)
    print("For complete information (pricing, features, models), use get_tool():")
    windsurf = api.get_tool("windsurf")
    print(f"Tool: {windsurf['name']}")
    
    # Handle pricing (can be dict or string)
    pricing = windsurf.get('pricing', {})
    if isinstance(pricing, dict):
        print(f"Pricing Model: {pricing.get('model', 'N/A')}")
    else:
        print(f"Pricing: {pricing}")
    
    # Features is a dict
    features = windsurf.get('features', {})
    if isinstance(features, dict):
        enabled = [k for k, v in features.items() if v]
        print(f"Features: {len(enabled)} enabled")
        if enabled:
            print(f"  Examples: {', '.join(enabled[:3])}")
    
    # Example 10: Compare two tools
    print("\n⚖️  Example 10: Compare Cursor vs GitHub Copilot")
    print("-" * 60)
    copilot = api.get_tool("github-copilot")
    
    # Get feature lists
    cursor_features_dict = cursor.get('features', {})
    copilot_features_dict = copilot.get('features', {})
    
    cursor_features = set(k for k, v in cursor_features_dict.items() if v) if isinstance(cursor_features_dict, dict) else set()
    copilot_features = set(k for k, v in copilot_features_dict.items() if v) if isinstance(copilot_features_dict, dict) else set()
    
    # Get model lists
    cursor_models = cursor.get('models', {}).get('supported', []) if isinstance(cursor.get('models'), dict) else []
    copilot_models = copilot.get('models', {}).get('supported', []) if isinstance(copilot.get('models'), dict) else []
    
    print(f"\n{cursor['name']}:")
    print(f"  Type: {cursor['type']}")
    print(f"  Features: {len(cursor_features)} enabled")
    print(f"  Models: {len(cursor_models)} supported")
    
    print(f"\n{copilot['name']}:")
    print(f"  Type: {copilot['type']}")
    print(f"  Features: {len(copilot_features)} enabled")
    print(f"  Models: {len(copilot_models)} supported")
    
    # Find unique features
    unique_cursor = cursor_features - copilot_features
    unique_copilot = copilot_features - cursor_features
    shared = cursor_features & copilot_features
    
    print(f"\nShared features: {len(shared)}")
    print(f"Unique to Cursor: {len(unique_cursor)}")
    if unique_cursor:
        print(f"  Examples: {', '.join(list(unique_cursor)[:3])}")
    print(f"Unique to Copilot: {len(unique_copilot)}")
    if unique_copilot:
        print(f"  Examples: {', '.join(list(unique_copilot)[:3])}")
    
    print("\n" + "=" * 60)
    print("✅ Examples completed!")
    print("\nFor more information, see: api/README.md")


if __name__ == "__main__":
    main()
