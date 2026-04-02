"""
Dealix AI Agent Framework — Base Agent
=======================================
Foundation class for all 22 AI agents.
Every agent inherits from this and gains:
- Multi-model AI routing (5 models)
- Memory & context management
- Inter-agent communication
- Self-monitoring & error recovery
- Event-driven architecture
"""
import asyncio
import json
import logging
import os
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from enum import Enum

logger = logging.getLogger("dealix.agents")


class AgentStatus(str, Enum):
    IDLE = "idle"
    WORKING = "working"
    WAITING = "waiting"
    ERROR = "error"
    DISABLED = "disabled"


class AgentPriority(str, Enum):
    CRITICAL = "critical"    # Must execute immediately
    HIGH = "high"            # Execute within minutes
    NORMAL = "normal"        # Execute within the hour
    LOW = "low"              # Execute when idle
    BACKGROUND = "background" # Execute overnight


class AgentMessage:
    """Inter-agent communication message."""
    def __init__(self, sender: str, recipient: str, action: str, payload: Dict = None, priority: AgentPriority = AgentPriority.NORMAL):
        self.id = f"msg_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}"
        self.sender = sender
        self.recipient = recipient
        self.action = action
        self.payload = payload or {}
        self.priority = priority
        self.timestamp = datetime.now(timezone.utc)
        self.processed = False


