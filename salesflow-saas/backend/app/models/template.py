from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base import BaseModel


class IndustryTemplate(BaseModel):
    __tablename__ = "industry_templates"

    industry = Column(String(100), nullable=False, index=True)
    name = Column(String(255))
    name_ar = Column(String(255))
    pipeline_stages = Column(JSONB)
    message_templates = Column(JSONB)
    proposal_templates = Column(JSONB)
    workflow_templates = Column(JSONB)
    is_active = Column(Boolean, default=True)
