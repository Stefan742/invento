# 06. Order Flow (no online payment)

The business sells through Instagram/Viber today. The website turns that into a structured, low-friction **order request**. The owner confirms each order on Viber; payment is **cash on delivery**. Design for a capacity-limited, one-person operation.

## Customer flow

1. Customer browses kits and taps **Add to cart** (stepper, max per line from settings).
2. **Cart drawer** (also reachable from the sticker and header): lines, quantities, total, or "price to be confirmed" if any price is empty; note about shipping cost from settings.
3. **`/order` form**:
   - Required: full name, phone (lenient parsing, default region MK), city, address, privacy consent checkbox (links to `/privacy`).
   - Optional: email, notes. `preferredContact` (Viber default, phone, email).
   - Summary of the cart beside/above the form; clear line "Плаќаш при достава / Pay on delivery".
   - Spam protection: honeypot field, minimum time-to-submit, per-IP rate limit (e.g. 5 requests / 10 min), optional Cloudflare Turnstile when keys are present.
4. On submit, the server validates (zod, same schema as client) and creates the order **inside a database transaction**.
5. Redirect to **`/order/[publicToken]`** (success):
   - Shows the **order reference** (e.g. INV-0007) and a non-personal summary (items, quantities). No name, phone or address on this page.
   - Owner-written "what happens next" text from settings.
   - Big **Viber button** with the number from settings, plus **"Copy order summary"** (so the customer can paste it into Viber) and an Instagram fallback. Verify how Viber deep links behave on iOS/Android/desktop and use the most reliable approach; do not promise pre-filled messages if unsupported.
6. If the customer gave an email, send a plain confirmation email (mk/en by locale).

## Owner flow

- Email notification on every new order (reference, items, customer contact, notes, link to the admin record).
- In the admin: orders list filtered by status; the owner moves status along `new → confirmed → in_production → shipped → delivered` or `cancelled`, and writes internal notes.
- Nice-to-have: CSV export of orders.

## Stock and drops

- Each kit may have `stockTotal` (batch size) and `stockRemaining`.
- **On order creation**, within the transaction, for each line: if the kit has `stockTotal`, require `stockRemaining >= quantity` (atomic conditional update so two simultaneous orders cannot oversell), then decrement. Otherwise return a friendly error naming the kit.
- **On status → `cancelled`**, restore the quantities (once; guard against double restore).
- If the owner edits stock by hand in the admin, that value wins. Document this in the owner guide.
- Sold-out kits cannot be added to the cart; if a kit sells out while it is in someone's cart, the order route rejects it and the UI explains.
- `comingSoon` kits can be viewed but not ordered. `nextDropDate` and `leadTimeText` are shown only when the owner filled them.

## Pause orders (capacity safety valve)

`SiteSettings.ordersOpen`. When false:
- Add-to-cart, cart submit and `/order` show `ordersClosedMessage` instead of the form.
- The order route rejects submissions server-side (never trust the client).
- Kit pages, gallery and everything else stay visible.
The owner flips this in one click in the admin.

## Pricing and totals

- Prices are in MKD, optional per kit. Snapshot `titleSnapshot` and `priceSnapshot` into the order so later edits don't alter history.
- If any line price is empty, `total` is null and the UI says the total will be confirmed on Viber.
- `shippingFee` comes from `shippingFlatFee` (nullable). Never invent a fee.

## Order reference

Sequential, human-friendly `INV-0001` generated atomically (database sequence or counter inside the transaction). The success URL uses the **separate random `publicToken`** so references cannot be guessed to view other orders.

## Security and privacy

- Public cannot create or read orders via the Payload API; only the server order route (using the local API) may create.
- Validate and sanitize everything; limit field lengths; reject oversized payloads.
- Log no personal data in application logs.
- Privacy consent stored with each order. Provide a simple admin way to delete or anonymize an order's personal fields on request.

## Tests (required)

- Unit: stock decrement/restore, reference generator, zod schema, total calculation with null prices.
- E2E (Playwright): happy-path order in `mk` and `en`; sold-out kit blocked; orders-paused state; honeypot rejection; concurrent-order oversell attempt rejected.

## Future (do not build, keep hooks)

Online payment providers (to be researched for North Macedonia separately), discount codes, order tracking by reference, courier integration, customer accounts.
