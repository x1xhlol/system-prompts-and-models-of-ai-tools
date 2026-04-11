from fastapi import APIRouter
from app.api.v1 import (
    auth, leads, deals, dashboard, tenants, users, affiliates, ai_agents,
    companies, contacts, calls, meetings, commissions, payouts, disputes,
    guarantees, consents, complaints, knowledge, sectors, presentations,
    supervisor, admin, health, analytics, webhooks, prospecting,
    inbox, sequences,
)
from app.api.v1 import compliance as compliance_router
from app.api.v1 import agents as agents_router
from app.api.v1 import intelligence as intelligence_router
from app.api.v1 import master as master_router
from app.api.v1 import revenue_room as revenue_room_router
from app.api.v1 import outreach_engine as outreach_router
from app.api.v1 import lead_prospector as prospector_router
from app.api.v1 import pipeline as pipeline_router
from app.api.v1 import agent_system as agent_system_router
from app.api.v1 import autonomous_foundation as autonomous_foundation_router
from app.api.v1 import marketing_hub as marketing_hub_router
from app.api.v1 import strategy_summary as strategy_summary_router
from app.api.v1 import value_proposition as value_proposition_router
from app.api.v1 import customer_onboarding as customer_onboarding_router
from app.api.v1 import sales_os as sales_os_router
from app.api.v1 import operations as operations_router

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(tenants.router, prefix="/tenant", tags=["Tenant"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])
api_router.include_router(deals.router, prefix="/deals", tags=["Deals"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(affiliates.router)
api_router.include_router(ai_agents.router)
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["Contacts"])
api_router.include_router(calls.router, prefix="/calls", tags=["Calls"])
api_router.include_router(meetings.router, prefix="/meetings", tags=["Meetings"])
api_router.include_router(commissions.router, prefix="/commissions", tags=["Commissions"])
api_router.include_router(payouts.router, prefix="/payouts", tags=["Payouts"])
api_router.include_router(disputes.router, prefix="/disputes", tags=["Disputes"])
api_router.include_router(guarantees.router, prefix="/guarantees", tags=["Guarantees"])
api_router.include_router(consents.router, prefix="/consents", tags=["Consents"])
api_router.include_router(complaints.router, prefix="/complaints", tags=["Complaints"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge"])
api_router.include_router(sectors.router, prefix="/sectors", tags=["Sectors"])
api_router.include_router(presentations.router, prefix="/presentations", tags=["Presentations"])
api_router.include_router(supervisor.router, prefix="/supervisor", tags=["Supervisor"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(marketing_hub_router.router)
api_router.include_router(strategy_summary_router.router)
api_router.include_router(value_proposition_router.router)
api_router.include_router(customer_onboarding_router.router)
api_router.include_router(sales_os_router.router)
api_router.include_router(operations_router.router)
api_router.include_router(analytics.router, tags=["Analytics & AI"])
api_router.include_router(webhooks.router, tags=["Webhooks"])
api_router.include_router(prospecting.router, prefix="/prospecting", tags=["Prospecting"])
api_router.include_router(inbox.router)
api_router.include_router(sequences.router)
api_router.include_router(compliance_router.router)

# ── Manus Multi-Agent + Autonomous Intelligence ─────────────
api_router.include_router(agents_router.router)
api_router.include_router(intelligence_router.router)
api_router.include_router(master_router.router)

# ── Revenue Room — Saudi AI Sales Engine ─────────────────────
api_router.include_router(revenue_room_router.router)

# ── Outreach Engine — Auto Client Acquisition ────────────────
api_router.include_router(outreach_router.router)

# ── Lead Prospector — AI-Powered Lead Generation ─────────────
api_router.include_router(prospector_router.router)

# ── Autonomous Pipeline — Self-Running Sales Machine ─────────
api_router.include_router(pipeline_router.router)

# ── 22-Agent AI System — Full Empire Control ─────────────────
api_router.include_router(agent_system_router.router)
api_router.include_router(autonomous_foundation_router.router)
