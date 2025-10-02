#!/usr/bin/env python3
"""
Metadata Generation Script for AI Coding Tools Repository
Automatically generates or updates metadata JSON files for tools
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Optional
import hashlib

class MetadataGenerator:
    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)
        self.metadata_dir = self.repo_path / "metadata"
        self.metadata_dir.mkdir(exist_ok=True)
        
    def scan_tool_directories(self) -> List[str]:
        """Scan repository for tool directories"""
        exclude_dirs = {'.git', '.github', 'site', 'assets', 'node_modules', 
                       'metadata', 'scripts', 'Open Source prompts'}
        
        tool_dirs = []
        for item in self.repo_path.iterdir():
            if item.is_dir() and item.name not in exclude_dirs:
                tool_dirs.append(item.name)
        
        return sorted(tool_dirs)
    
    def slugify(self, text: str) -> str:
        """Convert tool name to slug"""
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[-\s]+', '-', text)
        return text.strip('-')
    
    def detect_tool_type(self, tool_name: str, files: List[str]) -> str:
        """Detect tool type from name and files"""
        name_lower = tool_name.lower()
        
        if 'cli' in name_lower or 'terminal' in name_lower:
            return "CLI Tool"
        elif 'web' in name_lower or 'app' in name_lower or 'dev' in name_lower:
            return "Web Platform"
        elif 'agent' in name_lower or 'devin' in name_lower or 'poke' in name_lower:
            return "Autonomous Agent"
        else:
            return "IDE Plugin"
    
    def analyze_prompt_file(self, file_path: Path) -> Dict:
        """Analyze prompt file for patterns and features"""
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
        except:
            return {}
        
        content_lower = content.lower()
        
        # Detect patterns
        patterns = {
            'conciseness': self.detect_conciseness(content),
            'parallelTools': any(word in content_lower for word in ['parallel', 'concurrently', 'simultaneously']),
            'subAgents': any(word in content_lower for word in ['sub-agent', 'sub agent', 'delegate']),
            'verificationGates': any(word in content_lower for word in ['verify', 'validation', 'check', 'ensure']),
            'todoSystem': any(word in content_lower for word in ['todo', 'task list', 'manage_todo']),
            'memoryContext': any(word in content_lower for word in ['memory', 'context', 'agents.md']),
            'agentsFile': 'agents.md' in content_lower
        }
        
        # Detect features
        features = {
            'codeGeneration': True,  # Assume all have this
            'codeCompletion': 'completion' in content_lower or 'autocomplete' in content_lower,
            'chatInterface': 'chat' in content_lower or 'conversation' in content_lower,
            'agentMode': 'agent' in content_lower,
            'parallelExecution': patterns['parallelTools'],
            'memorySystem': patterns['memoryContext'],
            'todoTracking': patterns['todoSystem'],
            'gitIntegration': 'git' in content_lower,
            'multiFileEditing': any(word in content_lower for word in ['multi-file', 'multiple files', 'many files']),
            'testGeneration': 'test' in content_lower,
            'refactoring': 'refactor' in content_lower,
            'debugging': 'debug' in content_lower or 'bug' in content_lower
        }
        
        # Security rules count
        security_keywords = ['secret', 'password', 'api key', 'token', 'credential', 
                           'sensitive', 'private', 'security', 'encrypt']
        security_count = sum(1 for keyword in security_keywords if keyword in content_lower)
        
        # Calculate metrics
        metrics = {
            'promptTokens': len(content.split()) * 1.3,  # Rough estimate
            'securityRules': security_count,
            'concisenessScore': self.calculate_conciseness_score(content)
        }
        
        return {
            'patterns': patterns,
            'features': features,
            'metrics': metrics
        }
    
    def detect_conciseness(self, content: str) -> str:
        """Detect conciseness level from content"""
        content_lower = content.lower()
        indicators = [
            'be concise', 'brief', 'minimal', 'short', 'terse',
            'keep.*concise', 'avoid.*verbose', 'succinct'
        ]
        
        score = sum(1 for indicator in indicators if re.search(indicator, content_lower))
        
        if score >= 3:
            return "very-high"
        elif score >= 2:
            return "high"
        elif score >= 1:
            return "medium"
        else:
            return "low"
    
    def calculate_conciseness_score(self, content: str) -> int:
        """Calculate numeric conciseness score (0-100)"""
        content_lower = content.lower()
        
        # Positive indicators
        positive = [
            'concise', 'brief', 'short', 'minimal', 'terse', 'succinct',
            'keep it brief', 'be direct', 'avoid verbosity'
        ]
        
        # Negative indicators
        negative = [
            'detailed', 'comprehensive', 'thorough', 'verbose', 'explain fully'
        ]
        
        pos_score = sum(10 for word in positive if word in content_lower)
        neg_score = sum(5 for word in negative if word in content_lower)
        
        # Base score
        score = 50 + pos_score - neg_score
        
        # Clamp to 0-100
        return max(0, min(100, score))
    
    def analyze_tools_file(self, file_path: Path) -> Dict:
        """Analyze tools JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Count tools/functions
            tools_count = 0
            if isinstance(data, list):
                tools_count = len(data)
            elif isinstance(data, dict):
                tools_count = len(data.get('functions', []))
            
            return {'toolsCount': tools_count}
        except:
            return {'toolsCount': 0}
    
    def detect_versions(self, tool_dir: Path) -> List[str]:
        """Detect multiple versions of prompts"""
        versions = []
        
        for file in tool_dir.glob('*.txt'):
            name = file.stem.lower()
            
            # Look for version patterns
            version_patterns = [
                r'v\d+\.\d+',  # v1.0, v2.3
                r'version\s*\d+',  # version 1
                r'wave\s*\d+',  # wave 11
                r'agent',  # agent version
                r'\d{4}-\d{2}-\d{2}'  # date-based
            ]
            
            for pattern in version_patterns:
                match = re.search(pattern, name)
                if match:
                    versions.append(match.group())
        
        return versions if versions else ['1.0']
    
    def generate_metadata(self, tool_name: str) -> Dict:
        """Generate metadata for a tool"""
        tool_dir = self.repo_path / tool_name
        slug = self.slugify(tool_name)
        
        # Scan files
        files = list(tool_dir.glob('*'))
        file_names = [f.name for f in files]
        
        # Find main files
        prompt_file = None
        tools_file = None
        readme_file = None
        
        for f in files:
            if f.suffix == '.txt' and 'prompt' in f.stem.lower():
                prompt_file = f
            elif f.suffix == '.json' and 'tool' in f.stem.lower():
                tools_file = f
            elif f.name.lower() == 'readme.md':
                readme_file = f
        
        # Analyze content
        analysis = {}
        if prompt_file:
            analysis = self.analyze_prompt_file(prompt_file)
        
        tools_analysis = {}
        if tools_file:
            tools_analysis = self.analyze_tools_file(tools_file)
        
        # Detect versions
        versions = self.detect_versions(tool_dir)
        
        # Build metadata
        metadata = {
            "name": tool_name,
            "slug": slug,
            "type": self.detect_tool_type(tool_name, file_names),
            "status": "active",
            "description": f"AI coding assistant - {tool_name}",
            "version": {
                "current": versions[-1] if versions else "1.0",
                "lastUpdated": "2025-01-02",
                "history": [
                    {
                        "version": v,
                        "date": "2025-01-02",
                        "changes": "Version tracked"
                    } for v in versions
                ]
            },
            "pricing": {
                "model": "unknown",
                "tiers": []
            },
            "models": {
                "primary": "Unknown",
                "supported": [],
                "customizable": False
            },
            "features": analysis.get('features', {}),
            "platforms": {
                "vscode": "vscode" in slug or "cursor" in slug,
                "jetbrains": "jetbrains" in slug,
                "web": self.detect_tool_type(tool_name, file_names) == "Web Platform",
                "cli": self.detect_tool_type(tool_name, file_names) == "CLI Tool",
                "standalone": False
            },
            "patterns": analysis.get('patterns', {}),
            "documentation": {
                "folder": tool_name,
                "files": {
                    "systemPrompt": prompt_file.name if prompt_file else None,
                    "tools": tools_file.name if tools_file else None,
                    "readme": readme_file.name if readme_file else None
                },
                "hasMultipleVersions": len(versions) > 1,
                "versions": versions
            },
            "links": {
                "website": None,
                "docs": None,
                "github": None,
                "pricing": None
            },
            "tags": [
                self.detect_tool_type(tool_name, file_names),
                "AI Coding"
            ],
            "metrics": {
                **analysis.get('metrics', {}),
                **tools_analysis
            }
        }
        
        return metadata
    
    def save_metadata(self, tool_name: str, metadata: Dict):
        """Save metadata to JSON file"""
        slug = self.slugify(tool_name)
        output_file = self.metadata_dir / f"{slug}.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Generated: {output_file}")
    
    def generate_all(self):
        """Generate metadata for all tools"""
        tools = self.scan_tool_directories()
        print(f"📊 Found {len(tools)} tools")
        print()
        
        for tool in tools:
            try:
                print(f"🔍 Analyzing: {tool}")
                metadata = self.generate_metadata(tool)
                self.save_metadata(tool, metadata)
            except Exception as e:
                print(f"❌ Error processing {tool}: {e}")
        
        print()
        print(f"✅ Generated metadata for {len(tools)} tools")
        print(f"📁 Saved to: {self.metadata_dir}")
    
    def validate_metadata(self, file_path: Path) -> List[str]:
        """Validate metadata file"""
        errors = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            return [f"Invalid JSON: {e}"]
        
        # Check required fields
        required = ['name', 'slug', 'type', 'status', 'description']
        for field in required:
            if field not in data:
                errors.append(f"Missing required field: {field}")
        
        # Check types
        if 'type' in data and data['type'] not in ['IDE Plugin', 'CLI Tool', 'Web Platform', 'Autonomous Agent']:
            errors.append(f"Invalid type: {data['type']}")
        
        if 'status' in data and data['status'] not in ['active', 'beta', 'deprecated']:
            errors.append(f"Invalid status: {data['status']}")
        
        return errors
    
    def validate_all(self):
        """Validate all metadata files"""
        metadata_files = list(self.metadata_dir.glob('*.json'))
        
        print(f"🔍 Validating {len(metadata_files)} metadata files")
        print()
        
        errors_found = 0
        for file in metadata_files:
            errors = self.validate_metadata(file)
            if errors:
                print(f"❌ {file.name}:")
                for error in errors:
                    print(f"   - {error}")
                errors_found += len(errors)
            else:
                print(f"✅ {file.name}")
        
        print()
        if errors_found == 0:
            print("✅ All metadata files are valid!")
        else:
            print(f"❌ Found {errors_found} validation errors")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate metadata for AI coding tools')
    parser.add_argument('--tool', help='Generate metadata for specific tool')
    parser.add_argument('--all', action='store_true', help='Generate metadata for all tools')
    parser.add_argument('--validate', action='store_true', help='Validate all metadata files')
    parser.add_argument('--repo', default='.', help='Repository path')
    
    args = parser.parse_args()
    
    generator = MetadataGenerator(args.repo)
    
    if args.validate:
        generator.validate_all()
    elif args.all:
        generator.generate_all()
    elif args.tool:
        print(f"🔍 Generating metadata for: {args.tool}")
        metadata = generator.generate_metadata(args.tool)
        generator.save_metadata(args.tool, metadata)
        print("✅ Done!")
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
