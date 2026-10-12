import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Literal

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core.config import get_settings

Realm = Literal["store", "admin"]

_hasher = PasswordHasher()
# Verified against when the user does not exist, so login timing doesn't reveal accounts.
_DUMMY_HASH = _hasher.hash("coofix-timing-equalizer")

JWT_ALG = "HS256"
JWT_ISSUER = "coofix"


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    try:
        return _hasher.verify(password_hash or _DUMMY_HASH, password) and password_hash is not None
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def password_needs_rehash(password_hash: str) -> bool:
    return _hasher.check_needs_rehash(password_hash)


def create_access_token(user_id: int, realm: Realm, session_id: str) -> tuple[str, int]:
    s = get_settings()
    now = datetime.now(UTC)
    payload = {
        "iss": JWT_ISSUER,
        "aud": realm,
        "sub": str(user_id),
        "sid": session_id,
        "iat": now,
        "exp": now + timedelta(seconds=s.access_ttl_seconds),
    }
    return jwt.encode(payload, s.jwt_secret, algorithm=JWT_ALG), s.access_ttl_seconds


def decode_access_token(token: str, realm: Realm) -> dict:
    """Raises jwt.PyJWTError on any problem."""
    return jwt.decode(
        token,
        get_settings().jwt_secret,
        algorithms=[JWT_ALG],
        audience=realm,
        issuer=JWT_ISSUER,
        options={"require": ["exp", "sub", "aud", "iss", "sid"]},
    )


def new_opaque_token() -> tuple[str, str]:
    """Returns (raw token for the client, sha256 hash for storage)."""
    raw = secrets.token_urlsafe(32)
    return raw, hash_token(raw)


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()
