from pydantic import BaseModel
from decimal import Decimal


class DashboardOverview(BaseModel):
    total_leads: int
    new_leads_today: int
    total_deals: int
    open_deals_value: Decimal
    closed_won_value: Decimal
    closed_won_count: int
    messages_sent_today: int
    conversion_rate: float
    active_workflows: int


class PipelineSummary(BaseModel):
    stages: dict[str, int]
    total_value_by_stage: dict[str, float]


class RevenueAnalytics(BaseModel):
    total_revenue: Decimal
    monthly_revenue: list[dict]
    top_sources: list[dict]
    average_deal_value: Decimal


class PerformanceMetrics(BaseModel):
    agents: list[dict]
    top_performer: dict
    team_conversion_rate: float
