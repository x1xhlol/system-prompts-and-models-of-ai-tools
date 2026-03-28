from sqlalchemy import Column, String, Date, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import TenantModel


class Subscription(TenantModel):
    __tablename__ = "subscriptions"

    plan = Column(String(50), nullable=False)  # basic, professional, enterprise
    status = Column(String(50), default="active")  # active, past_due, cancelled, trial
    price_monthly = Column(Numeric(10, 2))
    currency = Column(String(3), default="SAR")
    current_period_start = Column(Date)
    current_period_end = Column(Date)
