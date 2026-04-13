import asyncio
import os
from pathlib import Path

# JWT-based API tests require this gate to be off (production may set .env).
os.environ["DEALIX_INTERNAL_API_TOKEN"] = ""

# Fresh SQLite schema per pytest session — avoids stale ./dealix.db missing new columns.
_backend_root = Path(__file__).resolve().parent.parent
_test_sqlite = _backend_root / ".pytest_dealix.sqlite"
try:
    _test_sqlite.unlink(missing_ok=True)
except OSError:
    pass
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///" + _test_sqlite.resolve().as_posix()

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def _init_database():
    from app.database import init_db

    asyncio.run(init_db())


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
