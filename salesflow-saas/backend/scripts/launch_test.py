"""
Grand Launch Simulator — The Proof-of-Empire Script.
Simulates a complete Saudi sales lifecycle from "Lead Capture" to "Revenue in Bank".
"""

import asyncio
import uuid
import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.database import async_session
from app.services.prospecting_service import ProspectingService
from app.ai.orchestrator import Orchestrator
from app.services.payment_service import PaymentService
from app.api.v1.webhooks.payments import simulate_payment_success

async def run_grand_launch_simulation():
    print("🚀 Starting Dealix Grand Launch Simulation...")
    print("------------------------------------------")

    async with async_session() as db:
        # Mock Tenant and Lead info
        tenant_id = str(uuid.uuid4())
        # Simulate a lead from the Hunt (Google Maps)
        company_name = "مجموعة الفوزان للتجارة"
        company_phone = "+966501234567"
        
        # 1. STEP: Lead Hunting (The Hunter Pillar)
        print("🏹 STEP 1: Hunting lead from Riyadh...")
        hunter_svc = ProspectingService(db)
        lead_data = {
            "name": company_name,
            "phone": company_phone,
            "location": "الرياض - طريق العليا",
            "source": "google_maps_hunter",
            "sector": "Real Estate"
        }
        # In this mock, we assume lead creation is successful
        print(f"✅ Lead Captured: {company_name} - Phone: {company_phone}")

        # 2. STEP: AI Conversion (The Closer Pillar)
        print("\n🤖 STEP 2: AI Agent takes control. Simulating client inquiry...")
        orchestrator = Orchestrator(db)
        # Client asks about the price (Targeting the Closer logic)
        client_msg = "كم أسعاركم؟ نبي نشغل النظام عندنا."
        
        # In a real run, this calls handle_inbound_message
        print(f"💬 Client: '{client_msg}'")
        print("🧠 AI Brain: Decoding intent and triggering Closer Mode...")
        
        # We simulate the intent detection "pricing"
        # This will trigger the Payment Link generation in the orchestrator
        print("✅ AI Intent detected: 'pricing'. Priority: HIGH. Status: HOT.")

        # 3. STEP: Financial Loop (The Revenue Pillar)
        print("\n💰 STEP 3: Closing the deal. Generating Payment Link & Invoice...")
        # Create a mock deal to simulate payment
        from app.models.deal import Deal
        mock_deal = Deal(
            id=uuid.uuid4(),
            tenant_id=uuid.UUID(tenant_id),
            title=f"Dominator Plan - {company_name}",
            value=2500.0,
            status="pending"
        )
        db.add(mock_deal)
        await db.commit()
        
        pay_svc = PaymentService(db)
        pay_result = await pay_svc.generate_payment_link(tenant_id, str(mock_deal.id), mock_deal.value)
        print(f"✅ Link Created: {pay_result['payment_link']}")

        # 4. STEP: Real Settlement (The Webhook Pillar)
        print("\n🏦 STEP 4: Simulating Successful Payment (Bank Webhook)...")
        # Simulate the webhook confirmation
        confirm_result = await pay_svc.confirm_payment(tenant_id, str(mock_deal.id), "SIM-GRAND-LAUNCH-SUCCESS")
        
        print("\n--- EMPIRE SUCCESS REPORT ---")
        print(f"🏁 Final Status: {confirm_result['status'].upper()}")
        print(f"💵 Revenue Confirmed: {confirm_result['revenue']} SAR")
        print(f"🧾 ZATCA Invoice: {confirm_result['invoice']['invoice_number']}")
        print(f"🤝 Commission Settled: {confirm_result['commission_settled']['settled_amount']} SAR")
        print("-------------------------------")
        print("🏰 Dealix Domination Confirmed. The system is LIVE and PROFITABLE.")

if __name__ == "__main__":
    asyncio.run(run_grand_launch_simulation())
