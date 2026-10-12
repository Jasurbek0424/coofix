import hmac
import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.security import hash_token, new_opaque_token
from app.models import (
    CartItem,
    DeliveryMethod,
    Order,
    OrderEvent,
    OrderItem,
    OrderStatus,
    PaymentMethod,
    Product,
    User,
)
from app.models.commerce import ORDER_TRANSITIONS
from app.schemas.common import pick
from app.schemas.orders import CartLineIn, CheckoutIn

# Statuses where stock has been taken and must be returned on cancel.
_HOLDS_STOCK = {OrderStatus.pending, OrderStatus.confirmed, OrderStatus.shipped}


def merge_lines(lines: list[CartLineIn]) -> dict[int, int]:
    merged: dict[int, int] = {}
    for line in lines:
        merged[line.product_id] = min(merged.get(line.product_id, 0) + line.quantity, 999)
    return merged


async def lock_products(db: AsyncSession, ids: list[int]) -> dict[int, Product]:
    # Lock in id order so concurrent checkouts can't deadlock on each other.
    rows = await db.scalars(
        select(Product).where(Product.id.in_(ids)).order_by(Product.id).with_for_update(of=Product)
    )
    return {p.id: p for p in rows}


def delivery_fee(method: DeliveryMethod, subtotal: int) -> int:
    s = get_settings()
    if method is DeliveryMethod.pickup or subtotal >= s.free_delivery_from_minor:
        return 0
    return s.courier_fee_minor


async def checkout(db: AsyncSession, data: CheckoutIn, user: User | None) -> tuple[Order, str]:
    s = get_settings()
    if data.payment_method is PaymentMethod.online and not s.online_payments_enabled:
        raise AppError(422, "payment_unavailable", "Online payment is not available yet")

    wanted = merge_lines(data.items)
    products = await lock_products(db, sorted(wanted))

    problems = []
    for pid, qty in wanted.items():
        p = products.get(pid)
        if p is None or not p.is_active:
            problems.append({"product_id": pid, "reason": "unavailable", "available": 0})
        elif p.stock < qty:
            problems.append(
                {"product_id": pid, "reason": "insufficient_stock", "available": p.stock}
            )
    if problems:
        raise AppError(409, "stock_conflict", "Some items are unavailable", {"items": problems})

    items: list[OrderItem] = []
    subtotal = 0
    for pid in sorted(wanted):
        p, qty = products[pid], wanted[pid]
        line_total = p.price_minor * qty
        subtotal += line_total
        items.append(
            OrderItem(
                product_id=p.id,
                sku=p.sku,
                name=pick(p.name, s.default_locale)[:300],
                unit_price_minor=p.price_minor,
                quantity=qty,
                line_total_minor=line_total,
            )
        )
        p.stock -= qty

    fee = delivery_fee(data.delivery_method, subtotal)
    total = subtotal + fee
    if data.expected_total_minor is not None and data.expected_total_minor != total:
        raise AppError(
            409, "price_changed", "Prices changed, please review your cart", {"total_minor": total}
        )

    raw_token, token_hash = new_opaque_token()
    order = Order(
        id=uuid.uuid4(),
        user_id=user.id if user else None,
        payment_method=data.payment_method,
        delivery_method=data.delivery_method,
        customer_name=data.customer_name,
        phone=data.phone,
        email=data.email or (user.email if user else None),
        address=data.address if data.delivery_method is DeliveryMethod.courier else None,
        comment=data.comment,
        currency=s.currency,
        subtotal_minor=subtotal,
        delivery_minor=fee,
        total_minor=total,
        access_token_hash=token_hash,
        items=items,
        events=[OrderEvent(from_status=None, to_status=OrderStatus.pending.value)],
    )
    db.add(order)
    if user:
        await db.execute(
            delete(CartItem).where(CartItem.user_id == user.id, CartItem.product_id.in_(wanted))
        )
    await db.flush()
    return order, raw_token


def token_matches(order: Order, raw: str) -> bool:
    return hmac.compare_digest(order.access_token_hash, hash_token(raw))


async def transition(
    db: AsyncSession, order: Order, to: OrderStatus, actor: User | None, note: str | None
) -> None:
    current = order.status
    if to not in ORDER_TRANSITIONS[current]:
        raise AppError(
            409,
            "invalid_transition",
            f"Cannot change status from {current} to {to}",
            {"allowed": sorted(ORDER_TRANSITIONS[current])},
        )
    if to is OrderStatus.cancelled and current in _HOLDS_STOCK:
        ids = [i.product_id for i in order.items if i.product_id is not None]
        products = await lock_products(db, sorted(ids))
        for item in order.items:
            if item.product_id in products:
                products[item.product_id].stock += item.quantity
    order.status = to
    order.events.append(
        OrderEvent(
            from_status=current.value,
            to_status=to.value,
            actor_user_id=actor.id if actor else None,
            note=note,
        )
    )
