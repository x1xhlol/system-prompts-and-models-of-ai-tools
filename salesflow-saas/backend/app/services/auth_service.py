"""
Auth Service — JWT tokens, RBAC, OTP, multi-tenant authentication.
"""

import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.utils import security as security_utils

settings = get_settings()


class AuthService:
    """Handles authentication, authorization, and tenant isolation."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Password Hashing ──────────────────────────

    @staticmethod
    def hash_password(password: str) -> str:
        return security_utils.hash_password(password)

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        return security_utils.verify_password(plain, hashed)

    # ── JWT Tokens ────────────────────────────────

    @staticmethod
    def create_access_token(
        user_id: str,
        tenant_id: str,
        role: str,
        extra: dict = None,
    ) -> str:
        payload = {
            "sub": user_id,
            "tenant_id": tenant_id,
            "role": role,
            "type": "access",
            "exp": datetime.now(timezone.utc)
            + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            "iat": datetime.now(timezone.utc),
        }
        if extra:
            payload.update(extra)
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: str, tenant_id: str) -> str:
        payload = {
            "sub": user_id,
            "tenant_id": tenant_id,
            "type": "refresh",
            "exp": datetime.now(timezone.utc)
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            "iat": datetime.now(timezone.utc),
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            return payload
        except JWTError:
            return None

    # ── OTP ───────────────────────────────────────

    @staticmethod
    def generate_otp() -> str:
        return "".join(
            secrets.choice(string.digits) for _ in range(settings.OTP_LENGTH)
        )

    @staticmethod
    def verify_otp(stored_otp: str, provided_otp: str, created_at: datetime) -> bool:
        if stored_otp != provided_otp:
            return False
        expiry = created_at + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        return datetime.now(timezone.utc) <= expiry

    # ── Registration ──────────────────────────────

    async def register_tenant(
        self,
        name: str,
        email: str,
        password: str,
        phone: str = "",
        plan: str = "free",
    ) -> dict:
        """Register a new tenant with an owner user."""
        from app.models.tenant import Tenant
        from app.models.user import User
        import uuid

        tenant_id = uuid.uuid4()
        user_id = uuid.uuid4()
        slug = name.lower().replace(" ", "-").replace(".", "")[:50]

        tenant = Tenant(
            id=tenant_id,
            name=name,
            slug=slug,
            plan=plan,
            is_active=True,
        )
        self.db.add(tenant)

        user = User(
            id=user_id,
            tenant_id=tenant_id,
            email=email,
            phone=phone,
            hashed_password=self.hash_password(password),
            full_name=name,
            role="owner",
            language="ar",
            is_active=True,
        )
        self.db.add(user)
        await self.db.flush()

        access = self.create_access_token(str(user_id), str(tenant_id), "owner")
        refresh = self.create_refresh_token(str(user_id), str(tenant_id))

        return {
            "user_id": str(user_id),
            "tenant_id": str(tenant_id),
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
        }

    async def login(self, email: str, password: str) -> Optional[dict]:
        """Authenticate user and return tokens."""
        from app.models.user import User

        result = await self.db.execute(
            select(User).where(User.email == email, User.is_active == True)
        )
        user = result.scalar_one_or_none()

        if not user or not self.verify_password(password, user.hashed_password):
            return None

        user.last_login_at = datetime.now(timezone.utc)
        await self.db.flush()

        access = self.create_access_token(
            str(user.id), str(user.tenant_id), user.role
        )
        refresh = self.create_refresh_token(str(user.id), str(user.tenant_id))

        return {
            "user_id": str(user.id),
            "tenant_id": str(user.tenant_id),
            "role": user.role,
            "access_token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
        }

    async def get_current_user(self, token: str) -> Optional[dict]:
        """Validate token and return user info."""
        payload = self.decode_token(token)
        if not payload or payload.get("type") != "access":
            return None
        return {
            "user_id": payload["sub"],
            "tenant_id": payload["tenant_id"],
            "role": payload["role"],
        }

    # ── RBAC Helpers ──────────────────────────────

    ROLE_HIERARCHY = {
        "viewer": 0,
        "affiliate": 1,
        "agent": 2,
        "manager": 3,
        "admin": 4,
        "owner": 5,
    }

    @classmethod
    def has_permission(cls, user_role: str, required_role: str) -> bool:
        return cls.ROLE_HIERARCHY.get(user_role, 0) >= cls.ROLE_HIERARCHY.get(
            required_role, 0
        )
