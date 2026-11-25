# 05. Pages, Sections and Copy

All routes live under `/[locale]` (`mk` | `en`). All copy below is a **DRAFT for the owner to review**; write the English as natural English, not literal translation. Anything editable by the owner comes from the CMS (`docs/03`); UI strings come from `messages/mk.json` and `messages/en.json`.

## Sitemap

| Route | Purpose |
|---|---|
| `/` | Home: the signature experience (sections below) |
| `/kits` | All kits (cards, filters by availability optional) |
| `/kits/[slug]` | Kit detail |
| `/gallery` | Curated builds (grid + lightbox) |
| `/faq` | Full FAQ |
| `/about` | About INVENTO (CMS Page) |
| `/contact` | Contact: Viber, Instagram, email, simple message form (see below) |
| `/shipping`, `/returns`, `/privacy`, `/terms` | CMS Pages, DRAFT text |
| `/order` | Order request form |
| `/order/[token]` | Order success page |
| `404`, `error` | Branded, playful (a marble that fell off the track) |

The contact form (name, contact, message) creates a `ContactMessage` or emails the owner directly; pick the simpler option, add honeypot + rate limit, and log it.

## Home page sections (order matters; colors in `docs/04`)

0. **Preloader** ("Build to enter").
1. **Hero**: slogan around the box; subline.
   - mk: "Дрвени комплети за градење за љубопитни умови од 6 до 12 години."
   - en: "Wooden build-it-yourself kits for curious minds aged 6 to 12."
   - Primary button: "Погледни ги кутиите / See the boxes". Scroll cue.
2. **Intro**: one short paragraph (CMS). Draft mk: "Секоја INVENTO кутија е мала инженерска авантура: дрвени делови, јасни упатства и еден момент кога сè ќе „кликне“." en: "Every INVENTO box is a small engineering adventure: wooden parts, clear instructions, and that moment when it all clicks."
3. **Kits showcase** (yellow): giant "КУТИИ / BOXES" with a floating gear that drifts near a letter. Below, a pinned horizontal carousel of featured kits: huge counter `01/03`, the kit on a circular disc, name in display type, **orbiting round info buttons** (age, difficulty gears, build time) that bob gently, a tilted "Order" sticker. Mobile: swipeable, unpinned.
4. **How it works** (teal): giant "КАКО РАБОТИ? / HOW IT WORKS?" and the four fanned manual cards (copy from CMS, defaults below).
5. **Pick your box** (paper): kit cards: image, name, gear difficulty, age chip, time chip, price (or "Цена наскоро / Price soon"), **stock bar** ("Уште 14 од 20 / 14 of 20 left") when `stockTotal` is set, lead-time or next-drop line, add-to-cart button. `featured` shows the "Најпопуларна / Most popular" ribbon. If everything is sold out, show a **next-drop block** with the date (or "Следна серија наскоро / Next batch soon"). A final darker card "Сите кутии → / All boxes →" with a circular arrow button.
6. **Parents say** (navy): a horizontal **ruler / measuring tape** with tick marks; each testimonial is a labeled tick with the first name; the active one enlarges; its quote appears in giant yellow display type. Arrows, swipe and keyboard. **Hide the section entirely if there are no published, non-placeholder testimonials.**
7. **Questions** (orange): giant "ИМАТЕ ПРАШАЊА? / QUESTIONS?" with the physics objects; a paper card with the top 5 FAQs and buttons "Пишете ни на Viber / Message us on Viber" and Instagram.
8. **Builds gallery** (paper): "Најдете нè тука / Find us here" and a giant `@handle` (from settings). 6-9 taped photos drift with parallax at different speeds in a **deterministic** layout. Click opens an accessible lightbox. If no published builds exist, hide the section or show illustrated "Your build here" frames (pick the cleaner option, log it).
9. **Footer** (navy): giant INVENTO wordmark; the **lid closes** over it as the bottom is reached (fallback: simple slide). Columns: navigation, policy links, contact (Viber, Instagram, email), language switch. Orange hairline. "Направено во Македонија / Made in North Macedonia".

Section toggles from `HomePage` global must be respected.

## Kit detail page (`/kits/[slug]`)

- Hero image / gallery (swipeable, zoom), title, short description, price or "price soon", availability state (available / sold out / coming soon with next-drop date), stock bar, lead-time text.
- Spec row: age, difficulty gears, build time, materials.
- **What's in the box**, **What you need at home**, **Safety notes** (from CMS; if empty, a neutral default "Recommended for ages X-Y. Adult supervision recommended." flagged for owner confirmation).
- Quantity stepper + "Додај во кошничка / Add to cart" (disabled with a clear message if sold out, coming soon, or orders are paused).
- Related kits. Product structured data (offers only when a price exists).
- *Later (backlog):* scroll-driven exploded view with numbered parts, once real kit art exists.

## Cart and order pages

See `docs/06-order-flow.md`.

## Navigation

Header: Кутии / Boxes, Како работи / How it works, Галерија / Gallery, Прашања / FAQ, Контакт / Contact. "How it works" anchors to the home section from the home page and links to `/#how-it-works` elsewhere.

## Copy deck (draft)

| Key | mk | en |
|---|---|---|
| slogan | ГРАДИ. ОТКРИВАЈ. СОЗДАВАЈ. | BUILD. DISCOVER. CREATE. |
| order | Порачај | Order |
| addToCart | Додај во кошничка | Add to cart |
| cart | Кошничка | Cart |
| sendOrder | Испрати нарачка | Send order |
| viberCta | Пишете ни на Viber | Message us on Viber |
| soldOut | Распродадено | Sold out |
| comingSoon | Наскоро | Coming soon |
| nextDrop | Следна серија | Next batch |
| stockLeft | Уште {n} од {total} | {n} of {total} left |
| mostPopular | Најпопуларна | Most popular |
| priceSoon | Цена наскоро | Price coming soon |
| ordersPaused | Моментално не примаме нарачки. Пробајте повторно наскоро. | We're not taking orders right now. Please check back soon. |
| skip | Прескокни | Skip |
| parentsSay | Родителите велат | Parents say |
| findUs | Најдете нè тука | Find us here |

### How it works: default steps

| # | mk title / body | en title / body |
|---|---|---|
| 01 | Избери кутија / Одбери ја градбата што ти се допаѓа. | Pick a box / Choose the build you like. |
| 02 | Испрати нарачка / Пополни кратка форма, без онлајн плаќање. | Send your order / Fill in a short form, no online payment. |
| 03 | Потврда на Viber / Ќе ти пишеме за детали и испорака. | We confirm on Viber / We'll message you the details and delivery. |
| 04 | Гради! / Плаќаш при достава. Отвори ја кутијата и започни. | Build it! / You pay on delivery. Open the box and start. |

(Flag in `OWNER_TODO.md`: confirm the delivery and payment wording once the courier and rules are decided.)

## Contact info rules

Viber number, Instagram handle, email and city come only from `SiteSettings`. Until the owner provides them, render the buttons disabled or hidden with a log in `OWNER_TODO.md`. Never hardcode.