class BaseAgent(ABC):
    """
    Base class for all Dealix AI agents.
    
    Every agent can:
    - Think (process data with AI)
    - Act (perform actions)
    - Communicate (send/receive messages to/from other agents)
    - Learn (store insights for future use)
    - Report (log actions and results)
    """

    def __init__(self, name: str, name_ar: str, layer: int, description: str = ""):
        self.name = name
        self.name_ar = name_ar
        self.layer = layer
        self.description = description
        self.status = AgentStatus.IDLE
        self.inbox: List[AgentMessage] = []
        self.outbox: List[AgentMessage] = []
        self.memory: Dict[str, Any] = {}
        self.metrics = {
            "tasks_completed": 0,
            "tasks_failed": 0,
            "total_runtime_seconds": 0,
            "last_active": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._ai_router = None
        self._message_bus = None

    @property
    def ai(self):
        """Lazy-load the AI model router."""
        if self._ai_router is None:
            try:
                from app.services.model_router import get_router
                self._ai_router = get_router()
            except Exception:
                logger.warning(f"[{self.name}] Could not load AI router")
        return self._ai_router

    # ══════════════════════════════════════════════════
    # Abstract methods — each agent implements these
    # ══════════════════════════════════════════════════

    @abstractmethod
    async def execute(self, task: Dict) -> Dict:
        """Execute the agent's primary task."""
        pass

    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """Return list of what this agent can do."""
        pass

    # ══════════════════════════════════════════════════
    # AI Thinking — Use any of 5 models
    # ══════════════════════════════════════════════════

    async def think(self, prompt: str, system_prompt: str = "", task_type: str = "general", 
                    model: str = None, temperature: float = 0.3) -> str:
        """Use AI to process a thought/decision."""
        if not self.ai:
            return ""
        
        sys_prompt = system_prompt or f"أنت {self.name_ar}، وكيل ذكي ضمن نظام Dealix AI. مهمتك: {self.description}"
        
        try:
            result = await self.ai.route(task_type, prompt, sys_prompt)
            return result.get("text", "")
        except Exception as e:
            logger.error(f"[{self.name}] Think error: {e}")
            return ""

    async def think_json(self, prompt: str, system_prompt: str = "", task_type: str = "general") -> Dict:
        """Use AI and expect JSON response."""
        response = await self.think(
            prompt + "\n\nرد بـ JSON فقط. بدون أي نص إضافي.",
            system_prompt,
            task_type,
        )
        try:
            if "{" in response:
                json_str = response[response.index("{"):response.rindex("}") + 1]
                return json.loads(json_str)
        except Exception:
            pass
        return {}

    # ══════════════════════════════════════════════════
    # Communication — Inter-agent messaging
    # ══════════════════════════════════════════════════

    def send_message(self, recipient: str, action: str, payload: Dict = None, 
                     priority: AgentPriority = AgentPriority.NORMAL):
        """Send a message to another agent."""
        msg = AgentMessage(
            sender=self.name,
            recipient=recipient,
            action=action,
            payload=payload or {},
            priority=priority,
        )
        self.outbox.append(msg)
        
        # Route via message bus if available
        if self._message_bus:
            self._message_bus.route(msg)
        
        return msg.id

    def receive_message(self, message: AgentMessage):
        """Receive a message from another agent."""
        self.inbox.append(message)

    async def process_inbox(self):
        """Process all pending messages."""
        # Sort by priority
        self.inbox.sort(key=lambda m: list(AgentPriority).index(m.priority))
        
        for msg in self.inbox:
            if not msg.processed:
                try:
                    await self.handle_message(msg)
                    msg.processed = True
                except Exception as e:
                    logger.error(f"[{self.name}] Message handling error: {e}")

    async def handle_message(self, message: AgentMessage):
        """Handle a received message. Override in subclasses for custom behavior."""
        logger.info(f"[{self.name}] Received '{message.action}' from {message.sender}")

    # ══════════════════════════════════════════════════
    # Memory — Store and retrieve insights
    # ══════════════════════════════════════════════════

    def remember(self, key: str, value: Any):
        """Store something in agent memory."""
        self.memory[key] = {
            "value": value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def recall(self, key: str, default: Any = None) -> Any:
        """Retrieve from memory."""
        entry = self.memory.get(key)
        if entry:
            return entry.get("value", default)
        return default

    # ══════════════════════════════════════════════════
    # Execution wrapper
    # ══════════════════════════════════════════════════

    async def run(self, task: Dict) -> Dict:
        """Safely execute a task with monitoring."""
        self.status = AgentStatus.WORKING
        self.metrics["last_active"] = datetime.now(timezone.utc).isoformat()
        start = asyncio.get_event_loop().time()

        try:
            result = await self.execute(task)
            self.metrics["tasks_completed"] += 1
            self.status = AgentStatus.IDLE
            return {"status": "success", "agent": self.name, "result": result}
        except Exception as e:
            self.metrics["tasks_failed"] += 1
            self.status = AgentStatus.ERROR
            logger.exception(f"[{self.name}] Task failed: {e}")
            return {"status": "error", "agent": self.name, "error": str(e)}
        finally:
            elapsed = asyncio.get_event_loop().time() - start
            self.metrics["total_runtime_seconds"] += elapsed

    # ══════════════════════════════════════════════════
    # Status & info
    # ══════════════════════════════════════════════════

    def get_status(self) -> Dict:
        return {
            "name": self.name,
            "name_ar": self.name_ar,
            "layer": self.layer,
            "status": self.status.value,
            "capabilities": self.get_capabilities(),
            "metrics": self.metrics,
            "inbox_pending": len([m for m in self.inbox if not m.processed]),
            "memory_keys": list(self.memory.keys()),
        }

    def __repr__(self):
        return f"<Agent:{self.name} Layer:{self.layer} Status:{self.status.value}>"


# ══════════════════════════════════════════════════════
# Message Bus — Routes messages between agents
# ══════════════════════════════════════════════════════

class AgentMessageBus:
    """Central message routing for all agents."""

    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.message_log: List[AgentMessage] = []

    def register(self, agent: BaseAgent):
        self.agents[agent.name] = agent
        agent._message_bus = self

    def route(self, message: AgentMessage):
        """Route a message to its recipient."""
        self.message_log.append(message)
        recipient = self.agents.get(message.recipient)
        if recipient:
            recipient.receive_message(message)
        else:
            logger.warning(f"Agent '{message.recipient}' not found for message from '{message.sender}'")

    def get_all_statuses(self) -> List[Dict]:
        return [agent.get_status() for agent in self.agents.values()]

    def get_agent(self, name: str) -> Optional[BaseAgent]:
        return self.agents.get(name)


# Singleton bus
_bus: Optional[AgentMessageBus] = None

def get_message_bus() -> AgentMessageBus:
    global _bus
    if _bus is None:
        _bus = AgentMessageBus()
    return _bus
