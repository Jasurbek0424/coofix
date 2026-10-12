# Coofix API

FastAPI + SQLAlchemy 2 (async) + PostgreSQL 16 + Redis.

## Dev

```bash
docker compose -f ../../infra/docker-compose.dev.yml up -d   # postgres :5442, redis :6380
cp .env.example .env                                         # set COOFIX_JWT_SECRET
uv sync
uv run alembic upgrade head
uv run python -m app.cli create-admin --email you@coofix.store --name Owner
uv run uvicorn app.main:app --reload                         # http://localhost:8000/api/docs
uv run pytest                                                # uses coofix_test DB
uv run ruff check . && uv run ruff format .
```

## Security model

- **Two auth realms:** `store` (coofix.store) and `admin` (coofix.online). A token issued for one realm is rejected by the other.
- **Access token:** a JWT that lives 15 minutes. Clients keep it in memory, never in localStorage.
- **Refresh token:**
  - An opaque value in an httpOnly `SameSite=Strict` cookie, stored in the DB only as a sha256 hash.
  - It is rotated on every use. Replaying a rotated token revokes the whole session family.
- **Session checks:** every request looks up its session, so logout, ban or role change take effect immediately.
- **CSRF:** cookie endpoints require the `X-Requested-With: coofix` header.
- **Authorization:** RBAC through permission sets (`app/core/deps.py`). Staff roles are `support`, `content`, `manager` and `admin`.
- **Input:** every input model forbids unknown fields, so mass assignment is impossible. Quantity and money fields are strict ints.
- **Prices and checkout:**
  - Prices are integers in kopecks.
  - The order total is computed only on the server.
  - Stock is locked with `SELECT … FOR UPDATE` in product-id order, so there is no oversell and no deadlock.
- **Auditing:** every admin mutation is written to `audit_log`.
- **Rate limits:** applied to login, register, refresh, checkout and order lookup.
- **Docs exposure:** interactive docs are disabled when `COOFIX_ENV=prod`.
