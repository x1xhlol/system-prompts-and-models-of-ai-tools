import asyncio
import json
import httpx


BASE_URL = "http://localhost:8000"


async def main() -> None:
    async with httpx.AsyncClient(timeout=30) as client:
        health = await client.get(f"{BASE_URL}/api/v1/health")
        print("HEALTH:", health.status_code, health.json())

        connectivity = await client.post(
            f"{BASE_URL}/api/v1/autonomous-foundation/integrations/connectivity-test",
            json={},
        )
        print("CONNECTIVITY:", connectivity.status_code)
        print(json.dumps(connectivity.json(), ensure_ascii=False, indent=2)[:2000])

        flow = await client.post(
            f"{BASE_URL}/api/v1/autonomous-foundation/flows/prospecting",
            json={
                "tenant_id": "launch_tenant",
                "deal": {
                    "company_name": "Launch Check Co",
                    "decision_maker": "Founder",
                    "phone": "966500000002",
                    "approval_token": "launch_approved",
                    "web_signals": [{"score": 90}],
                    "email_signals": [{"score": 60}],
                    "call_signals": [{"score": 50}],
                    "linkedin_signals": [{"score": 70}],
                },
            },
        )
        print("FLOW:", flow.status_code)
        print(json.dumps(flow.json(), ensure_ascii=False, indent=2)[:2000])


if __name__ == "__main__":
    asyncio.run(main())
