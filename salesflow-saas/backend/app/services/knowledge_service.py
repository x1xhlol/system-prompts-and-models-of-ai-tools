import uuid
import logging
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pgvector.sqlalchemy import Vector

from app.models.knowledge import SectorAsset, KnowledgeArticle
from app.ai.llm_provider import LLMProvider

logger = logging.getLogger("dealix.services.knowledge")

class KnowledgeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.llm = LLMProvider()

    async def search_sector_knowledge(self, query: str, sector: str = None, limit: int = 3) -> List[dict]:
        """
        Perform semantic search to find the most relevant sales assets/strategies.
        """
        try:
            # Generate embedding for the query
            query_embedding = await self.llm.embed(query)
            
            # Build search query
            # We use cosine distance for vector similarity
            stmt = select(SectorAsset).order_by(
                SectorAsset.embedding.cosine_distance(query_embedding)
            ).where(SectorAsset.is_active == True)
            
            if sector:
                stmt = stmt.where(SectorAsset.sector == sector)
            
            stmt = stmt.limit(limit)
            
            result = await self.db.execute(stmt)
            assets = result.scalars().all()
            
            return [
                {
                    "title": a.title,
                    "content": a.content or a.content_ar,
                    "sector": a.sector,
                    "asset_type": a.asset_type
                } for a in assets
            ]
        except Exception as e:
            logger.error(f"Error searching knowledge: {str(e)}")
            return []

    async def ingest_sector_asset(self, sector: str, title: str, content: str, asset_type: str = "presentation"):
        """Save a new sector asset and generate its embedding."""
        embedding = await self.llm.embed(content)
        
        asset = SectorAsset(
            id=uuid.uuid4(),
            sector=sector,
            title=title,
            content=content,
            asset_type=asset_type,
            embedding=embedding
        )
        self.db.add(asset)
        await self.db.flush()
        return asset
