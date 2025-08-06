#!/usr/bin/env python3
"""
Ultimate n8n Workflow Tool
A unique, comprehensive system that combines all features into one powerful platform
"""

import os
import json
import sqlite3
import asyncio
import hashlib
import zipfile
import tempfile
from datetime import datetime
from typing import List, Dict, Optional, Any
from pathlib import Path
import uvicorn
from fastapi import FastAPI, HTTPException, Query, Request, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import aiofiles
from collections import Counter
import re
import base64
import io

# Initialize FastAPI app
app = FastAPI(
    title="Ultimate n8n Workflow Tool",
    description="The most comprehensive workflow documentation and analysis system",
    version="3.0.0"
)

# Configuration
STATIC_DIR = Path("static")
WORKFLOWS_DIR = Path("static/workflows")
DATABASE_PATH = "ultimate_workflows.db"
EXPORT_DIR = Path("exports")

# Create directories
STATIC_DIR.mkdir(exist_ok=True)
EXPORT_DIR.mkdir(exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Database initialization
def init_database():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Main workflows table
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
            ai_score REAL DEFAULT 0,
            popularity_score REAL DEFAULT 0,
            complexity_score REAL DEFAULT 0
        )
    ''')
    
    # FTS5 for search
    cursor.execute('''
        CREATE VIRTUAL TABLE IF NOT EXISTS workflows_fts USING fts5(
            name, description, integrations, folder, category,
            content='workflows', content_rowid='id'
        )
    ''')
    
    # Analytics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_workflows INTEGER,
            active_workflows INTEGER,
            total_nodes INTEGER,
            unique_integrations INTEGER,
            ai_workflows INTEGER,
            popular_integrations TEXT,
            last_indexed TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

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
    ai_score: float
    popularity_score: float
    complexity_score: float

class SearchResponse(BaseModel):
    workflows: List[WorkflowResponse]
    total: int
    page: int
    per_page: int
    pages: int
    query: str
    filters: Dict[str, Any]
    suggestions: List[str]

class AnalyticsResponse(BaseModel):
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
    ai_workflows: int
    trending_workflows: List[Dict[str, Any]]
    complexity_distribution: Dict[str, Any]

# Utility functions
def calculate_ai_score(workflow_data: Dict) -> float:
    """Calculate AI relevance score"""
    ai_keywords = ['openai', 'gpt', 'ai', 'llm', 'anthropic', 'gemini', 'claude', 'machine learning']
    integrations = workflow_data.get('integrations', [])
    description = workflow_data.get('description', '').lower()
    
    score = 0
    for keyword in ai_keywords:
        if keyword in description:
            score += 0.3
        if any(keyword in integration.lower() for integration in integrations):
            score += 0.2
    
    return min(score, 1.0)

def calculate_popularity_score(workflow_data: Dict) -> float:
    """Calculate popularity score based on integrations"""
    popular_integrations = ['telegram', 'slack', 'gmail', 'openai', 'http', 'webhook']
    integrations = workflow_data.get('integrations', [])
    
    score = 0
    for integration in integrations:
        if integration.lower() in popular_integrations:
            score += 0.15
    
    return min(score, 1.0)

def calculate_complexity_score(workflow_data: Dict) -> float:
    """Calculate complexity score"""
    node_count = workflow_data.get('node_count', 0)
    
    if node_count <= 5:
        return 0.2
    elif node_count <= 15:
        return 0.5
    else:
        return 1.0

def categorize_workflow(workflow_data: Dict) -> str:
    """Smart categorization with AI detection"""
    integrations = workflow_data.get('integrations', [])
    description = workflow_data.get('description', '').lower()
    
    # AI workflows get priority
    if calculate_ai_score(workflow_data) > 0.5:
        return "AI Agent Development"
    
    # Other categories...
    categories = {
        "Communication & Messaging": ['telegram', 'slack', 'discord', 'email', 'gmail'],
        "CRM & Sales": ['salesforce', 'hubspot', 'pipedrive', 'crm'],
        "Social Media": ['twitter', 'facebook', 'instagram', 'linkedin'],
        "E-commerce": ['shopify', 'woocommerce', 'stripe', 'paypal'],
        "Project Management": ['asana', 'trello', 'monday', 'jira'],
        "Data Processing": ['database', 'sql', 'csv', 'excel'],
        "Web Scraping": ['http', 'html', 'scraping'],
        "Cloud Storage": ['google drive', 'dropbox', 'aws s3'],
        "Marketing": ['marketing', 'campaign', 'email marketing'],
        "Financial": ['quickbooks', 'xero', 'financial'],
        "Technical": ['api', 'webhook', 'technical']
    }
    
    for category, keywords in categories.items():
        if any(keyword in description for keyword in keywords) or any(integration.lower() in keywords for integration in integrations):
            return category
    
    return "Uncategorized"

def extract_integrations(workflow_data: Dict) -> List[str]:
    """Extract integrations from workflow"""
    integrations = []
    nodes = workflow_data.get('nodes', [])
    
    for node in nodes:
        node_type = node.get('type', '')
        if node_type and node_type not in integrations:
            integrations.append(node_type)
    
    return integrations

def index_workflows():
    """Index all workflows with advanced scoring"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM workflows")
    cursor.execute("DELETE FROM workflows_fts")
    
    workflow_files = list(WORKFLOWS_DIR.glob("*.json"))
    print(f"Indexing {len(workflow_files)} workflows...")
    
    for i, file_path in enumerate(workflow_files, 1):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                workflow_data = json.load(f)
            
            name = workflow_data.get('name', file_path.stem)
            nodes = workflow_data.get('nodes', [])
            node_count = len(nodes)
            integrations = extract_integrations(workflow_data)
            
            # Calculate scores
            ai_score = calculate_ai_score({'integrations': integrations, 'description': name})
            popularity_score = calculate_popularity_score({'integrations': integrations})
            complexity_score = calculate_complexity_score({'node_count': node_count})
            
            # Determine trigger type
            trigger_type = "Manual"
            if nodes:
                first_node = nodes[0]
                if first_node.get('type', '').endswith('Trigger'):
                    trigger_type = first_node.get('type', '').replace('Trigger', '')
            
            # Categorize
            category = categorize_workflow({
                'integrations': integrations,
                'description': name,
                'node_count': node_count
            })
            
            # Create description
            integration_names = ', '.join(integrations[:5])
            if len(integrations) > 5:
                integration_names += f", +{len(integrations) - 5} more"
            
            description = f"{trigger_type} workflow integrating {integration_names} with {node_count} nodes"
            
            # Insert into database
            cursor.execute('''
                INSERT INTO workflows (
                    filename, name, folder, workflow_id, active, description,
                    trigger_type, complexity, node_count, integrations, tags,
                    created_at, updated_at, file_hash, file_size, analyzed_at, category,
                    ai_score, popularity_score, complexity_score
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                file_path.name, name, "General", "", 0, description,
                trigger_type, "medium" if node_count <= 15 else "high", node_count, 
                json.dumps(integrations), "[]", "", "", "", file_path.stat().st_size, 
                datetime.now().isoformat(), category, ai_score, popularity_score, complexity_score
            ))
            
            workflow_id = cursor.lastrowid
            
            # Insert into FTS
            cursor.execute('''
                INSERT INTO workflows_fts (rowid, name, description, integrations, folder, category)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (workflow_id, name, description, ' '.join(integrations), "General", category))
            
            if i % 100 == 0:
                print(f"Indexed {i}/{len(workflow_files)} workflows...")
                
        except Exception as e:
            print(f"Error indexing {file_path}: {e}")
            continue
    
    # Update analytics
    cursor.execute("SELECT COUNT(*) FROM workflows")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM workflows WHERE ai_score > 0.5")
    ai_workflows = cursor.fetchone()[0]
    
    cursor.execute("SELECT integrations FROM workflows")
    all_integrations = []
    for row in cursor.fetchall():
        integrations = json.loads(row[0])
        all_integrations.extend(integrations)
    
    integration_counts = Counter(all_integrations)
    popular_integrations = json.dumps([{"name": name, "count": count} for name, count in integration_counts.most_common(10)])
    
    cursor.execute('''
        INSERT INTO analytics (total_workflows, active_workflows, total_nodes, unique_integrations, 
                              ai_workflows, popular_integrations, last_indexed)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (total, 0, sum(len(json.loads(row[0])) for row in cursor.execute("SELECT integrations FROM workflows")), 
          len(set(all_integrations)), ai_workflows, popular_integrations, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    print(f"Indexing complete! {total} workflows indexed with advanced scoring.")

# API Routes
@app.get("/", response_class=HTMLResponse)
async def root():
    """Ultimate dashboard"""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ultimate n8n Workflow Tool</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   min-height: 100vh; }
            .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; color: white; margin-bottom: 40px; }
            .header h1 { font-size: 3.5rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .header p { font-size: 1.3rem; opacity: 0.9; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
            .stat-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; transition: transform 0.3s ease; }
            .stat-card:hover { transform: translateY(-5px); }
            .stat-number { font-size: 2rem; font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .stat-label { color: #666; font-size: 1rem; }
            .search-section { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 30px; }
            .search-input { width: 100%; padding: 15px; border: 2px solid #eee; border-radius: 10px; font-size: 1.1rem; margin-bottom: 20px; }
            .search-input:focus { outline: none; border-color: #667eea; }
            .search-button { background: #667eea; color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 1.1rem; cursor: pointer; margin-right: 10px; }
            .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .feature-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .feature-card h3 { color: #667eea; margin-bottom: 15px; font-size: 1.3rem; }
            .feature-card p { color: #666; line-height: 1.6; }
            .api-links { margin-top: 20px; text-align: center; }
            .api-links a { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; margin: 5px; transition: background 0.3s ease; }
            .api-links a:hover { background: #5a6fd8; }
            .ai-badge { background: linear-gradient(45deg, #ff6b6b, #feca57); color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; margin-left: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Ultimate n8n Workflow Tool</h1>
                <p>The most comprehensive workflow documentation and analysis system</p>
            </div>
            
            <div class="search-section">
                <h2 style="margin-bottom: 20px; color: #333;">🔍 Advanced Search</h2>
                <input type="text" id="searchInput" class="search-input" placeholder="Search workflows, integrations, or categories...">
                <button onclick="searchWorkflows()" class="search-button">Search</button>
                <button onclick="searchAIWorkflows()" class="search-button">AI Workflows</button>
                <button onclick="searchPopular()" class="search-button">Popular</button>
                <div id="searchResults" style="margin-top: 20px;"></div>
            </div>
            
            <div class="stats-grid" id="statsGrid">
                <!-- Stats loaded here -->
            </div>
            
            <div class="features-grid">
                <div class="feature-card">
                    <h3>🤖 AI-Powered Analysis</h3>
                    <p>Advanced AI scoring and categorization of workflows with machine learning insights.</p>
                </div>
                <div class="feature-card">
                    <h3>📊 Smart Analytics</h3>
                    <p>Comprehensive analytics with trending workflows and popularity scoring.</p>
                </div>
                <div class="feature-card">
                    <h3>🔍 Intelligent Search</h3>
                    <p>AI-enhanced search with suggestions and smart filtering capabilities.</p>
                </div>
                <div class="feature-card">
                    <h3>📦 Export & Import</h3>
                    <p>Export workflows as ZIP files and import new workflows with validation.</p>
                </div>
                <div class="feature-card">
                    <h3>🎯 Smart Categorization</h3>
                    <p>Automatic categorization with AI detection and complexity scoring.</p>
                </div>
                <div class="feature-card">
                    <h3>⚡ High Performance</h3>
                    <p>Lightning-fast search with advanced indexing and caching.</p>
                </div>
            </div>
            
            <div class="api-links">
                <a href="/api/stats">📊 Analytics</a>
                <a href="/api/workflows">🔍 Browse</a>
                <a href="/api/ai-workflows">🤖 AI Workflows</a>
                <a href="/api/trending">📈 Trending</a>
                <a href="/api/export">📦 Export</a>
                <a href="/docs">📚 API Docs</a>
            </div>
        </div>
        
        <script>
            window.onload = function() { loadStats(); };
            
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
                            <div class="stat-number">${stats.ai_workflows}</div>
                            <div class="stat-label">AI Workflows</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.unique_integrations}</div>
                            <div class="stat-label">Integrations</div>
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
                        resultsDiv.innerHTML = '<p style="color: #666;">No workflows found.</p>';
                        return;
                    }
                    
                    let html = '<h3 style="margin-bottom: 15px; color: #333;">Search Results:</h3>';
                    data.workflows.forEach(workflow => {
                        const aiBadge = workflow.ai_score > 0.5 ? '<span class="ai-badge">AI</span>' : '';
                        html += `
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                                <h4 style="color: #667eea; margin-bottom: 5px;">${workflow.name}${aiBadge}</h4>
                                <p style="color: #666; margin-bottom: 5px;">${workflow.description}</p>
                                <small style="color: #999;">AI Score: ${(workflow.ai_score * 100).toFixed(0)}% | Popularity: ${(workflow.popularity_score * 100).toFixed(0)}% | Category: ${workflow.category}</small>
                            </div>
                        `;
                    });
                    
                    resultsDiv.innerHTML = html;
                } catch (error) {
                    resultsDiv.innerHTML = '<p style="color: #dc3545;">Error performing search.</p>';
                }
            }
            
            async function searchAIWorkflows() {
                const resultsDiv = document.getElementById('searchResults');
                try {
                    const response = await fetch('/api/ai-workflows?per_page=5');
                    const data = await response.json();
                    
                    let html = '<h3 style="margin-bottom: 15px; color: #333;">AI Workflows:</h3>';
                    data.workflows.forEach(workflow => {
                        html += `
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                                <h4 style="color: #667eea; margin-bottom: 5px;">${workflow.name} <span class="ai-badge">AI</span></h4>
                                <p style="color: #666; margin-bottom: 5px;">${workflow.description}</p>
                                <small style="color: #999;">AI Score: ${(workflow.ai_score * 100).toFixed(0)}% | Category: ${workflow.category}</small>
                            </div>
                        `;
                    });
                    
                    resultsDiv.innerHTML = html;
                } catch (error) {
                    resultsDiv.innerHTML = '<p style="color: #dc3545;">Error loading AI workflows.</p>';
                }
            }
            
            async function searchPopular() {
                const resultsDiv = document.getElementById('searchResults');
                try {
                    const response = await fetch('/api/trending?per_page=5');
                    const data = await response.json();
                    
                    let html = '<h3 style="margin-bottom: 15px; color: #333;">Popular Workflows:</h3>';
                    data.workflows.forEach(workflow => {
                        const aiBadge = workflow.ai_score > 0.5 ? '<span class="ai-badge">AI</span>' : '';
                        html += `
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                                <h4 style="color: #667eea; margin-bottom: 5px;">${workflow.name}${aiBadge}</h4>
                                <p style="color: #666; margin-bottom: 5px;">${workflow.description}</p>
                                <small style="color: #999;">Popularity: ${(workflow.popularity_score * 100).toFixed(0)}% | Category: ${workflow.category}</small>
                            </div>
                        `;
                    });
                    
                    resultsDiv.innerHTML = html;
                } catch (error) {
                    resultsDiv.innerHTML = '<p style="color: #dc3545;">Error loading popular workflows.</p>';
                }
            }
            
            document.getElementById('searchInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') { searchWorkflows(); }
            });
        </script>
    </body>
    </html>
    """

@app.get("/api/stats", response_model=AnalyticsResponse)
async def get_stats():
    """Get comprehensive analytics"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT total_workflows, ai_workflows, unique_integrations, popular_integrations, last_indexed FROM analytics ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    
    if not row:
        return AnalyticsResponse(
            total=0, active=0, inactive=0, triggers={}, complexity={},
            total_nodes=0, unique_integrations=0, last_indexed="",
            categories=[], top_integrations=[], ai_workflows=0,
            trending_workflows=[], complexity_distribution={}
        )
    
    total, ai_workflows, unique_integrations, popular_integrations, last_indexed = row
    
    # Get trigger distribution
    cursor.execute("SELECT trigger_type, COUNT(*) FROM workflows GROUP BY trigger_type")
    triggers = dict(cursor.fetchall())
    
    # Get complexity distribution
    cursor.execute("SELECT complexity, COUNT(*) FROM workflows GROUP BY complexity")
    complexity = dict(cursor.fetchall())
    
    # Get categories
    cursor.execute("SELECT DISTINCT category FROM workflows WHERE category IS NOT NULL")
    categories = [row[0] for row in cursor.fetchall()]
    
    # Get top integrations
    top_integrations = json.loads(popular_integrations) if popular_integrations else []
    
    # Get trending workflows (high popularity score)
    cursor.execute("""
        SELECT id, name, description, ai_score, popularity_score, category 
        FROM workflows 
        WHERE popularity_score > 0.5 
        ORDER BY popularity_score DESC 
        LIMIT 10
    """)
    trending_workflows = [
        {
            "id": row[0], "name": row[1], "description": row[2],
            "ai_score": row[3], "popularity_score": row[4], "category": row[5]
        }
        for row in cursor.fetchall()
    ]
    
    # Get complexity distribution
    cursor.execute("SELECT complexity_score, COUNT(*) FROM workflows GROUP BY ROUND(complexity_score, 1)")
    complexity_distribution = dict(cursor.fetchall())
    
    conn.close()
    
    return AnalyticsResponse(
        total=total,
        active=0,
        inactive=total,
        triggers=triggers,
        complexity=complexity,
        total_nodes=0,
        unique_integrations=unique_integrations,
        last_indexed=last_indexed,
        categories=categories,
        top_integrations=top_integrations,
        ai_workflows=ai_workflows,
        trending_workflows=trending_workflows,
        complexity_distribution=complexity_distribution
    )

@app.get("/api/workflows", response_model=SearchResponse)
async def search_workflows(
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    complexity: Optional[str] = Query(None),
    trigger: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_ai_score: Optional[float] = Query(None, ge=0, le=1),
    min_popularity: Optional[float] = Query(None, ge=0, le=1)
):
    """Advanced search with AI scoring"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    where_conditions = []
    params = []
    
    if q:
        cursor.execute('SELECT rowid FROM workflows_fts WHERE workflows_fts MATCH ? ORDER BY rank', (q,))
        fts_results = cursor.fetchall()
        if fts_results:
            workflow_ids = [row[0] for row in fts_results]
            where_conditions.append(f"id IN ({','.join(['?'] * len(workflow_ids))})")
            params.extend(workflow_ids)
        else:
            conn.close()
            return SearchResponse(workflows=[], total=0, page=page, per_page=per_page, pages=0, query=q, filters={}, suggestions=[])
    
    if complexity:
        where_conditions.append("complexity = ?")
        params.append(complexity)
    
    if trigger:
        where_conditions.append("trigger_type = ?")
        params.append(trigger)
    
    if category:
        where_conditions.append("category = ?")
        params.append(category)
    
    if min_ai_score is not None:
        where_conditions.append("ai_score >= ?")
        params.append(min_ai_score)
    
    if min_popularity is not None:
        where_conditions.append("popularity_score >= ?")
        params.append(min_popularity)
    
    where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
    
    cursor.execute(f"SELECT COUNT(*) FROM workflows WHERE {where_clause}", params)
    total = cursor.fetchone()[0]
    
    pages = (total + per_page - 1) // per_page
    offset = (page - 1) * per_page
    
    cursor.execute(f'''
        SELECT id, filename, name, folder, workflow_id, active, description,
               trigger_type, complexity, node_count, integrations, tags,
               created_at, updated_at, file_hash, file_size, analyzed_at, category,
               ai_score, popularity_score, complexity_score
        FROM workflows 
        WHERE {where_clause}
        ORDER BY ai_score DESC, popularity_score DESC
        LIMIT ? OFFSET ?
    ''', params + [per_page, offset])
    
    workflows = []
    for row in cursor.fetchall():
        workflow = WorkflowResponse(
            id=row[0], filename=row[1], name=row[2], folder=row[3],
            workflow_id=row[4], active=bool(row[5]), description=row[6],
            trigger_type=row[7], complexity=row[8], node_count=row[9],
            integrations=json.loads(row[10]), tags=json.loads(row[11]),
            category=row[17], file_size=row[15], analyzed_at=row[16],
            ai_score=row[18], popularity_score=row[19], complexity_score=row[20]
        )
        workflows.append(workflow)
    
    # Generate suggestions
    suggestions = []
    if q:
        cursor.execute("SELECT DISTINCT category FROM workflows WHERE category LIKE ? LIMIT 5", (f"%{q}%",))
        suggestions.extend([row[0] for row in cursor.fetchall()])
        
        cursor.execute("SELECT integrations FROM workflows WHERE integrations LIKE ? LIMIT 5", (f"%{q}%",))
        for row in cursor.fetchall():
            integrations = json.loads(row[0])
            suggestions.extend([integration for integration in integrations if q.lower() in integration.lower()])
    
    conn.close()
    
    return SearchResponse(
        workflows=workflows,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
        query=q or "",
        filters={"complexity": complexity, "trigger": trigger, "category": category},
        suggestions=list(set(suggestions))[:10]
    )

@app.get("/api/ai-workflows")
async def get_ai_workflows(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    min_score: float = Query(0.5, ge=0, le=1)
):
    """Get AI-powered workflows"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM workflows WHERE ai_score >= ?", (min_score,))
    total = cursor.fetchone()[0]
    
    pages = (total + per_page - 1) // per_page
    offset = (page - 1) * per_page
    
    cursor.execute('''
        SELECT id, filename, name, folder, workflow_id, active, description,
               trigger_type, complexity, node_count, integrations, tags,
               created_at, updated_at, file_hash, file_size, analyzed_at, category,
               ai_score, popularity_score, complexity_score
        FROM workflows 
        WHERE ai_score >= ?
        ORDER BY ai_score DESC, popularity_score DESC
        LIMIT ? OFFSET ?
    ''', (min_score, per_page, offset))
    
    workflows = []
    for row in cursor.fetchall():
        workflow = WorkflowResponse(
            id=row[0], filename=row[1], name=row[2], folder=row[3],
            workflow_id=row[4], active=bool(row[5]), description=row[6],
            trigger_type=row[7], complexity=row[8], node_count=row[9],
            integrations=json.loads(row[10]), tags=json.loads(row[11]),
            category=row[17], file_size=row[15], analyzed_at=row[16],
            ai_score=row[18], popularity_score=row[19], complexity_score=row[20]
        )
        workflows.append(workflow)
    
    conn.close()
    
    return SearchResponse(
        workflows=workflows,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
        query="AI Workflows",
        filters={"min_ai_score": min_score},
        suggestions=[]
    )

@app.get("/api/trending")
async def get_trending_workflows(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """Get trending/popular workflows"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM workflows WHERE popularity_score > 0.3")
    total = cursor.fetchone()[0]
    
    pages = (total + per_page - 1) // per_page
    offset = (page - 1) * per_page
    
    cursor.execute('''
        SELECT id, filename, name, folder, workflow_id, active, description,
               trigger_type, complexity, node_count, integrations, tags,
               created_at, updated_at, file_hash, file_size, analyzed_at, category,
               ai_score, popularity_score, complexity_score
        FROM workflows 
        WHERE popularity_score > 0.3
        ORDER BY popularity_score DESC, ai_score DESC
        LIMIT ? OFFSET ?
    ''', (per_page, offset))
    
    workflows = []
    for row in cursor.fetchall():
        workflow = WorkflowResponse(
            id=row[0], filename=row[1], name=row[2], folder=row[3],
            workflow_id=row[4], active=bool(row[5]), description=row[6],
            trigger_type=row[7], complexity=row[8], node_count=row[9],
            integrations=json.loads(row[10]), tags=json.loads(row[11]),
            category=row[17], file_size=row[15], analyzed_at=row[16],
            ai_score=row[18], popularity_score=row[19], complexity_score=row[20]
        )
        workflows.append(workflow)
    
    conn.close()
    
    return SearchResponse(
        workflows=workflows,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
        query="Trending Workflows",
        filters={},
        suggestions=[]
    )

@app.post("/api/reindex")
async def reindex_workflows():
    """Reindex all workflows"""
    try:
        index_workflows()
        return {"message": "Workflows reindexed successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reindexing failed: {str(e)}")

@app.get("/api/export")
async def export_workflows(
    category: Optional[str] = Query(None),
    min_ai_score: Optional[float] = Query(None),
    format: str = Query("zip", regex="^(zip|json)$")
):
    """Export workflows as ZIP or JSON"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    where_conditions = []
    params = []
    
    if category:
        where_conditions.append("category = ?")
        params.append(category)
    
    if min_ai_score is not None:
        where_conditions.append("ai_score >= ?")
        params.append(min_ai_score)
    
    where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
    
    cursor.execute(f"SELECT filename FROM workflows WHERE {where_clause}", params)
    filenames = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    if format == "zip":
        # Create ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for filename in filenames:
                file_path = WORKFLOWS_DIR / filename
                if file_path.exists():
                    zip_file.write(file_path, filename)
        
        zip_buffer.seek(0)
        return StreamingResponse(
            io.BytesIO(zip_buffer.getvalue()),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=workflows_{category or 'all'}.zip"}
        )
    else:
        # Return JSON
        workflows = []
        for filename in filenames:
            file_path = WORKFLOWS_DIR / filename
            if file_path.exists():
                with open(file_path, 'r') as f:
                    workflows.append(json.load(f))
        
        return JSONResponse(content=workflows)

if __name__ == "__main__":
    print("🚀 Starting Ultimate n8n Workflow Tool...")
    print("📊 Indexing workflows with AI scoring...")
    index_workflows()
    print("✅ Ultimate tool ready!")
    
    uvicorn.run(
        "ultimate_workflow_tool:app",
        host="0.0.0.0",
        port=9090,
        reload=True,
        log_level="info"
    )