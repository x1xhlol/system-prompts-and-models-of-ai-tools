import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text


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
    return url or "sqlite+aiosqlite:///./dealix.db"


_DB_URL = _get_db_url()
IS_SQLITE = "sqlite" in _DB_URL.lower()

if IS_SQLITE:
    engine = create_async_engine(
        _DB_URL,
        echo=False,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_async_engine(
        _DB_URL,
        echo=False,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
    )

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Aliases for backward compatibility with workers
SessionLocal = async_session
async_session_factory = async_session


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    import app.models  # noqa: F401 — register all models on Base.metadata before create_all

    async with engine.begin() as conn:
        if not IS_SQLITE:
            for ext in ["CREATE EXTENSION IF NOT EXISTS vector",
                        "CREATE EXTENSION IF NOT EXISTS pg_trgm"]:
                try:
                    await conn.execute(text(ext))
                except Exception:
                    pass
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Database initialized")
