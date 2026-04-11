"""
Compatibility helpers for PostgreSQL <-> SQLite column types.
Import from here instead of sqlalchemy.dialects.postgresql directly.
"""
import uuid
import json
from app.config import get_settings

_settings = get_settings()
IS_SQLITE = "sqlite" in _settings.DATABASE_URL

from sqlalchemy import Column, String, Text, TypeDecorator

if IS_SQLITE:
    # ── SQLite-compatible replacements ─────────────────────────

    class UUID:
        """Fake UUID column that stores as String(36) for SQLite."""
        def __new__(cls, as_uuid=True):
            return String(36)

    class JSONB(TypeDecorator):
        """Persist dict/list as JSON text under SQLite (binds dict correctly)."""
        impl = Text
        cache_ok = True

        def process_bind_param(self, value, dialect):
            if value is None:
                return None
            if isinstance(value, str):
                return value
            return json.dumps(value, ensure_ascii=False)

        def process_result_value(self, value, dialect):
            if value is None:
                return None
            if isinstance(value, str):
                try:
                    return json.loads(value)
                except Exception:
                    return {}
            return value

    def default_uuid():
        return str(uuid.uuid4())

    def default_json(val=None):
        """Returns a default factory for JSON columns."""
        _val = val if val is not None else {}
        return lambda: json.dumps(_val)

else:
    # ── Real PostgreSQL types ───────────────────────────────────
    from sqlalchemy.dialects.postgresql import UUID, JSONB

    def default_uuid():
        return uuid.uuid4()

    def default_json(val=None):
        return val if val is not None else {}
