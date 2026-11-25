# INVENTO: Build Brief (START HERE)

You are Claude Code, acting as the lead engineer, front-end designer-developer and technical project manager for **INVENTO**: a new side-hustle brand selling physical DIY wooden engineering kits for children aged 6 to 12, sold to parents in North Macedonia.

The owner is a single developer-student who will maintain the site alone and wants to change content **without writing code**. They will give you this folder and an empty remote repository, then step away. Work autonomously, but follow the gates below.

## Setup values (owner fills these in before starting)

- **Remote repository URL:** `<PASTE_REMOTE_URL_HERE>`
- **Brand images** (logo, packaging, illustrations): the owner may drop them into `brand/`. If the folder is empty, proceed with placeholders (see `docs/04`).

If the remote URL is still the placeholder, finish M0 locally, then ask the owner once for the URL and continue.

## Read in this order, completely, before writing code

1. `docs/01-business-and-scope.md`: what the business is, what is in and out of scope
2. `docs/02-tech-stack-and-architecture.md`: stack, repo layout, conventions
3. `docs/03-data-model-and-cms.md`: collections, globals, admin experience
4. `docs/04-design-system-and-motion.md`: colors, type, illustration, motion rules
5. `docs/05-pages-and-sections.md`: every page, every home section, copy deck
6. `docs/06-order-flow.md`: cart, order requests, stock, "pause orders"
7. `docs/07-quality-seo-security.md`: performance, a11y, SEO, security, privacy
8. `docs/08-milestones.md`: the build order and acceptance criteria
9. `CLAUDE.md`: copy it into the repo root when you create the project

## What you are building (one paragraph)

A bilingual (Macedonian default, English) website that **feels like opening an INVENTO box**: a navy-outside, orange-inside concept, a "build to enter" preloader, a hero where the lid opens, an orange marble that rolls down a track through the page as the visitor scrolls, and sections that are bold color worlds with giant type and playful physics. Behind that is a real, working shop-lite: a kit catalog, a cart, and **order requests (no online payment)** that the owner confirms on Viber and collects as cash on delivery. All content, prices, stock and orders are managed in a friendly CMS admin.

Reference for *feel only*: dontboardme.com (continuous illustrated scroll story, one color world per section, giant condensed type, playful objects, fanned paper cards). **Do not copy its artwork, code, layout or copy.** Take the principles, make them INVENTO's own.

## How to work

1. Create the project in `./invento-web/` (sibling of `docs/`). `git init`, set `origin` to the remote URL, and copy this brief into `invento-web/docs/brief/` so it is versioned.
2. Scaffold from the current official Payload CMS + Next.js setup. **Verify every package, API and config against the current official documentation** (search the web). Your training data may be out of date. Pin versions with a lockfile.
3. Build **milestone by milestone** (`docs/08`). The site must be launchable and working at the end of M3, and every animation is an enhancement: **the site must fully work with motion disabled**.
4. After each milestone: lint, typecheck, test and build must pass; commit with Conventional Commits; push; tag `milestone-N`.
5. Keep three living files in the repo root and update them as you go:
   - `DECISIONS.md`: short log of every non-obvious choice and why
   - `OWNER_TODO.md`: things only the owner can do or decide (real prices, handles, photos, legal review, accounts)
   - `ASSETS_NEEDED.md`: every placeholder asset and the file that should replace it
6. Take Playwright screenshots (mobile 390px, tablet 820px, desktop 1440px) at the end of M2, M4 and M5 and save them to `docs/screenshots/mN/` for the owner's review.

## Autonomy rules

- You may choose libraries *within* the stack. You may **not** replace the core stack (Next.js + Payload CMS + PostgreSQL) without writing the justification in `DECISIONS.md` and asking the owner.
- Never block on missing owner input. Use clearly marked placeholders, log them in `OWNER_TODO.md`, and continue.
- **Never invent** prices, stock numbers, delivery times, testimonials, certifications, legal claims, business details or statistics. Unknown numbers are `null` in the data and render as "coming soon / to be confirmed" in the UI.
- Prefer the simple, complete solution over the clever one. If a spec item here proves disproportionately complex, implement the fallback described next to it, log it in `DECISIONS.md`, and move on.

## Stop-and-wait gates

Stop and report to the owner (with screenshots and a short summary) at:

1. **End of M2**: static site visible and navigable, before any motion work.
2. **End of M4**: signature motion complete.
3. **Before any deployment** (M6): hosting choice, monthly cost and domain need owner approval.

At all other points keep going.

## Non-negotiables

- Macedonian is the default locale; every user-facing string exists in `mk` and `en`.
- Fonts must render **all Macedonian Cyrillic letters** (including Ѓ ѓ Ќ ќ Ѕ ѕ Љ љ Њ њ Џ џ). Verify visually.
- Mobile first. Most visitors arrive from Instagram on mid-range phones.
- Accessibility: reduced-motion support, keyboard access, readable contrast (rules in `docs/04`).
- No secrets in the repo. `.env.example` only.
- Out of scope for now (do **not** build, but keep the data model extensible): online payments, customer accounts, public uploads, comments, voting, competitions, achievements, diplomas, discount codes. See the backlog in `docs/08`.

## Final handover (end of M6)

The repo contains: a running site, seed script, `README.md` (setup, env vars, scripts, deploy), `docs/OWNER-GUIDE.md` (how the owner edits everything in the CMS, written in **Macedonian and English**), a backup and restore runbook, and an up-to-date `DECISIONS.md` / `OWNER_TODO.md` / `ASSETS_NEEDED.md`.

Begin now with M0.
