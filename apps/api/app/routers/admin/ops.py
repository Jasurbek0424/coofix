"""Admin: orders, customers/staff, audit log, dashboard."""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from pydantic import EmailStr, Field, field_validator
from sqlalchemy import cast, func, or_, select
from sqlalchemy.types import String

from app.core.deps import DB, require
from app.core.errors import AppError
from app.core.security import hash_password
from app.models import AuditLog, Order, OrderStatus, PaymentStatus, Product, Role, User
from app.schemas.auth import UserOut
from app.schemas.common import Input, Output, Page
from app.schemas.orders import OrderAdminOut, OrderAdminPatch, OrderTransitionIn
from app.services import auth as auth_svc
from app.services import orders as order_svc
from app.services.audit import record
from app.services.catalog import LOW_STOCK, escape_like, paginate

router = APIRouter(prefix="/admin", tags=["admin-ops"])

# ---------- orders ----------


@router.get("/orders", response_model=Page[OrderAdminOut])
async def list_orders(
    db: DB,
    _: Annotated[User, Depends(require("orders.read"))],
    status: OrderStatus | None = None,
    payment_status: PaymentStatus | None = None,
    q: Annotated[str | None, Query(max_length=100)] = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=100)] = 25,
):
    stmt = select(Order)
    if status:
        stmt = stmt.where(Order.status == status)
    if payment_status:
        stmt = stmt.where(Order.payment_status == payment_status)
    if q:
        pattern = f"%{escape_like(q)}%"
        stmt = stmt.where(
            or_(
                cast(Order.number, String).ilike(pattern, escape="\\"),
                Order.phone.ilike(pattern, escape="\\"),
                Order.customer_name.ilike(pattern, escape="\\"),
                Order.email.ilike(pattern, escape="\\"),
            )
        )
    if date_from:
        stmt = stmt.where(Order.created_at >= date_from)
    if date_to:
        stmt = stmt.where(Order.created_at < date_to)
    stmt = stmt.order_by(Order.created_at.desc())
    items, total = await paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page)


@router.get("/orders/{order_id}", response_model=OrderAdminOut)
async def get_order(
    order_id: uuid.UUID, db: DB, _: Annotated[User, Depends(require("orders.read"))]
):
    order = await db.get(Order, order_id)
    if order is None:
        raise AppError(404, "not_found", "Order not found")
    return order


@router.post("/orders/{order_id}/status", response_model=OrderAdminOut)
async def change_status(
    order_id: uuid.UUID,
    data: OrderTransitionIn,
    db: DB,
    user: Annotated[User, Depends(require("orders.write"))],
    request: Request,
):
    order = await db.scalar(select(Order).where(Order.id == order_id).with_for_update(of=Order))
    if order is None:
        raise AppError(404, "not_found", "Order not found")
    before = order.status
    await order_svc.transition(db, order, data.status, user, data.note)
    await record(
        db, user, "order.status", "order", order.id,
        {"from": before.value, "to": data.status.value, "note": data.note}, request,
    )  # fmt: skip
    await db.commit()
    await db.refresh(order)
    return order


@router.patch("/orders/{order_id}", response_model=OrderAdminOut)
async def patch_order(
    order_id: uuid.UUID,
    data: OrderAdminPatch,
    db: DB,
    user: Annotated[User, Depends(require("orders.write"))],
    request: Request,
):
    order = await db.scalar(select(Order).where(Order.id == order_id).with_for_update(of=Order))
    if order is None:
        raise AppError(404, "not_found", "Order not found")
    values = data.model_dump(mode="json", exclude_unset=True)
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(order, k, v)
    await record(db, user, "order.update", "order", order.id, values, request)
    await db.commit()
    await db.refresh(order)
    return order


# ---------- users ----------


class UserAdminOut(UserOut):
    is_active: bool
    last_login_at: datetime | None


class UserAdminPatch(Input):
    is_active: bool | None = None
    role: Role | None = None


class StaffCreateIn(Input):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str | None = Field(default=None, max_length=80)
    role: Role


@router.get("/users", response_model=Page[UserAdminOut])
async def list_users(
    db: DB,
    _: Annotated[User, Depends(require("customers.read"))],
    q: Annotated[str | None, Query(max_length=100)] = None,
    role: Role | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=100)] = 25,
):
    stmt = select(User)
    if q:
        pattern = f"%{escape_like(q)}%"
        stmt = stmt.where(
            or_(
                User.email.ilike(pattern, escape="\\"),
                User.phone.ilike(pattern, escape="\\"),
                User.first_name.ilike(pattern, escape="\\"),
                User.last_name.ilike(pattern, escape="\\"),
            )
        )
    if role:
        stmt = stmt.where(User.role == role)
    items, total = await paginate(db, stmt.order_by(User.created_at.desc()), page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page)


