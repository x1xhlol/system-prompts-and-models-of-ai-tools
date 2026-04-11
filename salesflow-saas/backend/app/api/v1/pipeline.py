"""
Dealix API — Autonomous Pipeline Endpoints
============================================
Connects the autonomous pipeline to the REST API.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/pipeline", tags=["Autonomous Pipeline"])


# ═══ Schemas ═══════════════════════════════════════════════

class IncomingMessage(BaseModel):
    phone: str
    message: str
    sender_name: Optional[str] = ""

class PipelineAction(BaseModel):
    action: str  # "start" | "stop" | "followups" | "report"


# ═══ Endpoints ═════════════════════════════════════════════

@router.get("/status")
async def pipeline_status():
    """Get the autonomous pipeline status and stats."""
    try:
        from app.services.auto_pipeline import get_pipeline
        pipeline = get_pipeline()
        return pipeline.get_pipeline_status()
    except Exception as e:
        return {
            "engine": "autonomous",
            "status": "initializing",
            "error": str(e),
        }


@router.post("/process-message")
async def process_message(msg: IncomingMessage):
    """Process an incoming WhatsApp message through the AI pipeline."""
    try:
        from app.services.auto_pipeline import get_pipeline
        pipeline = get_pipeline()
        result = await pipeline.process_incoming_message(
            phone=msg.phone,
            message=msg.message,
            sender_name=msg.sender_name,
        )
        return {
            "status": "processed",
            "result": result,
        }
    except Exception as e:
        logger.error(f"Pipeline process error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-followups")
async def run_followups(background_tasks: BackgroundTasks):
    """Trigger follow-up processing for all pending leads."""
    try:
        from app.services.auto_pipeline import get_pipeline
        pipeline = get_pipeline()
        background_tasks.add_task(pipeline.run_followups)
        return {
            "status": "followups_triggered",
            "message": "Follow-ups are being processed in background",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/send-report")
async def send_daily_report(background_tasks: BackgroundTasks):
    """Send daily performance report to CEO."""
    try:
        from app.services.auto_pipeline import get_pipeline
        pipeline = get_pipeline()
        background_tasks.add_task(pipeline.reporter.send_daily_report)
        return {
            "status": "report_triggered",
            "message": "Daily report will be sent to CEO",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leads")
async def get_all_leads():
    """Get all leads in the pipeline."""
    try:
        from app.services.auto_pipeline import get_pipeline
        pipeline = get_pipeline()
        return {
            "total": len(pipeline.store.leads),
            "leads": list(pipeline.store.leads.values()),
        }
    except Exception as e:
        return {"total": 0, "leads": [], "error": str(e)}


@router.get("/leads/{phone}")
async def get_lead(phone: str):
    """Get a specific lead by phone number."""
    try:
        from app.services.auto_pipeline import get_pipeline
        pipeline = get_pipeline()
        lead = pipeline.store.get_lead(phone)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return lead
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_pipeline_stats():
    """Get comprehensive pipeline statistics."""
    try:
        from app.services.auto_pipeline import get_pipeline
        pipeline = get_pipeline()
        stats = pipeline.store.get_stats()
        return {
            "pipeline": "dealix_autonomous",
            "version": "2.0",
            "stats": stats,
            "ai_models": {
                "groq": "active",
                "glm5": "active",
                "claude": "active",
                "gemini": "active",
                "deepseek": "active",
            },
            "channels": {
                "whatsapp": "connected",
                "email": "pending",
                "voice": "planned",
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        return {"error": str(e)}
