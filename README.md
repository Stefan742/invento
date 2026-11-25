# INVENTO web

Bilingual (Macedonian default, English) website and order-request shop for **INVENTO**, wooden DIY engineering kits for children aged 6–12, sold in North Macedonia. There is no online payment: customers send an order request, the owner confirms on Viber, and the customer pays cash on delivery.

- **Stack:** Next.js 16 (App Router) + Payload CMS 3 (admin at `/admin`) + PostgreSQL, TypeScript strict, Tailwind CSS 4, next-intl 4.
- **Full spec:** [`docs/brief/`](docs/brief/START-HERE.md). Working rules: [`CLAUDE.md`](CLAUDE.md).
- **Living logs:** [`DECISIONS.md`](DECISIONS.md), [`OWNER_TODO.md`](OWNER_TODO.md), [`ASSETS_NEEDED.md`](ASSETS_NEEDED.md).
- **Status:** M0–M5 done: launchable site with orders, signature motion, accessibility, performance and security pass. Next: M6 hosting proposal (needs owner approval before anything is deployed). See [Milestones](#milestones).

## Requirements

- Node **24.22.3**. pnpm downloads it automatically for this project (`use-node-version` in `.npmrc`), so your system Node version does not matter.
- pnpm 10 (`npm i -g pnpm@10`)
- Docker (for the local PostgreSQL)

## First run

```bash
cp .env.example .env          # then fill in PAYLOAD_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up -d          # PostgreSQL 17 on localhost:5433
pnpm install
pnpm seed                     # admin user + sample content (flagged as placeholders)
pnpm dev                      # http://localhost:3000 → redirects to /mk
```

Admin: <http://localhost:3000/admin>, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URI` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Long random string used to sign sessions |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL (canonical links, sitemap, OG) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin user, created by `pnpm seed` |
| `SHOW_PLACEHOLDERS` | Show seeded sample content. `true` in dev, **must be `false` in production** |
| `ORDER_NOTIFY_EMAIL` | Inbox for new-order and contact-form emails |
| `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME` | Email sending via Resend. Without a key, emails are printed to the server console |
| `ORDER_RATE_LIMIT` | Order requests per IP per 10 minutes (default 5) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional Cloudflare Turnstile on the order form |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER`, `NEXT_PUBLIC_ANALYTICS_ID`, `NEXT_PUBLIC_ANALYTICS_SRC` | Optional cookieless analytics, off by default (see [docs/ANALYTICS.md](docs/ANALYTICS.md)) |
| `NEXT_PUBLIC_MOTION_OFF` | Switch motion features off (`all` or a comma list) |
| `S3_*` | Production media storage (M6) |

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / server (the build needs no database) |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript |
| `pnpm test` | Unit tests (Vitest, no database) |
| `pnpm test:e2e` | Playwright end-to-end + axe accessibility tests (needs a seeded DB, starts `pnpm dev`) |
| `pnpm screenshots` | Review screenshots → `docs/screenshots/$MILESTONE/` (e.g. `MILESTONE=m2 pnpm screenshots`) |
| `pnpm seed` | Create the admin + sample content (safe to re-run) |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after schema changes |
| `pnpm migrate:create <name>` / `pnpm migrate` | Create / apply database migrations |

Before finishing any change: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

## Database: dev vs production

- **Development** uses Payload's schema *push*: edit a collection and the dev database follows.
- **Production** never pushes. After a schema change run `pnpm migrate:create <name>`, commit the file in `src/migrations/`, and run `pnpm migrate` on deploy.

## How content reaches the site

All pages render on request from data in a tagged cache (`src/lib/data.ts`). Every save in the admin runs a Payload hook (`src/hooks/revalidate.ts`) that expires the matching cache tags, so owner edits are live within seconds and nothing needs a rebuild. Public reads go through Payload's access rules (`overrideAccess: false`): only published content is visible, and seeded `isPlaceholder` content is hidden unless `SHOW_PLACEHOLDERS=true`.

## How an order works

1. Cart (browser only: kit ids + quantities) → `/order` form → `POST /api/order`.
2. The route validates with the same Zod schema as the form and runs the anti-spam checks. Then, in **one transaction**, it locks each kit row, checks and decrements stock, takes the next `INV-` number from a PostgreSQL sequence, and creates the order.
3. After commit: public stock is refreshed, the owner gets an email, and the customer gets one if they gave an email.
4. The customer lands on `/order/<random token>`: reference, items, "Open Viber" and "Copy order summary". No personal data on that page.
5. In the admin the owner moves the status `new → confirmed → in production → shipped → delivered`, or `cancelled` (puts stock back, once). Orders export to CSV and can be anonymised on request.

Pause all orders: Admin → Site settings → Orders → untick **Orders are open**.

## Motion

The home page "box" experience (preloader, lid-opening hero, marble track, section hand-offs, pinned showcase, fanned cards, physics, footer lid) plus site-wide smooth scroll, gear cursor and auto-hiding header. Code lives in `src/components/motion/`.

- Everything is an enhancement: content is in the server HTML, and reduced motion, no JavaScript or `?motion=off` all give a complete static site.
- Switch features off at build time with `NEXT_PUBLIC_MOTION_OFF=all` or a comma list (`smooth, header, cursor, preloader, hero, marble, reveals, showcase, hiw, gallery, physics, footer`). Try it per page view with `?motion=off:marble,physics`.
- The preloader shows once per browser session on the home page; `?skip` skips it.
- Review recordings: `docs/screenshots/m4/` (`pnpm build && pnpm start -p 3100`, then `E2E_BASE_URL=http://localhost:3100 MILESTONE=m4 pnpm screenshots --grep @motion`).

## Security and quality

- Strict per-request Content-Security-Policy with nonces (`src/proxy.ts`, `src/lib/csp.ts`), HSTS on HTTPS, standard hardening headers (`next.config.ts`).
- Accessibility: axe (WCAG 2.2 AA) on every page in both languages plus keyboard tests (`tests/e2e/a11y.spec.ts`).
- Performance and design decisions with measurements: [`DECISIONS.md`](DECISIONS.md).

## Project layout

```
src/
  app/(frontend)/[locale]/   public site (mk / en)
  app/(payload)/             Payload admin + REST API (+ /api/health)
  collections/ globals/      CMS schema (Kits, Orders, Pages, FAQs, Testimonials, Builds, Media, Users; SiteSettings, HomePage)
  access/ hooks/ fields/     access rules, revalidation hooks, shared fields
  components/                ui/, layout/, sections/ (home), kits/, gallery/, illustrations/ (placeholder art)
  i18n/                      routing, request config, messages/mk.json + en.json
  lib/                       availability, data access, SEO, formatting helpers
  seed/                      `pnpm seed`
  migrations/                production migrations
tests/unit, tests/e2e        Vitest / Playwright
docs/brief/                  the original build brief
docs/screenshots/            review screenshots per milestone
```

## Milestones

| | Milestone | Status |
|---|---|---|
| M0 | Foundations | ✅ |
| M1 | CMS and data | ✅ |
| M2 | Static site | ✅ (Gate 1 approved) |
| M3 | Orders (cart, order route, stock, emails) | ✅ launchable |
| M4 | Signature motion (Gate 2) | ✅ (Gate 2 approved) |
| M5 | Polish and hardening | ✅ |
| M6 | Deploy and handover (Gate 3 before deploying) | next: hosting proposal |

Deployment, backups and the owner guide arrive in M6.
