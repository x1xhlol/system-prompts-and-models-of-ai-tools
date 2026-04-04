import asyncio
import sys
import os
import logging

# Setup Path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from backend.app.agents.discovery.lead_engine import LeadEngine

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - [%(levelname)s] - %(message)s")
logger = logging.getLogger(__name__)

async def test_super_engine():
    logger.info("🚀 [SUPER ENGINE V3 TEST] Initializing...")
    engine = LeadEngine()
    
    # Task: Comprehensive Discovery for IT Sector in Riyadh
    task = {
        "action": "discover",
        "sector": "it",
        "city": "الرياض",
        "count": 5
    }
    
    logger.info(f"🔍 Starting Deep Discovery for: {task['sector']} in {task['city']}")
    result = await engine.execute(task)
    
    logger.info(f"📊 Discovery Complete! Total Leads Found: {result['total']}")
    
    for i, lead in enumerate(result['leads'], 1):
        logger.info(f"--- Lead #{i}: {lead['name']} ---")
        logger.info(f"📍 Location: {lead.get('city')} | Source: {lead.get('source')}")
        
        if "social_signals" in lead:
            logger.info(f"🔥 [SIGNAL FOUND] Platform: {lead['social_signals'][0]['platform']}")
            logger.info(f"👉 Content: {lead['social_signals'][0]['content']}")
            logger.info(f"🎯 Intent: {lead['social_signals'][0]['intent']} (Confidence: {lead['social_signals'][0]['score']}%)")
            
        if lead.get("is_enterprise"):
            logger.info(f"🏢 [ENTERPRISE] High-Value Target detected from official directories.")

    logger.info("✅ [SUPER ENGINE V3] Mission Success. All sources integrated.")

if __name__ == "__main__":
    asyncio.run(test_super_engine())
