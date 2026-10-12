import os

os.environ["COOFIX_ENV"] = "test"
os.environ["COOFIX_DATABASE_URL"] = os.environ.get(
    "COOFIX_TEST_DATABASE_URL", "postgresql+asyncpg://coofix:coofix@localhost:5442/coofix_test"
)
os.environ["COOFIX_REDIS_URL"] = ""
os.environ["COOFIX_JWT_SECRET"] = "test-secret-" + "x" * 40
os.environ["COOFIX_COOKIE_SECURE"] = "false"

import pytest  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.core import ratelimit  # noqa: E402
from app.core.db import SessionLocal, engine  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Base, Brand, Category, Product, Role, User  # noqa: E402

CSRF = {"X-Requested-With": "coofix"}


@pytest.fixture(scope="session", autouse=True)
async def schema():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


@pytest.fixture(autouse=True)
async def clean():
    ratelimit.backend.reset()
    yield
    tables = ", ".join(t.name for t in reversed(Base.metadata.sorted_tables))
    async with engine.begin() as conn:
        await conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test", headers=CSRF
    ) as c:
        yield c


async def make_user(email: str, password: str = "password123", role: Role = Role.customer):
    async with SessionLocal() as db:
        u = User(email=email, password_hash=hash_password(password), first_name="T", role=role)
        db.add(u)
        await db.commit()
        return u


async def login(client: AsyncClient, email: str, password: str = "password123", admin=False):
    path = "/api/admin/auth/login" if admin else "/api/auth/login"
    r = await client.post(path, json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
async def catalog():
    async with SessionLocal() as db:
        root = Category(slug="tools", name={"ru": "Инструменты"})
        db.add(root)
        await db.flush()
        drills = Category(slug="drills", name={"ru": "Дрели"}, parent_id=root.id)
        brand = Brand(slug="bosch", name="Bosch")
        db.add_all([drills, brand])
        await db.flush()
        p1 = Product(
            slug="drill-a", sku="DA-1", name={"ru": "Дрель ударная", "zh": "冲击钻"},
            category_id=drills.id, brand_id=brand.id, price_minor=450000, stock=10,
        )  # fmt: skip
        p2 = Product(
            slug="drill-b", name={"ru": "Дрель аккумуляторная"}, category_id=drills.id,
            price_minor=990000, old_price_minor=1200000, stock=1, is_hit=True,
        )  # fmt: skip
        p3 = Product(
            slug="hidden", name={"ru": "Скрытый 100%_товар"}, category_id=root.id,
            price_minor=100, stock=5, is_active=False,
        )  # fmt: skip
        db.add_all([p1, p2, p3])
        await db.commit()
        return {"root": root, "drills": drills, "brand": brand, "p1": p1, "p2": p2, "p3": p3}
