"""
SQLite Compatibility Patch for Dealix
Proper TypeDecorator subclasses — fully compatible with SQLAlchemy Column().
"""
import os
import json
from sqlalchemy import String, Text, TypeDecorator


def _get_db_url() -> str:
    url = os.environ.get("DATABASE_URL", "")
    if not url:
        for env_file in [".env", "../.env"]:
            try:
                with open(env_file) as f:
                    for line in f:
                        if line.strip().startswith("DATABASE_URL="):
                            url = line.strip().split("=", 1)[1]
                            break
            except FileNotFoundError:
                continue
    return url


class _FakeUUID(TypeDecorator):
    """UUID stored as VARCHAR(36) for SQLite."""
    impl = String
    cache_ok = True

    def __init__(self, as_uuid=True, **kw):
        super().__init__(36)

    def process_bind_param(self, value, dialect):
        return str(value) if value is not None else None

    def process_result_value(self, value, dialect):
        return value


class _FakeJSONB(TypeDecorator):
    """JSONB stored as TEXT for SQLite."""
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
                return value
        return value


class _FakeINET(TypeDecorator):
    """IP address stored as VARCHAR for SQLite."""
    impl = String
    cache_ok = True

    def __init__(self, *a, **kw):
        super().__init__(45)  # max IPv6 length


class _FakeARRAY(TypeDecorator):
    impl = Text
    cache_ok = True

    def __init__(self, *a, **kw):
        super().__init__()

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return json.dumps(value, ensure_ascii=False)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        try:
            return json.loads(value)
        except Exception:
            return value


class _FakePGModule:
    """Fake postgresql module — all common PG types mapped to SQLite-compatible types."""
    UUID = _FakeUUID
    JSONB = _FakeJSONB
    INET = _FakeINET
    ARRAY = _FakeARRAY
    # Additional types as simple String fallbacks
    TSVECTOR = String
    TSQUERY = String
    CIDR = String
    MACADDR = String
    HSTORE = _FakeJSONB
    JSON = _FakeJSONB


class _FakeVector(TypeDecorator):
    """Vector stored as TEXT for SQLite (no pgvector needed)."""
    impl = Text
    cache_ok = True

    def __init__(self, dim=None, *a, **kw):
        super().__init__()

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return json.dumps(value if isinstance(value, list) else list(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        try:
            return json.loads(value)
        except Exception:
            return value


class _FakePGVectorSQLAlchemy:
    Vector = _FakeVector


class _FakePGVectorRoot:
    sqlalchemy = _FakePGVectorSQLAlchemy()


def apply_patch():
    import sys
    import types
    db_url = _get_db_url()
    if "sqlite" in db_url.lower():
        # Patch PostgreSQL dialect
        sys.modules["sqlalchemy.dialects.postgresql"] = _FakePGModule()  # type: ignore

        # Patch pgvector
        pgvector_root = types.ModuleType("pgvector")
        pgvector_sa = types.ModuleType("pgvector.sqlalchemy")
        pgvector_sa.Vector = _FakeVector  # type: ignore
        pgvector_root.sqlalchemy = pgvector_sa  # type: ignore
        sys.modules["pgvector"] = pgvector_root
        sys.modules["pgvector.sqlalchemy"] = pgvector_sa

        print("🔧 SQLite patch applied — UUID/JSONB/Vector → SQLite types")
    else:
        print(f"ℹ️  DB: {db_url.split(':')[0]} — no patch needed")
