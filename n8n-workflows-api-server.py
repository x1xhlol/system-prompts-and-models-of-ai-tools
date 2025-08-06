#!/usr/bin/env python3
"""
FastAPI Server for N8N Workflow Documentation
High-performance API with sub-100ms response times.
"""

from fastapi import FastAPI, HTTPException, Query, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
import json
import os
import asyncio
from pathlib import Path
import uvicorn

from workflow_db import WorkflowDatabase

# Initialize FastAPI app
app = FastAPI(
    title="N8N Workflow Documentation API",
    description="Fast API for browsing and searching workflow documentation",
    version="2.0.0"
)

# Add middleware for performance
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
db = WorkflowDatabase()

# Startup function to verify database
@app.on_event("startup")
async def startup_event():
    """Verify database connectivity on startup."""
    try:
        stats = db.get_stats()
        if stats['total'] == 0:
            print("⚠️  Warning: No workflows found in database. Run indexing first.")
        else:
            print(f"✅ Database connected: {stats['total']} workflows indexed")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise

# Response models
class WorkflowSummary(BaseModel):
    id: Optional[int] = None
    filename: str
    name: str
    active: bool
    description: str = ""
    trigger_type: str = "Manual"
    complexity: str = "low"
    node_count: int = 0
    integrations: List[str] = []
    tags: List[str] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        # Allow conversion of int to bool for active field
        validate_assignment = True
        
    @field_validator('active', mode='before')
    @classmethod
    def convert_active(cls, v):
        if isinstance(v, int):
            return bool(v)
        return v
    

class SearchResponse(BaseModel):
    workflows: List[WorkflowSummary]
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

