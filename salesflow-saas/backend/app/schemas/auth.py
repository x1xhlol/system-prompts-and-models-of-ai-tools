from pydantic import BaseModel
from typing import Optional


class RegisterRequest(BaseModel):
    company_name: str
    company_name_ar: Optional[str] = None
    industry: Optional[str] = None
    full_name: str
    email: str
    password: str
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    tenant_id: str
    role: str


class RefreshRequest(BaseModel):
    refresh_token: str
