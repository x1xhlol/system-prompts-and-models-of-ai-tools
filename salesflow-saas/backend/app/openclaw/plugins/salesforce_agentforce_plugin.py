from __future__ import annotations

from typing import Any, Dict

from app.services.salesforce_agentforce import agentforce_service


class SalesforceAgentforcePlugin:
    name = "salesforce-agentforce"

    async def get_account_360(self, account_name: str) -> Dict[str, Any]:
        return await agentforce_service.get_account_360(account_name)

    async def sync_opportunity(self, deal_state: Dict[str, Any]) -> bool:
        return await agentforce_service.sync_deal(deal_state)
