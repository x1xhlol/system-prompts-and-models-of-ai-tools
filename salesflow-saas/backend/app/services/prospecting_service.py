"""
Prospecting Service — Automated lead discovery via Google Maps/Places API.
Bringing the market to Dealix.
"""

import uuid
import httpx
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import get_settings
from app.services.lead_service import LeadService

settings = get_settings()

class ProspectingService:
    """The 'Hunter' engine: Discovering businesses and turning them into leads."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.lead_service = LeadService(db)

    async def search_businesses(
        self, 
        tenant_id: str, 
        query: str, 
        location: str = "Riyadh, Saudi Arabia",
        limit: int = 20
    ) -> Dict[str, Any]:
        """Search for businesses using Google Places API and import them as leads."""
        
        api_key = settings.GOOGLE_MAPS_API_KEY
        if not api_key:
            return {"status": "error", "message": "Google Maps API Key not configured."}

        # 1. Search for places
        search_results = await self._call_google_places_text_search(query, location, api_key)
        
        imported_count = 0
        leads_data = []

        for place in search_results[:limit]:
            # 2. Get more details (phone, website)
            details = await self._get_place_details(place["place_id"], api_key)
            
            # 3. Create lead in Dealix
            lead_info = {
                "full_name": details.get("name", "Unknown Business"),
                "company_name": details.get("name", ""),
                "phone": details.get("formatted_phone_number", ""),
                "website": details.get("website", ""),
                "address": details.get("formatted_address", ""),
                "city": location.split(",")[0].strip(),
                "sector": query,
                "source": "google_maps_hunter",
                "notes": f"Scraped from Google Maps. Rating: {details.get('rating', 'N/A')}"
            }

            # Optional: Check if lead already exists by phone
            existing = await self.lead_service.get_lead_by_phone(tenant_id, lead_info["phone"])
            if not existing and lead_info["phone"]:
                await self.lead_service.create_lead(
                    tenant_id=tenant_id,
                    full_name=lead_info["full_name"],
                    phone=lead_info["phone"],
                    company_name=lead_info["company_name"],
                    sector=lead_info["sector"],
                    city=lead_info["city"],
                    source=lead_info["source"],
                    notes=lead_info["notes"]
                )
                imported_count += 1
                leads_data.append(lead_info)

        return {
            "status": "success",
            "query": query,
            "location": location,
            "found_count": len(search_results),
            "imported_count": imported_count,
            "leads": leads_data
        }

    async def _call_google_places_text_search(self, query: str, location: str, api_key: str) -> List[Dict]:
        """Internal helper to call Google Places API."""
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {
            "query": f"{query} in {location}",
            "key": api_key,
            "language": "ar"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return data.get("results", [])
        return []

    async def _get_place_details(self, place_id: str, api_key: str) -> Dict:
        """Fetch full details for a specific place."""
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "fields": "name,formatted_phone_number,website,formatted_address,rating,business_status",
            "key": api_key,
            "language": "ar"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return data.get("result", {})
        return {}
