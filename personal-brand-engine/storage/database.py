"""Database engine and session management for the personal brand engine."""

from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from config.settings import get_settings
from storage.models import Base

_engine = None
_SessionLocal: sessionmaker[Session] | None = None


def _get_engine():
    """Lazily create and return the SQLAlchemy engine."""
    global _engine
    if _engine is None:
        settings = get_settings()
        url = settings.database_url

        # Ensure the directory exists for SQLite databases.
        if url.startswith("sqlite"):
            db_path = url.split("///")[-1]
            if db_path and db_path != ":memory:":
                Path(db_path).parent.mkdir(parents=True, exist_ok=True)

        _engine = create_engine(
            url,
            echo=False,
            # SQLite-specific: allow multi-threaded access.
            connect_args={"check_same_thread": False} if url.startswith("sqlite") else {},
            pool_pre_ping=True,
        )
    return _engine


def _get_session_factory() -> sessionmaker[Session]:
    """Lazily create and return the session factory."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            bind=_get_engine(),
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )
    return _SessionLocal


def init_db() -> None:
    """Create all tables defined in the ORM models.

    Safe to call multiple times -- existing tables are not recreated.
    """
    Base.metadata.create_all(bind=_get_engine())


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """Provide a transactional database session scope.

    Usage::

        with get_db() as db:
            db.add(Post(...))
            db.commit()
    """
    session = _get_session_factory()()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
