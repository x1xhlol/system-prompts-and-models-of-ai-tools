#!/usr/bin/env python3
"""
Search and filter AI tools in the repository.
Usage:
    python scripts/search.py --category "Code Assistant"
    python scripts/search.py --company "Anthropic"
    python scripts/search.py --text "agent"
    python scripts/search.py --model "gpt-5"
"""

import json
import argparse
import os
from pathlib import Path

class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def load_index():
    """Load the metadata index."""
    index_path = "scripts/index.json"
    if not os.path.exists(index_path):
        print(f"Error: {index_path} not found. Run 'python scripts/generate_metadata.py' first.")
        exit(1)

    with open(index_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def search_tools(index, category=None, company=None, text=None, model=None, tool_type=None):
    """Search tools based on criteria."""
    results = []

    for tool in index['tools']:
        # Filter by category
        if category and tool.get('category', '').lower() != category.lower():
            continue

        # Filter by company
        if company and company.lower() not in tool.get('company', '').lower():
            continue

        # Filter by type
        if tool_type and tool.get('type', '').lower() != tool_type.lower():
            continue

        # Filter by model
        if model:
            models = tool.get('models', [])
            if not any(model.lower() in m.lower() for m in models):
                continue

        # Filter by text in name or description
        if text:
            searchable = f"{tool.get('name', '')} {tool.get('description', '')}".lower()
            if text.lower() not in searchable:
                continue

        results.append(tool)

    return results

def display_results(results, verbose=False):
    """Display search results."""
    if not results:
        print(f"{Colors.YELLOW}No results found.{Colors.RESET}")
        return

    print(f"\n{Colors.BOLD}Found {len(results)} tool(s):{Colors.RESET}\n")

    for tool in results:
        print(f"{Colors.BLUE}{Colors.BOLD}{tool['name']}{Colors.RESET}")
        print(f"  Company: {tool.get('company', 'Unknown')}")
        print(f"  Category: {tool.get('category', 'Unknown')}")
        print(f"  Type: {tool.get('type', 'unknown')}")

        if tool.get('website'):
            print(f"  Website: {tool['website']}")

        if tool.get('models'):
            print(f"  Models: {', '.join(tool['models'])}")

        print(f"  Files: {tool['file_count']} ({tool.get('total_lines', 0):,} lines)")

        if verbose:
            print(f"  Description: {tool.get('description', 'N/A')}")
            print(f"  Directory: {tool['directory']}")
            if tool.get('files'):
                print("  File list:")
                for file in tool['files']:
                    size_kb = file['size'] / 1024
                    print(f"    - {file['name']} ({size_kb:.1f} KB)")

        print()

def list_categories(index):
    """List all categories."""
    categories = set(tool.get('category', 'Unknown') for tool in index['tools'])
    print(f"\n{Colors.BOLD}Available Categories:{Colors.RESET}")
    for cat in sorted(categories):
        count = sum(1 for t in index['tools'] if t.get('category') == cat)
        print(f"  {cat} ({count})")

def list_companies(index):
    """List all companies."""
    companies = set(tool.get('company', 'Unknown') for tool in index['tools'])
    print(f"\n{Colors.BOLD}Available Companies:{Colors.RESET}")
    for company in sorted(companies):
        count = sum(1 for t in index['tools'] if t.get('company') == company)
        print(f"  {company} ({count})")

def main():
    parser = argparse.ArgumentParser(description='Search AI tools in the repository')
    parser.add_argument('--category', help='Filter by category')
    parser.add_argument('--company', help='Filter by company')
    parser.add_argument('--text', help='Search in name and description')
    parser.add_argument('--model', help='Filter by AI model')
    parser.add_argument('--type', help='Filter by type (proprietary/open-source)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed information')
    parser.add_argument('--list-categories', action='store_true', help='List all categories')
    parser.add_argument('--list-companies', action='store_true', help='List all companies')

    args = parser.parse_args()

    # Load index
    index = load_index()

    # Handle list commands
    if args.list_categories:
        list_categories(index)
        return

    if args.list_companies:
        list_companies(index)
        return

    # Perform search
    results = search_tools(
        index,
        category=args.category,
        company=args.company,
        text=args.text,
        model=args.model,
        tool_type=args.type
    )

    display_results(results, verbose=args.verbose)

if __name__ == "__main__":
    main()
