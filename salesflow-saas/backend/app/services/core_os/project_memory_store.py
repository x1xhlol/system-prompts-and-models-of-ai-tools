import os
import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

class ProjectMemoryStore:
    """
    Second Brain & Project Memory Store for Sovereign OS.
    File-based local memory with strict schemas to maintain institutional knowledge
    without turning into an unstructured dump.
    """
    
    MEMORY_DOMAINS = [
        "architecture", "adr", "runbooks", "releases", "postmortems",
        "growth", "partners", "ma", "seo", "security", "providers",
        "benchmarks", "patterns", "prompts", "experiments", "customers"
    ]
    
    def __init__(self, base_path: str = "memory"):
        self.base_path = Path(base_path)
        self._initialize_structure()
        
    def _initialize_structure(self):
        """Creates the internal memory domain folders if they don't exist."""
        for domain in self.MEMORY_DOMAINS:
            domain_path = self.base_path / domain
            domain_path.mkdir(parents=True, exist_ok=True)
            
    def store_item(self, domain: str, title: str, memory_type: str, owner: str, 
                   confidence: int, summary: str, links: List[str] = None, 
                   tags: List[str] = None, review_date: str = None) -> str:
        """
        Ingests a decision memo, realization, or learning into the Memory OS.
        Returns the memory ID.
        """
        if domain not in self.MEMORY_DOMAINS:
            raise ValueError(f"Invalid memory domain: {domain}. Must be one of {self.MEMORY_DOMAINS}")
            
        if confidence < 0 or confidence > 100:
            raise ValueError("Confidence must be between 0 and 100.")
            
        memory_id = f"mem_{uuid.uuid4().hex[:8]}"
        timestamp = datetime.utcnow().isoformat()
        
        item = {
            "id": memory_id,
            "title": title,
            "type": memory_type,
            "owner": owner,
            "date": timestamp,
            "confidence": confidence,
            "summary": summary,
            "links": links or [],
            "tags": tags or [],
            "review_date": review_date,
            "status": "active"
        }
        
        file_path = self.base_path / domain / f"{memory_id}.json"
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(item, f, ensure_ascii=False, indent=2)
            
        return memory_id
        
    def retrieve_by_tags(self, domain: str, tags: List[str]) -> List[Dict[str, Any]]:
        """Retrieve memory items matching specific tags within a domain."""
        domain_path = self.base_path / domain
        if not domain_path.exists():
            return []
            
        results = []
        for file_path in domain_path.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if any(tag in data.get("tags", []) for tag in tags):
                        results.append(data)
            except Exception:
                continue
                
        # Sort by confidence descending
        return sorted(results, key=lambda x: x.get("confidence", 0), reverse=True)
