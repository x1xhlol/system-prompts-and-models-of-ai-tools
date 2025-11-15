#!/usr/bin/env python3
"""
Generate metadata for all AI tools in the repository.
Creates an index.json file with comprehensive information about each tool.
"""

import os
import json
from pathlib import Path
from datetime import datetime

# Tool metadata - manually curated information about each tool
TOOL_INFO = {
    "Amp": {
        "name": "Amp",
        "company": "Unknown",
        "category": "AI Agent",
        "type": "proprietary",
        "description": "AI coding assistant",
        "website": None,
        "models": []
    },
    "Anthropic": {
        "name": "Anthropic",
        "company": "Anthropic",
        "category": "Foundation Model",
        "type": "proprietary",
        "description": "Claude Sonnet 4.5 and Claude Code 2.0 system prompts",
        "website": "https://anthropic.com",
        "models": ["claude-sonnet-4.5", "claude-code-2.0"]
    },
    "Augment Code": {
        "name": "Augment Code",
        "company": "Augment",
        "category": "Code Assistant",
        "type": "proprietary",
        "description": "AI-powered code completion and generation",
        "website": "https://augmentcode.com",
        "models": ["claude-4-sonnet", "gpt-5"]
    },
    "Claude Code": {
        "name": "Claude Code",
        "company": "Anthropic",
        "category": "Code Assistant",
        "type": "proprietary",
        "description": "Claude's official coding interface system prompt and tools",
        "website": "https://claude.ai/code",
        "models": ["claude-sonnet-4.5"]
    },
    "Cluely": {
        "name": "Cluely",
        "company": "Cluely",
        "category": "Code Assistant",
        "type": "proprietary",
        "description": "AI coding assistant with default and enterprise modes",
        "website": None,
        "models": []
    },
    "CodeBuddy Prompts": {
        "name": "CodeBuddy",
        "company": "CodeBuddy",
        "category": "Code Assistant",
        "type": "proprietary",
        "description": "Chat and Craft mode prompts for code generation",
        "website": None,
        "models": []
    },
    "Comet Assistant": {
        "name": "Comet Assistant",
        "company": "Comet",
        "category": "AI Assistant",
        "type": "proprietary",
        "description": "General purpose AI coding assistant",
        "website": None,
        "models": []
    },
    "Cursor Prompts": {
        "name": "Cursor",
        "company": "Cursor",
        "category": "IDE",
        "type": "proprietary",
        "description": "AI-first code editor with multiple agent modes",
        "website": "https://cursor.com",
        "models": ["claude", "gpt-4"]
    },
    "Devin AI": {
        "name": "Devin",
        "company": "Cognition AI",
        "category": "AI Agent",
        "type": "proprietary",
        "description": "Autonomous AI software engineer",
        "website": "https://devin.ai",
        "models": []
    },
    "Emergent": {
        "name": "Emergent",
        "company": "Emergent",
        "category": "AI Agent",
        "type": "proprietary",
        "description": "AI coding agent with tools",
        "website": None,
        "models": []
    },
    "Junie": {
        "name": "Junie",
        "company": "Junie",
        "category": "Code Assistant",
        "type": "proprietary",
        "description": "AI coding assistant",
        "website": None,
        "models": []
    },
    "Kiro": {
        "name": "Kiro",
        "company": "Kiro",
        "category": "Code Assistant",
        "type": "proprietary",
        "description": "Multi-mode AI assistant (Spec, Vibe, Mode Classifier)",
        "website": None,
        "models": []
    },
    "Leap.new": {
        "name": "Leap",
        "company": "Leap",
        "category": "Web Builder",
        "type": "proprietary",
        "description": "AI-powered web application builder",
        "website": "https://leap.new",
        "models": []
    },
    "Lovable": {
        "name": "Lovable",
        "company": "Lovable",
        "category": "Web Builder",
        "type": "proprietary",
        "description": "AI-powered app builder",
        "website": "https://lovable.dev",
        "models": []
    },
    "Manus Agent Tools & Prompt": {
        "name": "Manus",
        "company": "Manus",
        "category": "AI Agent",
        "type": "proprietary",
        "description": "Agent with loop, modules, and tools",
        "website": None,
        "models": []
    },
    "NotionAi": {
        "name": "Notion AI",
        "company": "Notion",
        "category": "Document Assistant",
        "type": "proprietary",
        "description": "AI assistant integrated into Notion",
        "website": "https://notion.so",
        "models": []
    },
    "Open Source prompts": {
        "name": "Open Source AI Tools",
        "company": "Various",
        "category": "Collection",
        "type": "open-source",
        "description": "Collection of open-source AI coding tools",
        "website": None,
        "models": [],
        "subcategories": ["Bolt", "Cline", "Codex CLI", "Gemini CLI", "Lumo", "RooCode"]
    },
    "Orchids.app": {
        "name": "Orchids",
        "company": "Orchids",
        "category": "AI Assistant",
        "type": "proprietary",
        "description": "AI assistant with decision-making capabilities",
        "website": "https://orchids.app",
        "models": []
    },
    "Perplexity": {
        "name": "Perplexity",
        "company": "Perplexity AI",
        "category": "Search Assistant",
        "type": "proprietary",
        "description": "AI-powered search and answer engine",
        "website": "https://perplexity.ai",
        "models": []
    },
    "Poke": {
        "name": "Poke",
        "company": "Poke",
        "category": "AI Agent",
        "type": "proprietary",
        "description": "Multi-part agent system (6 parts + agent)",
        "website": None,
        "models": []
    },
    "Qoder": {
        "name": "Qoder",
        "company": "Qoder",
        "category": "Code Assistant",
        "type": "proprietary",
        "description": "Quest-based code assistant (Design, Action)",
        "website": None,
        "models": []
    },
    "Replit": {
        "name": "Replit Agent",
        "company": "Replit",
        "category": "Cloud IDE",
        "type": "proprietary",
        "description": "AI agent for Replit cloud development environment",
        "website": "https://replit.com",
        "models": []
    },
    "Same.dev": {
        "name": "Same",
        "company": "Same",
        "category": "Code Assistant",
        "type": "proprietary",
        "description": "AI coding assistant",
        "website": "https://same.dev",
        "models": []
    },
    "Trae": {
        "name": "Trae",
        "company": "Trae",
        "category": "AI Agent",
        "type": "proprietary",
        "description": "Builder and chat modes for development",
        "website": None,
        "models": []
    },
    "Traycer AI": {
        "name": "Traycer",
        "company": "Traycer",
        "category": "AI Agent",
        "type": "proprietary",
        "description": "Multi-mode agent (Phase, Plan)",
        "website": None,
        "models": []
    },
    "VSCode Agent": {
        "name": "VSCode Copilot Agent",
        "company": "Microsoft/GitHub",
        "category": "IDE",
        "type": "proprietary",
        "description": "GitHub Copilot agent for VSCode",
        "website": "https://code.visualstudio.com",
        "models": ["gpt-4", "gpt-4.1", "gpt-5", "gpt-5-mini", "claude-sonnet-4", "gemini-2.5-pro"]
    },
    "Warp.dev": {
        "name": "Warp",
        "company": "Warp",
        "category": "Terminal",
        "type": "proprietary",
        "description": "AI-powered terminal",
        "website": "https://warp.dev",
        "models": []
    },
    "Windsurf": {
        "name": "Windsurf",
        "company": "Codeium",
        "category": "IDE",
        "type": "proprietary",
        "description": "AI-powered code editor (Wave 11)",
        "website": "https://codeium.com/windsurf",
        "models": []
    },
    "Xcode": {
        "name": "Xcode AI",
        "company": "Apple",
        "category": "IDE",
        "type": "proprietary",
        "description": "AI features in Xcode (Document, Explain, Message, Playground, Preview)",
        "website": "https://developer.apple.com/xcode/",
        "models": []
    },
    "Z.ai Code": {
        "name": "Z.ai Code",
        "company": "Z.ai",
        "category": "Code Assistant",
        "type": "proprietary",
        "description": "AI coding assistant",
        "website": None,
        "models": []
    },
    "dia": {
        "name": "Dia",
        "company": "Dia",
        "category": "Code Assistant",
        "type": "proprietary",
        "description": "AI coding assistant",
        "website": None,
        "models": []
    },
    "v0 Prompts and Tools": {
        "name": "v0",
        "company": "Vercel",
        "category": "Web Builder",
        "type": "proprietary",
        "description": "AI-powered UI generation tool",
        "website": "https://v0.dev",
        "models": []
    }
}


