from __future__ import annotations

from typing import Any, Awaitable, Callable, Dict


TaskHandler = Callable[[str, Dict[str, Any]], Awaitable[Dict[str, Any]]]


class OpenClawTaskRouter:
    """Routes task types to async handlers with safe defaults."""

    def __init__(self) -> None:
        self._handlers: Dict[str, TaskHandler] = {}

    def register(self, task_type: str, handler: TaskHandler) -> None:
        self._handlers[task_type] = handler

    async def route(self, task_type: str, tenant_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        h = self._handlers.get(task_type)
        if not h:
            raise ValueError(f"unsupported_task_type:{task_type}")
        return await h(tenant_id, payload)


task_router = OpenClawTaskRouter()
