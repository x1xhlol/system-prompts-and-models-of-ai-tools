"""
Dealix AI Engine — Arabic-first AI services for Saudi CRM.
Provides NLP, lead scoring, conversation intelligence, message writing, and forecasting.
"""

from app.services.ai.arabic_nlp import ArabicNLPService, LanguageDetection, IntentResult, EntityResult, SentimentResult
from app.services.ai.lead_scoring import LeadScoringEngine, LeadScoreResult, ScoreBreakdown
from app.services.ai.conversation_intelligence import ConversationIntelligence, ConversationInsight
from app.services.ai.message_writer import MessageWriter, MessageDraft
from app.services.ai.forecasting import SalesForecastingEngine, ForecastResult
from app.services.ai.sales_agent import SalesAgent, AgentContext, AgentResponse, ConversationState

__all__ = [
    "ArabicNLPService",
    "LanguageDetection",
    "IntentResult",
    "EntityResult",
    "SentimentResult",
    "LeadScoringEngine",
    "LeadScoreResult",
    "ScoreBreakdown",
    "ConversationIntelligence",
    "ConversationInsight",
    "MessageWriter",
    "MessageDraft",
    "SalesForecastingEngine",
    "ForecastResult",
    "SalesAgent",
    "AgentContext",
    "AgentResponse",
    "ConversationState",
]
