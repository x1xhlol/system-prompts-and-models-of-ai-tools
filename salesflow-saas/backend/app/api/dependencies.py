# app/api/dependencies.py — compatibility alias for deps.py
from app.api.deps import get_current_user, get_current_tenant, require_role
from app.database import get_db

__all__ = ["get_db", "get_current_user", "get_current_tenant", "require_role"]
