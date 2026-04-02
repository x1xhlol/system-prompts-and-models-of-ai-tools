import asyncio
import os
import pathlib
import sys
import uuid
import logging

# Add backend directory to PYTHONPATH to import app modules
sys.path.append(str(pathlib.Path(__file__).parent.parent.absolute()))

from app.database import async_session, init_db
from app.services.knowledge_service import KnowledgeService
from app.models.knowledge import SectorAsset

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dealix.ingest")

KNOWLEDGE_BASE_DIR = pathlib.Path(__file__).parent.parent / "knowledge_base"

async def ingest_knowledge():
    """Read MD files and ingest them into the vector database."""
    logger.info("Starting knowledge ingestion...")
    
    # Ensure database is initialized
    await init_db()
    
    async with async_session() as db:
        service = KnowledgeService(db)
        
        # Clear existing sector assets (optional, but good for refresh)
        # In production, we'd use a more refined update strategy
        from sqlalchemy import delete
        await db.execute(delete(SectorAsset))
        
        # Process each MD file
        for md_file in KNOWLEDGE_BASE_DIR.glob("*.md"):
            sector_name = md_file.stem.lower()
            logger.info(f"Ingesting sector: {sector_name}")
            
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Extract title (first H1)
            title = md_file.stem
            if "# " in content:
                title = content.split("# ")[1].split("\n")[0].strip()
            
            # Simple chunking: for small MD files, we ingest the whole file or by major sections
            # Here we'll ingest as one asset for small files
            await service.ingest_sector_asset(
                sector=sector_name,
                title=title,
                content=content,
                asset_type="presentation"
            )
            
        await db.commit()
        logger.info("Ingestion complete!")

if __name__ == "__main__":
    asyncio.run(ingest_knowledge())
