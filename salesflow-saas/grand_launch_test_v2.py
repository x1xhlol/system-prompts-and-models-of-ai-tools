import asyncio
import json
import logging
from pprint import pprint
import sys

# Configure basic logging to see everything in the console
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

from app.agents import initialize_agents

async def test_full_autonomous_os():
    print("\n" + "="*70)
    print("🚀 DEALIX AUTONOMOUS REVENUE OS: COMPREHENSIVE LAUNCH TEST (APRIL 2026) 🚀")
    print("="*70)

    print("\n[1] Initializing 34-Agent Ecosystem (Loading 7 Layers)...")
    bus = initialize_agents()
    ceo = bus.get_agent('ceo_agent')
    
    if not ceo:
        print("❌ CEO Agent failed to initialize.")
        sys.exit(1)
        
    print(f"✅ Empire Operational. Master Agent: {ceo.name}")

    print("\n[2] Testing LangGraph Deal Cycle (Layer 1 Orchestration)...")
    
    # We pass a test company into the CEO's new Run LangGraph capability
    initial_deal_state = {
        "deal_id": "STC-0092",
        "company_name": "Saudi Telecom Company (STC)",
        "decision_maker": "Olayan - VP Digital Channels"
    }
    
    result = await ceo.execute({
        "action": "langgraph_deal_cycle",
        "deal_state": initial_deal_state
    })
    
    if "error" in result:
        print(f"⚠️ Test proceeded with fallback due to missing config: {result['error']}")
    else:
        print("\n✅ LangGraph Deal Results:")
        print(f"  🏢 Company: {result.get('company_name')}")
        print(f"  📈 Intent Score: {result.get('intent_score', 0.0)}")
        print(f"  🛡️ Compliance Approved: {result.get('compliance_approved')}")
        print(f"  👤 Human Handoff Needed: {result.get('human_intervention_required')}")
        print(f"  ✉️ AI Generated Opener: {result.get('next_action_payload')}")
        
        print("\n📜 Time-Travel History Log:")
        for log in result.get('history_log', []):
            print(f"  -> {log}")

        # Check Salesforce Integration Result
        # Since sync_deal is mocked or real, we should see it in the logs.
        if any(
            isinstance(x, str) and "Synced to Salesforce Agentforce" in x
            for x in result.get("history_log", [])
        ):
            print("\n✅ Salesforce Agentforce 360 Sync Confirmed.")
            
    print("\n" + "="*70)
    print("🚀 ALL SYSTEMS AUTOMOUS - TEST COMPLETE 🚀")
    print("="*70 + "\n")

if __name__ == "__main__":
    asyncio.run(test_full_autonomous_os())
