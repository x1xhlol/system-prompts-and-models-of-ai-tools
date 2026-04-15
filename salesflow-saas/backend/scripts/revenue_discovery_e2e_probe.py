#!/usr/bin/env python3
"""
Revenue discovery E2E probe against a running API.

Flow:
1) create discovery leads
2) enrich one lead (async + poll)
3) generate governed channel drafts
4) optional strategic-deals create/link (when JWT is provided)

Usage:
  py backend/scripts/revenue_discovery_e2e_probe.py
  py backend/scripts/revenue_discovery_e2e_probe.py --base http://127.0.0.1:8000
  py backend/scripts/revenue_discovery_e2e_probe.py --jwt <token>
"""
from __future__ import annotations

import argparse
import asyncio
import os
from typing import Any

import httpx


def _headers(jwt: str | None) -> dict[str, str]:
    if not jwt:
        return {}
    return {"Authorization": f"Bearer {jwt}"}


async def _request(
    client: httpx.AsyncClient,
    method: str,
    path: str,
    *,
    expected: tuple[int, ...] = (200,),
    **kwargs: Any,
) -> tuple[bool, Any]:
    res = await client.request(method, path, **kwargs)
    ok = res.status_code in expected
    try:
        body = res.json()
    except Exception:
        body = {"raw": res.text[:500]}
    return ok, {"status": res.status_code, "body": body}


async def main() -> int:
    parser = argparse.ArgumentParser(description="Dealix revenue-discovery E2E probe")
    parser.add_argument("--base", default=os.environ.get("DEALIX_BASE_URL", "http://127.0.0.1:8000"))
    parser.add_argument("--jwt", default=os.environ.get("DEALIX_JWT", ""))
    parser.add_argument("--sector", default="SaaS B2B")
    parser.add_argument("--city", default="Riyadh")
    parser.add_argument("--poll-seconds", type=float, default=1.2)
    parser.add_argument("--poll-max", type=int, default=6)
    args = parser.parse_args()

    base = args.base.rstrip("/") + "/api/v1"
    jwt = args.jwt or None

    async with httpx.AsyncClient(base_url=base, timeout=30.0) as client:
        h = _headers(jwt)

        print("1) generate-leads")
        ok, out = await _request(
            client,
            "POST",
            "/dealix/generate-leads",
            headers=h,
            json={"sector": args.sector, "city": args.city, "limit": 3},
        )
        if not ok:
            print("FAILED generate-leads:", out)
            return 1
        leads = out["body"].get("leads") or []
        if not leads:
            print("FAILED generate-leads: no leads in response")
            return 1
        lead = leads[0]
        company_name = str(lead.get("company_name") or "Discovery Company")

        print("2) enrich-exploration/async")
        ok, out = await _request(
            client,
            "POST",
            "/dealix/enrich-exploration/async",
            headers=h,
            json={
                "sector": args.sector,
                "city": args.city,
                "lead": {"company_name": company_name},
                "icp_notes_ar": "E2E probe",
            },
        )
        if not ok:
            print("FAILED async enqueue:", out)
            return 1
        job_id = out["body"].get("job_id")
        if not job_id:
            print("FAILED async enqueue: missing job_id")
            return 1

        enrich = None
        for _ in range(args.poll_max):
            await asyncio.sleep(args.poll_seconds)
            ok, poll = await _request(
                client,
                "GET",
                f"/dealix/enrich-exploration/jobs/{job_id}",
                headers=h,
            )
            if not ok:
                print("FAILED job poll:", poll)
                return 1
            status = poll["body"].get("status")
            if status == "done":
                enrich = poll["body"].get("result") or {}
                break
            if status == "error":
                print("FAILED enrichment job:", poll["body"])
                return 1
        if enrich is None:
            print("FAILED enrichment job did not finish in time")
            return 1

        print("3) channel-drafts")
        angle = "شراكة نمو وتسويق مشترك"
        if isinstance(enrich, dict):
            angle = str(enrich.get("partnership_opportunity_ar") or angle)
        ok, out = await _request(
            client,
            "POST",
            "/dealix/channel-drafts",
            headers=h,
            json={"company_name": company_name, "partnership_angle_ar": angle},
        )
        if not ok:
            print("FAILED channel-drafts:", out)
            return 1
        linkedin = out["body"].get("linkedin") or {}
        if not bool(linkedin.get("human_in_loop_required")):
            print("FAILED governance: linkedin human_in_loop_required != true")
            return 1

        if jwt:
            print("4) strategic-deals create + links (JWT mode)")
            ok, out = await _request(
                client,
                "POST",
                "/strategic-deals",
                headers=h,
                expected=(200, 201),
                json={
                    "title": f"E2E Probe: {company_name}",
                    "deal_type": "co_marketing",
                    "counterparty_name": company_name,
                    "status": "draft",
                },
            )
            if not ok:
                print("FAILED strategic-deals create:", out)
                return 1
            deal_id = out["body"].get("id")
            if deal_id:
                _, patch_out = await _request(
                    client,
                    "PATCH",
                    f"/strategic-deals/{deal_id}/links",
                    headers=h,
                    expected=(200, 204, 422),
                    json={"lead_id": None},
                )
                print("strategic-deals links check:", patch_out["status"])
        else:
            print("4) strategic-deals step skipped (no JWT provided)")

    print("Revenue discovery E2E probe: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
