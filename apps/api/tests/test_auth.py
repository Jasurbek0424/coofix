from app.models import Role
from tests.conftest import login, make_user


async def test_register_login_me(client):
    r = await client.post(
        "/api/auth/register",
        json={
            "email": "A@x.ru",
            "password": "password123",
            "first_name": "Ann",
            "phone": "8 (999) 123-45-67",
        },
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["user"]["email"] == "a@x.ru"
    assert body["user"]["phone"] == "+79991234567"
    assert body["user"]["role"] == "customer"
    assert "cf_rt" in r.cookies

    me = await client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"}
    )
    assert me.status_code == 200


async def test_register_rejects_role_and_unknown_fields(client):
    r = await client.post(
        "/api/auth/register",
        json={"email": "b@x.ru", "password": "password123", "first_name": "B", "role": "admin"},
    )
    assert r.status_code == 422


async def test_login_errors_do_not_reveal_accounts(client):
    await make_user("c@x.ru")
    wrong_pw = await client.post("/api/auth/login", json={"email": "c@x.ru", "password": "nope"})
    no_user = await client.post("/api/auth/login", json={"email": "z@x.ru", "password": "nope"})
    assert wrong_pw.status_code == no_user.status_code == 401
    assert wrong_pw.json() == no_user.json()


async def test_login_rejects_operator_payload(client):
    r = await client.post("/api/auth/login", json={"email": {"$ne": None}, "password": "x"})
    assert r.status_code == 422


async def test_refresh_rotation_and_reuse_detection(client):
    await make_user("d@x.ru")
    await login(client, "d@x.ru")
    old = client.cookies.get("cf_rt")

    r1 = await client.post("/api/auth/refresh")
    assert r1.status_code == 200
    new = client.cookies.get("cf_rt")
    assert new and new != old

    # Replaying the old token kills the whole family, including the new one.
    client.cookies.set("cf_rt", old, path="/api/auth")
    assert (await client.post("/api/auth/refresh")).status_code == 401
    client.cookies.set("cf_rt", new, path="/api/auth")
    assert (await client.post("/api/auth/refresh")).status_code == 401


async def test_refresh_requires_csrf_header(client):
    await make_user("e@x.ru")
    await login(client, "e@x.ru")
    r = await client.post("/api/auth/refresh", headers={"X-Requested-With": ""})
    assert r.status_code == 403


async def test_logout_revokes_access_token(client):
    await make_user("f@x.ru")
    h = await login(client, "f@x.ru")
    assert (await client.get("/api/auth/me", headers=h)).status_code == 200
    assert (await client.post("/api/auth/logout")).status_code == 204
    assert (await client.get("/api/auth/me", headers=h)).status_code == 401


async def test_customer_cannot_use_admin_realm(client):
    await make_user("g@x.ru")
    r = await client.post(
        "/api/admin/auth/login", json={"email": "g@x.ru", "password": "password123"}
    )
    assert r.status_code == 401
    store = await login(client, "g@x.ru")
    # A store token is not valid for admin routes (different audience).
    assert (await client.get("/api/admin/products", headers=store)).status_code == 401


async def test_role_permissions(client):
    await make_user("content@x.ru", role=Role.content)
    await make_user("support@x.ru", role=Role.support)
    content = await login(client, "content@x.ru", admin=True)
    support = await login(client, "support@x.ru", admin=True)
    assert (await client.get("/api/admin/products", headers=content)).status_code == 200
    assert (await client.get("/api/admin/orders", headers=content)).status_code == 403
    assert (await client.get("/api/admin/orders", headers=support)).status_code == 200
    assert (await client.get("/api/admin/products", headers=support)).status_code == 403


async def test_demoted_staff_loses_access_immediately(client):
    admin = await make_user("boss@x.ru", role=Role.admin)
    mgr = await make_user("mgr@x.ru", role=Role.manager)
    boss_h = await login(client, "boss@x.ru", admin=True)
    mgr_h = await login(client, "mgr@x.ru", admin=True)
    r = await client.patch(f"/api/admin/users/{mgr.id}", json={"role": "customer"}, headers=boss_h)
    assert r.status_code == 200
    assert (await client.get("/api/admin/products", headers=mgr_h)).status_code == 401
    # Admin can't demote themselves.
    r = await client.patch(
        f"/api/admin/users/{admin.id}", json={"role": "customer"}, headers=boss_h
    )
    assert r.status_code == 409


async def test_login_rate_limited(client):
    for _ in range(10):
        await client.post("/api/auth/login", json={"email": "h@x.ru", "password": "bad"})
    r = await client.post("/api/auth/login", json={"email": "h@x.ru", "password": "bad"})
    assert r.status_code == 429


async def test_admin_change_password_revokes_sessions(client):
    await make_user("own@x.ru", password="old-password-123", role=Role.admin)
    h = await login(client, "own@x.ru", "old-password-123", admin=True)
    r = await client.post(
        "/api/admin/auth/change-password",
        headers=h,
        json={"current_password": "old-password-123", "new_password": "short"},
    )
    assert r.status_code == 422
    r = await client.post(
        "/api/admin/auth/change-password",
        headers=h,
        json={"current_password": "old-password-123", "new_password": "new-password-456"},
    )
    assert r.status_code == 204
    assert (await client.get("/api/admin/auth/me", headers=h)).status_code == 401
    await login(client, "own@x.ru", "new-password-456", admin=True)
