# 08. Milestones

Work in order. At the end of each milestone: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass, commit (Conventional Commits), push, tag `milestone-N`, update `DECISIONS.md`, `OWNER_TODO.md`, `ASSETS_NEEDED.md`. **Gates: stop for owner review at the end of M2, at the end of M4, and before any deployment in M6.**

The site must be **launchable at the end of M3**. Motion (M4) is an enhancement layered on top.

---

## M0: Foundations
- Create `invento-web/`, `git init`, remote `origin`, copy brief into `docs/brief/`, root `CLAUDE.md`.
- Scaffold Next.js + Payload (verify current docs), Postgres via `docker-compose.yml`, pnpm, TypeScript strict, ESLint, Prettier.
- Tailwind + design tokens (`docs/04`), `next/font` setup, **`/dev/fonts` Macedonian glyph test page**; choose fonts, log in `DECISIONS.md`.
- i18n routing `/mk` `/en`, message files, language switch, `<html lang>`.
- `.env.example`, README skeleton, GitHub Actions (lint, typecheck, test, build).
- **Done when:** app runs locally with admin login, locale routing works, fonts render all Macedonian letters, CI green, first push done.

## M1: CMS and data
- All collections and globals from `docs/03` with localization, access control, drafts, validation (e.g. Builds consent), admin grouping and field descriptions.
- Media with image sizes; local storage in dev.
- Seed script (admin, 3 sample kits **with null prices**, FAQs, how-it-works defaults, placeholder testimonials/builds flagged `isPlaceholder`).
- Revalidation hooks wired.
- Unit tests for access control and derived availability.
- **Done when:** owner could create/edit a kit, FAQ, page and settings in the admin; public API cannot read orders/users; placeholders hidden when `SHOW_PLACEHOLDERS=false`.

## M2: Static site (everything works, no signature motion) → **GATE 1**
- Layout: header, footer, language switch, announcement bar, branded 404/error.
- Home with **all sections as static, responsive layouts** in their color worlds (backgrounds, giant type, cards, ruler layout, etc.), using placeholder SVG illustrations.
- `/kits`, `/kits/[slug]`, `/gallery` (grid + lightbox), `/faq`, `/about`, `/contact`, policy pages.
- SEO: metadata, hreflang, sitemap, robots, JSON-LD, default OG image.
- Playwright screenshots at 390 / 820 / 1440 saved to `docs/screenshots/m2/`.
- **Done when:** the whole site is navigable and looks on-brand in both languages on mobile and desktop with zero animation. Report to the owner with screenshots and wait.

## M3: Orders
- Cart (Zustand, persisted), cart drawer, order sticker, `/order`, order route with zod validation, transaction, stock decrement/restore, sequential `ref`, `publicToken`.
- Success page with Viber CTA and "copy summary".
- Owner email notification (and optional customer confirmation); status workflow in admin; pause-orders switch; sold-out and coming-soon handling.
- Anti-spam (honeypot, timing, rate limit, optional Turnstile).
- Tests from `docs/06` (unit + e2e).
- **Done when:** a full order can be placed in `mk` and `en`, appears in the admin, emails the owner, respects stock and the pause switch, and oversell attempts fail.

## M4: Signature motion → **GATE 2**
Build in this order, each behind `matchMedia` branches (desktop / touch / reduced motion) and each independently disable-able via a single flag:
1. Smooth scroll (Lenis, fine pointer only) + section color-world transitions.
2. Preloader "Build to enter" (+ session flag, skip, hard cap).
3. Hero: word micro-animations, lid open + dive on scroll, hand-off to orange.
4. Marble track (anchors, path, marble, track color follow, section hand-off reveals, 2-3 simple triggers).
5. Kits showcase carousel with orbiting info buttons; How-it-works fanned cards.
6. Parents-say ruler interaction; Questions physics section; gallery drift + lightbox polish.
7. Custom cursor (desktop), footer lid-close.
- Performance pass on the throttled mobile profile; degrade where needed.
- Screenshots **and short screen recordings** (Playwright video) of each signature moment to `docs/screenshots/m4/`.
- **Done when:** all of the above run smoothly, the site still passes every M3 test, and works with motion disabled and with `prefers-reduced-motion`. Report to the owner and wait.

## M5: Polish and hardening
- Accessibility audit (axe + manual keyboard pass), contrast verification.
- Lighthouse/Web Vitals pass against targets in `docs/07`; image and font optimization.
- Route transitions (lid wipe) if clean; otherwise log as skipped.
- Privacy-friendly analytics proposal for the owner; security headers and CSP; `pnpm audit`.
- Copy review pass: ensure no invented claims; list all draft copy needing owner review in `OWNER_TODO.md`.
- Screenshots to `docs/screenshots/m5/`.

## M6: Deploy and handover → **GATE 3 (before deploying)**
- Research current pricing and terms for 2-3 hosting options that fit a small side-business budget (including database, object storage, email), present a comparison and a recommendation, and **wait for owner approval**.
- Production env, migrations, object storage, domain and HTTPS, email sending domain, health endpoint, uptime monitor suggestion.
- Backups configured and **a restore tested once**; write `docs/RUNBOOK.md`.
- Write `docs/OWNER-GUIDE.md` in **Macedonian and English**: add/edit a kit, mark sold out, set next drop, pause orders, process an order, add a build photo (with consent), edit FAQs and policies, change contact details, what to do when something looks wrong.
- Final README, final `DECISIONS.md` / `OWNER_TODO.md` / `ASSETS_NEEDED.md`.

---

## Backlog (not now; keep the model extensible)
1. Online payments (research Macedonian options separately; do not assume international providers support the business).
2. Customer accounts, order tracking.
3. Public build uploads with moderation; likes/comments.
4. Monthly competitions: challenges, submissions, grading (4 categories × 0-25), jury winner + community favorite, anti-fraud voting, leaderboard, archive.
5. Achievements/badges/XP, loyalty and discount codes.
6. PDF diplomas.
7. Customer reviews with moderation.
8. Per-kit exploded-view scroll experience and richer marble-track triggers (levers, dominoes, catapult).
9. Courier integrations, subscriptions, additional currencies/locales.
