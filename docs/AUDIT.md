# Coofix — Legacy Audit (2026-10-12)

Scope: `legacy/server` (Express 5 + MongoDB), `legacy/web` (Next.js 16), `legacy/admin` (Vite + React 18 + shadcn).

## 🔴 Act now (before any rewrite)

| # | Issue | Where | Action |
|---|---|---|---|
| 1 | Telegram bot token hardcoded + in git history | `legacy/web/src/app/api/{orders/create,telegram/callback,wholesale}/route.ts:3-4` | Revoke in BotFather, new token via env only |
| 2 | Server root password shared in plain screenshot | — | `passwd`, SSH keys, `PasswordAuthentication no` |
| 3 | Brand/category CRUD — no auth | `server/src/modules/brands/brand.routes.js:199,230,253`, `categories/category.routes.js:213,244,267` | Anyone can delete catalog |
| 4 | Wholesale GET/PATCH — no auth (PII leak) | `wholesale.routes.js:64,96` | |
| 5 | Upload — no auth, no mimetype filter | `upload.routes.js:46,86` | Free Cloudinary for anyone |
| 6 | Admin `.env` tracked in git (Firebase web config) | `legacy/admin/.env` | Restrict key by referrer, remove file |
| 7 | Checkout broken: `Product` not imported | `server/src/modules/orders/order.service.js:29` | Every order throws |

## Security findings (summary)

**Auth**
- Access JWT in localStorage (web + admin) → XSS = account takeover.
- Admin client guard checks only `!!user`, not role.
- Google login auto-links to existing email account → account takeover.
- Google access token lives 7 days, no refresh.
- Role baked into JWT, never rechecked; algorithm not pinned; refresh token stored plaintext.
- User enumeration on login/register.
- No rate limiting anywhere (login, register-email, LLM chat, upload, Telegram relays).

**Injection / validation**
- `loginSchema` not applied; query objects reach `findOne` → NoSQL injection (`auth.controller.js:90`).
- `validate.js` uses `allowUnknown:true`; register schema whitelists `role:'admin'`.
- Mass assignment `{...req.body}` in product/category update.
- Unescaped `$regex` → ReDoS.
- Cart quantity unvalidated (negative/string/fractional).

**Money**
- Web sends `price`/`total` from localStorage to Next API → Telegram. Backend uses cart snapshot but never re-prices.
- Prices are JS floats.

**Chat**
- Client can inject `system` role messages.
- History uncapped; anonymous use of a paid LLM.

**Infra**
- No helmet/CSP/HSTS, no body limit.
- Swagger public in production.
- `err.message` leaked to clients.
- localhost in production CORS.

## Domain model (→ PostgreSQL)

User, VerifyToken, Category (self-tree), Brand, Product (characteristics = JSONB, stock, flags, rating), Cart, Order (no payment fields!), Review (user+product unique), Favorite, Compare (≤4), Wholesale lead.

Missing:
- SKU/variants
- currency
- soft-delete
- payment/transaction
- shipping
- status history
- addresses table
- promo codes
- banners/CMS
- audit log

## Business logic gaps

- **Account:** no password reset or resend-verify. Phone regex is Russian `+7`.
- **Orders:**
  - Order status can jump freely.
  - Cancel doesn't restock.
  - No notifications.
  - No guest checkout.
  - Address is a free string.
- **Reviews:** no purchase requirement; a second review overwrites the first.
- **Stats:**
  - Revenue inconsistent between endpoints.
  - `recentOrders.totalPrice` undefined.

## Frontend (web)

- **Rendering:** 17 client-only pages, so there is zero product SEO. No metadata, JSON-LD or sitemap.
- **Catalog:** fetches `limit=1000` and filters on the client.
- **Dependencies:** dead deps (MUI, Emotion, framer-motion, react-query, daisyUI). Images are 1–2 MB PNGs.
- **Config:**
  - Broken Netlify SPA redirect.
  - `lang="en"` on Russian content.
  - No i18n.
  - RUB hardcoded.
- **Branding:**
  - Logo: orange hexagon + "COOFIX TOOLS & EQUIPMENT".
  - Colors: primary `#f05a00`, coal `#212526`, light background `#f2f5f7`.
  - Font: Noto Sans.

## Admin

- **Pages:** Dashboard, Products, Categories (×2 duplicate), Brands, Orders, Wholesale, Users, Reviews.
- **Bugs:**
  - Search covers the current page only.
  - Orders search uses a nonexistent field.
  - Currency shown as `$`.
  - Product characteristics edited as raw JSON.
  - 3 toast libraries.
- **Missing:**
  - Order workflow and history, refunds.
  - Payments view.
  - RBAC and 2FA.
  - Audit log.
  - Promo codes, banners, CMS/SEO.
  - CSV import/export.
  - Date-range reports.
  - Support inbox.
- **Reusable:** DataTable, ImageUpload, KeyValueEditor, StatusBadge, StatsCard, shadcn `ui/`.
