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

## M3: Orders

- **One order route, `POST /api/order`.** It is the only way an order is created. Checks run in order: body size (16 KB) → per-IP rate limit → JSON → shared Zod schema (the same file the form uses, `src/lib/order.ts`) → honeypot → signed form token → optional Turnstile → pause switch → database transaction. Errors return a short code (`stock`, `paused`, `spam`, …) that the form shows in the visitor's language.
- **Stock without overselling:** inside one Payload transaction the route locks each kit row (`SELECT … FOR UPDATE`, in kit-id order to avoid deadlocks), re-reads the kit, checks it, and decrements through `payload.update`. Going through Payload (not raw SQL) keeps the admin's draft/version record in sync, so the admin always shows the real stock. If any line fails, the whole transaction rolls back. E2E-tested: two simultaneous orders for the last piece → exactly one succeeds.
- **Owner edits win:** if the owner has a kit open, an order arrives, and the owner then saves the old stock number, the owner's value is kept (as the brief asks). To be explained in the owner guide.
- **Order reference:** PostgreSQL sequence `order_ref_seq`, created by migration and formatted `INV-0001`. Sequences never roll back, so a failed order leaves a gap: references are unique and never reused, but not gap-free.
  - **M5 fix:** in development, Payload's schema push drops the sequence (it is not in Payload's schema). A recreated sequence restarted at 1 and collided with existing references. Every order now ensures the sequence exists and has caught up with the highest reference already used (`setval(greatest(...))`), and the unique index on `ref` stays the final guard.
- **Public token:** 24 random bytes (base64url) for the success URL. The success page shows only the reference, items and totals, is `noindex`, and sends no referrer.
- **Cancel restores stock once** (`beforeChange` hook on Orders, guarded by a hidden `stockRestored` flag, never above the batch size). Un-cancelling does not take stock again; the owner adjusts by hand (the field description says so).
- **Anti-spam:** honeypot field `website` (visually hidden, `aria-hidden`); **minimum time-to-submit via an HMAC-signed form token** issued when the page renders (≥ 3 s, ≤ 6 h; enforced on the server without trusting the client clock); rate limit 5 requests / 10 min per IP (`ORDER_RATE_LIMIT`); Cloudflare Turnstile only when both keys are set.
- **Rate limiter is in memory, per server instance.** Fine for one small server. If the host runs several instances or serverless functions, move it to the database or a KV store (revisit at M6). The client IP is the first `X-Forwarded-For` hop, which is only trustworthy behind a proxy that sets it: verify on the chosen host.
- **Emails:** Resend through Payload's official adapter when `RESEND_API_KEY` is set; otherwise Payload prints emails to the console (dev). Owner notification goes to `ORDER_NOTIFY_EMAIL`; the customer gets a plain mk/en confirmation only if they gave an email. Emails are sent **after** the transaction commits, and a failed email never undoes an order. Logs contain the order reference only, never personal data.
- **Viber:** the success page opens `viber://chat?number=+…` and offers **"Copy order summary"** (reference, items, total; no personal data) to paste into the chat. A pre-filled message is not promised: Viber does not officially document a draft parameter for `viber://chat` links (only a community answer mentions `&draft=`), and the app must be installed. Instagram is the fallback.
- **Cart:** Zustand + `persist` in localStorage (`invento-cart-v1`) storing only kit ids and quantities. Titles, prices and availability always come fresh from the server catalog in the layout, so a kit that sells out while in someone's cart is flagged there, and the server rejects it anyway. Storage failures (private mode) fall back to memory. The store rehydrates after mount to avoid hydration mismatches.
- **Cart drawer uses the native `<dialog>`;** quantity steppers are 44 px+ buttons; cart updates are announced through an `aria-live` region.
- **CSV export** (`GET /api/orders/export.csv`, admin only, button above the Orders list). UTF-8 with BOM so Excel shows Cyrillic. Cells that could be read as formulas get a leading `'`, except E.164 phone numbers.
- **Privacy requests:** an "Anonymise personal data on save" checkbox on each order replaces name, phone, city and address with `ANONYMIZED` and removes email and notes; reference, items and totals stay for bookkeeping. Irreversible (the description says so).
- **Contact form:** emails the owner directly (`ORDER_NOTIFY_EMAIL`, else the Site settings email); nothing is stored. Same honeypot, signed token and rate limit as orders.
- **Error text colour `#B3261E`** (5.9:1 on paper) is the one non-palette colour, used only for form error messages, so errors never look like brand accents.
- **"New orders" count in the admin nav:** skipped (nice-to-have). The Orders list sorts newest first and filters by status.

