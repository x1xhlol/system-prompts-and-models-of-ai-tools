"""
Vector Embeddings & RAG Engine
Handles text embedding and semantic search using pgvector.
"""

import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.config import get_settings

logger = logging.getLogger("dealix.agents.embeddings")
settings = get_settings()

class EmbeddingsEngine:
    """Generates embeddings and performs vector search against knowledge base."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_embedding(self, text: str) -> List[float]:
        """Generate vector embedding for text using configured provider."""
        if settings.EMBEDDING_PROVIDER == "openai":
            import openai
            client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.embeddings.create(
                input=text,
                model=settings.EMBEDDING_MODEL
            )
            return response.data[0].embedding
        else:
            # Fallback for local models
            raise NotImplementedError(f"Embedding provider {settings.EMBEDDING_PROVIDER} not fully implemented yet.")

    async def add_knowledge(self, tenant_id: str, title: str, content: str, metadata: dict = None) -> str:
        """Embed document and store in database vector index."""
        try:
            vector = await self.get_embedding(f"{title}\n\n{content}")
            
            # Using pgvector to insert knowledge.
            query = text("""
                INSERT INTO knowledge_articles (id, tenant_id, title, content, embedding, metadata)
                VALUES (gen_random_uuid(), :tenant_id, :title, :content, :embedding, :metadata)
                RETURNING id
            """)
            
            # Note: The knowledge_articles model needs to have the vector column added
            # We'll use raw SQL here to interface directly with pgvector
            # We assume the column `embedding` exists as vector(1536)
            import json
            result = await self.db.execute(query, {
                "tenant_id": tenant_id,
                "title": title,
                "content": content,
                "embedding": str(vector), # pgvector parses strings of arrays directly
                "metadata": json.dumps(metadata or {})
            })
            await self.db.flush()
            
            return str(result.scalar())
        except Exception as e:
            logger.error(f"Failed to add knowledge: {e}")
            raise

    async def search_knowledge(self, tenant_id: str, query_text: str, limit: int = 3) -> List[dict]:
        """Semantic search using L2 distance (or cosine similarity via pgvector)."""
        try:
            query_vector = await self.get_embedding(query_text)
            
            # Using pgvector cosine distance `<=>` operator to find closest rows
            query = text("""
                SELECT id, title, content, metadata, 1 - (embedding <=> :query_vector) as similarity
                FROM knowledge_articles
                WHERE tenant_id = :tenant_id
                ORDER BY embedding <=> :query_vector
                LIMIT :limit
            """)
            
            result = await self.db.execute(query, {
                "tenant_id": tenant_id,
                "query_vector": str(query_vector),
                "limit": limit
            })
            
            rows = result.fetchall()
            return [
                {
                    "id": str(row.id),
                    "title": row.title,
                    "content": row.content,
                    "metadata": row.metadata,
                    "similarity": float(row.similarity)
                }
                for row in rows
            ]
        except Exception as e:
            logger.error(f"Failed to search knowledge: {e}")
            return []
