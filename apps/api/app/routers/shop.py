"""Customer-facing cart, favorites and orders."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.core.config import get_settings
from app.core.deps import DB, CustomerUser, Locale, OptionalCustomer
from app.core.errors import AppError
from app.core.ratelimit import rate_limit
from app.models import CartItem, Favorite, Order, OrderStatus, Product
from app.schemas.catalog import ProductCard
from app.schemas.common import Page
from app.schemas.orders import (
    CartLineOut,
    CartMergeIn,
    CartOut,
    CartQtyIn,
    CheckoutIn,
    CheckoutOut,
    OrderCustomerOut,
    OrderOut,
)
from app.services import catalog as catalog_svc
from app.services import orders as svc

router = APIRouter(tags=["shop"])

# ---------- cart (logged-in; guests keep the cart client-side) ----------


async def _cart(db, user_id: int, lang: str) -> CartOut:
    rows = await db.scalars(
        select(CartItem).where(CartItem.user_id == user_id).order_by(CartItem.added_at)
    )
    lines, subtotal = [], 0
    for row in rows:
        p = row.product
        available = p.is_active and p.stock >= row.quantity
        line_total = p.price_minor * row.quantity
        if available:
            subtotal += line_total
        lines.append(
            CartLineOut(
                product=catalog_svc.to_card(p, lang),
                quantity=row.quantity,
                line_total_minor=line_total,
                available=available,
            )
        )
    return CartOut(items=lines, subtotal_minor=subtotal, currency=get_settings().currency)


async def _active_product(db, product_id: int) -> Product:
    p = await db.get(Product, product_id)
    if p is None or not p.is_active:
        raise AppError(404, "not_found", "Product not found")
    return p


@router.get("/cart", response_model=CartOut)
async def get_cart(user: CustomerUser, db: DB, lang: Locale):
    return await _cart(db, user.id, lang)


@router.put("/cart/items/{product_id}", response_model=CartOut)
async def set_cart_item(product_id: int, data: CartQtyIn, user: CustomerUser, db: DB, lang: Locale):
    await _active_product(db, product_id)
    stmt = insert(CartItem).values(user_id=user.id, product_id=product_id, quantity=data.quantity)
    await db.execute(
        stmt.on_conflict_do_update(
            index_elements=[CartItem.user_id, CartItem.product_id],
            set_={"quantity": data.quantity},
        )
    )
    await db.commit()
    return await _cart(db, user.id, lang)


@router.delete("/cart/items/{product_id}", response_model=CartOut)
async def remove_cart_item(product_id: int, user: CustomerUser, db: DB, lang: Locale):
    item = await db.get(CartItem, (user.id, product_id))
    if item:
        await db.delete(item)
        await db.commit()
    return await _cart(db, user.id, lang)


@router.post("/cart/merge", response_model=CartOut)
async def merge_cart(data: CartMergeIn, user: CustomerUser, db: DB, lang: Locale):
    """After login: fold the guest cart into the account cart (max of both quantities)."""
    wanted = svc.merge_lines(data.items)
    if wanted:
        valid = set(
            await db.scalars(select(Product.id).where(Product.id.in_(wanted), Product.is_active))
        )
        for pid in valid:
            stmt = insert(CartItem).values(user_id=user.id, product_id=pid, quantity=wanted[pid])
            await db.execute(
                stmt.on_conflict_do_update(
                    index_elements=[CartItem.user_id, CartItem.product_id],
                    set_={"quantity": stmt.excluded.quantity},
                    where=CartItem.quantity < stmt.excluded.quantity,
                )
            )
        await db.commit()
    return await _cart(db, user.id, lang)


# ---------- favorites ----------


@router.get("/favorites", response_model=list[ProductCard])
async def favorites(user: CustomerUser, db: DB, lang: Locale):
    rows = await db.scalars(
        select(Favorite).where(Favorite.user_id == user.id).order_by(Favorite.added_at.desc())
    )
    return [catalog_svc.to_card(f.product, lang) for f in rows if f.product.is_active]


@router.put("/favorites/{product_id}", status_code=204)
async def add_favorite(product_id: int, user: CustomerUser, db: DB):
    await _active_product(db, product_id)
    await db.execute(
        insert(Favorite).values(user_id=user.id, product_id=product_id).on_conflict_do_nothing()
    )
    await db.commit()


@router.delete("/favorites/{product_id}", status_code=204)
async def remove_favorite(product_id: int, user: CustomerUser, db: DB):
    fav = await db.get(Favorite, (user.id, product_id))
    if fav:
        await db.delete(fav)
        await db.commit()


# ---------- orders ----------


@router.post(
    "/orders",
    response_model=CheckoutOut,
    status_code=201,
    dependencies=[Depends(rate_limit("checkout", 10, 600))],
)
async def place_order(data: CheckoutIn, user: OptionalCustomer, db: DB):
    order, token = await svc.checkout(db, data, user)
    await db.commit()
    await db.refresh(order)
    return CheckoutOut(order=OrderOut.model_validate(order), access_token=token)


@router.get("/orders/my", response_model=Page[OrderOut])
async def my_orders(
    user: CustomerUser,
    db: DB,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=50)] = 10,
):
    stmt = select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
    items, total = await catalog_svc.paginate(db, stmt, page, per_page)
    return Page(items=items, total=total, page=page, per_page=per_page)


async def _owned_order(
    db, order_id: uuid.UUID, user, token: str | None, lock: bool = False
) -> Order:
    stmt = select(Order).where(Order.id == order_id)
    if lock:
        stmt = stmt.with_for_update(of=Order)
    order = await db.scalar(stmt)
    allowed = order is not None and (
        (user is not None and order.user_id == user.id)
        or (token is not None and svc.token_matches(order, token))
    )
    if not allowed:
        # 404 for both "missing" and "not yours" so ids can't be probed.
        raise AppError(404, "not_found", "Order not found")
    return order


@router.get(
    "/orders/{order_id}",
    response_model=OrderCustomerOut,
    dependencies=[Depends(rate_limit("order-view", 60, 60))],
)
async def get_order(
    order_id: uuid.UUID,
    user: OptionalCustomer,
    db: DB,
    token: Annotated[str | None, Query(max_length=100)] = None,
):
    return await _owned_order(db, order_id, user, token)


@router.post(
    "/orders/{order_id}/cancel",
    response_model=OrderCustomerOut,
    dependencies=[Depends(rate_limit("order-cancel", 10, 600))],
)
async def cancel_order(
    order_id: uuid.UUID,
    user: OptionalCustomer,
    db: DB,
    token: Annotated[str | None, Query(max_length=100)] = None,
):
    order = await _owned_order(db, order_id, user, token, lock=True)
    if order.status is not OrderStatus.pending:
        raise AppError(409, "cannot_cancel", "Order is already being processed; contact support")
    await svc.transition(db, order, OrderStatus.cancelled, user, "Cancelled by customer")
    await db.commit()
    await db.refresh(order)
    return order