## M4: Signature motion

- **Libraries (verified 2026-11-25):** GSAP 3.15.1 under its Standard "no charge" licence (free for commercial use, all plugins included since 2025; the licence only excludes tools that compete with Webflow), Lenis 1.3.28, Matter.js 0.20.0. All loaded with dynamic `import()` only where used: GSAP + ScrollTrigger on the home page, Matter.js only when the Questions section comes near, Lenis only on fine-pointer desktops. Pages other than home load no animation library.
- **One switch per feature:** `NEXT_PUBLIC_MOTION_OFF=all` or a comma list (`smooth, header, cursor, preloader, hero, marble, reveals, showcase, hiw, gallery, physics, footer`). For QA, `?motion=off` (everything) or `?motion=off:marble,physics` (just those) in the URL.
- **Three branches with `gsap.matchMedia()`:** desktop (fine pointer, ≥ 1024 px), touch / mobile, reduced motion (= nothing: static page, no preloader, static parts pile). Lenis, the gear cursor, section circle reveals, the pinned showcase and gallery parallax are desktop only.
- **Content is never trapped:** every element is in the server HTML in its final position. Initial animation states are applied by JS after mount, and everything is reverted on unmount (`gsap.matchMedia().revert()`, canvas/observers/listeners removed). E2E-tested: reduced motion, `?motion=off`, no-JS, and navigating away and back without errors.
- **Preloader:**
  - **When it shows:** home page only, first visit per session. A tiny inline script decides before first paint (adds `html.show-preloader`), so the overlay never flashes. Without JS it never appears.
  - **Skip:** Skip and Escape are wired by that inline script, so they work even before React loads.
  - **Failsafes:** a CSS failsafe removes the overlay after 6 s if the motion script never runs.
  - **Progress and timing:** fonts + window load, blended with a 1.6 s minimum, hard cap 4 s.
  - **Reduced motion:** the preloader is skipped entirely (the brief allows a ≤ 300 ms fade; none is simpler and calmer).
  - **Sequence deviation:** the box slams shut and hands off to the **closed** hero box. Scrolling then opens it. This keeps one story: you put the parts in, then open the box.
- **Hero letters are split on the server** (`aria-hidden` letter spans plus a screen-reader copy of the word). GSAP SplitText's ARIA handling on a `<span>` inside an `<h1>` would have hidden the word from screen readers.
- **ОТКРИВАЈ spotlight** is a radial gradient clipped to the text with an animated CSS variable (no duplicated text); forced-colours mode falls back to plain text.
- **No ScrollTrigger `pin`.** Pinning toggles `position: fixed`, which the browser recorded as layout shift (CLS 0.95 mobile / 2.8 desktop in our measurements). The hero and the desktop showcase use CSS `position: sticky` inside a tall wrapper instead (`home/sticky.ts`): CLS 0.01 / 0, and no jitter with native touch scroll.
- **Marble track on a viewport-sized `<canvas>`,** not a page-tall SVG. It redraws only the samples on screen, only when something moved, at ≤ 1.25× resolution on mobile. The marble follows the viewport (≈ 55 % down) along one Catmull-Rom path through the section anchors, with a small curl under the intro. Each section's track side alternates left/right in the gutter; side changes happen in section padding so the line never crosses text. Content sits above the track (z-index layers inside `<main>`).
- **Track simple triggers (v1 scope):** the showcase gear spins, the Order sticker pops at "Pick your box", the intro catapult flicks. Levers / dominoes / catapult launches stay in the backlog.
- **Section hand-off:** circle reveal from the track side on desktop, with `<main>` temporarily taking the previous section's colour so the area outside the circle matches. Mobile keeps hard edges (cheaper). Hero → intro is the hero dive itself.
- **Physics:**
  - **Rendering:** the existing SVG parts are moved with `transform` from Matter.js positions, not drawn on a canvas, so there is one illustration source.
  - **Bodies and interaction:** desktop has 18 bodies and drag/flick (the wheel listener is removed so the page still scrolls); touch has 8 bodies and no dragging, so native scroll is untouched.
  - **Efficiency:** the engine pauses off-screen and bodies sleep.
