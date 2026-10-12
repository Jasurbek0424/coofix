from app.core.db import SessionLocal
from app.models import Product, Role
from tests.conftest import login, make_user


def checkout_body(items, **kw):
    return {
        "items": items,
        "customer_name": "Иван Петров",
        "phone": "+7 999 000 11 22",
        "delivery_method": "pickup",
        "payment_method": "cash_on_delivery",
        **kw,
    }


async def stock_of(pid: int) -> int:
    async with SessionLocal() as db:
        return (await db.get(Product, pid)).stock


async def test_guest_checkout_prices_from_server(client, catalog):
    p1 = catalog["p1"]
    r = await client.post(
        "/api/orders",
        json=checkout_body(
            [{"product_id": p1.id, "quantity": 2}, {"product_id": p1.id, "quantity": 1}]
        ),
    )
    assert r.status_code == 201, r.text
    data = r.json()
    order = data["order"]
    assert order["subtotal_minor"] == 3 * 450000
    assert order["total_minor"] == 3 * 450000
    assert order["number"] == 100001
    assert await stock_of(p1.id) == 7

    # Guest can view with token only.
    oid = order["id"]
    assert (await client.get(f"/api/orders/{oid}")).status_code == 404
    assert (await client.get(f"/api/orders/{oid}", params={"token": "wrong"})).status_code == 404
    r = await client.get(f"/api/orders/{oid}", params={"token": data["access_token"]})
    assert r.status_code == 200


async def test_client_price_fields_rejected(client, catalog):
    r = await client.post(
        "/api/orders",
        json=checkout_body([{"product_id": catalog["p1"].id, "quantity": 1, "price": 1}]),
    )
    assert r.status_code == 422


async def test_invalid_quantities_rejected(client, catalog):
    for qty in (0, -1, 1.5, "2", 1000):
        r = await client.post(
            "/api/orders", json=checkout_body([{"product_id": catalog["p1"].id, "quantity": qty}])
        )
        assert r.status_code == 422, qty


async def test_stock_conflict_and_inactive(client, catalog):
    r = await client.post(
        "/api/orders",
        json=checkout_body(
            [
                {"product_id": catalog["p2"].id, "quantity": 2},
                {"product_id": catalog["p3"].id, "quantity": 1},
            ]
        ),
    )
    assert r.status_code == 409
    reasons = {i["product_id"]: i["reason"] for i in r.json()["error"]["items"]}
    assert reasons == {catalog["p2"].id: "insufficient_stock", catalog["p3"].id: "unavailable"}
    assert await stock_of(catalog["p2"].id) == 1


async def test_expected_total_mismatch(client, catalog):
    r = await client.post(
        "/api/orders",
        json=checkout_body(
            [{"product_id": catalog["p1"].id, "quantity": 1}], expected_total_minor=1
        ),
    )
    assert r.json()["error"]["code"] == "price_changed"
    assert await stock_of(catalog["p1"].id) == 10


async def test_courier_fee_and_address(client, catalog):
    r = await client.post(
        "/api/orders",
        json=checkout_body(
            [{"product_id": catalog["p1"].id, "quantity": 1}], delivery_method="courier"
        ),
    )
    assert r.status_code == 422
    r = await client.post(
        "/api/orders",
        json=checkout_body(
            [{"product_id": catalog["p1"].id, "quantity": 1}],
            delivery_method="courier",
            address="Москва, ул. Ленина, 1",
        ),
    )
    assert r.json()["order"]["delivery_minor"] == 50000


async def test_online_payment_disabled(client, catalog):
    r = await client.post(
        "/api/orders",
        json=checkout_body(
            [{"product_id": catalog["p1"].id, "quantity": 1}], payment_method="online"
        ),
    )
    assert r.json()["error"]["code"] == "payment_unavailable"


async def test_status_machine_and_restock(client, catalog):
    await make_user("mgr@x.ru", role=Role.manager)
    h = await login(client, "mgr@x.ru", admin=True)
    r = await client.post(
        "/api/orders", json=checkout_body([{"product_id": catalog["p1"].id, "quantity": 4}])
    )
    oid = r.json()["order"]["id"]
    assert await stock_of(catalog["p1"].id) == 6

    r = await client.post(
        f"/api/admin/orders/{oid}/status", headers=h, json={"status": "delivered"}
    )
    assert r.json()["error"]["code"] == "invalid_transition"

    for s in ("confirmed", "cancelled"):
        r = await client.post(f"/api/admin/orders/{oid}/status", headers=h, json={"status": s})
        assert r.status_code == 200, r.text
    assert await stock_of(catalog["p1"].id) == 10
    assert [e["to_status"] for e in r.json()["events"]] == ["pending", "confirmed", "cancelled"]

    # Cancelled is terminal: no double restock.
    r = await client.post(
        f"/api/admin/orders/{oid}/status", headers=h, json={"status": "cancelled"}
    )
    assert r.status_code == 409
    assert await stock_of(catalog["p1"].id) == 10


async def test_customer_orders_isolated(client, catalog):
    await make_user("a@x.ru")
    await make_user("b@x.ru")
    ha = await login(client, "a@x.ru")
    hb = await login(client, "b@x.ru")
    r = await client.post(
        "/api/orders",
        headers=ha,
        json=checkout_body([{"product_id": catalog["p1"].id, "quantity": 1}]),
    )
    oid = r.json()["order"]["id"]
    assert (await client.get(f"/api/orders/{oid}", headers=ha)).status_code == 200
    assert (await client.get(f"/api/orders/{oid}", headers=hb)).status_code == 404
    assert (await client.get("/api/orders/my", headers=hb)).json()["total"] == 0
    # Customer may cancel own pending order.
    r = await client.post(f"/api/orders/{oid}/cancel", headers=ha)
    assert r.json()["status"] == "cancelled"


async def test_cart_flow(client, catalog):
    await make_user("cart@x.ru")
    h = await login(client, "cart@x.ru")
    p1, p2 = catalog["p1"], catalog["p2"]
    r = await client.put(f"/api/cart/items/{p1.id}", headers=h, json={"quantity": 2})
    assert r.json()["subtotal_minor"] == 900000
    r = await client.post(
        "/api/cart/merge",
        headers=h,
        json={
            "items": [{"product_id": p1.id, "quantity": 1}, {"product_id": p2.id, "quantity": 1}]
        },
    )
    lines = {line["product"]["id"]: line["quantity"] for line in r.json()["items"]}
    assert lines == {p1.id: 2, p2.id: 1}
    # Inactive products can't be added.
    r = await client.put(f"/api/cart/items/{catalog['p3'].id}", headers=h, json={"quantity": 1})
    assert r.status_code == 404
    # Ordered items leave the cart.
    await client.post(
        "/api/orders", headers=h, json=checkout_body([{"product_id": p1.id, "quantity": 2}])
    )
    r = await client.get("/api/cart", headers=h)
    assert [line["product"]["id"] for line in r.json()["items"]] == [p2.id]


async def test_concurrent_checkout_cannot_oversell(client, catalog):
    import asyncio

    p2 = catalog["p2"]  # stock == 1
    body = checkout_body([{"product_id": p2.id, "quantity": 1}])
    results = await asyncio.gather(*[client.post("/api/orders", json=body) for _ in range(5)])
    codes = sorted(r.status_code for r in results)
    assert codes == [201, 409, 409, 409, 409]
    assert await stock_of(p2.id) == 0
