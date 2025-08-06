#!/usr/bin/env python3
"""
N8N Workflow Importer
Python replacement for import-workflows.sh with better error handling and progress tracking.
"""

import json
import subprocess
import sys
from pathlib import Path
from typing import List, Dict, Any


class WorkflowImporter:
    """Import n8n workflows with progress tracking and error handling."""
    
    def __init__(self, workflows_dir: str = "workflows"):
        self.workflows_dir = Path(workflows_dir)
        self.imported_count = 0
        self.failed_count = 0
        self.errors = []

    def validate_workflow(self, file_path: Path) -> bool:
        """Validate workflow JSON before import."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Basic validation
            if not isinstance(data, dict):
                return False
            
            # Check required fields
            required_fields = ['nodes', 'connections']
            for field in required_fields:
                if field not in data:
                    return False
            
            return True
        except (json.JSONDecodeError, FileNotFoundError, PermissionError):
            return False

    def import_workflow(self, file_path: Path) -> bool:
        """Import a single workflow file."""
        try:
            # Validate first
            if not self.validate_workflow(file_path):
                self.errors.append(f"Invalid JSON: {file_path.name}")
                return False
            
            # Run n8n import command
            result = subprocess.run([
                'npx', 'n8n', 'import:workflow', 
                f'--input={file_path}'
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print(f"✅ Imported: {file_path.name}")
                return True
            else:
                error_msg = result.stderr.strip() or result.stdout.strip()
                self.errors.append(f"Import failed for {file_path.name}: {error_msg}")
                print(f"❌ Failed: {file_path.name}")
                return False
                
        except subprocess.TimeoutExpired:
            self.errors.append(f"Timeout importing {file_path.name}")
            print(f"⏰ Timeout: {file_path.name}")
            return False
        except Exception as e:
            self.errors.append(f"Error importing {file_path.name}: {str(e)}")
            print(f"❌ Error: {file_path.name} - {str(e)}")
            return False

    def get_workflow_files(self) -> List[Path]:
        """Get all workflow JSON files."""
        if not self.workflows_dir.exists():
            print(f"❌ Workflows directory not found: {self.workflows_dir}")
            return []
        
        json_files = list(self.workflows_dir.glob("*.json"))
        if not json_files:
            print(f"❌ No JSON files found in: {self.workflows_dir}")
            return []
        
        return sorted(json_files)

    def import_all(self) -> Dict[str, Any]:
        """Import all workflow files."""
        workflow_files = self.get_workflow_files()
        total_files = len(workflow_files)
        
        if total_files == 0:
            return {"success": False, "message": "No workflow files found"}
        
        print(f"🚀 Starting import of {total_files} workflows...")
        print("-" * 50)
        
        for i, file_path in enumerate(workflow_files, 1):
            print(f"[{i}/{total_files}] Processing {file_path.name}...")
            
            if self.import_workflow(file_path):
                self.imported_count += 1
            else:
                self.failed_count += 1
        
        # Summary
        print("\n" + "=" * 50)
        print(f"📊 Import Summary:")
        print(f"✅ Successfully imported: {self.imported_count}")
        print(f"❌ Failed imports: {self.failed_count}")
        print(f"📁 Total files: {total_files}")
        
        if self.errors:
            print(f"\n❌ Errors encountered:")
            for error in self.errors[:10]:  # Show first 10 errors
                print(f"   • {error}")
            if len(self.errors) > 10:
                print(f"   ... and {len(self.errors) - 10} more errors")
        
        return {
            "success": self.failed_count == 0,
            "imported": self.imported_count,
            "failed": self.failed_count,
            "total": total_files,
            "errors": self.errors
        }


def check_n8n_available() -> bool:
    """Check if n8n CLI is available."""
    try:
        result = subprocess.run(
            ['npx', 'n8n', '--version'], 
            capture_output=True, text=True, timeout=10
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def main():
    """Main entry point."""
    print("🔧 N8N Workflow Importer")
    print("=" * 40)
    
    # Check if n8n is available
    if not check_n8n_available():
        print("❌ n8n CLI not found. Please install n8n first:")
        print("   npm install -g n8n")
        sys.exit(1)
    
    # Create importer and run
    importer = WorkflowImporter()
    result = importer.import_all()
    
    # Exit with appropriate code
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main() 