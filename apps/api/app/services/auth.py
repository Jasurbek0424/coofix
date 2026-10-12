import uuid
from datetime import UTC, datetime, timedelta

from fastapi import Request
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.ratelimit import client_ip
from app.core.security import (
    Realm,
    create_access_token,
    hash_password,
    hash_token,
    new_opaque_token,
    password_needs_rehash,
    verify_password,
)
from app.models import AuthSession, User
from app.schemas.auth import RegisterIn


def invalid_credentials() -> AppError:
    return AppError(401, "invalid_credentials", "Invalid email or password")


def _now() -> datetime:
    return datetime.now(UTC)


def _refresh_ttl(realm: Realm) -> timedelta:
    s = get_settings()
    if realm == "admin":
        return timedelta(hours=s.admin_refresh_ttl_hours)
    return timedelta(days=s.refresh_ttl_days)


async def find_by_email(db: AsyncSession, email: str) -> User | None:
    return await db.scalar(select(User).where(func.lower(User.email) == email.lower()))


async def register(db: AsyncSession, data: RegisterIn) -> User:
    if await find_by_email(db, data.email):
        raise AppError(409, "email_taken", "An account with this email already exists")
    user = User(
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
    )
    db.add(user)
    await db.flush()
    return user


async def authenticate(db: AsyncSession, email: str, password: str) -> User:
    user = await find_by_email(db, email)
    # verify_password runs a dummy hash when user is None, keeping timing uniform.
    if not verify_password(password, user.password_hash if user else None) or user is None:
        raise invalid_credentials()
    if not user.is_active:
        raise invalid_credentials()
    if password_needs_rehash(user.password_hash):
        user.password_hash = hash_password(password)
    user.last_login_at = _now()
    return user


async def issue_session(
    db: AsyncSession,
    user: User,
    realm: Realm,
    request: Request,
    family_id: uuid.UUID | None = None,
) -> tuple[str, int, str, datetime]:
    """Creates a session row. Returns (access_token, expires_in, refresh_raw, refresh_expires)."""
    raw, digest = new_opaque_token()
    expires = _now() + _refresh_ttl(realm)
    session = AuthSession(
        id=uuid.uuid4(),
        family_id=family_id or uuid.uuid4(),
        user_id=user.id,
        realm=realm,
        token_hash=digest,
        expires_at=expires,
        user_agent=(request.headers.get("user-agent") or "")[:300] or None,
        ip=client_ip(request) if request.client else None,
    )
    db.add(session)
    await db.flush()
    access, ttl = create_access_token(user.id, realm, str(session.id))
    return access, ttl, raw, expires


async def rotate(
    db: AsyncSession, raw: str, realm: Realm, request: Request
) -> tuple[User, str, int, str, datetime]:
    session = await db.scalar(
        select(AuthSession)
        .where(AuthSession.token_hash == hash_token(raw), AuthSession.realm == realm)
        .with_for_update(of=AuthSession)
    )
    invalid = AppError(401, "invalid_refresh", "Session expired, please sign in again")
    if session is None:
        raise invalid
    if session.rotated_at is not None or session.revoked_at is not None:
        # A rotated token was replayed: assume theft, kill the whole family.
        await revoke_family(db, session.family_id)
        await db.commit()
        raise invalid
    if session.expires_at <= _now() or not session.user.is_active:
        raise invalid
    if realm == "admin" and not session.user.role.is_staff:
        raise invalid

    session.rotated_at = _now()
    session.revoked_at = _now()
    access, ttl, new_raw, expires = await issue_session(
        db, session.user, realm, request, family_id=session.family_id
    )
    return session.user, access, ttl, new_raw, expires


async def revoke_by_token(db: AsyncSession, raw: str) -> None:
    await db.execute(
        update(AuthSession)
        .where(AuthSession.token_hash == hash_token(raw), AuthSession.revoked_at.is_(None))
        .values(revoked_at=_now())
    )


async def revoke_family(db: AsyncSession, family_id: uuid.UUID) -> None:
    await db.execute(
        update(AuthSession)
        .where(AuthSession.family_id == family_id, AuthSession.revoked_at.is_(None))
        .values(revoked_at=_now())
    )


async def revoke_all(db: AsyncSession, user_id: int, except_session: uuid.UUID | None = None):
    stmt = update(AuthSession).where(
        AuthSession.user_id == user_id, AuthSession.revoked_at.is_(None)
    )
    if except_session:
        stmt = stmt.where(AuthSession.id != except_session)
    await db.execute(stmt.values(revoked_at=_now()))
