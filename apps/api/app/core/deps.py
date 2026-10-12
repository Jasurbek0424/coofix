import uuid
from collections.abc import Callable
from typing import Annotated

import jwt
from fastapi import Depends, Header, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.db import get_session
from app.core.errors import AppError
from app.core.security import Realm, decode_access_token
from app.models import AuthSession, Role, User

DB = Annotated[AsyncSession, Depends(get_session)]

CSRF_HEADER = "X-Requested-With"
CSRF_VALUE = "coofix"

# Role → permissions. Server is the only place authorization is decided.
PERMISSIONS: dict[Role, frozenset[str]] = {
    Role.customer: frozenset(),
    Role.support: frozenset({"orders.read", "orders.write", "customers.read"}),
    Role.content: frozenset({"catalog.write", "reviews.moderate"}),
    Role.manager: frozenset(
        {"catalog.write", "reviews.moderate", "orders.read", "orders.write", "customers.read"}
    ),
    Role.admin: frozenset(
        {
            "catalog.write",
            "reviews.moderate",
            "orders.read",
            "orders.write",
            "customers.read",
            "staff.manage",
            "audit.read",
        }
    ),
}


def _bearer(request: Request) -> str | None:
    header = request.headers.get("authorization", "")
    scheme, _, token = header.partition(" ")
    return token if scheme.lower() == "bearer" and token else None


async def _resolve(request: Request, db: AsyncSession, realm: Realm) -> User | None:
    token = _bearer(request)
    if token is None:
        return None
    try:
        claims = decode_access_token(token, realm)
        session_id = uuid.UUID(claims["sid"])
        user_id = int(claims["sub"])
    except (jwt.PyJWTError, ValueError, KeyError):
        raise AppError(401, "invalid_token", "Invalid or expired token") from None

    # Session lookup on every request: logout / role change / ban take effect immediately.
    session = await db.scalar(
        select(AuthSession).where(
            AuthSession.id == session_id,
            AuthSession.user_id == user_id,
            AuthSession.realm == realm,
            AuthSession.revoked_at.is_(None),
        )
    )
    if session is None or not session.user.is_active:
        raise AppError(401, "invalid_token", "Session is no longer valid")
    if realm == "admin" and not session.user.role.is_staff:
        raise AppError(403, "forbidden", "Staff only")
    return session.user


async def optional_customer(request: Request, db: DB) -> User | None:
    return await _resolve(request, db, "store")


async def current_customer(request: Request, db: DB) -> User:
    user = await _resolve(request, db, "store")
    if user is None:
        raise AppError(401, "unauthorized", "Authentication required")
    return user


async def current_staff(request: Request, db: DB) -> User:
    user = await _resolve(request, db, "admin")
    if user is None:
        raise AppError(401, "unauthorized", "Authentication required")
    return user


def require(permission: str) -> Callable:
    async def dependency(user: Annotated[User, Depends(current_staff)]) -> User:
        if permission not in PERMISSIONS[user.role]:
            raise AppError(403, "forbidden", "Insufficient permissions")
        return user

    return dependency


async def csrf_guard(x_requested_with: Annotated[str | None, Header()] = None) -> None:
    """Cookie-authenticated endpoints require a custom header. Browsers can't send it
    cross-site without a CORS preflight, which our origin allowlist rejects."""
    if x_requested_with != CSRF_VALUE:
        raise AppError(403, "csrf_failed", "Missing CSRF header")


def locale(lang: Annotated[str | None, Query(max_length=5)] = None) -> str:
    s = get_settings()
    return lang if lang in s.locales else s.default_locale


CustomerUser = Annotated[User, Depends(current_customer)]
OptionalCustomer = Annotated[User | None, Depends(optional_customer)]
StaffUser = Annotated[User, Depends(current_staff)]
Locale = Annotated[str, Depends(locale)]