@app.get("/")
async def root():
    """Serve the main documentation page."""
    static_dir = Path("static")
    index_file = static_dir / "index.html"
    if not index_file.exists():
        return HTMLResponse("""
        <html><body>
        <h1>Setup Required</h1>
        <p>Static files not found. Please ensure the static directory exists with index.html</p>
        <p>Current directory: """ + str(Path.cwd()) + """</p>
        </body></html>
        """)
    return FileResponse(str(index_file))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "N8N Workflow API is running"}

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get workflow database statistics."""
    try:
        stats = db.get_stats()
        return StatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@app.get("/api/workflows", response_model=SearchResponse)
async def search_workflows(
    q: str = Query("", description="Search query"),
    trigger: str = Query("all", description="Filter by trigger type"),
    complexity: str = Query("all", description="Filter by complexity"),
    active_only: bool = Query(False, description="Show only active workflows"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Search and filter workflows with pagination."""
    try:
        offset = (page - 1) * per_page
        
        workflows, total = db.search_workflows(
            query=q,
            trigger_filter=trigger,
            complexity_filter=complexity,
            active_only=active_only,
            limit=per_page,
            offset=offset
        )
        
        # Convert to Pydantic models with error handling
        workflow_summaries = []
        for workflow in workflows:
            try:
                # Remove extra fields that aren't in the model
                clean_workflow = {
                    'id': workflow.get('id'),
                    'filename': workflow.get('filename', ''),
                    'name': workflow.get('name', ''),
                    'active': workflow.get('active', False),
                    'description': workflow.get('description', ''),
                    'trigger_type': workflow.get('trigger_type', 'Manual'),
                    'complexity': workflow.get('complexity', 'low'),
                    'node_count': workflow.get('node_count', 0),
                    'integrations': workflow.get('integrations', []),
                    'tags': workflow.get('tags', []),
                    'created_at': workflow.get('created_at'),
                    'updated_at': workflow.get('updated_at')
                }
                workflow_summaries.append(WorkflowSummary(**clean_workflow))
            except Exception as e:
                print(f"Error converting workflow {workflow.get('filename', 'unknown')}: {e}")
                # Continue with other workflows instead of failing completely
                continue
        
        pages = (total + per_page - 1) // per_page  # Ceiling division
        
        return SearchResponse(
            workflows=workflow_summaries,
            total=total,
            page=page,
            per_page=per_page,
            pages=pages,
            query=q,
            filters={
                "trigger": trigger,
                "complexity": complexity,
                "active_only": active_only
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching workflows: {str(e)}")

@app.get("/api/workflows/{filename}")
async def get_workflow_detail(filename: str):
    """Get detailed workflow information including raw JSON."""
    try:
        # Get workflow metadata from database
        workflows, _ = db.search_workflows(f'filename:"{filename}"', limit=1)
        if not workflows:
            raise HTTPException(status_code=404, detail="Workflow not found in database")
        
        workflow_meta = workflows[0]
        
        # Load raw JSON from file
        file_path = os.path.join("workflows", filename)
        if not os.path.exists(file_path):
            print(f"Warning: File {file_path} not found on filesystem but exists in database")
            raise HTTPException(status_code=404, detail=f"Workflow file '{filename}' not found on filesystem")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            raw_json = json.load(f)
        
        return {
            "metadata": workflow_meta,
            "raw_json": raw_json
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading workflow: {str(e)}")

@app.get("/api/workflows/{filename}/download")
async def download_workflow(filename: str):
    """Download workflow JSON file."""
    try:
        file_path = os.path.join("workflows", filename)
        if not os.path.exists(file_path):
            print(f"Warning: Download requested for missing file: {file_path}")
            raise HTTPException(status_code=404, detail=f"Workflow file '{filename}' not found on filesystem")
        
        return FileResponse(
            file_path,
            media_type="application/json",
            filename=filename
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Workflow file '{filename}' not found")
    except Exception as e:
        print(f"Error downloading workflow {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading workflow: {str(e)}")

@app.get("/api/workflows/{filename}/diagram")
async def get_workflow_diagram(filename: str):
    """Get Mermaid diagram code for workflow visualization."""
    try:
        file_path = os.path.join("workflows", filename)
        if not os.path.exists(file_path):
            print(f"Warning: Diagram requested for missing file: {file_path}")
            raise HTTPException(status_code=404, detail=f"Workflow file '{filename}' not found on filesystem")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        nodes = data.get('nodes', [])
        connections = data.get('connections', {})
        
        # Generate Mermaid diagram
        diagram = generate_mermaid_diagram(nodes, connections)
        
        return {"diagram": diagram}
    except HTTPException:
        raise
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Workflow file '{filename}' not found")
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON in {filename}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid JSON in workflow file: {str(e)}")
    except Exception as e:
        print(f"Error generating diagram for {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating diagram: {str(e)}")

def generate_mermaid_diagram(nodes: List[Dict], connections: Dict) -> str:
    """Generate Mermaid.js flowchart code from workflow nodes and connections."""
    if not nodes:
        return "graph TD\n  EmptyWorkflow[No nodes found in workflow]"
    
    # Create mapping for node names to ensure valid mermaid IDs
    mermaid_ids = {}
    for i, node in enumerate(nodes):
        node_id = f"node{i}"
        node_name = node.get('name', f'Node {i}')
        mermaid_ids[node_name] = node_id
    
    # Start building the mermaid diagram
    mermaid_code = ["graph TD"]
    
    # Add nodes with styling
    for node in nodes:
        node_name = node.get('name', 'Unnamed')
        node_id = mermaid_ids[node_name]
        node_type = node.get('type', '').replace('n8n-nodes-base.', '')
        
        # Determine node style based on type
        style = ""
        if any(x in node_type.lower() for x in ['trigger', 'webhook', 'cron']):
            style = "fill:#b3e0ff,stroke:#0066cc"  # Blue for triggers
        elif any(x in node_type.lower() for x in ['if', 'switch']):
            style = "fill:#ffffb3,stroke:#e6e600"  # Yellow for conditional nodes
        elif any(x in node_type.lower() for x in ['function', 'code']):
            style = "fill:#d9b3ff,stroke:#6600cc"  # Purple for code nodes
        elif 'error' in node_type.lower():
            style = "fill:#ffb3b3,stroke:#cc0000"  # Red for error handlers
        else:
            style = "fill:#d9d9d9,stroke:#666666"  # Gray for other nodes
        
        # Add node with label (escaping special characters)
        clean_name = node_name.replace('"', "'")
        clean_type = node_type.replace('"', "'")
        label = f"{clean_name}<br>({clean_type})"
        mermaid_code.append(f"  {node_id}[\"{label}\"]")
        mermaid_code.append(f"  style {node_id} {style}")
    
    # Add connections between nodes
    for source_name, source_connections in connections.items():
        if source_name not in mermaid_ids:
            continue
        
        if isinstance(source_connections, dict) and 'main' in source_connections:
            main_connections = source_connections['main']
            
            for i, output_connections in enumerate(main_connections):
                if not isinstance(output_connections, list):
                    continue
                    
                for connection in output_connections:
                    if not isinstance(connection, dict) or 'node' not in connection:
                        continue
                        
                    target_name = connection['node']
                    if target_name not in mermaid_ids:
                        continue
                        
                    # Add arrow with output index if multiple outputs
                    label = f" -->|{i}| " if len(main_connections) > 1 else " --> "
                    mermaid_code.append(f"  {mermaid_ids[source_name]}{label}{mermaid_ids[target_name]}")
    
    # Format the final mermaid diagram code
    return "\n".join(mermaid_code)

@app.post("/api/reindex")
async def reindex_workflows(background_tasks: BackgroundTasks, force: bool = False):
    """Trigger workflow reindexing in the background."""
    def run_indexing():
        db.index_all_workflows(force_reindex=force)
    
    background_tasks.add_task(run_indexing)
    return {"message": "Reindexing started in background"}

@app.get("/api/integrations")
async def get_integrations():
    """Get list of all unique integrations."""
    try:
        stats = db.get_stats()
        # For now, return basic info. Could be enhanced to return detailed integration stats
        return {"integrations": [], "count": stats['unique_integrations']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching integrations: {str(e)}")

@app.get("/api/categories")
async def get_categories():
    """Get available workflow categories for filtering."""
    try:
        # Try to load from the generated unique categories file
        categories_file = Path("context/unique_categories.json")
        if categories_file.exists():
            with open(categories_file, 'r', encoding='utf-8') as f:
                categories = json.load(f)
            return {"categories": categories}
        else:
            # Fallback: extract categories from search_categories.json
            search_categories_file = Path("context/search_categories.json")
            if search_categories_file.exists():
                with open(search_categories_file, 'r', encoding='utf-8') as f:
                    search_data = json.load(f)
                
                unique_categories = set()
                for item in search_data:
                    if item.get('category'):
                        unique_categories.add(item['category'])
                    else:
                        unique_categories.add('Uncategorized')
                
                categories = sorted(list(unique_categories))
                return {"categories": categories}
            else:
                # Last resort: return basic categories
                return {"categories": ["Uncategorized"]}
                
    except Exception as e:
        print(f"Error loading categories: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@app.get("/api/category-mappings")
async def get_category_mappings():
    """Get filename to category mappings for client-side filtering."""
    try:
        search_categories_file = Path("context/search_categories.json")
        if not search_categories_file.exists():
            return {"mappings": {}}
        
        with open(search_categories_file, 'r', encoding='utf-8') as f:
            search_data = json.load(f)
        
        # Convert to a simple filename -> category mapping
        mappings = {}
        for item in search_data:
            filename = item.get('filename')
            category = item.get('category') or 'Uncategorized'
            if filename:
                mappings[filename] = category
        
        return {"mappings": mappings}
        
    except Exception as e:
        print(f"Error loading category mappings: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching category mappings: {str(e)}")

@app.get("/api/workflows/category/{category}", response_model=SearchResponse)
async def search_workflows_by_category(
    category: str,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Search workflows by service category (messaging, database, ai_ml, etc.)."""
    try:
        offset = (page - 1) * per_page
        
        workflows, total = db.search_by_category(
            category=category,
            limit=per_page,
            offset=offset
        )
        
        # Convert to Pydantic models with error handling
        workflow_summaries = []
        for workflow in workflows:
            try:
                clean_workflow = {
                    'id': workflow.get('id'),
                    'filename': workflow.get('filename', ''),
                    'name': workflow.get('name', ''),
                    'active': workflow.get('active', False),
                    'description': workflow.get('description', ''),
                    'trigger_type': workflow.get('trigger_type', 'Manual'),
                    'complexity': workflow.get('complexity', 'low'),
                    'node_count': workflow.get('node_count', 0),
                    'integrations': workflow.get('integrations', []),
                    'tags': workflow.get('tags', []),
                    'created_at': workflow.get('created_at'),
                    'updated_at': workflow.get('updated_at')
                }
                workflow_summaries.append(WorkflowSummary(**clean_workflow))
            except Exception as e:
                print(f"Error converting workflow {workflow.get('filename', 'unknown')}: {e}")
                continue
        
        pages = (total + per_page - 1) // per_page
        
        return SearchResponse(
            workflows=workflow_summaries,
            total=total,
            page=page,
            per_page=per_page,
            pages=pages,
            query=f"category:{category}",
            filters={"category": category}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching by category: {str(e)}")

# Custom exception handler for better error responses
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# Mount static files AFTER all routes are defined
static_dir = Path("static")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")
    print(f"✅ Static files mounted from {static_dir.absolute()}")
else:
    print(f"❌ Warning: Static directory not found at {static_dir.absolute()}")

def create_static_directory():
    """Create static directory if it doesn't exist."""
    static_dir = Path("static")
    static_dir.mkdir(exist_ok=True)
    return static_dir

def run_server(host: str = "127.0.0.1", port: int = 8000, reload: bool = False):
    """Run the FastAPI server."""
    # Ensure static directory exists
    create_static_directory()
    
    # Debug: Check database connectivity
    try:
        stats = db.get_stats()
        print(f"✅ Database connected: {stats['total']} workflows found")
        if stats['total'] == 0:
            print("🔄 Database is empty. Indexing workflows...")
            db.index_all_workflows()
            stats = db.get_stats()
    except Exception as e:
        print(f"❌ Database error: {e}")
        print("🔄 Attempting to create and index database...")
        try:
            db.index_all_workflows()
            stats = db.get_stats()
            print(f"✅ Database created: {stats['total']} workflows indexed")
        except Exception as e2:
            print(f"❌ Failed to create database: {e2}")
            stats = {'total': 0}
    
    # Debug: Check static files
    static_path = Path("static")
    if static_path.exists():
        files = list(static_path.glob("*"))
        print(f"✅ Static files found: {[f.name for f in files]}")
    else:
        print(f"❌ Static directory not found at: {static_path.absolute()}")
    
    print(f"🚀 Starting N8N Workflow Documentation API")
    print(f"📊 Database contains {stats['total']} workflows")
    print(f"🌐 Server will be available at: http://{host}:{port}")
    print(f"📁 Static files at: http://{host}:{port}/static/")
    
    uvicorn.run(
        "api_server:app",
        host=host,
        port=port,
        reload=reload,
        access_log=True,  # Enable access logs for debugging
        log_level="info"
    )

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='N8N Workflow Documentation API Server')
    parser.add_argument('--host', default='127.0.0.1', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8000, help='Port to bind to')
    parser.add_argument('--reload', action='store_true', help='Enable auto-reload for development')
    
    args = parser.parse_args()
    
    run_server(host=args.host, port=args.port, reload=args.reload)