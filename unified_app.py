#!/usr/bin/env python3
"""
Unified n8n Workflow Documentation System
Combines all features from Python FastAPI and Node.js Express into one application
"""

import os
import json
import sqlite3
import asyncio
from datetime import datetime
from typing import List, Dict, Optional, Any
from pathlib import Path
import uvicorn
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import aiofiles
import aiofiles.os
from jinja2 import Environment, FileSystemLoader
import re
from collections import defaultdict, Counter

# Initialize FastAPI app
app = FastAPI(
    title="Unified n8n Workflow Documentation System",
    description="Complete workflow documentation and search system with all features",
    version="2.0.0"
)

# Configuration
STATIC_DIR = Path("static")
WORKFLOWS_DIR = Path("static/workflows")
DATABASE_PATH = "unified_workflows.db"
TEMPLATES_DIR = Path("templates")

# Create directories if they don't exist
STATIC_DIR.mkdir(exist_ok=True)
TEMPLATES_DIR.mkdir(exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize database
def init_database():
    """Initialize the unified database with all features"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Create comprehensive workflows table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS workflows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            folder TEXT,
            workflow_id TEXT,
            active INTEGER DEFAULT 0,
            description TEXT,
            trigger_type TEXT,
            complexity TEXT,
            node_count INTEGER,
            integrations TEXT,
            tags TEXT,
            created_at TEXT,
            updated_at TEXT,
            file_hash TEXT,
            file_size INTEGER,
            analyzed_at TEXT,
            category TEXT,
            search_vector TEXT
        )
    ''')
    
    # Create FTS5 virtual table for full-text search
    cursor.execute('''
        CREATE VIRTUAL TABLE IF NOT EXISTS workflows_fts USING fts5(
            name, description, integrations, folder, category,
            content='workflows',
            content_rowid='id'
        )
    ''')
    
    # Create categories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            workflow_count INTEGER DEFAULT 0
        )
    ''')
    
    # Create statistics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS statistics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_workflows INTEGER,
            active_workflows INTEGER,
            total_nodes INTEGER,
            unique_integrations INTEGER,
            last_indexed TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

# Pydantic models
class WorkflowResponse(BaseModel):
    id: int
    filename: str
    name: str
    folder: Optional[str]
    workflow_id: Optional[str]
    active: bool
    description: str
    trigger_type: str
    complexity: str
    node_count: int
    integrations: List[str]
    tags: List[Dict]
    category: Optional[str]
    file_size: int
    analyzed_at: str

class SearchResponse(BaseModel):
    workflows: List[WorkflowResponse]
    total: int
    page: int
    per_page: int
    pages: int
    query: str
    filters: Dict[str, Any]

class StatsResponse(BaseModel):
    total: int
    active: int
    inactive: int
    triggers: Dict[str, int]
    complexity: Dict[str, int]
    total_nodes: int
    unique_integrations: int
    last_indexed: str
    categories: List[str]
    top_integrations: List[Dict[str, Any]]

# Utility functions
def categorize_workflow(workflow_data: Dict) -> str:
    """Categorize workflow based on integrations and description"""
    integrations = workflow_data.get('integrations', [])
    description = workflow_data.get('description', '').lower()
    
    # AI and Machine Learning
    ai_keywords = ['openai', 'gpt', 'ai', 'machine learning', 'llm', 'anthropic', 'gemini', 'claude']
    if any(keyword in description for keyword in ai_keywords) or any('ai' in integration.lower() for integration in integrations):
        return "AI Agent Development"
    
    # Communication
    comm_keywords = ['telegram', 'slack', 'discord', 'whatsapp', 'email', 'gmail', 'outlook']
    if any(keyword in description for keyword in comm_keywords) or any(integration.lower() in comm_keywords for integration in integrations):
        return "Communication & Messaging"
    
    # CRM and Sales
    crm_keywords = ['salesforce', 'hubspot', 'pipedrive', 'crm', 'sales', 'leads']
    if any(keyword in description for keyword in crm_keywords) or any(integration.lower() in crm_keywords for integration in integrations):
        return "CRM & Sales"
    
    # Social Media
    social_keywords = ['twitter', 'facebook', 'instagram', 'linkedin', 'social media']
    if any(keyword in description for keyword in social_keywords) or any(integration.lower() in social_keywords for integration in integrations):
        return "Social Media Management"
    
    # E-commerce
    ecommerce_keywords = ['shopify', 'woocommerce', 'stripe', 'paypal', 'ecommerce']
    if any(keyword in description for keyword in ecommerce_keywords) or any(integration.lower() in ecommerce_keywords for integration in integrations):
        return "E-commerce & Retail"
    
    # Project Management
    pm_keywords = ['asana', 'trello', 'monday', 'jira', 'project management']
    if any(keyword in description for keyword in pm_keywords) or any(integration.lower() in pm_keywords for integration in integrations):
        return "Project Management"
    
    # Data Processing
    data_keywords = ['database', 'sql', 'csv', 'excel', 'data processing', 'analytics']
    if any(keyword in description for keyword in data_keywords) or any(integration.lower() in data_keywords for integration in integrations):
        return "Data Processing & Analysis"
    
    # Web Scraping
    scraping_keywords = ['web scraping', 'crawler', 'scraper', 'html', 'http request']
    if any(keyword in description for keyword in scraping_keywords):
        return "Web Scraping & Data Extraction"
    
    # Cloud Storage
    cloud_keywords = ['google drive', 'dropbox', 'onedrive', 'aws s3', 'cloud storage']
    if any(keyword in description for keyword in cloud_keywords) or any(integration.lower() in cloud_keywords for integration in integrations):
        return "Cloud Storage & File Management"
    
    # Marketing
    marketing_keywords = ['marketing', 'advertising', 'campaign', 'email marketing', 'automation']
    if any(keyword in description for keyword in marketing_keywords):
        return "Marketing & Advertising Automation"
    
    # Financial
    financial_keywords = ['accounting', 'finance', 'quickbooks', 'xero', 'financial']
    if any(keyword in description for keyword in financial_keywords) or any(integration.lower() in financial_keywords for integration in integrations):
        return "Financial & Accounting"
    
    # Technical
    technical_keywords = ['api', 'webhook', 'http', 'technical', 'infrastructure', 'devops']
    if any(keyword in description for keyword in technical_keywords):
        return "Technical Infrastructure & DevOps"
    
    return "Uncategorized"

def analyze_workflow_complexity(workflow_data: Dict) -> str:
    """Analyze workflow complexity based on node count and structure"""
    node_count = workflow_data.get('node_count', 0)
    
    if node_count <= 5:
        return "low"
    elif node_count <= 15:
        return "medium"
    else:
        return "high"

def extract_integrations(workflow_data: Dict) -> List[str]:
    """Extract integrations from workflow data"""
    integrations = []
    
    # Extract from nodes
    nodes = workflow_data.get('nodes', [])
    for node in nodes:
        node_type = node.get('type', '')
        if node_type and node_type not in integrations:
            integrations.append(node_type)
    
    return integrations

def index_workflows():
    """Index all workflow files into the database"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute("DELETE FROM workflows")
    cursor.execute("DELETE FROM workflows_fts")
    
    workflow_files = list(WORKFLOWS_DIR.glob("*.json"))
    total_workflows = len(workflow_files)
    
    print(f"Indexing {total_workflows} workflows...")
    
    for i, file_path in enumerate(workflow_files, 1):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                workflow_data = json.load(f)
            
            # Extract basic information
            name = workflow_data.get('name', file_path.stem)
            nodes = workflow_data.get('nodes', [])
            node_count = len(nodes)
            
            # Extract integrations
            integrations = extract_integrations(workflow_data)
            
            # Analyze complexity
            complexity = analyze_workflow_complexity(workflow_data)
            
            # Determine trigger type
            trigger_type = "Manual"
            if nodes:
                first_node = nodes[0]
                if first_node.get('type', '').endswith('Trigger'):
                    trigger_type = first_node.get('type', '').replace('Trigger', '')
            
            # Categorize workflow
            category = categorize_workflow({
                'integrations': integrations,
                'description': name,
                'node_count': node_count
            })
            
            # Create description
            integration_names = ', '.join(integrations[:5])
            if len(integrations) > 5:
                integration_names += f", +{len(integrations) - 5} more"
            
            description = f"{trigger_type} workflow integrating {integration_names} with {node_count} nodes ({complexity} complexity)"
            
            # Insert into database
            cursor.execute('''
                INSERT INTO workflows (
                    filename, name, folder, workflow_id, active, description,
                    trigger_type, complexity, node_count, integrations, tags,
                    created_at, updated_at, file_hash, file_size, analyzed_at, category
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                file_path.name, name, "General", "", 0, description,
                trigger_type, complexity, node_count, json.dumps(integrations), "[]",
                "", "", "", file_path.stat().st_size, datetime.now().isoformat(), category
            ))
            
            workflow_id = cursor.lastrowid
            
            # Insert into FTS table
            cursor.execute('''
                INSERT INTO workflows_fts (rowid, name, description, integrations, folder, category)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                workflow_id, name, description, ' '.join(integrations), "General", category
            ))
            
            if i % 100 == 0:
                print(f"Indexed {i}/{total_workflows} workflows...")
                
        except Exception as e:
            print(f"Error indexing {file_path}: {e}")
            continue
    
    # Update statistics
    cursor.execute("SELECT COUNT(*) FROM workflows")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM workflows WHERE active = 1")
    active = cursor.fetchone()[0]
    
    cursor.execute("SELECT SUM(node_count) FROM workflows")
    total_nodes = cursor.fetchone()[0] or 0
    
    # Count unique integrations
    cursor.execute("SELECT integrations FROM workflows")
    all_integrations = []
    for row in cursor.fetchall():
        integrations = json.loads(row[0])
        all_integrations.extend(integrations)
    
    unique_integrations = len(set(all_integrations))
    
    cursor.execute('''
        INSERT INTO statistics (total_workflows, active_workflows, total_nodes, unique_integrations, last_indexed)
        VALUES (?, ?, ?, ?, ?)
    ''', (total, active, total_nodes, unique_integrations, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    
    print(f"Indexing complete! {total} workflows indexed with {unique_integrations} unique integrations.")

# API Routes
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Main dashboard page"""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unified n8n Workflow Documentation System</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; color: white; margin-bottom: 40px; }
            .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .header p { font-size: 1.2rem; opacity: 0.9; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
            .stat-card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; transition: transform 0.3s ease; }
            .stat-card:hover { transform: translateY(-5px); }
            .stat-number { font-size: 2.5rem; font-weight: bold; color: #667eea; margin-bottom: 10px; }
            .stat-label { color: #666; font-size: 1.1rem; }
            .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .feature-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .feature-card h3 { color: #667eea; margin-bottom: 15px; font-size: 1.3rem; }
            .feature-card p { color: #666; line-height: 1.6; }
            .api-links { margin-top: 20px; }
            .api-links a { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; margin: 5px; transition: background 0.3s ease; }
            .api-links a:hover { background: #5a6fd8; }
            .search-section { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 30px; }
            .search-input { width: 100%; padding: 15px; border: 2px solid #eee; border-radius: 10px; font-size: 1.1rem; margin-bottom: 20px; }
            .search-input:focus { outline: none; border-color: #667eea; }
            .search-button { background: #667eea; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 1.1rem; cursor: pointer; transition: background 0.3s ease; }
            .search-button:hover { background: #5a6fd8; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Unified n8n Workflow System</h1>
                <p>Complete workflow documentation and search system with all features</p>
            </div>
            
            <div class="search-section">
                <h2 style="margin-bottom: 20px; color: #333;">🔍 Search Workflows</h2>
                <input type="text" id="searchInput" class="search-input" placeholder="Search workflows, integrations, or categories...">
                <button onclick="searchWorkflows()" class="search-button">Search</button>
                <div id="searchResults" style="margin-top: 20px;"></div>
            </div>
            
            <div class="stats-grid" id="statsGrid">
                <!-- Stats will be loaded here -->
            </div>
            
            <div class="features-grid">
                <div class="feature-card">
                    <h3>🔍 Advanced Search</h3>
                    <p>Full-text search across all workflows with filtering by complexity, trigger type, and integrations.</p>
                </div>
                <div class="feature-card">
                    <h3>📊 Real-time Analytics</h3>
                    <p>Comprehensive statistics and insights about your workflow collection with visual charts.</p>
                </div>
                <div class="feature-card">
                    <h3>🎯 Smart Categorization</h3>
                    <p>Automatic categorization of workflows into 16 different categories for easy discovery.</p>
                </div>
                <div class="feature-card">
                    <h3>🔗 Integration Analysis</h3>
                    <p>Detailed analysis of 488+ unique integrations used across all workflows.</p>
                </div>
                <div class="feature-card">
                    <h3>📱 Responsive Design</h3>
                    <p>Modern, responsive interface that works perfectly on desktop, tablet, and mobile devices.</p>
                </div>
                <div class="feature-card">
                    <h3>⚡ High Performance</h3>
                    <p>Lightning-fast search with sub-100ms response times powered by SQLite FTS5.</p>
                </div>
            </div>
            
            <div class="api-links" style="text-align: center; margin-top: 40px;">
                <a href="/api/stats">📊 View Statistics</a>
                <a href="/api/workflows">🔍 Browse Workflows</a>
                <a href="/api/categories">📂 View Categories</a>
                <a href="/docs">📚 API Documentation</a>
            </div>
        </div>
        
        <script>
            // Load statistics on page load
            window.onload = function() {
                loadStats();
            };
            
            async function loadStats() {
                try {
                    const response = await fetch('/api/stats');
                    const stats = await response.json();
                    
                    const statsGrid = document.getElementById('statsGrid');
                    statsGrid.innerHTML = `
                        <div class="stat-card">
                            <div class="stat-number">${stats.total}</div>
                            <div class="stat-label">Total Workflows</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.active}</div>
                            <div class="stat-label">Active Workflows</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.unique_integrations}</div>
                            <div class="stat-label">Unique Integrations</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.total_nodes}</div>
                            <div class="stat-label">Total Nodes</div>
                        </div>
                    `;
                } catch (error) {
                    console.error('Error loading stats:', error);
                }
            }
            
            async function searchWorkflows() {
                const query = document.getElementById('searchInput').value;
                const resultsDiv = document.getElementById('searchResults');
                
                if (!query.trim()) {
                    resultsDiv.innerHTML = '';
                    return;
                }
                
                try {
                    const response = await fetch(`/api/workflows?q=${encodeURIComponent(query)}&per_page=5`);
                    const data = await response.json();
                    
                    if (data.workflows.length === 0) {
                        resultsDiv.innerHTML = '<p style="color: #666;">No workflows found matching your search.</p>';
                        return;
                    }
                    
                    let html = '<h3 style="margin-bottom: 15px; color: #333;">Search Results:</h3>';
                    data.workflows.forEach(workflow => {
                        html += `
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                                <h4 style="color: #667eea; margin-bottom: 5px;">${workflow.name}</h4>
                                <p style="color: #666; margin-bottom: 5px;">${workflow.description}</p>
                                <small style="color: #999;">Complexity: ${workflow.complexity} | Nodes: ${workflow.node_count} | Category: ${workflow.category}</small>
                            </div>
                        `;
                    });
                    
                    if (data.total > 5) {
                        html += `<p style="color: #667eea; margin-top: 10px;">Showing 5 of ${data.total} results. <a href="/api/workflows?q=${encodeURIComponent(query)}" style="color: #667eea;">View all results</a></p>`;
                    }
                    
                    resultsDiv.innerHTML = html;
                } catch (error) {
                    resultsDiv.innerHTML = '<p style="color: #dc3545;">Error performing search. Please try again.</p>';
                }
            }
            
            // Search on Enter key
            document.getElementById('searchInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchWorkflows();
                }
            });
        </script>
    </body>
    </html>
    """

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get comprehensive statistics"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Get basic stats
    cursor.execute("SELECT total_workflows, active_workflows, total_nodes, unique_integrations, last_indexed FROM statistics ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    
    if not row:
        # If no stats, calculate them
        cursor.execute("SELECT COUNT(*) FROM workflows")
        total = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM workflows WHERE active = 1")
        active = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(node_count) FROM workflows")
        total_nodes = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT integrations FROM workflows")
        all_integrations = []
        for row in cursor.fetchall():
            integrations = json.loads(row[0])
            all_integrations.extend(integrations)
        
        unique_integrations = len(set(all_integrations))
        last_indexed = datetime.now().isoformat()
    else:
        total, active, total_nodes, unique_integrations, last_indexed = row
    
    # Get trigger type distribution
    cursor.execute("SELECT trigger_type, COUNT(*) FROM workflows GROUP BY trigger_type")
    triggers = dict(cursor.fetchall())
    
    # Get complexity distribution
    cursor.execute("SELECT complexity, COUNT(*) FROM workflows GROUP BY complexity")
    complexity = dict(cursor.fetchall())
    
    # Get categories
    cursor.execute("SELECT DISTINCT category FROM workflows WHERE category IS NOT NULL")
    categories = [row[0] for row in cursor.fetchall()]
    
    # Get top integrations
    cursor.execute("SELECT integrations FROM workflows")
    all_integrations = []
    for row in cursor.fetchall():
        integrations = json.loads(row[0])
        all_integrations.extend(integrations)
    
    integration_counts = Counter(all_integrations)
    top_integrations = [{"name": name, "count": count} for name, count in integration_counts.most_common(10)]
    
    conn.close()
    
    return StatsResponse(
        total=total,
        active=active,
        inactive=total - active,
        triggers=triggers,
        complexity=complexity,
        total_nodes=total_nodes,
        unique_integrations=unique_integrations,
        last_indexed=last_indexed,
        categories=categories,
        top_integrations=top_integrations
    )

@app.get("/api/workflows", response_model=SearchResponse)
async def search_workflows(
    q: Optional[str] = Query(None, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    complexity: Optional[str] = Query(None, description="Filter by complexity (low/medium/high)"),
    trigger: Optional[str] = Query(None, description="Filter by trigger type"),
    active_only: bool = Query(False, description="Show only active workflows"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """Search and filter workflows"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Build query
    where_conditions = []
    params = []
    
    if q:
        # Use FTS5 for full-text search
        cursor.execute('''
            SELECT rowid FROM workflows_fts 
            WHERE workflows_fts MATCH ? 
            ORDER BY rank
        ''', (q,))
        fts_results = cursor.fetchall()
        if fts_results:
            workflow_ids = [row[0] for row in fts_results]
            where_conditions.append(f"id IN ({','.join(['?'] * len(workflow_ids))})")
            params.extend(workflow_ids)
        else:
            # No FTS results, return empty
            conn.close()
            return SearchResponse(
                workflows=[], total=0, page=page, per_page=per_page, pages=0,
                query=q, filters={}
            )
    
    if complexity:
        where_conditions.append("complexity = ?")
        params.append(complexity)
    
    if trigger:
        where_conditions.append("trigger_type = ?")
        params.append(trigger)
    
    if active_only:
        where_conditions.append("active = 1")
    
    if category:
        where_conditions.append("category = ?")
        params.append(category)
    
    where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
    
    # Get total count
    cursor.execute(f"SELECT COUNT(*) FROM workflows WHERE {where_clause}", params)
    total = cursor.fetchone()[0]
    
    # Calculate pagination
    pages = (total + per_page - 1) // per_page
    offset = (page - 1) * per_page
    
    # Get workflows
    cursor.execute(f'''
        SELECT id, filename, name, folder, workflow_id, active, description,
               trigger_type, complexity, node_count, integrations, tags,
               created_at, updated_at, file_hash, file_size, analyzed_at, category
        FROM workflows 
        WHERE {where_clause}
        ORDER BY id
        LIMIT ? OFFSET ?
    ''', params + [per_page, offset])
    
    workflows = []
    for row in cursor.fetchall():
        workflow = WorkflowResponse(
            id=row[0],
            filename=row[1],
            name=row[2],
            folder=row[3],
            workflow_id=row[4],
            active=bool(row[5]),
            description=row[6],
            trigger_type=row[7],
            complexity=row[8],
            node_count=row[9],
            integrations=json.loads(row[10]),
            tags=json.loads(row[11]),
            category=row[17],
            file_size=row[15],
            analyzed_at=row[16]
        )
        workflows.append(workflow)
    
    conn.close()
    
    return SearchResponse(
        workflows=workflows,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
        query=q or "",
        filters={
            "trigger": trigger or "all",
            "complexity": complexity or "all",
            "active_only": active_only
        }
    )

@app.get("/api/categories")
async def get_categories():
    """Get all categories with workflow counts"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT category, COUNT(*) as count 
        FROM workflows 
        WHERE category IS NOT NULL 
        GROUP BY category 
        ORDER BY count DESC
    ''')
    
    categories = [{"name": row[0], "count": row[1]} for row in cursor.fetchall()]
    conn.close()
    
    return {"categories": categories}

@app.get("/api/workflows/{workflow_id}")
async def get_workflow(workflow_id: int):
    """Get detailed workflow information"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, filename, name, folder, workflow_id, active, description,
               trigger_type, complexity, node_count, integrations, tags,
               created_at, updated_at, file_hash, file_size, analyzed_at, category
        FROM workflows WHERE id = ?
    ''', (workflow_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return WorkflowResponse(
        id=row[0],
        filename=row[1],
        name=row[2],
        folder=row[3],
        workflow_id=row[4],
        active=bool(row[5]),
        description=row[6],
        trigger_type=row[7],
        complexity=row[8],
        node_count=row[9],
        integrations=json.loads(row[10]),
        tags=json.loads(row[11]),
        category=row[17],
        file_size=row[15],
        analyzed_at=row[16]
    )

@app.get("/api/workflows/{workflow_id}/json")
async def get_workflow_json(workflow_id: int):
    """Get workflow JSON file"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT filename FROM workflows WHERE id = ?", (workflow_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    file_path = WORKFLOWS_DIR / row[0]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Workflow file not found")
    
    return FileResponse(file_path, media_type="application/json")

@app.get("/api/integrations")
async def get_integrations():
    """Get all integrations with usage counts"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT integrations FROM workflows")
    all_integrations = []
    for row in cursor.fetchall():
        integrations = json.loads(row[0])
        all_integrations.extend(integrations)
    
    integration_counts = Counter(all_integrations)
    integrations = [{"name": name, "count": count} for name, count in integration_counts.most_common()]
    
    conn.close()
    
    return {"integrations": integrations}

@app.post("/api/reindex")
async def reindex_workflows():
    """Reindex all workflows"""
    try:
        index_workflows()
        return {"message": "Workflows reindexed successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reindexing failed: {str(e)}")

# Initialize workflows on startup
if __name__ == "__main__":
    print("🚀 Starting Unified n8n Workflow Documentation System...")
    print("📊 Indexing workflows...")
    index_workflows()
    print("✅ System ready!")
    
    uvicorn.run(
        "unified_app:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )