"""Staff notifications. Failures are logged, never raised: an order must not fail
because Telegram is down."""

import html
import logging

import httpx

from app.core.config import get_settings
from app.models import Order

log = logging.getLogger("coofix.notify")


def _rub(minor: int) -> str:
    return f"{minor / 100:,.2f}".replace(",", " ").replace(".00", "") + " ₽"


def order_message(order: Order) -> str:
    e = html.escape
    lines = [
        f"🛒 <b>Новый заказ №{order.number}</b>",
        f"👤 {e(order.customer_name)}",
        f"📞 {e(order.phone)}",
    ]
    if order.email:
        lines.append(f"✉️ {e(order.email)}")
    lines.append(
        "🚚 Самовывоз"
        if order.delivery_method == "pickup"
        else f"🚚 Курьер: {e(order.address or '')}"
    )
    lines.append("")
    for item in order.items:
        lines.append(f"• {e(item.name)} × {item.quantity} = {_rub(item.line_total_minor)}")
    lines.append("")
    if order.delivery_minor:
        lines.append(f"Доставка: {_rub(order.delivery_minor)}")
    lines.append(f"<b>Итого: {_rub(order.total_minor)}</b>")
    if order.comment:
        lines.append(f"💬 {e(order.comment)}")
    lines.append(f'\n<a href="{get_settings().admin_url}/orders/{order.id}">Открыть в админке</a>')
    return "\n".join(lines)


async def telegram(text: str) -> None:
    s = get_settings()
    if not (s.telegram_bot_token and s.telegram_chat_id):
        return
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                f"https://api.telegram.org/bot{s.telegram_bot_token}/sendMessage",
                json={
                    "chat_id": s.telegram_chat_id,
                    "text": text[:4000],
                    "parse_mode": "HTML",
                    "disable_web_page_preview": True,
                },
            )
            if r.status_code != 200:
                log.warning("telegram send failed: %s", r.status_code)
    except httpx.HTTPError as exc:
        log.warning("telegram send error: %s", type(exc).__name__)
