# Developer Guide

Setup, configuration, and deployment for CanteenX. For what the product does, see [README.md](./README.md).

## Prerequisites

- **Python 3.12+** and **Node.js >= 20.19** (pinned in `frontend/package.json#engines`; Tailwind v4's native binary requires it). Use [nvm](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20`.
- **PostgreSQL 14+**, local or hosted. Supabase works and is what the deployed instance uses.
- **Docker** (optional, but the quickest way to get a database).
- A [Razorpay](https://razorpay.com) account for payments, and an HTTP object-storage endpoint for image uploads. Neither is required to run the app - both degrade to a clear "not configured" error rather than a broken screen.

## 1. Clone and install

```sh
git clone https://github.com/Dileepadari/CanteenX.git
cd CanteenX

# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt

# Frontend
cd ../frontend
npm install
```

## 2. Start a database

```sh
docker run -d --name canteenx-db \
  -e POSTGRES_USER=canteenx -e POSTGRES_PASSWORD=canteenx -e POSTGRES_DB=canteenx \
  -p 55432:5432 postgres:16-alpine
```

## 3. Configure the backend

Copy the example and fill it in:

```sh
cd backend && cp .env.example .env
```

There are **no fallback values for secrets**. A missing or short `JWT_SECRET` raises on startup rather than silently signing tokens with a value committed to the repository.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Any Postgres URL. Normalised to `asyncpg` automatically, and `?sslmode=` is translated for you - asyncpg rejects libpq's spelling. |
| `JWT_SECRET` | yes | 32+ characters. Generate with `openssl rand -hex 32`. |
| `ENVIRONMENT` | no | `development` (default), `test`, `staging`, `production`. Production disables GraphiQL, introspection, and the OpenAPI routes. |
| `CORS_ORIGINS` | in production | Comma-separated. `*` is rejected because credentials are allowed. |
| `COOKIE_SAMESITE` | no | `lax` (default). Set `none` only in production - it requires HTTPS, and the app refuses the combination otherwise so it fails loudly rather than silently dropping cookies on localhost. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` / `REFRESH_TOKEN_EXPIRE_DAYS` | no | Default 15 minutes / 7 days. |
| `CAS_SERVER_URL` | no | Defaults to `https://login.iiit.ac.in/cas/`. |
| `CAS_SERVICE_URL` | no | Where CAS redirects back - your frontend's `/cas` route. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | no | Absent means online payment is **disabled**, never mocked. |
| `RAZORPAY_WEBHOOK_SECRET` | no | A *different* secret from the API key. Required for webhooks. |
| `ORACLE_UPLOAD_BASE_URL` / `ORACLE_PUBLIC_BASE_URL` / `ORACLE_UPLOAD_API_KEY` | no | Absent means uploads are disabled. See [Storage contract](#storage-contract). |
| `ORACLE_APP_NAME` | no | Defaults to `canteenx`; namespaces objects when storage is shared with another app. |
| `REDIS_URL` | no | Unset uses in-process pub/sub, which is correct for a single instance. Set it when running more than one. |
| `TAX_RATE_BPS` | no | Basis points; `500` = 5.00%. |

## 4. Migrate and seed

```sh
alembic upgrade head
python -m scripts.seed
```

Migrations are the **only** source of schema truth - the app does not call `create_all()`. `alembic check` fails if a model is edited without a matching migration, and CI runs it on every PR.

The seed is idempotent and creates four canteens with menus, customization groups, stock, and promo codes. Accounts use `$SEED_PASSWORD` (default `canteenx-dev-2026`):

| Account | Role |
|---|---|
| `admin@canteenx.dev` | Admin |
| `student@canteenx.dev` | Student, with a demo wallet balance |
| `vendor1@canteenx.dev` … `vendor4@canteenx.dev` | Vendor, one per canteen |

**Override `SEED_PASSWORD` before any deployment.**

## 5. Configure the frontend

```sh
cd ../frontend && cp .env.example .env
```

| Variable | Notes |
|---|---|
| `VITE_API_URL` | Leave empty in development - the Vite dev server proxies `/api` so the browser sees one origin. Cross-origin cookies would otherwise need `SameSite=None`, which needs HTTPS. |
| `VITE_DEV_API_TARGET` | Where that proxy points. Defaults to `http://127.0.0.1:8000`. |
| `VITE_RAZORPAY_KEY_ID` | Publishable key id only. The secret never leaves the server. |

## 6. Run it

```sh
# Terminal 1
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev        # http://localhost:8080
```

GraphiQL is at `http://localhost:8000/api/graphql` outside production.

## Working on the API

```sh
cd backend
pytest                      # full suite against a throwaway database
ruff check app scripts tests
ruff format app scripts tests
alembic check               # fails on model/migration drift
python -m scripts.smoke     # end-to-end against a running server
```

Tests need a `canteenx_test` database:

```sh
docker exec canteenx-db psql -U canteenx -d postgres -c "CREATE DATABASE canteenx_test;"
```

The suite builds its schema by running Alembic, so migrations are exercised on every run. Point it elsewhere with `TEST_DATABASE_URL`.

### Adding a field

Every GraphQL field must declare `permission_classes` - `AllowAny` included, so that "public" is a decision someone wrote down. `tests/test_authorization.py::test_every_schema_field_declares_a_policy` fails the build otherwise. This is deliberate: the previous build had 18 of 23 queries with no policy at all, which exposed other users' carts, orders, and payment history to anonymous callers.

Object-level ownership ("is this order yours") belongs in the service, not the policy - a policy cannot see the loaded row.

## Working on the frontend

```sh
cd frontend
npm run dev
npm run lint
npx tsc --noEmit -p tsconfig.app.json
npm run codegen             # regenerate types from a running API
npm run build
```

TypeScript is strict, including `noUncheckedIndexedAccess`. GraphQL types are **generated**, never hand-written: start the backend, then `npm run codegen`. Add operations to `src/graphql/operations.ts`, keeping one document per operation name - duplicates under one name corrupt the Apollo cache.

## Real-time

Subscriptions run over `graphql-ws` at the same `/api/graphql` path. Two things are worth knowing before changing them:

- **Auth is pinned at the handshake.** A cookie refreshed later never reaches an already-open socket, so the client fetches a short-lived ticket via `createRealtimeTicket` over HTTP - where refresh-and-retry works - and presents it in `connection_init`. Claims are resolved lazily so the ticket, which arrives *after* the handshake, is still seen.
- **Never hold a session for a subscription's lifetime.** A dependency resolved on a WebSocket route lives as long as the connection; yielding a pooled session there exhausts the pool after a handful of subscribers and takes the whole API down. Use `context.db()`, which opens a short-lived session and releases it.

Set `REDIS_URL` when running more than one instance, or events only reach clients connected to the instance that published them.

## Storage contract

Uploads are proxied by the API so the upload key never reaches the browser. The API validates magic bytes, strips EXIF, and re-encodes to WebP before forwarding:

- **Upload**: `POST {ORACLE_UPLOAD_BASE_URL}/upload` with headers `x-upload-key`, `x-file-type` (`images`), `x-app-name`, `x-file-name`, and the raw bytes as the body.
- **Public read**: the API builds the URL from the convention `{ORACLE_PUBLIC_BASE_URL}/{fileType}/{ORACLE_APP_NAME}/{fileName}` rather than trusting the upload response.

Any HTTP storage service implementing that contract is a drop-in replacement.

## Payments

1. `initiatePayment` creates a Razorpay order server-side and returns only the publishable key id.
2. The browser opens Razorpay Checkout and returns a signed response.
3. `verifyPayment` checks the HMAC signature **and** re-confirms status and amount with Razorpay directly.
4. The signed webhook at `POST /api/payments/webhook` is the authoritative confirmation. It is idempotent - the gateway's event id is a primary key, so a replay is a no-op.

The webhook is deliberately CSRF-exempt and cookie-less; its HMAC is its only gate. Register it in the Razorpay dashboard for `payment.captured`, `order.paid`, and `payment.failed`.

There is no client-assertable "mark paid" route, and no mock processor. Absent keys disable payment with a clear error.

## Deployment

**Backend** - any container host. The image ships `alembic/`, so run migrations as a release step:

```sh
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

On Render, set the root directory to `backend/`. In production set `ENVIRONMENT=production`, a real `CORS_ORIGINS`, and `COOKIE_SAMESITE=none` if the SPA is on a different domain.

**Frontend** - a static Vite build:

```sh
npm run build     # outputs to dist/
```

Point Vercel, Netlify, or Cloudflare Pages at `frontend/` with build command `npm run build` and output directory `dist`, and set `VITE_API_URL` to the deployed API.

`.github/workflows/ci.yml` runs lint, type-check, migration drift, and tests on every push and PR. `.github/workflows/ping.yaml` keeps a free-tier instance awake by hitting `/api/awake`, which does no database work.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `JWT_SECRET must be at least 32 characters` on startup | Working as intended - set a real secret. |
| `sslmode is invalid` from asyncpg | Should not happen; the URL parser strips it. Check `DATABASE_URL` is reachable. |
| Subscriptions connect but deliver nothing | Multiple instances without `REDIS_URL` - the publisher and subscriber are on different ones. |
| `QueuePool limit ... reached` | Something is holding a session for a connection's lifetime. Subscriptions must use `context.db()`. |
| Cookies ignored in the browser | `COOKIE_SAMESITE=none` requires HTTPS. Use the dev proxy locally instead of `VITE_API_URL`. |
| `payments_disabled` at checkout | No Razorpay keys configured. Wallet payment still works. |
