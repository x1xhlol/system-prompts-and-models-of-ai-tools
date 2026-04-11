import enum
from sqlalchemy import Column, String, Integer, Text, Boolean, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from app.models.base import BaseModel


class AssetType(str, enum.Enum):
    PRESENTATION = "presentation"
    ONE_PAGER = "one_pager"
    CASE_STUDY = "case_study"
    ROI_CALCULATOR = "roi_calculator"
    SCRIPT = "script"


class KnowledgeArticle(BaseModel):
    __tablename__ = "knowledge_articles"

    category = Column(String(100), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    title_ar = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    content_ar = Column(Text, nullable=True)
    tags = Column(JSONB, default=[])
    is_internal = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    version = Column(Integer, default=1)
    embedding = Column(Vector(1536), nullable=True)  # OpenAI 1536 dim

    author = relationship("User")


class SectorAsset(BaseModel):
    __tablename__ = "sector_assets"

    sector = Column(String(100), nullable=False, index=True)
    asset_type = Column(Enum(AssetType), nullable=False)
    title = Column(String(255), nullable=False)
    title_ar = Column(String(255), nullable=True)
    content = Column(Text, nullable=True)
    content_ar = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)
    extra_metadata = Column(JSONB, default={})
    is_active = Column(Boolean, default=True)
    embedding = Column(Vector(1536), nullable=True)  # OpenAI 1536 dim
