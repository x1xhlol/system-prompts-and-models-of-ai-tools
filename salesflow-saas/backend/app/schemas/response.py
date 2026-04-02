"""
Global Response Schemas — Standardized communication for the Dealix Empire.
Ensures every API response is structured, clear, and professional.
"""

from typing import Any, Optional, Dict, List
from pydantic import BaseModel

class ResponseSchema(BaseModel):
    """The universal response structure for Dealix APIs."""
    status: str  # success, error, ignored
    message: str
    data: Optional[Any] = None
    meta: Optional[Dict[str, Any]] = None

class ErrorResponse(ResponseSchema):
    """Standardized error format."""
    status: str = "error"
    error_code: Optional[str] = None
    details: Optional[Any] = None
