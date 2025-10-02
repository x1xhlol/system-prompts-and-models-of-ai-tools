#!/usr/bin/env python3
"""
Version Comparison Tool
Compare different versions of system prompts
"""

import os
import sys
import difflib
from pathlib import Path
import json
from datetime import datetime

class VersionComparer:
    def __init__(self, repo_path):
        self.repo_path = Path(repo_path)
        
    def find_versions(self, tool_name):
        """Find all versions of prompts for a tool"""
        tool_dir = self.repo_path / tool_name
        
        if not tool_dir.exists():
            return []
        
        versions = []
        for file in tool_dir.glob('*.txt'):
            if 'prompt' in file.stem.lower():
                versions.append({
                    'name': file.stem,
                    'path': file,
                    'size': file.stat().st_size,
                    'modified': datetime.fromtimestamp(file.stat().st_mtime)
                })
        
        return sorted(versions, key=lambda x: x['modified'])
    
    def compare_files(self, file1, file2, context_lines=3):
        """Compare two files and return diff"""
        with open(file1, 'r', encoding='utf-8', errors='ignore') as f1:
            lines1 = f1.readlines()
        
        with open(file2, 'r', encoding='utf-8', errors='ignore') as f2:
            lines2 = f2.readlines()
        
        diff = difflib.unified_diff(
            lines1,
            lines2,
            fromfile=str(file1),
            tofile=str(file2),
            lineterm='',
            n=context_lines
        )
        
        return list(diff)
    
    def calculate_similarity(self, file1, file2):
        """Calculate similarity ratio between two files"""
        with open(file1, 'r', encoding='utf-8', errors='ignore') as f1:
            text1 = f1.read()
        
        with open(file2, 'r', encoding='utf-8', errors='ignore') as f2:
            text2 = f2.read()
        
        return difflib.SequenceMatcher(None, text1, text2).ratio()
    
    def count_changes(self, diff):
        """Count additions, deletions, and modifications"""
        added = 0
        removed = 0
        
        for line in diff:
            if line.startswith('+') and not line.startswith('+++'):
                added += 1
            elif line.startswith('-') and not line.startswith('---'):
                removed += 1
        
        return {
            'added': added,
            'removed': removed,
            'total': added + removed
        }
    
    def generate_html_diff(self, file1, file2, tool_name):
        """Generate HTML diff view"""
        diff = self.compare_files(file1, file2, context_lines=5)
        similarity = self.calculate_similarity(file1, file2)
        changes = self.count_changes(diff)
        
        html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Version Comparison - {tool_name}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #0d1117;
            color: #c9d1d9;
            padding: 20px;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}
        
        header {{
            background: linear-gradient(135deg, #1f6feb 0%, #58a6ff 100%);
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            color: white;
        }}
        
        h1 {{
            font-size: 28px;
            margin-bottom: 10px;
        }}
        
        .subtitle {{
            opacity: 0.9;
        }}
        
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }}
        
        .stat-card {{
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
        }}
        
        .stat-number {{
            font-size: 32px;
            font-weight: bold;
            color: #58a6ff;
            display: block;
            margin-bottom: 5px;
        }}
        
        .stat-label {{
            font-size: 14px;
            color: #8b949e;
        }}
        
        .diff-container {{
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            overflow: hidden;
        }}
        
        .diff-header {{
            background: #21262d;
            padding: 15px;
            border-bottom: 1px solid #30363d;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        pre {{
            padding: 20px;
            overflow-x: auto;
            font-family: 'SFMono-Regular', Consolas, monospace;
            font-size: 14px;
            line-height: 1.6;
        }}
        
        .diff-line {{
            padding: 2px 0;
        }}
        
        .added {{
            background: rgba(63, 185, 80, 0.15);
            color: #3fb950;
        }}
        
        .removed {{
            background: rgba(248, 81, 73, 0.15);
            color: #f85149;
        }}
        
        .info {{
            color: #8b949e;
        }}
        
        button {{
            padding: 8px 16px;
            background: #21262d;
            color: #58a6ff;
            border: 1px solid #30363d;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }}
        
        button:hover {{
            background: #30363d;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Version Comparison: {tool_name}</h1>
            <p class="subtitle">Comparing {Path(file1).name} vs {Path(file2).name}</p>
        </header>
        
        <div class="stats">
            <div class="stat-card">
                <span class="stat-number">{changes['added']}</span>
                <span class="stat-label">Lines Added</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">{changes['removed']}</span>
                <span class="stat-label">Lines Removed</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">{changes['total']}</span>
                <span class="stat-label">Total Changes</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">{similarity:.1%}</span>
                <span class="stat-label">Similarity</span>
            </div>
        </div>
        
        <div class="diff-container">
            <div class="diff-header">
                <span>Unified Diff</span>
                <button onclick="copyDiff()">Copy Diff</button>
            </div>
            <pre id="diffContent">'''
        
        for line in diff:
            line_class = ''
            if line.startswith('+') and not line.startswith('+++'):
                line_class = 'added'
            elif line.startswith('-') and not line.startswith('---'):
                line_class = 'removed'
            elif line.startswith('@@'):
                line_class = 'info'
            
            escaped_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            html += f'<div class="diff-line {line_class}">{escaped_line}</div>'
        
        html += '''</pre>
        </div>
    </div>
    
    <script>
        function copyDiff() {
            const content = document.getElementById('diffContent').textContent;
            navigator.clipboard.writeText(content).then(() => {
                alert('Diff copied to clipboard!');
            });
        }
    </script>
</body>
</html>'''
        
        return html
    
    def compare_tool_versions(self, tool_name, output_format='text'):
        """Compare all versions of a tool"""
        versions = self.find_versions(tool_name)
        
        if len(versions) < 2:
            print(f"Found {len(versions)} version(s) for {tool_name}")
            print("Need at least 2 versions to compare")
            return
        
        print(f"\n📊 Comparing {len(versions)} versions of {tool_name}\n")
        
        for i in range(len(versions) - 1):
            v1 = versions[i]
            v2 = versions[i + 1]
            
            print(f"Comparing: {v1['name']} → {v2['name']}")
            
            similarity = self.calculate_similarity(v1['path'], v2['path'])
            diff = self.compare_files(v1['path'], v2['path'])
            changes = self.count_changes(diff)
            
            print(f"  Similarity: {similarity:.1%}")
            print(f"  Lines added: {changes['added']}")
            print(f"  Lines removed: {changes['removed']}")
            print(f"  Total changes: {changes['total']}")
            
            if output_format == 'html':
                output_file = self.repo_path / f"comparison_{v1['name']}_vs_{v2['name']}.html"
                html = self.generate_html_diff(v1['path'], v2['path'], tool_name)
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(html)
                print(f"  HTML diff saved to: {output_file}")
            
            print()


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Compare versions of system prompts')
    parser.add_argument('--tool', required=True, help='Tool name (e.g., "Cursor Prompts")')
    parser.add_argument('--repo', default='.', help='Repository path')
    parser.add_argument('--format', choices=['text', 'html', 'json'], default='text', help='Output format')
    parser.add_argument('--v1', help='First version file name')
    parser.add_argument('--v2', help='Second version file name')
    parser.add_argument('--all', action='store_true', help='Compare all versions')
    
    args = parser.parse_args()
    
    comparer = VersionComparer(args.repo)
    
    if args.all:
        comparer.compare_tool_versions(args.tool, output_format=args.format)
    elif args.v1 and args.v2:
        tool_dir = Path(args.repo) / args.tool
        file1 = tool_dir / args.v1
        file2 = tool_dir / args.v2
        
        if not file1.exists() or not file2.exists():
            print(f"Error: Files not found")
            return
        
        if args.format == 'html':
            html = comparer.generate_html_diff(file1, file2, args.tool)
            print(html)
        else:
            diff = comparer.compare_files(file1, file2)
            for line in diff:
                print(line)
    else:
        versions = comparer.find_versions(args.tool)
        print(f"\nFound {len(versions)} version(s) for {args.tool}:")
        for v in versions:
            print(f"  - {v['name']} ({v['size']} bytes, modified {v['modified']})")
        print("\nUse --all to compare all versions, or --v1 and --v2 to compare specific versions")


if __name__ == '__main__':
    main()
