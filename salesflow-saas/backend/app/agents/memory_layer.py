import os
from typing import Dict, List, Any, Optional
import json

try:
    from mem0 import Memory
    from mem0.configs.base import MemoryConfig
except ImportError:
    Memory = None  # type: ignore[misc, assignment]
    MemoryConfig = None  # type: ignore[misc, assignment]


class _MockMemory:
    """Used when mem0 is unavailable or cannot initialize (CI, missing API keys)."""

    def __init__(self, config=None):
        self.store = []

    def search(self, query: str, user_id: str, **kwargs):
        return [{"text": "Mocked memory context."}]

    def add(self, text: str, user_id: str, metadata: dict = None, **kwargs):
        self.store.append({"text": text, "user_id": user_id, "metadata": metadata})

class SelfHealingMemory:
    """
    Layer 3: Centralized Self-Healing Memory using Mem0 AI.
    Provides episodic long-term memory for CrewAI Agents across the Dealix OS.
    """
    def __init__(self, namespace="dealix_org"):
        self.namespace = namespace
        # Use simple configuration. Can be enhanced with Qdrant later.
        self.config = {
            "llm": {
                "provider": "anthropic",
                "config": {
                    "model": "claude-3-haiku-20240307",
                    "temperature": 0.1
                }
            }
        }
        self.memory = _MockMemory()
        if Memory is not None and MemoryConfig is not None:
            try:
                self.memory = Memory(config=MemoryConfig.model_validate(self.config))
            except Exception:
                self.memory = _MockMemory()

    def get_context(self, company_name: str, context_type: str = "general") -> str:
        """
        Retrieves context about a company to inject into agent prompts.
        """
        query = f"Provide all known {context_type} information regarding the company: {company_name}"
        records = self.memory.search(query=query, user_id=self.namespace)
        
        # Consolidate strings
        if not records:
            return "No prior context discovered in episodic memory."
            
        context_str = "Memory Context:\n"
        for rec in records:
            # Mem0 records structure depends on version, usually contains 'memory' or 'text'
            text_val = rec.get('text') or rec.get('memory') or str(rec)
            context_str += f"- {text_val}\n"
            
        return context_str

    def add_insight(self, company_name: str, insight: str, tag: str = "discovery"):
        """
        Stores episodic agent findings.
        """
        metadata = {
            "company": company_name,
            "tag": tag,
            "source": "autonomous_os"
        }
        self.memory.add(text=insight, user_id=self.namespace, metadata=metadata)
        
    def consolidate(self, company_name: str):
        """
        To be implemented by the Knowledge Distiller Node:
        Cleans up redundant memories.
        """
        pass

# Singleton instance for agents
empire_memory = SelfHealingMemory()
