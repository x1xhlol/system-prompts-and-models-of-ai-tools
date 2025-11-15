#!/usr/bin/env python3
"""
Analyze and generate statistics about AI tools in the repository.
Creates comparison charts and statistics.
"""

import json
import os
from collections import defaultdict

class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def load_index():
    """Load the metadata index."""
    index_path = "scripts/index.json"
    if not os.path.exists(index_path):
        print("Error: index.json not found. Run 'python scripts/generate_metadata.py' first.")
        exit(1)

    with open(index_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def print_header(text):
    """Print a formatted header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(70)}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}\n")

def print_bar_chart(data, title, max_width=50):
    """Print a horizontal bar chart."""
    print(f"{Colors.BOLD}{title}{Colors.RESET}")

    if not data:
        print("  No data available")
        return

    max_value = max(data.values())

    for key, value in sorted(data.items(), key=lambda x: x[1], reverse=True):
        bar_length = int((value / max_value) * max_width) if max_value > 0 else 0
        bar = '█' * bar_length
        print(f"  {key:30} {Colors.GREEN}{bar}{Colors.RESET} {value}")

def analyze_by_category(index):
    """Analyze tools by category."""
    print_bar_chart(index['stats']['by_category'], "Tools by Category")

def analyze_by_company(index):
    """Analyze tools by company."""
    companies = defaultdict(int)
    for tool in index['tools']:
        company = tool.get('company', 'Unknown')
        companies[company] += 1

    print_bar_chart(dict(companies), "Tools by Company")

def analyze_by_type(index):
    """Analyze tools by type."""
    print_bar_chart(index['stats']['by_type'], "Tools by Type")

def analyze_file_sizes(index):
    """Analyze file sizes and line counts."""
    print(f"{Colors.BOLD}File Size Analysis{Colors.RESET}")

    total_size = 0
    largest_files = []

    for tool in index['tools']:
        for file in tool.get('files', []):
            total_size += file['size']
            largest_files.append((file['path'], file['size'], tool['name']))

    # Sort and get top 10
    largest_files.sort(key=lambda x: x[1], reverse=True)

    print(f"\n  Total Size: {total_size / 1024 / 1024:.2f} MB")
    print(f"\n  {Colors.BOLD}Top 10 Largest Files:{Colors.RESET}")
    for path, size, tool_name in largest_files[:10]:
        size_kb = size / 1024
        print(f"    {path:50} {size_kb:8.1f} KB  ({tool_name})")

def analyze_models(index):
    """Analyze AI models used."""
    print(f"{Colors.BOLD}AI Models Analysis{Colors.RESET}\n")

    model_count = defaultdict(int)
    for tool in index['tools']:
        for model in tool.get('models', []):
            model_count[model] += 1

    if model_count:
        print("  Models mentioned in tools:")
        for model, count in sorted(model_count.items(), key=lambda x: x[1], reverse=True):
            print(f"    {model:30} {count} tool(s)")
    else:
        print("  No model information available in metadata")

def analyze_complexity(index):
    """Analyze complexity based on line count and file count."""
    print(f"{Colors.BOLD}Complexity Analysis{Colors.RESET}\n")

    # Sort by total lines
    by_lines = sorted(index['tools'], key=lambda x: x.get('total_lines', 0), reverse=True)

    print(f"  {Colors.BOLD}Most Complex (by line count):{Colors.RESET}")
    for i, tool in enumerate(by_lines[:10], 1):
        lines = tool.get('total_lines', 0)
        files = tool.get('file_count', 0)
        print(f"    {i:2}. {tool['name']:30} {lines:6,} lines, {files:2} files")

    # Sort by file count
    by_files = sorted(index['tools'], key=lambda x: x.get('file_count', 0), reverse=True)

    print(f"\n  {Colors.BOLD}Most Files:{Colors.RESET}")
    for i, tool in enumerate(by_files[:10], 1):
        files = tool.get('file_count', 0)
        print(f"    {i:2}. {tool['name']:30} {files:2} files")

def generate_comparison_table(index):
    """Generate a markdown comparison table."""
    print(f"{Colors.BOLD}Generating Comparison Table (Markdown){Colors.RESET}\n")

    md = "| Tool | Company | Category | Files | Lines | Models |\n"
    md += "|------|---------|----------|-------|-------|--------|\n"

    for tool in sorted(index['tools'], key=lambda x: x['name']):
        name = tool['name']
        company = tool.get('company', 'Unknown')
        category = tool.get('category', 'Unknown')
        files = tool.get('file_count', 0)
        lines = tool.get('total_lines', 0)
        models = ', '.join(tool.get('models', [])[:2]) if tool.get('models') else 'N/A'
        if len(tool.get('models', [])) > 2:
            models += '...'

        md += f"| {name} | {company} | {category} | {files} | {lines:,} | {models} |\n"

    # Save to file
    output_path = "scripts/comparison_table.md"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md)

    print(f"  Saved to: {output_path}")

def main():
    """Run all analyses."""
    index = load_index()

    print_header("AI Tools Repository Analysis")

    # Overall stats
    print(f"{Colors.BOLD}Overall Statistics{Colors.RESET}")
    print(f"  Total Tools: {Colors.CYAN}{index['stats']['total_tools']}{Colors.RESET}")
    print(f"  Total Files: {Colors.CYAN}{index['stats']['total_files']}{Colors.RESET}")
    print(f"  Total Lines: {Colors.CYAN}{index['stats']['total_lines']:,}{Colors.RESET}")

    print()
    analyze_by_category(index)
    print()
    analyze_by_company(index)
    print()
    analyze_by_type(index)
    print()
    analyze_models(index)
    print()
    analyze_complexity(index)
    print()
    analyze_file_sizes(index)
    print()
    generate_comparison_table(index)

    print(f"\n{Colors.GREEN}Analysis complete!{Colors.RESET}\n")

if __name__ == "__main__":
    main()
