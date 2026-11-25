# 07. Quality, SEO, Security and Privacy

## Performance targets

Measure with **mid-range mobile emulation** (Moto G-class, 4x CPU throttle, slow 4G).
- LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms on the home page and kit pages.
- Animations hold ≥ 50fps on that profile; if not, degrade (fewer bodies, simpler track) rather than ship jank.
- Heavy modules lazy loaded; no animation library in routes that do not use it.
- Images responsive and modern formats; explicit dimensions; no layout shift from late-loading art.
- The owner should also test on a real phone by opening the site from an **Instagram link** (in-app browser): record this in `OWNER_TODO.md`. In-app browsers can differ (viewport units, blocked features), so avoid hover-only interactions and test `100dvh` behavior.

## Accessibility (target WCAG 2.2 AA on core flows)

- Contrast rule from `docs/04`; verify with a checker, not by eye.
- Full keyboard use: nav, carousel, lightbox, cart drawer, accordion, preloader skip. Visible focus styles (orange ring with navy outline).
- `prefers-reduced-motion` honored everywhere (see `docs/04`).
- Touch targets ≥ 44px; form labels, error messages in the active locale, `aria-live` for cart updates.
- Meaningful `alt` text (from Media `alt` field, localized); decorative SVG `aria-hidden`.
- Language switch updates `<html lang>` (`mk` / `en`).
- Run axe checks in Playwright on home, kits, kit detail, order, success pages.

## SEO

- Per-locale metadata, canonical URLs, `hreflang` alternates, `lang` attribute.
- `sitemap.xml` (kits, pages, both locales) and `robots.txt`; `NEXT_PUBLIC_SITE_URL` drives absolute URLs.
- Open Graph / Twitter images (a default branded image + per-kit when available). Link previews matter because links are shared on Instagram and Viber.
- JSON-LD: Organization, WebSite, FAQPage (from FAQs), Product with `offers` only when a price exists.
- Semantic HTML: one `h1` per page, logical headings, descriptive link text.
- Clean Latin slugs for kits.

## Security

- Payload access control default-deny (see `docs/03`). Re-test that public requests cannot read orders or users.
- Server-side validation for every write; zod schemas shared with the client.
- Rate limiting on the order route, contact form and login; honeypot; optional Turnstile.
- Secrets only in environment variables; `.env.example` committed, `.env*` ignored.
- Security headers: Content-Security-Policy (compatible with the animation stack), HSTS (once on HTTPS), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame protection.
- Admin: strong password requirement documented, login-attempt lockout if supported (verify), HTTPS-only cookies in production.
- Upload restrictions: images only, size cap, server-side mime check.
- `pnpm audit` clean at each milestone, or exceptions logged.
- Error pages leak no internals.

## Privacy (not legal advice; owner/legal review required)

- Collect the minimum: name, phone, city, address, optional email and notes.
- No accounts, no public uploads, no comments, no third-party trackers by default.
- **Analytics:** default to none until M5. At M5 propose a cookieless, privacy-friendly option (e.g. Plausible or Umami), explain cost, and let the owner decide. Cookieless analytics + strictly-necessary localStorage (cart, preloader flag) should avoid a consent banner, but record this reasoning and flag it for the owner's confirmation.
- `/privacy` page: draft in both languages describing what is collected, why, retention, and how to request deletion; clearly marked as DRAFT.
- Gallery: consent checkbox required; see `docs/01` child-related constraints.
- Provide an admin procedure to delete/anonymize a customer's order data on request.

## Backups and reliability

- Daily automated PostgreSQL backups to storage separate from the database host; media bucket with versioning or periodic copy. Document retention (e.g. keep a rolling set) once the host is chosen.
- **Test a restore once** and write the runbook (`docs/RUNBOOK.md`).
- `/api/health` endpoint (db reachable) for uptime monitoring; suggest a free uptime monitor in the owner guide.
- Error monitoring: propose a free-tier option; owner decides.

## Testing summary

- Unit (Vitest): stock logic, order ref, validation, totals, access-control rules, slug/seo helpers.
- E2E (Playwright): order flows, locale switching, paused orders, sold-out handling, a11y (axe), screenshots at 390 / 820 / 1440 widths.
- CI runs lint, typecheck, unit tests and build on every push.
