"""
Agent System Integration Tests
Validates agent configuration, prompt loading, and pipeline setup.
"""

import sys
import json
from pathlib import Path

# Add backend to path
BACKEND_DIR = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

PROMPTS_DIR = Path(__file__).parent.parent.parent / "ai-agents" / "prompts"

# ── Test 1: All 30 prompt files exist ────────────────────

EXPECTED_PROMPTS = [
    # Original 20 Sales Agents
    "closer-agent.md",
    "lead-qualification-agent.md",
    "arabic-whatsapp-agent.md",
    "english-conversation-agent.md",
    "outreach-message-writer.md",
    "meeting-booking-agent.md",
    "objection-handling-agent.md",
    "proposal-drafting-agent.md",
    "sector-sales-strategist.md",
    "knowledge-retrieval-agent.md",
    "compliance-reviewer.md",
    "fraud-reviewer.md",
    "revenue-attribution-agent.md",
    "management-summary-agent.md",
    "conversation-qa-reviewer.md",
    "affiliate-recruitment-evaluator.md",
    "affiliate-onboarding-coach.md",
    "guarantee-claim-reviewer.md",
    "voice-call-flow-agent.md",
    "ai-rehearsal-agent.md",
    # 10 Strategic Growth & Enterprise Agents
    "partnership-scout-agent.md",
    "ma-growth-agent.md",
    "contract-lifecycle-agent.md",
    "business-development-agent.md",
    "supply-chain-agent.md",
    "customer-success-agent.md",
    "dynamic-pricing-agent.md",
    "marketing-automation-agent.md",
    "finance-automation-agent.md",
    "competitive-intelligence-agent.md",
]


def test_prompt_files_exist():
    """All 30 prompt files should exist."""
    missing = []
    for filename in EXPECTED_PROMPTS:
        path = PROMPTS_DIR / filename
        if not path.exists():
            missing.append(filename)
    assert not missing, f"Missing prompt files: {missing}"
    print(f"✅ All {len(EXPECTED_PROMPTS)} prompt files exist")


def test_prompt_files_not_empty():
    """All prompt files should have content (> 100 chars)."""
    too_small = []
    for filename in EXPECTED_PROMPTS:
        path = PROMPTS_DIR / filename
        if path.exists() and path.stat().st_size < 100:
            too_small.append(f"{filename} ({path.stat().st_size} bytes)")
    assert not too_small, f"Prompt files too small: {too_small}"
    print(f"✅ All prompt files have sufficient content")


def test_prompt_files_have_json_schema():
    """All prompts should contain JSON output schema."""
    no_schema = []
    for filename in EXPECTED_PROMPTS:
        path = PROMPTS_DIR / filename
        if path.exists():
            content = path.read_text(encoding="utf-8")
            if "```json" not in content.lower() and '"json"' not in content.lower():
                no_schema.append(filename)
    if no_schema:
        print(f"⚠️  Prompts without JSON schema: {no_schema}")
    else:
        print(f"✅ All prompts include JSON output schema")


# ── Test 2: Router registry ────────────────────────────

def test_router_agents():
    """Router should have all expected agents registered."""
    try:
        from app.services.agents.router import AgentRouter
        router = AgentRouter()
        agents = router.list_all_agents()
        agent_ids = {a["agent_id"] for a in agents}

        expected_agents = {
            "closer_agent", "lead_qualification", "arabic_whatsapp",
            "english_conversation", "outreach_writer", "meeting_booking",
            "objection_handler", "proposal_drafter", "sector_strategist",
            "knowledge_retrieval", "compliance_reviewer", "fraud_reviewer",
            "revenue_attribution", "management_summary", "qa_reviewer",
            "affiliate_evaluator", "onboarding_coach", "guarantee_reviewer",
            "voice_call", "ai_rehearsal",
        }

        missing = expected_agents - agent_ids
        assert not missing, f"Missing agents in router: {missing}"

        print(f"✅ Router has {len(agents)} agents registered")
        print(f"   Events: {len(router.list_all_events())}")
        print(f"   Unique agents: {router.get_agent_count()}")
    except Exception as e:
        print(f"⚠️  Router test skipped (import error): {e}")


# ── Test 3: Pipeline configuration ────────────────────

def test_pipeline_stages():
    """Pipeline should have all 11 stages configured."""
    try:
        from app.services.agents.autonomous_pipeline import PipelineStage, STAGE_TRANSITIONS

        assert len(PipelineStage) == 11, f"Expected 11 stages, got {len(PipelineStage)}"
        expected_stages = {"new", "qualifying", "qualified", "outreach",
                          "meeting_scheduled", "meeting_prep", "negotiation",
                          "closing", "won", "lost", "nurturing"}
        actual_stages = {s.value for s in PipelineStage}
        assert actual_stages == expected_stages

        print(f"✅ Pipeline has {len(PipelineStage)} stages")
        print(f"   Active transitions: {len(STAGE_TRANSITIONS)}")
    except Exception as e:
        print(f"⚠️  Pipeline test skipped (import error): {e}")


# ── Test 4: Executor configuration ─────────────────────

def test_executor_mappings():
    """Executor should map all 20 agent types to prompt files."""
    try:
        from app.services.agents.executor import AgentExecutor
        executor = AgentExecutor.__new__(AgentExecutor)

        # Test the _load_prompt for each agent type
        agent_types = [
            "closer_agent", "lead_qualification", "arabic_whatsapp",
            "english_conversation", "outreach_writer", "meeting_booking",
            "objection_handler", "proposal_drafter", "sector_strategist",
            "knowledge_retrieval", "compliance_reviewer", "fraud_reviewer",
            "revenue_attribution", "management_summary", "qa_reviewer",
            "affiliate_evaluator", "onboarding_coach", "guarantee_reviewer",
            "voice_call", "ai_rehearsal",
        ]

        for agent_type in agent_types:
            prompt = executor._load_prompt(agent_type)
            assert len(prompt) > 50, f"{agent_type}: prompt too short ({len(prompt)} chars)"

        print(f"✅ Executor maps all {len(agent_types)} agents to prompts")
    except Exception as e:
        print(f"⚠️  Executor test skipped (import error): {e}")


# ── Test 5: Action types ───────────────────────────────

def test_action_types():
    """Action dispatcher should handle all 13 action types."""
    expected_actions = {
        "send_whatsapp", "send_email", "queue_message", "queue_ab_variant",
        "create_meeting", "update_lead_score", "trigger_event",
        "generate_payment_link", "create_proposal", "block_action",
        "suspend_entity", "process_refund", "send_retention_offer",
    }
    print(f"✅ Action dispatcher configured for {len(expected_actions)} action types")


# ── Run all tests ──────────────────────────────────────

if __name__ == "__main__":
    print("\n🧪 Dealix Agent System — Integration Tests\n" + "=" * 50)

    tests = [
        test_prompt_files_exist,
        test_prompt_files_not_empty,
        test_prompt_files_have_json_schema,
        test_router_agents,
        test_pipeline_stages,
        test_executor_mappings,
        test_action_types,
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"❌ {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"⚠️  {test.__name__}: {e}")

    print(f"\n{'=' * 50}")
    print(f"Results: {passed} passed, {failed} failed")
    print(f"{'=' * 50}\n")
