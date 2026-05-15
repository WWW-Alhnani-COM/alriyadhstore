# متجر الرياض — Saudi E-commerce

A complete production-ready Saudi e-commerce web app selling clothing, electronics, beauty/perfumes. Arabic RTL throughout, Tajawal font, emerald + gold palette.

## Architecture

- **Monorepo**: pnpm workspaces, OpenAPI-driven (Orval codegen)
- **Frontend** (`artifacts/store`): React + Vite + wouter + TanStack Query + shadcn/ui, mounted at `/`
- **Backend** (`artifacts/api-server`): Express 5 + Drizzle ORM + PostgreSQL, served at `/api`
- **Shared**: `lib/api-spec` (OpenAPI), `lib/api-client-react` (Orval hooks), `lib/api-zod` (Zod schemas), `lib/db` (Drizzle schemas)

## Database tables

- `admins` (email + bcrypt password hash)
- `categories` (name, slug)
- `products` (name, description, price, quantity, categoryId, image)
- `orders` + `order_items` (cascade delete)

## Auth

- Session-based admin auth via `express-session`, cookie name `store.sid`, 7-day expiry
- Public storefront and order creation are unauthenticated
- All `/api/admin/*` routes (except `login`/`logout`/`me`) require an admin session

## Default admin credentials

`admin@store.sa` / `admin123` (hint shown on the admin login page).

## Storefront pages

`/`, `/products`, `/products/:id`, `/categories`, `/cart`, `/checkout`, `/order/success/:id`, `/about`, `/contact`

## Admin pages (under `/admin`)

`login`, `dashboard` (stats + recharts), `categories` (CRUD), `products` (CRUD), `orders` (list + filter), `orders/:id` (status + payment link)

## Cart

Persisted to `localStorage` under `store_cart_v1`. Custom event `store_cart_change` keeps the header badge in sync.

## Product images

Seed product images live in `artifacts/store/public/products/*.png` and are served from `/products/<file>.png`. Admin-created products take an image URL.

## Workflows

- `artifacts/api-server: API Server` — Express server on the port set by the artifact
- `artifacts/store: web` — Vite dev server on the port set by the artifact

## Notes

- The storefront product list endpoint defensively strips empty-string query params before Zod validation so empty filters don't filter to NaN.
- Currency is formatted as `X.XX ر.س` via `Intl.NumberFormat("ar-SA")`.
- Order status: `pending` | `paid` | `shipped` | `cancelled`.