- **Gear cursor** keeps the native cursor in text fields and inside dialogs (dialogs live in the browser's top layer above any z-index).
- **Header** ~~hides on scroll down~~ (superseded 2026-11-26 by owner feedback: it stays on screen; navy bar at the top, floating pill once scrolled).
- **Kept as CSS (no JS):** orbiting info buttons bob, testimonial quotes animate in, the cart drawer slides in, the lightbox pops, the mobile menu opens like a lid. The global reduced-motion rule turns them off.
- **Route transitions (lid wipe):** not attempted yet; M5 nice-to-have per the brief.
- **Performance (production build, headless Chromium, mobile emulation 390 px with 4× CPU throttling + slow 4G, scripted scroll through the whole home page in 9 s):**
  - **Mobile:** ≈ 52 fps average (48–57 across runs), LCP 1.9–2.1 s, CLS 0.01.
  - **Desktop:** 60 fps, LCP 0.35 s, CLS 0.
  - **Note:** headless Chromium rasterises canvas in software, so real phones should do better.
  - **Degrades applied to reach this:** viewport-only track drawing, frame skipping, mobile canvas resolution cap, 8 physics bodies on mobile.
  - **Follow-up (M5):** the full page `load` takes ~18 s on slow 4G; that is page weight (fonts, illustrations, sample images), not motion, and belongs to M5's image and font pass.

## M5: Polish and hardening

- **Page weight (mobile, production build):** home 487 → **407 KB**, kit page 332 KB, order page 356 KB.
  - **Cart bundle:** the cart drawer (on every page) imported `computeTotals` from the order module, dragging Zod and libphonenumber into the shared bundle. Pure totals moved to `src/lib/totals.ts` (−59 KB JS).
  - **Fonts:** only the weights used are loaded: display 800 only (900 was never used), and Onest as one variable file per subset, which also gives real 900 weight instead of a synthesised one (−25 KB).
  - **HTML:** inline SVG illustrations make the HTML 36 KB gzipped. That is acceptable; a sprite sheet would break the animated box lid.
- **Measured after M5** (headless Chromium, 390 px, 4× CPU throttle + slow 4G):
  - **Mobile:** 51–54 fps while scrolling the whole page, LCP 2.1–2.3 s, CLS 0.01.
  - **Desktop:** 60 fps, LCP 0.44 s, CLS 0.
  - **INP:** not measurable in this lab setup; the only heavy interaction (add to cart) does no network work. Re-check with field data once analytics is on.
- **Content-Security-Policy (strict, per request):**
  - **Scripts:** `script-src 'self' 'nonce-…' 'strict-dynamic'` (plus Turnstile and, if configured, the analytics origin). Everything else that matters is locked down too: `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'`, and `upgrade-insecure-requests` on HTTPS.
  - **Nonce delivery:** `src/proxy.ts` creates the nonce and adds it to the *request* headers before next-intl runs. next-intl forwards request headers, so Next.js stamps the nonce on its own scripts and the layout reads `x-nonce` for the inline preloader script.
  - **Styles:** allow `'unsafe-inline'` (React style attributes, animation libraries); this cannot run scripts.
  - **Payload admin (`/admin`):** outside the proxy, so no CSP. It keeps the general headers; Payload's admin needs its own policy work, which is not worth the risk now.
  - **Verified:** no violations on any page, including the preloader, GSAP/Matter chunks and the order flow (e2e-tested).
- **Other headers:**
  - `Strict-Transport-Security` (1 year, includeSubDomains) only when the site URL is https. **No `preload`:** that is a commitment for the owner to make with the domain.
  - `Cross-Origin-Opener-Policy: same-origin`, plus the existing nosniff, Referrer-Policy, X-Frame-Options and Permissions-Policy.
- **Route transitions:** a lid wipe between pages, built as a plain overlay animated with the Web Animations API (no library), started by a capture-phase click listener. It never blocks or delays navigation: the lid closes (260 ms) while the next page loads and opens (320 ms) when the new route renders, and opens on its own after 1.2 s if a navigation is slow or cancelled. It skips external, new-tab, download, same-page and admin links. Motion flag `transitions`.
- **Accessibility audit:**
  - **axe:** WCAG 2.2 AA tags, zero serious or critical issues on all 13 pages × 2 languages, plus home with reduced motion.
  - **Keyboard pass (e2e):** skip link first; visible focus on every stop; mobile menu, cart drawer and lightbox all keyboard-operable with focus return; FAQ accordions; Tab on the preloader skips it instead of focusing hidden links.
  - **Fixed:** kit cards hid the focus outline of their full-card link. The link keeps its outline and the whole card gets an orange ring.
- **Contrast:** the palette rule is unit-tested (navy on every light colour and every accent on navy ≥ 4.5:1) and axe checks rendered contrast on every page.
- **Analytics:** proposal in `docs/ANALYTICS.md` (Cloudflare Web Analytics recommended: free, cookieless, includes real-user speed; Umami / Plausible alternatives). The code is pre-wired and **off** until `NEXT_PUBLIC_ANALYTICS_PROVIDER` and `NEXT_PUBLIC_ANALYTICS_ID` are set; the CSP then allows that provider automatically.
- **Copy review:** no safety, certification, educational-outcome or superlative claims anywhere. The footer origin line now matches in both languages ("Северна Македонија"). The full list of draft copy and where to edit it is in OWNER_TODO.
- **Audit:** `pnpm audit --prod` unchanged: only the accepted `esbuild` exception inside drizzle-kit (see M2).
- **Review screenshots** (`docs/screenshots/m5/`) are static full-page captures with reduced motion; the motion is reviewed through the M4 recordings.

## M6: Deploy and handover

- **Hosting comparison:** `docs/HOSTING.md` (researched 2026-11-26 from official pricing and terms). Recommended: Railway Hobby (EU West, Amsterdam) + Cloudflare R2 + Resend Free + `.mk` domain, about $10/month. Waiting for owner approval (Gate 3).
  - **Vercel Hobby excluded:** its terms limit it to personal or non-commercial use.
  - **Hetzner excluded for now:** it has restricted new cloud servers since June 2026.
- **Media storage:** `@payloadcms/storage-s3` (pinned 3.94.2, same as Payload), switched on only when `S3_BUCKET` is set, so dev keeps local disk.
  - **Served through Payload:** files are still served through `/api/media/file/*` instead of public bucket URLs. That keeps the Builds consent and draft access rules, leaves `next/image` patterns and the CSP unchanged, and keeps the bucket private.
  - **Schema:** `alwaysInsertFields: true` keeps the DB schema identical with and without the plugin. Migration `storage_s3` adds `media.prefix` and `media._objectkey`.
  - **Not yet tested against a real bucket:** the MinIO images are no longer public, so the first real upload is tested against R2 during deployment.

### Owner feedback before hosting (2026-11-26)

- **Header:** now a floating paper "sticker" pill with the navy outline and hard shadow used across the site. Nav links are in the display font and pop up yellow on hover; the current section is orange. The language toggle is a small segmented pill and the cart is an orange button.
  - **Layout:** the header overlays the top of each page. The first block of every page reserves `--header-h` with a transparent top border, so its own background shows behind the header without fighting padding utilities. The home hero pads itself.
- **Showcase fits the screen:** slide sizes are capped by screen height (`svh`), and while pinned the section fills the screen with its content centred.
  - **Fallback:** if a section is still taller than the screen, `stickyPin` sticks it by its bottom edge, so the order buttons are never cut off. The horizontal scroll starts only once it is stuck.
- **Footer:** the lid over the wordmark is replaced by the INVENTO letters popping up out of an orange "box rim", with an orange hard text shadow. Fully visible without motion. The bottom row leaves room for the fixed order sticker.
- **Gear cursor:** redrawn as a symmetric 8-tooth gear with room for its outline. The old drawing touched the SVG edges, so the teeth looked clipped.
- **Add to cart:** hover lifts the button (bigger hard shadow, yellow, slight tilt) and the cart icon hops. Pressing flattens it. Hover only on devices that have hover.

### Owner feedback, round 2 (2026-11-26)

- **Header has two states:** at the top of every page it is a full-width navy bar (matching the navy hero), and after 24px of scroll it turns into the floating paper pill. It always stays on screen; hiding on scroll down is removed, as the owner asked for a sticky header.
  - **How:** MotionRoot sets `data-scrolled` on the header. The navy bar and the pill are separate layers that crossfade with opacity and transform only, and the controls take their colours from `--ink` / `--ink-contrast`. This is a style state, not a motion feature, so the `header` motion flag is gone. Without JS the header stays the navy bar.
- **Order sticker:** uses the same `btn-pop` hover as Add to cart (lift, yellow, hard shadow, the cart icon hops), on top of its own tilt. The marble's "pop" tween clears its inline transform afterwards so the hover keeps working.
