# OWNER TODO

Things only you (the owner) can do or decide. Nothing here blocks development; the site shows "coming soon" or hides the feature until you fill it in.

## Business details (enter in Admin → Site settings)

- [ ] **Viber number** (international format, e.g. `+38970123456`). Until it is set, all Viber buttons are disabled.
- [ ] **Phone display** text (e.g. `070 123 456`).
- [ ] **Instagram handle** and URL. The home gallery's giant `@handle` and the Instagram buttons appear once set.
- [ ] **Email** for customers. Also choose the email that receives order notifications (`ORDER_NOTIFY_EMAIL`, M3).
- [ ] **City** (optional, shown on the contact page).

## Orders and email

- [ ] Create a **Resend** account (or tell us your preferred email provider) and verify a sending domain once you have one. Until then, order emails only appear in the server log.
- [ ] Choose the inbox that receives **order notifications and contact messages** (`ORDER_NOTIFY_EMAIL`).
- [ ] Optional: a free **Cloudflare Turnstile** key, if spam ever gets past the built-in checks.
- [ ] Try the full flow on your phone: add to cart → order form → success page → "Open Viber" / "Copy order summary".
- [ ] Decide your routine for **cancelled orders** (cancelling puts the stock back automatically, once) and for **data deletion requests** (each order has an "Anonymise personal data" checkbox).

## Motion review (Gate 2)

- [ ] Watch the recordings in `docs/screenshots/m4/` (`.webm`, opens in any browser) and tell us what to change: speed, how much motion, anything that feels too much on a phone.
- [ ] Once the site is online, try the home page on your own phone, especially opened from an Instagram link.

## Products and prices (Admin → Kits)

- [ ] Decide the launch range (1–3 kits). Replace the three **sample kits** (Mini catapult, Hydraulic arm, Gear machine), or edit them into real ones and **untick "isPlaceholder"**.
- [ ] **Prices** in MKD. Empty = "Price coming soon" on the site.
- [ ] **Batch sizes / stock** (`stockTotal`, `stockRemaining`). The sample "14 of 20" is not real.
- [ ] **Lead-time text** in your own words (e.g. "Ships within 5 days"). Empty = nothing shown.
- [ ] Real **What's in the box / What you need at home / materials / build time** per kit.
- [ ] **Safety notes** per kit. The default text "Recommended for ages X–Y. Adult supervision recommended." must be confirmed by you.
- [ ] Confirm the age claim **"designed for ages 6–12, adult supervision recommended"** used across the site.

## Delivery and payment

- [ ] Choose a **courier**, **delivery cost** (`shippingFlatFee` in Site settings; empty = "confirmed on Viber") and realistic **delivery times**.
- [ ] Confirm the "How it works" wording once delivery/payment rules are decided (Admin → Home page → How it works).
- [ ] Review the **order success note** ("what happens next") in Site settings.

## Legal and compliance (not legal advice: please get proper advice)

- [ ] Choose a **business legal form** and open a business bank account.
- [ ] **Toy / product safety** requirements for kits sold to children in North Macedonia (labelling, age warnings, small parts, any certification). The site makes **no** safety or certification claims until you confirm them.
- [ ] **Distance selling / consumer law**: return period, information duties, who pays return shipping.
- [ ] **Invoicing** for cash-on-delivery sales.
- [ ] Review and rewrite the four **DRAFT policy pages** (Shipping, Returns, Privacy, Terms) and **About**. Each is marked "DRAFT: needs owner/legal review" on the page.
- [ ] **Privacy:** decide how long order data is kept; confirm the reasoning that **no cookie banner is needed** (the public site sets no cookies; the cart and preloader flag use the browser's local storage only and are strictly functional; analytics, if any, will be cookieless). Please confirm with legal advice.

## Content to review

- [ ] All **draft copy** (Macedonian and English): hero subline, intro paragraph, How-it-works steps, FAQ answers, page texts. The six seeded FAQs only state the agreed model (order request, Viber confirmation, cash on delivery, ages 6–12); edit freely.
- [ ] **Testimonials:** only real words from real customers, with permission. The section stays hidden until at least one real, published testimonial exists.
- [ ] **Customer builds:** only with parent consent; prefer hands and the build, no children's faces or full names.

## Brand assets

- [ ] Drop the real logo, brand image, packaging and kit photos into `brand/` (see `ASSETS_NEEDED.md`).

## Testing on a real phone

- [ ] Open the site from an **Instagram link** on your phone (the in-app browser behaves differently) once it is online, and tell us anything that looks off.

## Later decisions

- [ ] Hosting, monthly budget and **domain** (M6, you approve before anything is deployed).
- [ ] Analytics: none by default; a cookieless option will be proposed in M5.
