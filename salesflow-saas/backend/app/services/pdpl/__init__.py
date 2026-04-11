"""PDPL (Saudi Personal Data Protection Law) consent management."""

from app.services.pdpl.consent_manager import ConsentManager
from app.services.pdpl.data_rights import DataRightsHandler

__all__ = ["ConsentManager", "DataRightsHandler"]
