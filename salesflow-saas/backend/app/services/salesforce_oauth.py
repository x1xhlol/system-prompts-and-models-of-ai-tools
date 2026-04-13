"""Salesforce OAuth2 refresh-token flow for REST API calls."""

from __future__ import annotations

import logging

import httpx

logger = logging.getLogger("dealix.salesforce_oauth")


def salesforce_token_url(domain_host: str) -> str:
    d = (domain_host or "login.salesforce.com").strip().rstrip("/")
    if d.startswith("http://") or d.startswith("https://"):
        return f"{d}/services/oauth2/token"
    return f"https://{d}/services/oauth2/token"


async def refresh_salesforce_access_token(
    *,
    domain_host: str,
    client_id: str,
    client_secret: str,
    refresh_token: str,
) -> dict:
    """
    Exchange refresh token for access_token + instance_url.
    Returns dict with access_token, instance_url, and optional issued fields.
    """
    url = salesforce_token_url(domain_host)
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            data={
                "grant_type": "refresh_token",
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=45.0,
        )
    if response.status_code != 200:
        logger.warning("Salesforce token refresh failed: %s", response.text[:500])
        response.raise_for_status()
    data = response.json()
    instance = (data.get("instance_url") or "").rstrip("/")
    if not data.get("access_token") or not instance:
        raise ValueError("Salesforce token response missing access_token or instance_url")
    return {
        "access_token": data["access_token"],
        "instance_url": instance,
    }
