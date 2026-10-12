# Coofix v2 — Rebuild Plan (draft)

Decision: **rewrite**, not refactor. Legacy has broken checkout, critical auth holes, no payment model, zero SEO. Legacy kept read-only in `legacy/` as reference + data source.

## Target layout

```
apps/
  api/      FastAPI + SQLAlchemy 2 (async) + Alembic + PostgreSQL 16 + Redis
  web/      Storefront — coofix.store   (React, Next.js App Router for SSR/SEO)
  admin/    Admin — coofix.online       (React + Vite + shadcn + TanStack Query/Table)
packages/
  ui/       shared tokens + components
  api-client/  TS client generated from FastAPI OpenAPI
infra/
  docker-compose.yml, nginx/, deploy scripts
```

## Backend (FastAPI)

- **Auth:**
  - Argon2id password hashing.
  - Short access JWT (15 min) kept in memory.
  - Rotating refresh token in an httpOnly `Secure` `SameSite` cookie, stored hashed in the DB.
  - CSRF double-submit.
  - Separate admin auth realm; admin login requires 2FA (TOTP).
- **RBAC:** roles `customer`, `manager`, `content`, `support`, `admin`, plus permission checks on every admin route.
- **Validation and limits:**
  - Pydantic `extra="forbid"` on every input, so mass assignment is impossible.
  - Rate limit (Redis) on auth, OTP, chat, forms and upload.
  - Upload validation: MIME sniffing and size limits.
- **Prices and payments:**
  - Prices are integers in minor units, with a currency field.
  - The order total is computed only on the server, inside a DB transaction with `SELECT … FOR UPDATE` on stock.
  - Payment provider adapters (`click`, `payme`, …), callbacks verified with signature and idempotency, plus a `payments` table and reconciliation.
- **Order lifecycle:** order state machine with transition rules and `order_status_history`; cancelling restocks; notifications go to Telegram and email/SMS.
- **Audit and errors:** `audit_log` for every admin mutation; no internal error details leak to clients; OpenAPI docs disabled in production.
- **Search:** Postgres FTS + trigram; Meilisearch later if needed.
- **Media:** keep Cloudinary (signed uploads) or self-host on S3-compatible storage.

## Storefront (coofix.store)

- **Rendering and SEO:** SSR/ISR for the catalog, product and category pages; `generateMetadata`, JSON-LD (Product, BreadcrumbList), sitemap and robots.
- **Catalog:** server-side pagination, sorting and filters (brand, price, stock, characteristics).
- **Checkout and accounts:** guest checkout; checkout as a separate page; payment selection (Click, Payme, cash).
- **Sync:** cart, favorites and compare synced to the server for logged-in users.
- **i18n:** uz / ru (/ en).
- **Design:**
  - A new design system built on the existing brand: orange `#f05a00`, coal, light surface.
  - Motion with anime.js / Motion, used sparingly.
  - Blocks borrowed from 21st.dev and refero.
  - Lighthouse target ≥ 90 on every metric; WCAG AA.
- **Security headers:** strict CSP and HSTS.

## Admin (coofix.online)

Covers everything the legacy panel does, plus:
- order workflow
- payments and refunds
- inventory log
- promo codes
- banners/CMS
- SEO fields
- CSV import/export
- reports with date range
- RBAC and user management
- audit log viewer
- wholesale leads
- review moderation
- support inbox

## Infra (85.137.173.50)

- **Server:** Ubuntu with Docker Compose running postgres, redis, api, web, admin and nginx; Let's Encrypt via certbot.
- **Hardening:** SSH key only, ufw (22/80/443), fail2ban, unattended upgrades, non-root deploy user.
- **Backups:** nightly `pg_dump` to off-site storage.
- **CI/CD:** GitHub Actions does lint, test and build, then deploys over SSH.
- **DNS:** point the A records for `coofix.store`, `www.coofix.store` and `coofix.online` to 85.137.173.50; they currently point to 72.56.11.184.

## Phases

0. **Hotfix and hygiene:** revoke secrets, harden the server, take a legacy data export (Mongo → JSON).
1. **API foundation:** auth, RBAC, catalog, media, migrations; import legacy data.
2. **Storefront MVP:** catalog, product, cart, guest checkout, accounts.
3. **Admin MVP:** catalog CRUD, orders workflow, users, dashboard.
4. **Deploy:** staging on the server, then production cutover.
5. **Payments:** Click and Payme with webhooks and reconciliation.
6. **Growth:** promo codes, CMS, search, analytics, then the mobile app (React Native / Expo, same API).

## Open decisions

See questions to the owner: market (UZ vs RU), languages, storefront framework, data migration source.