def get_file_info(filepath):
    """Get metadata about a file."""
    stat = os.stat(filepath)
    return {
        "name": os.path.basename(filepath),
        "path": filepath,
        "size": stat.st_size,
        "type": os.path.splitext(filepath)[1],
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
    }


def analyze_directory(dir_path):
    """Analyze a directory and gather metadata."""
    files = []
    total_lines = 0

    for root, dirs, filenames in os.walk(dir_path):
        for filename in filenames:
            if filename.endswith(('.txt', '.json', '.md')):
                filepath = os.path.join(root, filename)
                file_info = get_file_info(filepath)

                # Count lines for text files
                if file_info['type'] in ['.txt', '.md']:
                    try:
                        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                            lines = len(f.readlines())
                            file_info['lines'] = lines
                            total_lines += lines
                    except Exception:
                        file_info['lines'] = 0

                files.append(file_info)

    return files, total_lines


def generate_index():
    """Generate comprehensive index of all tools."""
    index = {
        "generated": datetime.now().isoformat(),
        "repository": "system-prompts-and-models-of-ai-tools",
        "version": "2.0",
        "stats": {
            "total_tools": 0,
            "total_files": 0,
            "total_lines": 0,
            "by_category": {},
            "by_type": {}
        },
        "tools": []
    }

    # Scan all directories
    for item in sorted(os.listdir('.')):
        if os.path.isdir(item) and item not in ['.git', 'assets', '.github', 'scripts']:
            # Get metadata
            info = TOOL_INFO.get(item, {
                "name": item,
                "company": "Unknown",
                "category": "Unknown",
                "type": "unknown",
                "description": "No description available",
                "website": None,
                "models": []
            })

            # Analyze files
            files, total_lines = analyze_directory(item)

            tool_data = {
                **info,
                "directory": item,
                "files": files,
                "file_count": len(files),
                "total_lines": total_lines
            }

            index["tools"].append(tool_data)
            index["stats"]["total_tools"] += 1
            index["stats"]["total_files"] += len(files)
            index["stats"]["total_lines"] += total_lines

            # Update category stats
            category = info.get("category", "Unknown")
            index["stats"]["by_category"][category] = index["stats"]["by_category"].get(category, 0) + 1

            # Update type stats
            tool_type = info.get("type", "unknown")
            index["stats"]["by_type"][tool_type] = index["stats"]["by_type"].get(tool_type, 0) + 1

    return index


if __name__ == "__main__":
    print("Generating metadata index...")
    index = generate_index()

    # Write to file
    output_path = "scripts/index.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Generated {output_path}")
    print(f"\nStatistics:")
    print(f"  Total Tools: {index['stats']['total_tools']}")
    print(f"  Total Files: {index['stats']['total_files']}")
    print(f"  Total Lines: {index['stats']['total_lines']:,}")
    print(f"\nBy Category:")
    for cat, count in sorted(index['stats']['by_category'].items()):
        print(f"  {cat}: {count}")
    print(f"\nBy Type:")
    for typ, count in sorted(index['stats']['by_type'].items()):
        print(f"  {typ}: {count}")
