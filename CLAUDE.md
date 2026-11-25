# CLAUDE.md: INVENTO web project rules

Copy of the working rules. Full spec lives in `docs/brief/`.

## Project
Bilingual (mk default, en) site for INVENTO: wooden DIY engineering kits for kids 6-12, North Macedonia. Next.js (App Router) + Payload CMS + PostgreSQL, one codebase. Orders are **requests with cash on delivery**, confirmed by the owner on Viber. No online payments.

## Rules
- Verify packages/APIs against current official docs before using them; do not rely on memory. Pin versions.
- Every user-facing string exists in `mk` and `en`. Macedonian is the default.
- Never invent prices, stock, delivery times, testimonials, certifications or legal claims. Unknown = `null` in data, "coming soon / to be confirmed" in UI.
- Motion is an enhancement. Everything must work with JS animations off and with `prefers-reduced-motion`.
- Animate only `transform` and `opacity`. Clean up GSAP contexts and ScrollTriggers on unmount. Load heavy libs (GSAP plugins, Matter.js) lazily on the client.
- Orange, teal and yellow are used as **text** only on navy; on light backgrounds text is navy. Check contrast.
- Public users can never write directly to Payload collections. Orders are created through a validated server route only.
- Content edits made in the admin must appear on the live site within seconds (on-demand revalidation), with no redeploy.
- Keep the owner-facing admin simple: grouped navigation, helpful field descriptions in en/mk, sensible defaults, hide advanced fields.
- Conventional Commits; one logical change per commit; never commit `.env` or secrets; never force-push.
- Before finishing any task: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
- Log non-obvious choices in `DECISIONS.md`, owner-only items in `OWNER_TODO.md`, placeholder assets in `ASSETS_NEEDED.md`.

## Scripts expected
`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `seed`, `generate:types`, `migrate`.
