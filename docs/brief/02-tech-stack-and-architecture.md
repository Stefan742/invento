# 02. Tech Stack and Architecture

**Rule for this whole document:** versions below are intentionally unspecified. Use the latest stable versions and **verify setup steps and APIs against current official docs** before coding. Pin with a lockfile.

## Chosen stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js** (App Router) + React + TypeScript (strict) | One codebase for site and admin |
| CMS / admin / backend | **Payload CMS 3.x**, installed inside the Next.js app | Admin at `/admin`; gives auth, access control, uploads, localization, drafts |
| Database | **PostgreSQL** via Payload's Postgres adapter | Use migrations in production, never schema "push" |
| Rich text | Payload's default editor (Lexical) | |
| Styling | **Tailwind CSS** + CSS variables for design tokens | Tokens in `docs/04` |
| Animation | **GSAP** (core, ScrollTrigger, MotionPath, DrawSVG if available) | Verify current license terms for commercial use; GSAP plugins were made free in 2025, confirm |
| Smooth scroll | **Lenis**, desktop / fine pointer only | Native scroll on touch |
| Physics | **Matter.js** | Preloader + FAQ section, canvas-rendered, lazy loaded |
| UI micro-animation | **Motion** (Framer Motion successor) or CSS | Drawer, accordion, lightbox |
| i18n (UI strings) | **next-intl** (or the current equivalent) | URL prefixes `/mk` and `/en` |
| i18n (content) | Payload field-level **localization** (`mk`, `en`) | Fallback to `mk` when `en` is empty |
| Forms | react-hook-form + **zod** | Same zod schemas on client and server |
| Cart state | **Zustand** with `persist` (localStorage) | Cart is strictly functional storage |
| Phone parsing | libphonenumber-js, default region MK, lenient | |
| Email | Payload email adapter (Resend or SMTP) | Owner notification on each order; customer confirmation only if email given |
| Media storage | Local disk in dev; **S3-compatible object storage** in production (e.g. Cloudflare R2) via Payload storage adapter | Hosting decision made at M6 with owner |
| Testing | Vitest (unit), Playwright (e2e + screenshots + axe a11y) | |
| CI | GitHub Actions: lint, typecheck, unit tests, build | |
| Package manager | pnpm | |

Do **not** add the Stripe/e-commerce plugin or template: there are no online payments. Start from Payload's blank or website template and remove what is unused.

## Repo layout (guideline)

```
invento-web/
  src/
    app/
      (frontend)/[locale]/        # public site
        page.tsx                  # home
        kits/ , kits/[slug]/
        gallery/ , faq/ , contact/ , about/
        [policy]/                 # shipping, returns, privacy, terms
        cart/ (drawer-first, page as fallback)
        order/ , order/[token]/   # form and success
      (payload)/admin/            # Payload admin
      api/                        # order route, health, revalidate
    collections/                  # Kits, Orders, Builds, Testimonials, FAQs, Pages, Media, Users
    globals/                      # SiteSettings, HomePage
    components/
      ui/                         # buttons, chips, stickers, inputs
      sections/                   # home sections
      motion/                     # preloader, hero, marble track, physics, cursor
      illustrations/              # SVG components (placeholder art lives here)
    lib/                          # stock logic, order ref, validation, seo, revalidate
    i18n/                         # routing, messages/mk.json, messages/en.json
    styles/                       # tokens.css, globals.css
  public/art/                     # replaceable illustration/brand files
  tests/ , e2e/
  docs/brief/                     # copy of this brief
  docker-compose.yml              # local Postgres
  .env.example
  DECISIONS.md  OWNER_TODO.md  ASSETS_NEEDED.md  CLAUDE.md  README.md
```

## Key architectural rules

1. **Server-rendered content, client-enhanced motion.** All text content is in the server HTML. Motion modules are client components, dynamically imported, that hydrate on top. Initial animated states must not hide content when JS is off or fails (apply initial states from JS after mount; use a `no-js` fallback).
2. **On-demand revalidation.** Payload `afterChange` / `afterDelete` hooks revalidate the affected paths/tags so owner edits go live in seconds. Follow the current Next.js caching model (it changes between versions; read the docs).
3. **Public write access is closed.** Payload collections deny public create/update/delete. Orders are created only by a validated server route using Payload's local API (see `docs/06`).
4. **Access control by default deny.** Public read only for published content. Orders, users and internal fields are admin-only.
5. **Localized routing.** `/` redirects to `/mk` (use `Accept-Language` only to pick `en` when clearly English; otherwise `mk`). `hreflang` alternates and a visible language switch (MK / EN) on every page.
6. **Hydration safety.** Anything "random" (drifting photo layout, physics seed) must be deterministic from an index or seed.
7. **Environment.** `.env.example` documents: `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, email provider keys, storage keys, `ADMIN_EMAIL` and `ADMIN_PASSWORD` for seeding, optional Turnstile keys, `SHOW_PLACEHOLDERS`.
8. **Dev experience.** `docker compose up -d` starts Postgres; `pnpm dev` runs the app; `pnpm seed` creates the admin and sample content; `pnpm generate:types` after schema changes.
9. **Deploy-agnostic until M6.** Do not couple the code to one host. At M6, research current pricing and terms (including any non-commercial-use restrictions on free tiers) for 2-3 realistic hosting options in the target budget, present them to the owner, then document the chosen one.

## Performance architecture

- `next/image` for all images; configure Payload image sizes; AVIF/WebP.
- Self-host fonts via `next/font`, subsets: Cyrillic + Latin only.
- Heavy modules (`gsap` plugins, `matter-js`, Lenis, preloader) loaded dynamically, only where used.
- One ScrollTrigger setup per page component using `gsap.context()` and `gsap.matchMedia()` for desktop/touch/reduced-motion variants.
