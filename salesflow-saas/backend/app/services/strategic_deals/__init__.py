"""
Dealix Strategic Deals Engine — Deal Exchange OS + Strategic Growth OS
محرك الصفقات الاستراتيجية — نظام تبادل الصفقات + نظام النمو الاستراتيجي
اكتشاف وتفاوض وإغلاق شراكات B2B بالذكاء الاصطناعي
"""

from app.services.strategic_deals.company_profiler import CompanyProfiler
from app.services.strategic_deals.deal_matcher import DealMatcher
from app.services.strategic_deals.deal_negotiator import DealNegotiator, NegotiationStrategy
from app.services.strategic_deals.deal_agent import DealAgent
from app.services.strategic_deals.company_twin import CompanyTwin, CompanyTwinBuilder
from app.services.strategic_deals.deal_taxonomy import DealTaxonomyService, DEAL_TAXONOMY
from app.services.strategic_deals.deal_room import DealRoom, DealRoomService
from app.services.strategic_deals.operating_modes import OperatingMode, ModeEnforcer, MODE_POLICIES
from app.services.strategic_deals.channel_compliance import ChannelRules, ConsentLedger

# Strategic Growth OS
from app.services.strategic_deals.acquisition_scouting import (
    AcquisitionTarget, AcquisitionCriteria, AcquisitionScoutingEngine,
)
from app.services.strategic_deals.ecosystem_mapper import (
    EcosystemEntity, EcosystemLink, EcosystemMapper,
)
from app.services.strategic_deals.strategic_simulator import (
    StrategicScenario, StrategicSimulator,
)
from app.services.strategic_deals.roi_engine import ROICalculation, ROIEngine
from app.services.strategic_deals.portfolio_intelligence import (
    PortfolioInsight, PortfolioIntelligence,
)

__all__ = [
    # Existing
    "CompanyProfiler",
    "DealMatcher",
    "DealNegotiator",
    "NegotiationStrategy",
    "DealAgent",
    # Deal Exchange OS
    "CompanyTwin",
    "CompanyTwinBuilder",
    "DealTaxonomyService",
    "DEAL_TAXONOMY",
    "DealRoom",
    "DealRoomService",
    "OperatingMode",
    "ModeEnforcer",
    "MODE_POLICIES",
    "ChannelRules",
    "ConsentLedger",
    # Strategic Growth OS
    "AcquisitionTarget",
    "AcquisitionCriteria",
    "AcquisitionScoutingEngine",
    "EcosystemEntity",
    "EcosystemLink",
    "EcosystemMapper",
    "StrategicScenario",
    "StrategicSimulator",
    "ROICalculation",
    "ROIEngine",
    "PortfolioInsight",
    "PortfolioIntelligence",
]
