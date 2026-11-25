# Analytics: proposal for the owner

**Status: nothing is installed.** The site sends no data to any analytics service until you choose one. This page compares three cookieless options so you can decide. *Not legal advice: confirm the cookie-banner reasoning with your adviser (see OWNER_TODO).*

## What we want to know

How many people visit, where they come from (Instagram, Viber, Google), which kits they look at, how many reach the order form, and, ideally, how fast the site feels on real phones.

## Options (prices checked 2026-11-25; confirm on each site before signing up)

| | **Cloudflare Web Analytics** | **Umami Cloud: Hobby** | **Plausible: Starter** |
|---|---|---|---|
| Price | Free, no traffic limits stated | Free | ~$9 / month (annual billing ~17 % cheaper) |
| Limits | none stated | ~100 k events / month, ~6 months retention | 10 k pageviews / month, 3 years retention |
| Cookies / local storage | none | none | none |
| Real-phone speed (Web Vitals) | **yes** | no | no |
| Custom events (e.g. "order sent") | limited | yes | yes |
| Account needed | Cloudflare (free) | Umami (free) | Plausible (paid after a 30-day trial) |
| Notes | Works without moving your domain to Cloudflare. Cloudflare can exclude EU/UK visitor data, a setting worth reviewing | Open source; can be self-hosted later | Polished, EU-based company |

Sources:
- [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/)
- [Cloudflare blog: privacy-first analytics](https://blog.cloudflare.com/free-privacy-first-analytics-for-a-better-web/)
- [Umami Cloud docs](https://docs.umami.is/docs/cloud)
- [Toolradar: Umami pricing](https://toolradar.com/tools/umami/pricing)
- [Plausible subscription plans](https://plausible.io/docs/subscription-plans)
- [Seline: Plausible pricing](https://seline.com/blog/plausible-analytics-pricing)

Third-party pricing pages disagreed on some limits, so treat the figures as approximate.

## Recommendation

**Cloudflare Web Analytics.** It is free with no traffic limits, sets no cookies or local storage, and also reports real-world loading speed. That speed data is useful because most visitors arrive from Instagram on mid-range phones. If you later want detailed funnels ("viewed a kit → opened the cart → sent an order"), add **Umami Cloud** (free) or switch to it.

The final choice can wait until the hosting decision in M6. If the site ends up behind Cloudflare, enabling it there is one click.

## How to switch it on (already prepared in the code)

Set these environment variables on the host and redeploy:

```
NEXT_PUBLIC_ANALYTICS_PROVIDER=cloudflare      # or umami / plausible
NEXT_PUBLIC_ANALYTICS_ID=<token / website id / domain>
# optional, e.g. a self-hosted Umami:
NEXT_PUBLIC_ANALYTICS_SRC=https://stats.example.com/script.js
```

The site then loads the provider's script after the page is interactive and automatically allows it in the Content-Security-Policy. Remove the variables to switch it off again.

## Cookie banner reasoning (to confirm)

With one of these cookieless tools, the site stores nothing on visitors' devices except:
- the cart (kit ids and quantities, in the browser's local storage);
- a "preloader already seen" flag (session storage).

Both are strictly necessary for what the visitor asked for. That is why we believe no consent banner is needed. Please confirm this with your legal adviser.
