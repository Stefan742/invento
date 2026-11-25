# 03. Data Model and CMS

Goal: the owner runs the whole site from the admin, in a friendly way, with no code. `(l)` = localized field (`mk` + `en`). Add short, plain-language **descriptions** on every field in the admin (English, with Macedonian where practical).

## Admin experience

- Navigation groups: **Shop** (Kits, Orders), **Content** (Home page, Pages, FAQs, Testimonials, Builds, Media), **Settings** (Site settings).
- Enable **drafts / versions** on Kits, Pages and the Home page so the owner can save without publishing. Add Live Preview if it works cleanly; otherwise skip and log it.
- Useful list columns, default sort newest first, search on the main text fields.
- Hide advanced/technical fields. Provide sensible defaults.
- Orders list: columns `ref`, `status`, `customerName`, `phone`, `total`, `createdAt`; filter by status; default sort newest.
- A **"New orders" count** next to the Orders nav item or on the dashboard is a nice-to-have.
- Single role today (`admin`), stored as a `roles` array for future expansion.
- Seed script (`pnpm seed`) creates the admin from env, sample content and settings.
- **Placeholders:** any seeded sample content that imitates real content (testimonials, builds, prices) carries `isPlaceholder: true`. The frontend hides placeholder items unless `SHOW_PLACEHOLDERS=true` (default true in dev, false in production). **Never ship invented testimonials.**

## Collections

### Kits
- `title` (l), `slug` (single, Latin, unique), `shortDescription` (l), `description` rich text (l)
- `heroImage`, `gallery[]` (media)
- `priceMKD` number, **optional**. If empty the UI shows "price coming soon / to be confirmed".
- `ageMin`, `ageMax` (defaults 6 and 12), `difficulty` 1-3 (shown as gears), `buildTimeMinutes` (or min/max)
- `whatsInTheBox[]` (l), `whatYouNeedAtHome[]` (l), `safetyNotes` (l), `materials` text
- Availability: `isPublished`, `comingSoon` boolean, `stockTotal` (batch size), `stockRemaining`, `nextDropDate` (optional date), `leadTimeText` (l, owner-written, e.g. "Ships in X days": do not invent)
- `featured` boolean (shows the "most popular" ribbon and home showcase), `sortOrder`
- `seo` group (title, description, ogImage)
- **Derived `availability`** (computed, not stored by hand): `coming_soon` if `comingSoon`; `sold_out` if `stockTotal` is set and `stockRemaining <= 0`; otherwise `available`. Kits with no `stockTotal` are treated as available with no stock bar.

### Orders (admin read/write; public cannot read or write)
- `ref` human reference, sequential, e.g. `INV-0001` (atomic counter, never reused)
- `publicToken` random unguessable string used for the success URL
- `status`: `new` | `confirmed` | `in_production` | `shipped` | `delivered` | `cancelled`
- `customerName`, `phone`, `email` (optional), `city`, `address`, `notes`, `preferredContact` (`viber` default | `phone` | `email`), `locale`
- `items[]`: `kit` relation, `titleSnapshot`, `priceSnapshot` (nullable), `quantity`
- `subtotal`, `shippingFee`, `total`: nullable when a price or fee is unknown
- `paymentMethod`: enum with a single value `cash_on_delivery` today (extensible)
- `privacyConsent` boolean (required at submission), `createdAt`
- `internalNotes` (admin only)
- Hooks: on create, send the owner notification; on status change to `cancelled`, restore stock (see `docs/06`).
- Admin action or simple export for **CSV** of orders (useful for the accountant). Do it if cheap; otherwise log it in the backlog.

### Builds (curated gallery)
- `title` (l), `kit` relation (optional), `photos[]` (at least 1), `caption` (l), `builderFirstName` (optional), `consentConfirmed` boolean, `isPublished`, `sortOrder`, `isPlaceholder`
- Validation: **cannot be published unless `consentConfirmed` is true.** Field description warns: prefer photos of the build and hands; no children's faces or full names without clear parental consent.

### Testimonials (owner-entered only)
- `quote` (l), `authorName` (first name), `authorNote` (l, e.g. "parent"), `kit` relation optional, `isPublished`, `isPlaceholder`

### FAQs
- `question` (l), `answer` (l, rich or plain), `category` optional, `sortOrder`, `isPublished`

### Pages (about and policies)
- Restricted set of slugs: `about`, `shipping`, `returns`, `privacy`, `terms`
- `title` (l), `content` rich text (l), `seo` group. Seed neutral drafts marked "DRAFT: needs owner/legal review".

### Media
- Image upload with alt text (l), sensible size presets (thumb, card, hero, og). Upload size limit and image-only mime types.

### Users
- Admin users only. Email + password. Configure login-attempt limiting if Payload supports it (verify).

## Globals

### SiteSettings
- Contact: `viberNumber`, `phoneDisplay`, `email`, `instagramHandle`, `instagramUrl`
- **`ordersOpen` boolean (default true)** and `ordersClosedMessage` (l): a one-click "pause orders" switch for when the owner is at capacity. When off: order button is replaced by the message; cart cannot be submitted; kit pages stay visible.
- Order rules: `maxQuantityPerLine` (default 5), `shippingFlatFee` (nullable), `shippingNote` (l, e.g. "Delivery cost confirmed on Viber")
- `announcementBar`: `enabled`, `text` (l), optional link
- `orderSuccessNote` (l): what happens next (owner words)
- Defaults for SEO (site name, description, OG image)

### HomePage
- Hero texts (l, default to the slogan), `heroSubline` (l)
- Intro paragraph (l)
- `howItWorks[4]`: `title` (l), `body` (l)
- `featuredKits` relation list for the showcase (fallback: kits with `featured`)
- Section toggles (e.g. hide Testimonials, hide Gallery) and section titles (l)

## Access control summary

| Data | Public | Admin |
|---|---|---|
| Kits, Builds, Testimonials, FAQs, Pages, Media, Globals | read **published** only | full |
| Orders | **none** (created only by the server order route) | full |
| Users | none | full |

## Revalidation

Every change to published content must revalidate the relevant pages (`/mk` and `/en` variants, plus lists and sitemap) via hooks, so edits appear within seconds without redeploy.
