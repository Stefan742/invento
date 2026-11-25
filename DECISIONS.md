# DECISIONS

Short log of non-obvious choices and why. Newest at the bottom of each milestone.

## M0: Foundations

- **Project location:** `invento-web/` sits next to the brief folder at the top of the owner's `invento/` folder (`invento/invento-web`), not inside the doubly nested `invento-brief/invento-brief/`, which looks like an unzip artifact. The brief is copied into `docs/brief/` so it is versioned.
- **Own git repository:** `invento-web` has its own `.git` and pushes to `github.com/Stefan742/invento`. (The owner's home folder is itself a git repo; it was not touched.)
- **Versions (verified on npm, 2026-11-25):** Payload 3.94.2, Next.js 16.4.6, React 19.2, next-intl 4.16, Tailwind CSS 4.3, Zod 4, Zustand 5. Scaffolded with `create-payload-app@3.94.2 -t blank --db postgres`, then trimmed (GraphQL removed, example route removed). Exact versions are pinned by `pnpm-lock.yaml`.
- **Node 24.22.3, pinned per project.** Payload 3.94 requires Node `^22.23.5 || ^24.22.3 || >=26.13.1`. The dev machine had 22.16, so `.npmrc` sets `use-node-version=24.22.3`: pnpm downloads and uses that Node for all scripts without changing the system install. `.nvmrc` holds the same version for CI and hosts.
- **Local Postgres on port 5433** (`docker-compose.yml`) because a separate PostgreSQL was already listening on 5432 on the dev machine.
- **Env var name `DATABASE_URI`** (as in the brief), not the template's `DATABASE_URL`.
- **Next.js 16 `proxy.ts`** replaces `middleware.ts` (renamed in Next 16). The matcher excludes `/admin`, `/api`, `/_next` and files with an extension.
- **Locale detection:** `/` uses `Accept-Language` (next-intl best-fit matching against `mk`/`en`), so only browsers that prefer English get `/en`; everything else gets `/mk`. **No locale cookie** (`localeCookie: false`): the public site sets no cookies, which keeps the "no consent banner" reasoning simple (see OWNER_TODO). hreflang alternates come from page metadata (`alternateLinks: false` in next-intl, to avoid duplicates).
- **Fonts (chosen on the `/dev/fonts` glyph test page, by eye):**
  - Display: **Fira Sans Extra Condensed 800/900**. Heavy, truly condensed, all Macedonian letters (Ѓ ѓ Ќ ќ Ѕ ѕ Љ љ Њ њ Џ џ) are drawn properly and the slogan keeps its punch in Cyrillic. Oswald was a close second (lighter max weight). Alumni Sans is too narrow/spiky at small sizes; Roboto Condensed is less condensed; Unbounded is wide (doesn't fit the giant-condensed system). **Bebas Neue is rejected:** Google Fonts ships it Latin-only, so Cyrillic falls back to a system font.
  - Body: **Onest**. Designed with Cyrillic in mind, friendly geometric shapes, very readable at 16–18 px. Manrope and Rubik were fine; Nunito felt too round for a "premium engineering" brand.
  - Both self-hosted via `next/font/google`, subsets `latin` + `cyrillic` only.
- **ESLint** uses `eslint-config-next` 16's native flat configs (the template's `FlatCompat` setup needed a package that is not installed).

## M1: CMS and data

- **Drafts instead of `isPublished` on Kits and Pages.** Both use Payload versions/drafts (`Save draft` / `Publish`), which is exactly "save without publishing". A second `isPublished` checkbox would be a confusing duplicate, so the publish state is Payload's `_status`. Builds, Testimonials and FAQs (no drafts) keep an `isPublished` checkbox.
- **Kits also carry `isPlaceholder`.** The seeded sample kits imitate real products, so they are flagged and hidden in production like the sample testimonials/builds. Untick the flag (or delete the kit) when real kits exist.
- **Sample stock numbers.** One sample kit has stock 14/20 (the copy-deck example) to show the stock bar; it is a placeholder like the kit itself. Prices are `null` on every kit.
- **Difficulty is a number 1–3** (not a select) so it sorts and renders as gears directly.
- **Rendering and revalidation.** All public pages render on request (`dynamic = 'force-dynamic'` in the locale layout); data comes from `unstable_cache` entries tagged per collection. Payload `afterChange`/`afterDelete` hooks call `revalidateTag(tag, { expire: 0 })`, so admin edits show on the next request with no stale window. Why: owner edits must be live in seconds, and the build needs no database (simpler CI and deploys). Cost: one cached-data render per request, which is cheap.
- **Access:** default deny. Public reads go through the local API with `overrideAccess: false`, so Payload's own rules apply (published only). Orders and Users: admin only for every operation. The public REST API returns 403 for `orders`/`users` (e2e-tested). Builds are additionally filtered to `consentConfirmed = true` in the data layer (defence in depth), and cannot be published without consent (field validation).
- **Login lockout:** Payload's built-in `maxLoginAttempts: 5`, `lockTime: 15 min`.
- **GraphQL disabled.** Not used; smaller attack surface.
- **Uploads:** images only (JPEG/PNG/WebP/AVIF), 8 MB limit, converted to WebP; sizes `thumb` 400, `card` 800, `hero` 1600, `og` 1200×630.
- **Seeding:** `payload run src/seed/index.ts`. Placeholder photos are rendered from our own SVG illustrations with sharp and labelled "SAMPLE PHOTO"/"SAMPLE BUILD". The script uses top-level `await` because `payload run` exits as soon as the module finishes loading.
- **Live Preview:** not added yet; revisit in M5 if cheap.
- **Admin language** is English (Payload has no Macedonian admin translation); every field description is written in English + Macedonian.
- **Migrations:** dev uses schema push; `src/migrations/*_initial.ts` was generated for production and verified against an empty database (46 tables).

## M2: Static site

- **Hero layout:** the slogan is a 3-row grid with the box sitting beside ОТКРИВАЈ (rows: ГРАДИ / box + ОТКРИВАЈ / СОЗДАВАЈ). An absolutely centred box over the words hurt legibility at every width.
- **Empty gallery state:** when there are no published builds, the home gallery shows illustrated dashed "Your build here" frames rather than hiding the section, which keeps the colour-world rhythm before the footer. The `/gallery` page shows a short text instead.
- **Placeholder labels on screen:** sample testimonials and builds show a yellow "ПРИМЕР / SAMPLE" badge so nobody mistakes them for real ones during review.
- **Kit page ordering in M2:** the cart arrives in M3. Until then the kit page shows the orders-paused / not-orderable message when relevant, otherwise Viber/Instagram buttons (disabled until contacts are set in Site settings).
- **Contact form deferred to M3**, together with the rate limiting and honeypot it needs (shared with the order route). The contact page shows Viber/Instagram/email from settings.
- **Cart icon in the header deferred to M3** (nothing to count yet). The "Порачај / Order" sticker links to `/kits` until the cart drawer exists.
- **Accordions use native `<details>`:** keyboard-accessible and working without JavaScript.
- **Lightbox uses native `<dialog>`:** focus trap, Esc and focus return come from the browser; arrow keys move between photos; without JS each thumbnail is a plain link to the image.
- **"How it works" numbers** are navy with an orange offset shadow (orange text on a paper card would break the contrast rule).
- **Metadata routes** (`robots.ts`, `sitemap.ts`) live at the app root; inside the `(frontend)` group the `[locale]` segment captured `/robots.txt`.
- **OG image** is generated by `next/og` with Latin text only (the built-in OG font has no Cyrillic); the owner can set a real default share image in Site settings.
- **Same-origin media URLs are made relative** (`toRelative` in `src/lib/media.ts`), because Payload returns absolute URLs once `serverURL` is set and `next/image` would reject `localhost`.

## Security audit (M2)

- `sharp` bumped to 0.35.5 (librsvg CVE). `happy-dom` (via `@lexical/headless`) forced to `^21.0.4` with a pnpm override (two advisories).
- **Accepted exception:** `esbuild <=0.24.2` inside `drizzle-kit → @esbuild-kit` (moderate, GHSA-67mh-4wv8-2f99). It affects esbuild's own dev server, which this project never runs; the package is only used by the migration CLI. Re-check when Payload updates drizzle-kit.
