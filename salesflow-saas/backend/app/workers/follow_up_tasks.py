from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.follow_up_tasks.process_pending_followups")
def process_pending_followups():
    """Check for leads that need follow-up and trigger automated messages."""
    # TODO: Query leads with no response after configured time
    # TODO: Execute automation workflow actions
    # TODO: Create activities for completed follow-ups
    pass


@celery_app.task(name="app.workers.follow_up_tasks.execute_workflow")
def execute_workflow(workflow_id: str, lead_id: str):
    """Execute a specific automation workflow for a lead."""
    # TODO: Load workflow definition
    # TODO: Check conditions
    # TODO: Execute actions (send message, create task, notify)
    pass