@router.patch("/users/{user_id}", response_model=UserAdminOut)
async def update_user(
    user_id: int,
    data: UserAdminPatch,
    db: DB,
    actor: Annotated[User, Depends(require("staff.manage"))],
    request: Request,
):
    target = await db.get(User, user_id)
    if target is None:
        raise AppError(404, "not_found", "User not found")
    if target.id == actor.id:
        raise AppError(409, "self_modification", "You cannot change your own role or status")
    values = data.model_dump(mode="json", exclude_unset=True)
    for k, v in data.model_dump(exclude_unset=True).items():
        if v is None:
            raise AppError(422, "required_field", f"{k} cannot be null")
        setattr(target, k, v)
    # Any role/status change kills existing sessions so new rights apply immediately.
    await auth_svc.revoke_all(db, target.id)
    await record(db, actor, "user.update", "user", target.id, values, request)
    await db.commit()
    await db.refresh(target)
    return target


@router.post("/staff", response_model=UserAdminOut, status_code=201)
async def create_staff(
    data: StaffCreateIn,
    db: DB,
    actor: Annotated[User, Depends(require("staff.manage"))],
    request: Request,
):
    if not data.role.is_staff:
        raise AppError(422, "invalid_role", "Use a staff role")
    if await auth_svc.find_by_email(db, data.email):
        raise AppError(409, "email_taken", "An account with this email already exists")
    user = User(
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        role=data.role,
        email_verified_at=datetime.now(UTC),
    )
    db.add(user)
    await db.flush()
    await record(
        db, actor, "staff.create", "user", user.id,
        {"email": user.email, "role": data.role.value}, request,
    )  # fmt: skip
    await db.commit()
    await db.refresh(user)
    return user


# ---------- audit ----------


class AuditOut(Output):
    id: int
    actor_user_id: int | None
    action: str
    entity: str
    entity_id: str | None
    data: dict
    ip: str | None
    created_at: datetime

    @field_validator("ip", mode="before")
    @classmethod
    def _ip(cls, v):
        return str(v) if v is not None else None


@router.get("/audit", response_model=Page[AuditOut])
async def audit_log(
    db: DB,
    _: Annotated[User, Depends(require("audit.read"))],
    entity: Annotated[str | None, Query(max_length=40)] = None,
    entity_id: Annotated[str | None, Query(max_length=64)] = None,
    actor_user_id: int | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=100)] = 50,
):
    stmt = select(AuditLog)
    if entity:
        stmt = stmt.where(AuditLog.entity == entity)
    if entity_id:
        stmt = stmt.where(AuditLog.entity_id == entity_id)
    if actor_user_id:
        stmt = stmt.where(AuditLog.actor_user_id == actor_user_id)
    items, total = await paginate(db, stmt.order_by(AuditLog.id.desc()), page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page)


# ---------- dashboard ----------


class DashboardOut(Output):
    revenue_minor_30d: int
    orders_30d: int
    pending_orders: int
    new_customers_30d: int
    low_stock_products: int
    daily: list[dict]


@router.get("/dashboard", response_model=DashboardOut)
async def dashboard(db: DB, _: Annotated[User, Depends(require("orders.read"))]):
    since = datetime.now(UTC) - timedelta(days=30)
    # Revenue = orders not cancelled. One definition everywhere.
    counted = (Order.created_at >= since, Order.status != OrderStatus.cancelled)
    revenue = await db.scalar(select(func.coalesce(func.sum(Order.total_minor), 0)).where(*counted))
    orders = await db.scalar(select(func.count()).select_from(Order).where(*counted))
    pending = await db.scalar(
        select(func.count()).select_from(Order).where(Order.status == OrderStatus.pending)
    )
    customers = await db.scalar(
        select(func.count())
        .select_from(User)
        .where(User.created_at >= since, User.role == Role.customer)
    )
    low = await db.scalar(
        select(func.count())
        .select_from(Product)
        .where(Product.is_active, Product.stock <= LOW_STOCK)
    )
    day = func.date_trunc("day", Order.created_at).label("day")
    rows = await db.execute(
        select(day, func.count(), func.sum(Order.total_minor))
        .where(*counted)
        .group_by(day)
        .order_by(day)
    )
    return DashboardOut(
        revenue_minor_30d=int(revenue or 0),
        orders_30d=int(orders or 0),
        pending_orders=int(pending or 0),
        new_customers_30d=int(customers or 0),
        low_stock_products=int(low or 0),
        daily=[
            {"date": d.date().isoformat(), "orders": int(n), "revenue_minor": int(r or 0)}
            for d, n, r in rows
        ],
    )
