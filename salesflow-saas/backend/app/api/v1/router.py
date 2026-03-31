from fastapi import APIRouter
from app.api.v1 import (
    auth, leads, deals, dashboard, tenants, users, affiliates, ai_agents,
    companies, contacts, calls, meetings, commissions, payouts, disputes,
    guarantees, consents, complaints, knowledge, sectors, presentations,
    supervisor, admin, health,
)

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
