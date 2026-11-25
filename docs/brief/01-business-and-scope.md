# 01. Business and Scope

## The business

**INVENTO** sells physical DIY engineering and creative building kits ("boxes"). A customer buys a box containing parts, materials and instructions and builds an interesting project themselves.

- **Slogan:** ГРАДИ. ОТКРИВАЈ. СОЗДАВАЈ. / BUILD. DISCOVER. CREATE.
- **Market:** North Macedonia only at launch. Keep the architecture international-ready (locales, currency field), but do not build for it.
- **Buyers:** mainly **parents**, gift-givers; the **users** are children aged **6-12**.
- **Product:** wood-first kits, produced with a local woodworker using CNC. Launch range is undecided (likely 1-3 kits). Electronics are a possible later line. Example ideas: mini catapult, hydraulic arm, mechanical puzzles, gear mechanisms.
- **Operations:** two people, no own machines, dependent on a supplier. Batches are small. **Capacity is the biggest business risk**, so the site must support limited batches, honest lead times, and an easy way to pause orders.
- **Stage:** pre-product, pre-registration, pre-revenue. Selling begins via Instagram and Viber; the website supports and professionalizes that.
- **Payments:** none online. Order request, then confirmation on Viber, then cash on delivery. Courier is not chosen yet.
- **Unknowns (never invent):** prices, unit costs, stock, courier, delivery cost, delivery time, business legal form, domain, Viber number, Instagram handle, safety certifications.

## Brand

- Palette: dark navy `#0D1B2A`, orange `#FF7A00`, yellow `#FFD166`, teal `#00B4DB`, light `#F2F2F2`.
- Style: modern, playful, premium, engineering-inspired. A premium engineering brand, **not a generic online store**.
- Logo: an open box with engineering illustrations (gears, rocket, lightbulb, tools).
- Packaging: **navy outside, orange inside**. This is the core metaphor of the website (see `docs/04`).
- Tone of voice: warm, curious, confident. Speaks to parents (trust, quality, learning through play, screen-free time) while sparking kids' excitement. Short sentences. No hype, no unverifiable claims. Do not claim "certified", "CE", "100% safe", or educational outcomes. Say "designed for ages 6-12, adult supervision recommended" and flag it in `OWNER_TODO.md` for the owner to confirm.

## Goals of the website

1. Make the brand memorable the moment a visitor arrives from Instagram.
2. Present the kits clearly and let parents send an order request in under a minute.
3. Reduce the owner's manual work: orders arrive structured, stock is tracked, orders can be paused.
4. Show real customer builds (curated by the owner) to build trust.
5. Be editable by the owner without code.

## Scope

### In scope (MVP)
- Public site: home (signature experience), kits list, kit detail, about, FAQ, contact, gallery, policy pages (shipping, returns, privacy, terms).
- Bilingual mk/en.
- Cart and **order request** flow with cash on delivery; order management in the admin.
- Stock per batch, "sold out", "coming soon", "next drop" dates, lead-time text, and a global **pause orders** switch.
- Owner-curated build gallery with a mandatory consent flag.
- Curated testimonials (owner-entered only).
- CMS admin for everything above; email notification to the owner on each order.
- SEO basics, privacy-friendly analytics decision, security, backups, deployment plan.

### Out of scope now (backlog, do not build)
Online payments, customer accounts, public uploads, comments, likes, voting, monthly competitions, grading, leaderboards, achievements and badges, diplomas (PDF), discount codes, product reviews by customers, order tracking page, courier integrations, subscriptions, per-kit exploded 3D views.

Keep the data model **extensible** for these (e.g. `paymentMethod` is an enum with one value today; a `roles` array on users), but ship none of them.

## Child-related constraints

The audience is children's parents, and gallery photos may involve children.
- No public upload, no comments, no accounts: the exposure surface is minimal by design.
- Gallery items require an explicit `consentConfirmed` checkbox before they can be published.
- Guidance in the admin field description: prefer photos of the build and hands; avoid children's faces and never show full names (first name optional, parent's consent required).

## Legal and compliance (flag, do not decide)

Create `OWNER_TODO.md` items for: choosing a business legal form and bank account, toy/product safety requirements for kits sold to children, consumer-law basics for distance selling (returns, information duties), personal-data handling and privacy policy review, and invoicing. Draft neutral placeholder text for the policy pages and mark them clearly **"DRAFT: needs owner/legal review"**. You are not giving legal advice.
