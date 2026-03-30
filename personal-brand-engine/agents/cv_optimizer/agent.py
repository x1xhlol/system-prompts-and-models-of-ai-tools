"""CV Optimizer agent -- reads brand profile, enhances content via LLM, and generates PDFs."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from agents.base_agent import BaseAgent
from agents.cv_optimizer.formatter import (
    generate_pdf,
    render_cv_html,
)
from agents.cv_optimizer.updater import enhance_cv_content

logger = logging.getLogger(__name__)

# Resolve once so every helper can rely on the path.
_OUTPUT_DIR = Path(__file__).resolve().parents[2] / "generated_cvs"
_TEMPLATE_DIR = Path(__file__).resolve().parent / "templates"


class CVOptimizerAgent(BaseAgent):
    """Autonomous agent that keeps Sami's CV polished and up-to-date."""

    agent_name: str = "cv_optimizer"

    def __init__(
        self,
        config: Any,
        llm_client: Any,
        db_session: Session,
    ) -> None:
        super().__init__(config, llm_client, db_session)
        _OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # Task dispatcher
    # ------------------------------------------------------------------

    async def run(self, task: str, **kwargs: Any) -> dict:
        """Dispatch *task* to the matching handler.

        Supported tasks
        ---------------
        - ``update_cv``    -- enhance CV content using the LLM
        - ``generate_pdf`` -- render and export the CV as a PDF
        """
        dispatch = {
            "update_cv": self._update_cv,
            "generate_pdf": self._generate_pdf,
        }

        handler = dispatch.get(task)
        if handler is None:
            self.log_action(task, details=f"Unknown task: {task}", status="failed")
            return {"status": "error", "message": f"Unknown task: {task}"}

        with self.timer() as t:
            try:
                result = await handler(**kwargs)
                self.log_action(task, details=str(result), duration=t.elapsed)
                return {"status": "success", "result": result}
            except Exception as exc:
                logger.exception("Task %s failed", task)
                self.log_action(
                    task,
                    details=str(exc),
                    status="failed",
                    duration=t.elapsed,
                )
                await self.notify_owner(
                    f"[CV Optimizer] Task '{task}' failed: {exc}"
                )
                return {"status": "error", "message": str(exc)}

    # ------------------------------------------------------------------
    # update_cv
    # ------------------------------------------------------------------

    async def _update_cv(self, **kwargs: Any) -> dict:
        """Use the LLM to enhance CV descriptions and keywords."""
        brand_profile = self.get_brand_profile()

        enhanced = await enhance_cv_content(self.llm, brand_profile)

        logger.info("CV content enhanced successfully")
        return {
            "enhanced": True,
            "sections_updated": list(enhanced.keys()),
        }

    # ------------------------------------------------------------------
    # generate_pdf
    # ------------------------------------------------------------------

    async def _generate_pdf(self, *, language: str = "en", **kwargs: Any) -> dict:
        """Render the CV to HTML then convert to PDF.

        Parameters
        ----------
        language:
            ``"en"`` (default) or ``"ar"`` to select the template.
        """
        brand_profile = self.get_brand_profile()

        # Optionally enhance first
        enhanced_profile = await enhance_cv_content(self.llm, brand_profile)

        template_name = f"cv_template_{language}.html"
        template_path = _TEMPLATE_DIR / template_name

        if not template_path.exists():
            raise FileNotFoundError(f"Template not found: {template_path}")

        html = render_cv_html(enhanced_profile, str(template_path), language=language)

        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"sami_assiri_cv_{language}_{timestamp}.pdf"
        output_path = _OUTPUT_DIR / filename

        pdf_path = generate_pdf(html, str(output_path))

        logger.info("CV PDF generated: %s", pdf_path)
        return {
            "pdf_path": str(pdf_path),
            "language": language,
            "filename": filename,
        }
