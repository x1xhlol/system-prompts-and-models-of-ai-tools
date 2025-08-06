#!/usr/bin/env python3
"""
Fast N8N Workflow Database
SQLite-based workflow indexer and search engine for instant performance.
"""

import sqlite3
import json
import os
import glob
import datetime
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path

class WorkflowDatabase:
    """High-performance SQLite database for workflow metadata and search."""
    
    def __init__(self, db_path: str = None):
        # Use environment variable if no path provided
        if db_path is None:
            db_path = os.environ.get('WORKFLOW_DB_PATH', 'workflows.db')
        self.db_path = db_path
        self.workflows_dir = "workflows"
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database with optimized schema and indexes."""
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA journal_mode=WAL")  # Write-ahead logging for performance
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute("PRAGMA cache_size=10000")
        conn.execute("PRAGMA temp_store=MEMORY")
        
        # Create main workflows table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS workflows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                workflow_id TEXT,
                active BOOLEAN DEFAULT 0,
                description TEXT,
                trigger_type TEXT,
                complexity TEXT,
                node_count INTEGER DEFAULT 0,
                integrations TEXT,  -- JSON array
                tags TEXT,         -- JSON array
                created_at TEXT,
                updated_at TEXT,
                file_hash TEXT,
                file_size INTEGER,
                analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create FTS5 table for full-text search
        conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS workflows_fts USING fts5(
                filename,
                name,
                description,
                integrations,
                tags,
                content=workflows,
                content_rowid=id
            )
        """)
        
        # Create indexes for fast filtering
        conn.execute("CREATE INDEX IF NOT EXISTS idx_trigger_type ON workflows(trigger_type)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_complexity ON workflows(complexity)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_active ON workflows(active)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_node_count ON workflows(node_count)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_filename ON workflows(filename)")
        
        # Create triggers to keep FTS table in sync
        conn.execute("""
            CREATE TRIGGER IF NOT EXISTS workflows_ai AFTER INSERT ON workflows BEGIN
                INSERT INTO workflows_fts(rowid, filename, name, description, integrations, tags)
                VALUES (new.id, new.filename, new.name, new.description, new.integrations, new.tags);
            END
        """)
        
        conn.execute("""
            CREATE TRIGGER IF NOT EXISTS workflows_ad AFTER DELETE ON workflows BEGIN
                INSERT INTO workflows_fts(workflows_fts, rowid, filename, name, description, integrations, tags)
                VALUES ('delete', old.id, old.filename, old.name, old.description, old.integrations, old.tags);
            END
        """)
        
        conn.execute("""
            CREATE TRIGGER IF NOT EXISTS workflows_au AFTER UPDATE ON workflows BEGIN
                INSERT INTO workflows_fts(workflows_fts, rowid, filename, name, description, integrations, tags)
                VALUES ('delete', old.id, old.filename, old.name, old.description, old.integrations, old.tags);
                INSERT INTO workflows_fts(rowid, filename, name, description, integrations, tags)
                VALUES (new.id, new.filename, new.name, new.description, new.integrations, new.tags);
            END
        """)
        
        conn.commit()
        conn.close()
    
    def get_file_hash(self, file_path: str) -> str:
        """Get MD5 hash of file for change detection."""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def format_workflow_name(self, filename: str) -> str:
        """Convert filename to readable workflow name."""
        # Remove .json extension
        name = filename.replace('.json', '')
        
        # Split by underscores
        parts = name.split('_')
        
        # Skip the first part if it's just a number
        if len(parts) > 1 and parts[0].isdigit():
            parts = parts[1:]
        
        # Convert parts to title case and join with spaces
        readable_parts = []
        for part in parts:
            # Special handling for common terms
            if part.lower() == 'http':
                readable_parts.append('HTTP')
            elif part.lower() == 'api':
                readable_parts.append('API')
            elif part.lower() == 'webhook':
                readable_parts.append('Webhook')
            elif part.lower() == 'automation':
                readable_parts.append('Automation')
            elif part.lower() == 'automate':
                readable_parts.append('Automate')
            elif part.lower() == 'scheduled':
                readable_parts.append('Scheduled')
            elif part.lower() == 'triggered':
                readable_parts.append('Triggered')
            elif part.lower() == 'manual':
                readable_parts.append('Manual')
            else:
                # Capitalize first letter
                readable_parts.append(part.capitalize())
        
        return ' '.join(readable_parts)
    
    def analyze_workflow_file(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Analyze a single workflow file and extract metadata."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            print(f"Error reading {file_path}: {str(e)}")
            return None
        
        filename = os.path.basename(file_path)
        file_size = os.path.getsize(file_path)
        file_hash = self.get_file_hash(file_path)
        
        # Extract basic metadata
        workflow = {
            'filename': filename,
            'name': self.format_workflow_name(filename),
            'workflow_id': data.get('id', ''),
            'active': data.get('active', False),
            'nodes': data.get('nodes', []),
            'connections': data.get('connections', {}),
            'tags': data.get('tags', []),
            'created_at': data.get('createdAt', ''),
            'updated_at': data.get('updatedAt', ''),
            'file_hash': file_hash,
            'file_size': file_size
        }
        
        # Use JSON name if available and meaningful, otherwise use formatted filename
        json_name = data.get('name', '').strip()
        if json_name and json_name != filename.replace('.json', '') and not json_name.startswith('My workflow'):
            workflow['name'] = json_name
        # If no meaningful JSON name, use formatted filename (already set above)
        
        # Analyze nodes
        node_count = len(workflow['nodes'])
        workflow['node_count'] = node_count
        
        # Determine complexity
        if node_count <= 5:
            complexity = 'low'
        elif node_count <= 15:
            complexity = 'medium'
        else:
            complexity = 'high'
        workflow['complexity'] = complexity
        
        # Find trigger type and integrations
        trigger_type, integrations = self.analyze_nodes(workflow['nodes'])
        workflow['trigger_type'] = trigger_type
        workflow['integrations'] = list(integrations)
        
        # Generate description
        workflow['description'] = self.generate_description(workflow, trigger_type, integrations)
        
        return workflow
    
    def analyze_nodes(self, nodes: List[Dict]) -> Tuple[str, set]:
        """Analyze nodes to determine trigger type and integrations."""
        trigger_type = 'Manual'
        integrations = set()
        
        # Enhanced service mapping for better recognition
        service_mappings = {
            # Messaging & Communication
            'telegram': 'Telegram',
            'telegramTrigger': 'Telegram',
            'discord': 'Discord',
            'slack': 'Slack', 
            'whatsapp': 'WhatsApp',
            'mattermost': 'Mattermost',
            'teams': 'Microsoft Teams',
            'rocketchat': 'Rocket.Chat',
            
            # Email
            'gmail': 'Gmail',
            'mailjet': 'Mailjet',
            'emailreadimap': 'Email (IMAP)',
            'emailsendsmt': 'Email (SMTP)',
            'outlook': 'Outlook',
            
            # Cloud Storage
            'googledrive': 'Google Drive',
            'googledocs': 'Google Docs',
            'googlesheets': 'Google Sheets',
            'dropbox': 'Dropbox',
            'onedrive': 'OneDrive',
            'box': 'Box',
            
            # Databases
            'postgres': 'PostgreSQL',
            'mysql': 'MySQL',
            'mongodb': 'MongoDB',
            'redis': 'Redis',
            'airtable': 'Airtable',
            'notion': 'Notion',
            
            # Project Management
            'jira': 'Jira',
            'github': 'GitHub',
            'gitlab': 'GitLab',
            'trello': 'Trello',
            'asana': 'Asana',
            'mondaycom': 'Monday.com',
            
            # AI/ML Services
            'openai': 'OpenAI',
            'anthropic': 'Anthropic',
            'huggingface': 'Hugging Face',
            
            # Social Media
            'linkedin': 'LinkedIn',
            'twitter': 'Twitter/X',
            'facebook': 'Facebook',
            'instagram': 'Instagram',
            
            # E-commerce
            'shopify': 'Shopify',
            'stripe': 'Stripe',
            'paypal': 'PayPal',
            
            # Analytics
            'googleanalytics': 'Google Analytics',
            'mixpanel': 'Mixpanel',
            
            # Calendar & Tasks
            'googlecalendar': 'Google Calendar', 
            'googletasks': 'Google Tasks',
            'cal': 'Cal.com',
            'calendly': 'Calendly',
            
            # Forms & Surveys
            'typeform': 'Typeform',
            'googleforms': 'Google Forms',
            'form': 'Form Trigger',
            
            # Development Tools
            'webhook': 'Webhook',
            'httpRequest': 'HTTP Request',
            'graphql': 'GraphQL',
            'sse': 'Server-Sent Events',
            
            # Utility nodes (exclude from integrations)
            'set': None,
            'function': None,
            'code': None,
            'if': None,
            'switch': None,
            'merge': None,
            'split': None,
            'stickynote': None,
            'stickyNote': None,
            'wait': None,
            'schedule': None,
            'cron': None,
            'manual': None,
            'stopanderror': None,
            'noop': None,
            'noOp': None,
            'error': None,
            'limit': None,
            'aggregate': None,
            'summarize': None,
            'filter': None,
            'sort': None,
            'removeDuplicates': None,
            'dateTime': None,
            'extractFromFile': None,
            'convertToFile': None,
            'readBinaryFile': None,
            'readBinaryFiles': None,
            'executionData': None,
            'executeWorkflow': None,
            'executeCommand': None,
            'respondToWebhook': None,
        }
        
        for node in nodes:
            node_type = node.get('type', '')
            node_name = node.get('name', '').lower()
            
            # Determine trigger type
            if 'webhook' in node_type.lower() or 'webhook' in node_name:
                trigger_type = 'Webhook'
            elif 'cron' in node_type.lower() or 'schedule' in node_type.lower():
                trigger_type = 'Scheduled'
            elif 'trigger' in node_type.lower() and trigger_type == 'Manual':
                if 'manual' not in node_type.lower():
                    trigger_type = 'Webhook'
            
            # Extract integrations with enhanced mapping
            service_name = None
            
            # Handle n8n-nodes-base nodes
            if node_type.startswith('n8n-nodes-base.'):
                raw_service = node_type.replace('n8n-nodes-base.', '').lower()
                raw_service = raw_service.replace('trigger', '')
                service_name = service_mappings.get(raw_service, raw_service.title() if raw_service else None)
            
            # Handle @n8n/ namespaced nodes
            elif node_type.startswith('@n8n/'):
                raw_service = node_type.split('.')[-1].lower() if '.' in node_type else node_type.lower()
                raw_service = raw_service.replace('trigger', '')
                service_name = service_mappings.get(raw_service, raw_service.title() if raw_service else None)
            
            # Handle custom nodes
            elif '-' in node_type:
                # Try to extract service name from custom node names like "n8n-nodes-youtube-transcription-kasha.youtubeTranscripter"
                parts = node_type.lower().split('.')
                for part in parts:
                    if 'youtube' in part:
                        service_name = 'YouTube'
                        break
                    elif 'telegram' in part:
                        service_name = 'Telegram'
                        break
                    elif 'discord' in part:
                        service_name = 'Discord'
                        break
            
            # Also check node names for service hints
            for service_key, service_value in service_mappings.items():
                if service_key in node_name and service_value:
                    service_name = service_value
                    break
            
            # Add to integrations if valid service found
            if service_name and service_name not in ['None', None]:
                integrations.add(service_name)
        
        # Determine if complex based on node variety and count
        if len(nodes) > 10 and len(integrations) > 3:
            trigger_type = 'Complex'
        
        return trigger_type, integrations
    
    def generate_description(self, workflow: Dict, trigger_type: str, integrations: set) -> str:
        """Generate a descriptive summary of the workflow."""
        name = workflow['name']
        node_count = workflow['node_count']
        
        # Start with trigger description
        trigger_descriptions = {
            'Webhook': "Webhook-triggered automation that",
            'Scheduled': "Scheduled automation that", 
            'Complex': "Complex multi-step automation that",
        }
        desc = trigger_descriptions.get(trigger_type, "Manual workflow that")
        
        # Add functionality based on name and integrations
        if integrations:
            main_services = list(integrations)[:3]
            if len(main_services) == 1:
                desc += f" integrates with {main_services[0]}"
            elif len(main_services) == 2:
                desc += f" connects {main_services[0]} and {main_services[1]}"
            else:
                desc += f" orchestrates {', '.join(main_services[:-1])}, and {main_services[-1]}"
        
        # Add workflow purpose hints from name
        name_lower = name.lower()
        if 'create' in name_lower:
            desc += " to create new records"
        elif 'update' in name_lower:
            desc += " to update existing data"
        elif 'sync' in name_lower:
            desc += " to synchronize data"
        elif 'notification' in name_lower or 'alert' in name_lower:
            desc += " for notifications and alerts"
        elif 'backup' in name_lower:
            desc += " for data backup operations"
        elif 'monitor' in name_lower:
            desc += " for monitoring and reporting"
        else:
            desc += " for data processing"
        
        desc += f". Uses {node_count} nodes"
        if len(integrations) > 3:
            desc += f" and integrates with {len(integrations)} services"
        
        return desc + "."
    
    def index_all_workflows(self, force_reindex: bool = False) -> Dict[str, int]:
        """Index all workflow files. Only reprocesses changed files unless force_reindex=True."""
        if not os.path.exists(self.workflows_dir):
            print(f"Warning: Workflows directory '{self.workflows_dir}' not found.")
            return {'processed': 0, 'skipped': 0, 'errors': 0}
        
        json_files = glob.glob(os.path.join(self.workflows_dir, "*.json"))
        
        if not json_files:
            print(f"Warning: No JSON files found in '{self.workflows_dir}' directory.")
            return {'processed': 0, 'skipped': 0, 'errors': 0}
        
        print(f"Indexing {len(json_files)} workflow files...")
        
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        stats = {'processed': 0, 'skipped': 0, 'errors': 0}
        
        for file_path in json_files:
            filename = os.path.basename(file_path)
            
            try:
                # Check if file needs to be reprocessed
                if not force_reindex:
                    current_hash = self.get_file_hash(file_path)
                    cursor = conn.execute(
                        "SELECT file_hash FROM workflows WHERE filename = ?", 
                        (filename,)
                    )
                    row = cursor.fetchone()
                    if row and row['file_hash'] == current_hash:
                        stats['skipped'] += 1
                        continue
                
                # Analyze workflow
                workflow_data = self.analyze_workflow_file(file_path)
                if not workflow_data:
                    stats['errors'] += 1
                    continue
                
                # Insert or update in database
                conn.execute("""
                    INSERT OR REPLACE INTO workflows (
                        filename, name, workflow_id, active, description, trigger_type,
                        complexity, node_count, integrations, tags, created_at, updated_at,
                        file_hash, file_size, analyzed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    workflow_data['filename'],
                    workflow_data['name'],
                    workflow_data['workflow_id'],
                    workflow_data['active'],
                    workflow_data['description'],
                    workflow_data['trigger_type'],
                    workflow_data['complexity'],
                    workflow_data['node_count'],
                    json.dumps(workflow_data['integrations']),
                    json.dumps(workflow_data['tags']),
                    workflow_data['created_at'],
                    workflow_data['updated_at'],
                    workflow_data['file_hash'],
                    workflow_data['file_size']
                ))
                
                stats['processed'] += 1
                
            except Exception as e:
                print(f"Error processing {file_path}: {str(e)}")
                stats['errors'] += 1
                continue
        
        conn.commit()
        conn.close()
        
        print(f"✅ Indexing complete: {stats['processed']} processed, {stats['skipped']} skipped, {stats['errors']} errors")
        return stats
    
    def search_workflows(self, query: str = "", trigger_filter: str = "all", 
                        complexity_filter: str = "all", active_only: bool = False,
                        limit: int = 50, offset: int = 0) -> Tuple[List[Dict], int]:
        """Fast search with filters and pagination."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        # Build WHERE clause
        where_conditions = []
        params = []
        
        if active_only:
            where_conditions.append("w.active = 1")
        
        if trigger_filter != "all":
            where_conditions.append("w.trigger_type = ?")
            params.append(trigger_filter)
        
        if complexity_filter != "all":
            where_conditions.append("w.complexity = ?")
            params.append(complexity_filter)
        
        # Use FTS search if query provided
        if query.strip():
            # FTS search with ranking
            base_query = """
                SELECT w.*, rank
                FROM workflows_fts fts
                JOIN workflows w ON w.id = fts.rowid
                WHERE workflows_fts MATCH ?
            """
            params.insert(0, query)
        else:
            # Regular query without FTS
            base_query = """
                SELECT w.*, 0 as rank
                FROM workflows w
                WHERE 1=1
            """
        
        if where_conditions:
            base_query += " AND " + " AND ".join(where_conditions)
        
        # Count total results
        count_query = f"SELECT COUNT(*) as total FROM ({base_query}) t"
        cursor = conn.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        # Get paginated results
        if query.strip():
            base_query += " ORDER BY rank"
        else:
            base_query += " ORDER BY w.analyzed_at DESC"
        
        base_query += f" LIMIT {limit} OFFSET {offset}"
        
        cursor = conn.execute(base_query, params)
        rows = cursor.fetchall()
        
        # Convert to dictionaries and parse JSON fields
        results = []
        for row in rows:
            workflow = dict(row)
            workflow['integrations'] = json.loads(workflow['integrations'] or '[]')
            
            # Parse tags and convert dict tags to strings
            raw_tags = json.loads(workflow['tags'] or '[]')
            clean_tags = []
            for tag in raw_tags:
                if isinstance(tag, dict):
                    # Extract name from tag dict if available
                    clean_tags.append(tag.get('name', str(tag.get('id', 'tag'))))
                else:
                    clean_tags.append(str(tag))
            workflow['tags'] = clean_tags
            
            results.append(workflow)
        
        conn.close()
        return results, total
    
    def get_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        # Basic counts
        cursor = conn.execute("SELECT COUNT(*) as total FROM workflows")
        total = cursor.fetchone()['total']
        
        cursor = conn.execute("SELECT COUNT(*) as active FROM workflows WHERE active = 1")
        active = cursor.fetchone()['active']
        
        # Trigger type breakdown
        cursor = conn.execute("""
            SELECT trigger_type, COUNT(*) as count 
            FROM workflows 
            GROUP BY trigger_type
        """)
        triggers = {row['trigger_type']: row['count'] for row in cursor.fetchall()}
        
        # Complexity breakdown
        cursor = conn.execute("""
            SELECT complexity, COUNT(*) as count 
            FROM workflows 
            GROUP BY complexity
        """)
        complexity = {row['complexity']: row['count'] for row in cursor.fetchall()}
        
        # Node stats
        cursor = conn.execute("SELECT SUM(node_count) as total_nodes FROM workflows")
        total_nodes = cursor.fetchone()['total_nodes'] or 0
        
        # Unique integrations count
        cursor = conn.execute("SELECT integrations FROM workflows WHERE integrations != '[]'")
        all_integrations = set()
        for row in cursor.fetchall():
            integrations = json.loads(row['integrations'])
            all_integrations.update(integrations)
        
        conn.close()
        
        return {
            'total': total,
            'active': active,
            'inactive': total - active,
            'triggers': triggers,
            'complexity': complexity,
            'total_nodes': total_nodes,
            'unique_integrations': len(all_integrations),
            'last_indexed': datetime.datetime.now().isoformat()
        }

    def get_service_categories(self) -> Dict[str, List[str]]:
        """Get service categories for enhanced filtering."""
        return {
            'messaging': ['Telegram', 'Discord', 'Slack', 'WhatsApp', 'Mattermost', 'Microsoft Teams', 'Rocket.Chat'],
            'email': ['Gmail', 'Mailjet', 'Email (IMAP)', 'Email (SMTP)', 'Outlook'],
            'cloud_storage': ['Google Drive', 'Google Docs', 'Google Sheets', 'Dropbox', 'OneDrive', 'Box'],
            'database': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Airtable', 'Notion'],
            'project_management': ['Jira', 'GitHub', 'GitLab', 'Trello', 'Asana', 'Monday.com'],
            'ai_ml': ['OpenAI', 'Anthropic', 'Hugging Face'],
            'social_media': ['LinkedIn', 'Twitter/X', 'Facebook', 'Instagram'],
            'ecommerce': ['Shopify', 'Stripe', 'PayPal'],
            'analytics': ['Google Analytics', 'Mixpanel'],
            'calendar_tasks': ['Google Calendar', 'Google Tasks', 'Cal.com', 'Calendly'],
            'forms': ['Typeform', 'Google Forms', 'Form Trigger'],
            'development': ['Webhook', 'HTTP Request', 'GraphQL', 'Server-Sent Events', 'YouTube']
        }

    def search_by_category(self, category: str, limit: int = 50, offset: int = 0) -> Tuple[List[Dict], int]:
        """Search workflows by service category."""
        categories = self.get_service_categories()
        if category not in categories:
            return [], 0
        
        services = categories[category]
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        
        # Build OR conditions for all services in category
        service_conditions = []
        params = []
        for service in services:
            service_conditions.append("integrations LIKE ?")
            params.append(f'%"{service}"%')
        
        where_clause = " OR ".join(service_conditions)
        
        # Count total results
        count_query = f"SELECT COUNT(*) as total FROM workflows WHERE {where_clause}"
        cursor = conn.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        # Get paginated results
        query = f"""
            SELECT * FROM workflows 
            WHERE {where_clause}
            ORDER BY analyzed_at DESC
            LIMIT {limit} OFFSET {offset}
        """
        
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()
        
        # Convert to dictionaries and parse JSON fields
        results = []
        for row in rows:
            workflow = dict(row)
            workflow['integrations'] = json.loads(workflow['integrations'] or '[]')
            raw_tags = json.loads(workflow['tags'] or '[]')
            clean_tags = []
            for tag in raw_tags:
                if isinstance(tag, dict):
                    clean_tags.append(tag.get('name', str(tag.get('id', 'tag'))))
                else:
                    clean_tags.append(str(tag))
            workflow['tags'] = clean_tags
            results.append(workflow)
        
        conn.close()
        return results, total


def main():
    """Command-line interface for workflow database."""
    import argparse
    
    parser = argparse.ArgumentParser(description='N8N Workflow Database')
    parser.add_argument('--index', action='store_true', help='Index all workflows')
    parser.add_argument('--force', action='store_true', help='Force reindex all files')
    parser.add_argument('--search', help='Search workflows')
    parser.add_argument('--stats', action='store_true', help='Show database statistics')
    
    args = parser.parse_args()
    
    db = WorkflowDatabase()
    
    if args.index:
        stats = db.index_all_workflows(force_reindex=args.force)
        print(f"Indexed {stats['processed']} workflows")
    
    elif args.search:
        results, total = db.search_workflows(args.search, limit=10)
        print(f"Found {total} workflows:")
        for workflow in results:
            print(f"  - {workflow['name']} ({workflow['trigger_type']}, {workflow['node_count']} nodes)")
    
    elif args.stats:
        stats = db.get_stats()
        print(f"Database Statistics:")
        print(f"  Total workflows: {stats['total']}")
        print(f"  Active: {stats['active']}")
        print(f"  Total nodes: {stats['total_nodes']}")
        print(f"  Unique integrations: {stats['unique_integrations']}")
        print(f"  Trigger types: {stats['triggers']}")
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()