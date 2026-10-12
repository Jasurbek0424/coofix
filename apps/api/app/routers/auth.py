from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Request, Response

from app.core.config import get_settings
from app.core.deps import DB, CustomerUser, StaffUser, csrf_guard
from app.core.errors import AppError
from app.core.ratelimit import check_key, rate_limit
from app.core.security import Realm, hash_password, verify_password
from app.schemas.auth import (
    ChangePasswordIn,
    LoginIn,
    ProfileUpdateIn,
    RegisterIn,
    TokenOut,
    UserOut,
)
from app.services import auth as svc
from app.services.audit import record

STORE_COOKIE = "cf_rt"
ADMIN_COOKIE = "cf_admin_rt"


def _set_cookie(response: Response, realm: Realm, raw: str, expires: datetime) -> None:
    name, path = (
        (STORE_COOKIE, "/api/auth") if realm == "store" else (ADMIN_COOKIE, "/api/admin/auth")
    )
    response.set_cookie(
        name,
        raw,
        expires=expires,
        path=path,
        httponly=True,
        secure=get_settings().cookie_secure,
        samesite="strict",
    )


def _clear_cookie(response: Response, realm: Realm) -> None:
    name, path = (
        (STORE_COOKIE, "/api/auth") if realm == "store" else (ADMIN_COOKIE, "/api/admin/auth")
    )
    response.delete_cookie(name, path=path, secure=get_settings().cookie_secure, httponly=True)


# ---------- storefront realm ----------

store = APIRouter(prefix="/auth", tags=["auth"])


@store.post(
    "/register",
    response_model=TokenOut,
    status_code=201,
    dependencies=[Depends(rate_limit("register", 5, 3600))],
)
async def register(data: RegisterIn, request: Request, response: Response, db: DB):
    user = await svc.register(db, data)
    access, ttl, raw, expires = await svc.issue_session(db, user, "store", request)
    await db.commit()
    _set_cookie(response, "store", raw, expires)
    return TokenOut(access_token=access, expires_in=ttl, user=UserOut.model_validate(user))


@store.post("/login", response_model=TokenOut, dependencies=[Depends(rate_limit("login", 10, 60))])
async def login(data: LoginIn, request: Request, response: Response, db: DB):
    await check_key("login-email", data.email.lower(), 10, 900)
    user = await svc.authenticate(db, data.email, data.password)
    access, ttl, raw, expires = await svc.issue_session(db, user, "store", request)
    await db.commit()
    _set_cookie(response, "store", raw, expires)
    return TokenOut(access_token=access, expires_in=ttl, user=UserOut.model_validate(user))


@store.post(
    "/refresh",
    response_model=TokenOut,
    dependencies=[Depends(csrf_guard), Depends(rate_limit("refresh", 30, 60))],
)
async def refresh(
    request: Request,
    response: Response,
    db: DB,
    cf_rt: Annotated[str | None, Cookie()] = None,
):
    if not cf_rt:
        raise AppError(401, "invalid_refresh", "No session")
    try:
        user, access, ttl, raw, expires = await svc.rotate(db, cf_rt, "store", request)
    except AppError:
        _clear_cookie(response, "store")
        raise
    await db.commit()
    _set_cookie(response, "store", raw, expires)
    return TokenOut(access_token=access, expires_in=ttl, user=UserOut.model_validate(user))


@store.post("/logout", status_code=204, dependencies=[Depends(csrf_guard)])
async def logout(response: Response, db: DB, cf_rt: Annotated[str | None, Cookie()] = None):
    if cf_rt:
        await svc.revoke_by_token(db, cf_rt)
        await db.commit()
    _clear_cookie(response, "store")


@store.get("/me", response_model=UserOut)
async def me(user: CustomerUser):
    return user


@store.patch("/me", response_model=UserOut)
async def update_me(data: ProfileUpdateIn, user: CustomerUser, db: DB):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    return user


@store.post(
    "/change-password",
    status_code=204,
    dependencies=[Depends(rate_limit("change-password", 5, 900))],
)
async def change_password(data: ChangePasswordIn, user: CustomerUser, db: DB, response: Response):
    if not verify_password(data.current_password, user.password_hash):
        raise AppError(400, "invalid_password", "Current password is incorrect")
    user.password_hash = hash_password(data.new_password)
    # Sign out everywhere; the client must log in again.
    await svc.revoke_all(db, user.id)
    await db.commit()
    _clear_cookie(response, "store")


# ---------- admin realm (coofix.online) ----------

admin = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


@admin.post("/login", response_model=TokenOut, dependencies=[Depends(rate_limit("a-login", 5, 60))])
async def admin_login(data: LoginIn, request: Request, response: Response, db: DB):
    await check_key("a-login-email", data.email.lower(), 5, 900)
    user = await svc.authenticate(db, data.email, data.password)
    if not user.role.is_staff:
        # Same error as bad credentials: don't confirm that a customer account exists.
        raise svc.invalid_credentials()
    access, ttl, raw, expires = await svc.issue_session(db, user, "admin", request)
    await record(db, user, "auth.login", "user", user.id, request=request)
    await db.commit()
    _set_cookie(response, "admin", raw, expires)
    return TokenOut(access_token=access, expires_in=ttl, user=UserOut.model_validate(user))


@admin.post(
    "/refresh",
    response_model=TokenOut,
    dependencies=[Depends(csrf_guard), Depends(rate_limit("a-refresh", 30, 60))],
)
async def admin_refresh(
    request: Request,
    response: Response,
    db: DB,
    cf_admin_rt: Annotated[str | None, Cookie()] = None,
):
    if not cf_admin_rt:
        raise AppError(401, "invalid_refresh", "No session")
    try:
        user, access, ttl, raw, expires = await svc.rotate(db, cf_admin_rt, "admin", request)
    except AppError:
        _clear_cookie(response, "admin")
        raise
    await db.commit()
    _set_cookie(response, "admin", raw, expires)
    return TokenOut(access_token=access, expires_in=ttl, user=UserOut.model_validate(user))


@admin.post("/logout", status_code=204, dependencies=[Depends(csrf_guard)])
async def admin_logout(
    response: Response, db: DB, cf_admin_rt: Annotated[str | None, Cookie()] = None
):
    if cf_admin_rt:
        await svc.revoke_by_token(db, cf_admin_rt)
        await db.commit()
    _clear_cookie(response, "admin")


@admin.get("/me", response_model=UserOut)
async def admin_me(user: StaffUser):
    return user


@admin.post(
    "/change-password",
    status_code=204,
    dependencies=[Depends(rate_limit("a-change-password", 5, 900))],
)
async def admin_change_password(
    data: ChangePasswordIn, user: StaffUser, db: DB, request: Request, response: Response
):
    if len(data.new_password) < 12:
        raise AppError(422, "weak_password", "Staff passwords must be at least 12 characters")
    if not verify_password(data.current_password, user.password_hash):
        raise AppError(400, "invalid_password", "Current password is incorrect")
    user.password_hash = hash_password(data.new_password)
    await svc.revoke_all(db, user.id)
    await record(db, user, "auth.change_password", "user", user.id, request=request)
    await db.commit()
    _clear_cookie(response, "admin")
