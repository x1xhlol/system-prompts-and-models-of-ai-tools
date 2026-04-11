"""
Dealix Services Layer
Business logic for all core platform operations.
"""

from app.services.auth_service import AuthService
from app.services.lead_service import LeadService
from app.services.deal_service import DealService
from app.services.company_service import CompanyService
from app.services.meeting_service import MeetingService
from app.services.affiliate_service import AffiliateService
from app.services.notification_service import NotificationService
from app.services.analytics_service import AnalyticsService
from app.services.trust_score_service import TrustScoreService
from app.services.sequence_engine import SequenceEngine
from app.services.pdpl import ConsentManager, DataRightsHandler
from app.services.tool_verification import ToolVerifier, tool_verifier
from app.services.security_gate import SecurityGate, security_gate
from app.services.territory_manager import TerritoryManager
from app.services.knowledge_brain import KnowledgeBrain, knowledge_brain
from app.services.tool_receipts import (
    PreExecutionPolicy, pre_execution_policy,
    ReceiptStore, receipt_store,
    TrustAnalytics, trust_analytics,
)
from app.services.memory_engine import (
    MemoryAdapter, FileMemoryAdapter, RedisMemoryAdapter,
    MemoryEvaluator, memory_adapter, memory_evaluator,
    create_memory_adapter,
)
from app.services.session_continuity import SessionContinuity, session_continuity
from app.services.strategic_deals import (
    CompanyProfiler, DealMatcher, DealNegotiator, NegotiationStrategy, DealAgent,
)

__all__ = [
    "AuthService",
    "LeadService",
    "DealService",
    "CompanyService",
    "MeetingService",
    "AffiliateService",
    "NotificationService",
    "AnalyticsService",
    "TrustScoreService",
    "SequenceEngine",
    "ConsentManager",
    "DataRightsHandler",
    "ToolVerifier",
    "tool_verifier",
    "SecurityGate",
    "security_gate",
    "TerritoryManager",
    "KnowledgeBrain",
    "knowledge_brain",
    "PreExecutionPolicy",
    "pre_execution_policy",
    "ReceiptStore",
    "receipt_store",
    "TrustAnalytics",
    "trust_analytics",
    "MemoryAdapter",
    "FileMemoryAdapter",
    "RedisMemoryAdapter",
    "MemoryEvaluator",
    "memory_adapter",
    "memory_evaluator",
    "create_memory_adapter",
    "SessionContinuity",
    "session_continuity",
    "CompanyProfiler",
    "DealMatcher",
    "DealNegotiator",
    "NegotiationStrategy",
    "DealAgent",
]
