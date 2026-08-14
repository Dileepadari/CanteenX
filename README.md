# CanteenX

Order ahead from your campus canteens, pay digitally, watch your order being made, and collect it without queueing.

Built for university campuses where the lunch rush costs students more time in a line than at a table. For local setup, environment variables, migrations, and deployment, see **[DEVDOC.md](./DEVDOC.md)**.

## Features

- **Browse every canteen on campus** - live open/closed status derived from each canteen's weekly schedule (in campus local time, not UTC), ratings, search, and per-category filtering.
- **Real customization** - sizes, add-ons, spice levels and a note for the kitchen. Option prices are looked up server-side from the menu; the client only ever sends option ids, so a crafted request cannot change what an item costs.
- **One cart, on the server** - it follows you between phone and laptop, holds items from a single canteen, and tells you before checkout if something has sold out.
- **Payments that actually verify** - UPI and cards through Razorpay with server-side HMAC signature checking, plus a signed, idempotent webhook as the authoritative confirmation. Orders are never marked paid on a client's say-so. There is also an internal wallet for one-tap repeat orders.
- **Live order tracking** - the kitchen moves your order from confirmed to preparing to ready, and your screen updates over a WebSocket the moment it happens. No refreshing, no polling.
- **Notifications that reach you** - persisted server-side and pushed live, so a status change finds you even if the tab was closed when it happened.
- **Pre-orders and catering** - schedule a pickup time, or request a bulk order for an event and accept the canteen's quote.
- **Reviews and complaints** - both anchored to a real completed order, with a response flow the canteen and admins can work through.
- **Vendor console** - live order queue, menu management with image upload, server-backed stock counts, promo codes, catering quotes, and revenue analytics.
- **Admin console** - canteens, users and roles, complaint triage, and CSV-exportable reports.
- **Light and dark themes**, keyboard-navigable, and usable on a phone - including the vendor and admin consoles.

## Roles

| Role | Can do |
|---|---|
| **Student** | Browse, order, pay, track, review, complain, request catering |
| **Staff** | Everything a student can, plus run the queue and menu for canteens they are assigned to |
| **Vendor** | Owns a canteen: menu, stock, promotions, catering quotes, analytics, settings |
| **Admin** | Everything, plus canteens, user roles, complaint triage, and platform reports |

## The order lifecycle

1. **Browse** a canteen and add items, choosing any options.
2. **Checkout** - the server recalculates every price, applies any promo code, and reserves stock.
3. **Pay** by UPI, card, or wallet. Gateway payments are verified against Razorpay before the order is confirmed.
4. **Track** it live: `pending → confirmed → preparing → ready → completed`.
5. **Collect** using your order reference. Cancel inside the cancellation window and stock is returned automatically.

## Tech stack

- **Frontend**: React 18, TypeScript (strict), Vite, React Router, Apollo Client, Tailwind CSS v4, shadcn/ui
- **Backend**: FastAPI, Strawberry GraphQL, async SQLAlchemy 2.0, PostgreSQL, Alembic
- **Real-time**: GraphQL subscriptions over `graphql-ws`, with a pub/sub interface that runs in-process or on Redis
- **Payments**: Razorpay, with signature verification and idempotent webhooks
- **Storage**: self-hosted object storage, proxied through the API so the upload key never reaches the browser
- **Auth**: JWT in httpOnly cookies with refresh-token rotation, CSRF double-submit, argon2 hashing, and CAS single sign-on
- **CI**: GitHub Actions - lint, type-check, migration drift check, and tests on every push and PR

## Project structure

```
backend/
├── app/
│   ├── api/          # GraphQL schema, REST endpoints, middleware, request context
│   ├── core/         # settings, database, security, logging, pub/sub
│   ├── db/models/    # SQLAlchemy models (snake_case columns only)
│   └── domain/       # services, pricing rules, payment gateway
├── alembic/          # migrations - the single source of schema truth
├── scripts/          # seed and end-to-end smoke script
└── tests/            # pytest suite, run against a throwaway database

frontend/
└── src/
    ├── components/   # brand, layout, shared primitives, menu, ui
    ├── graphql/      # operations, plus types generated from the live schema
    ├── lib/          # Apollo client, Razorpay loader, formatting helpers
    ├── pages/        # route-level pages (public, vendor, admin)
    └── stores/       # session state
```

## Notes on design

Money is stored and transported as an integer count of paise - never a float - so tax and discount arithmetic is exact. Order status, payment status, and roles are database enums with an explicit transition table, so an order cannot skip from pending to completed. Every GraphQL field declares an authorization policy, and a test fails the build if one is ever added without it.

## Contributors

- [Dileep Kumar Adari](https://github.com/Dileepadari)
- Revanth Reddy
- Keshava Kishora Nanda
- Naga Sai Ritvik
- Shailender Goyal

## License

MIT - see [LICENSE.md](./LICENSE.md).
