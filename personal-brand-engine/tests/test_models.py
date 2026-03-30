"""Tests for database models."""

import sys
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def test_database_init():
    """Database should initialize and create tables."""
    import os
    os.environ["DATABASE_URL"] = "sqlite:///./test_brand.db"
    from storage.database import init_db, get_db
    from storage.models import Base
    init_db()
    db = get_db()
    db.close()
    # Cleanup
    if Path("test_brand.db").exists():
        Path("test_brand.db").unlink()


def test_post_model():
    """Post model should be creatable."""
    from storage.models import Post
    post = Post(
        platform="linkedin",
        content="Test post",
        status="draft",
    )
    assert post.platform == "linkedin"
    assert post.status == "draft"


def test_opportunity_model():
    """Opportunity model should be creatable."""
    from storage.models import Opportunity
    opp = Opportunity(
        source="linkedin",
        title="Field Engineer",
        company="Smiths Detection",
        url="https://example.com",
        description="Test job",
        relevance_score=0.85,
        status="new",
    )
    assert opp.relevance_score == 0.85
    assert opp.source == "linkedin"


def test_agent_log_model():
    """AgentLog model should be creatable."""
    from storage.models import AgentLog
    log = AgentLog(
        agent_name="linkedin",
        task="post_content",
        status="success",
        details="Posted successfully",
        duration_seconds=1.5,
    )
    assert log.agent_name == "linkedin"
    assert log.duration_seconds == 1.5
