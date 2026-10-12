from app.models import Role
from tests.conftest import login, make_user


async def test_category_tree_and_products(client, catalog):
    tree = (await client.get("/api/catalog/categories")).json()
    assert tree[0]["slug"] == "tools"
    assert tree[0]["children"][0]["slug"] == "drills"

    # Root category includes descendants; inactive products are hidden.
    page = (await client.get("/api/catalog/products", params={"category": "tools"})).json()
    assert page["total"] == 2
    assert {p["slug"] for p in page["items"]} == {"drill-a", "drill-b"}
    assert page["price_min"] == 450000 and page["price_max"] == 990000


async def test_filters_and_sort(client, catalog):
    r = await client.get("/api/catalog/products", params={"on_sale": True})
    assert [p["slug"] for p in r.json()["items"]] == ["drill-b"]
    r = await client.get("/api/catalog/products", params={"brand": "bosch"})
    assert [p["slug"] for p in r.json()["items"]] == ["drill-a"]
    r = await client.get("/api/catalog/products", params={"sort": "price_desc"})
    assert [p["slug"] for p in r.json()["items"]] == ["drill-b", "drill-a"]
    r = await client.get("/api/catalog/products", params={"price_max": 500000})
    assert r.json()["total"] == 1


async def test_search_escapes_wildcards(client, catalog):
    r = await client.get("/api/catalog/products", params={"q": "ударн"})
    assert r.json()["total"] == 1
    r = await client.get("/api/catalog/products", params={"q": "%_"})
    assert r.json()["total"] == 0


async def test_localization(client, catalog):
    r = await client.get("/api/catalog/products/drill-a", params={"lang": "zh"})
    assert r.json()["name"] == "冲击钻"
    # Missing translation falls back to Russian.
    r = await client.get("/api/catalog/products/drill-b", params={"lang": "zh"})
    assert r.json()["name"] == "Дрель аккумуляторная"
    detail = (await client.get("/api/catalog/products/drill-a")).json()
    assert [c["slug"] for c in detail["breadcrumbs"]] == ["tools", "drills"]
    assert detail["stock_level"] == "in"


async def test_inactive_product_404(client, catalog):
    assert (await client.get("/api/catalog/products/hidden")).status_code == 404


async def test_admin_catalog_requires_auth(client, catalog):
    r = await client.post("/api/admin/brands", json={"name": "Makita"})
    assert r.status_code == 401


async def test_admin_crud_and_audit(client, catalog):
    await make_user("admin@x.ru", role=Role.admin)
    h = await login(client, "admin@x.ru", admin=True)

    r = await client.post(
        "/api/admin/products",
        headers=h,
        json={
            "name": {"ru": "Перфоратор Мощный"},
            "category_id": catalog["drills"].id,
            "price_minor": 1500000,
            "stock": 3,
            "images": [{"url": "https://cdn.coofix.store/a.webp"}],
            "attributes": {"Мощность, Вт": "800"},
        },
    )
    assert r.status_code == 201, r.text
    product = r.json()
    assert product["slug"] == "perforator-moshchnyi"

    # Mass assignment of computed fields is rejected.
    r = await client.patch(
        f"/api/admin/products/{product['id']}", headers=h, json={"rating_avg": 5}
    )
    assert r.status_code == 422

    r = await client.post(
        f"/api/admin/products/{product['id']}/stock", headers=h, json={"delta": -5, "reason": "x"}
    )
    assert r.json()["error"]["code"] == "negative_stock"

    # Category cycle prevention.
    r = await client.patch(
        f"/api/admin/categories/{catalog['root'].id}",
        headers=h,
        json={"parent_id": catalog["drills"].id},
    )
    assert r.json()["error"]["code"] == "category_cycle"

    audit = (await client.get("/api/admin/audit", headers=h)).json()
    assert {"product.create", "auth.login"} <= {a["action"] for a in audit["items"]}
