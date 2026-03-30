"""APScheduler-based task runner that reads schedule.yaml and dispatches agent tasks."""

from __future__ import annotations

import asyncio
import logging
import signal
import sys
from pathlib import Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config.settings import get_settings, get_schedule_config
from scheduler.tasks import execute_agent_task

logger = logging.getLogger(__name__)


def parse_cron(cron_str: str) -> CronTrigger:
    """Parse a cron string into an APScheduler CronTrigger."""
    parts = cron_str.strip().split()
    if len(parts) == 5:
        return CronTrigger(
            minute=parts[0],
            hour=parts[1],
            day=parts[2],
            month=parts[3],
            day_of_week=parts[4],
            timezone=get_settings().timezone,
        )
    raise ValueError(f"Invalid cron expression: {cron_str}")


def setup_scheduler() -> AsyncIOScheduler:
    """Create and configure the scheduler from schedule.yaml."""
    settings = get_settings()
    schedule_config = get_schedule_config()
    scheduler = AsyncIOScheduler(timezone=settings.timezone)

    agents = schedule_config.get("agents", {})

    for agent_name, tasks in agents.items():
        for task_name, task_config in tasks.items():
            if task_name in ("mode", "description"):
                continue

            if isinstance(task_config, str):
                continue

            job_id = f"{agent_name}.{task_name}"
            description = task_config.get("description", task_name)

            if "cron" in task_config:
                trigger = parse_cron(task_config["cron"])
                scheduler.add_job(
                    execute_agent_task,
                    trigger=trigger,
                    id=job_id,
                    name=description,
                    args=[agent_name, task_name],
                    replace_existing=True,
                    misfire_grace_time=300,
                )
                logger.info("Scheduled %s: %s", job_id, task_config["cron"])

            elif "interval_minutes" in task_config:
                trigger = IntervalTrigger(
                    minutes=task_config["interval_minutes"],
                    timezone=settings.timezone,
                )
                scheduler.add_job(
                    execute_agent_task,
                    trigger=trigger,
                    id=job_id,
                    name=description,
                    args=[agent_name, task_name],
                    replace_existing=True,
                    misfire_grace_time=60,
                )
                logger.info(
                    "Scheduled %s: every %d minutes", job_id, task_config["interval_minutes"]
                )

    return scheduler


async def main():
    """Main entry point for the scheduler."""
    logging.basicConfig(
        level=getattr(logging, get_settings().log_level),
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        handlers=[logging.StreamHandler()],
    )

    logger.info("Starting Personal Brand Engine Scheduler...")

    scheduler = setup_scheduler()
    scheduler.start()

    logger.info("Scheduler started with %d jobs", len(scheduler.get_jobs()))
    for job in scheduler.get_jobs():
        logger.info("  - %s: next run at %s", job.id, job.next_run_time)

    # Graceful shutdown
    loop = asyncio.get_event_loop()
    stop_event = asyncio.Event()

    def shutdown(sig):
        logger.info("Received signal %s, shutting down...", sig)
        scheduler.shutdown(wait=False)
        stop_event.set()

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, shutdown, sig)

    await stop_event.wait()
    logger.info("Scheduler stopped.")


if __name__ == "__main__":
    asyncio.run(main())
