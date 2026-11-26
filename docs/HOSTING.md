# Hosting options for INVENTO (M6, Gate 3)

Researched on 2026-11-26 from each provider's own pricing and terms pages (links below).
Prices change. They are quoted excluding VAT, and anything marked *estimate* depends on real traffic.
**Nothing will be deployed and no account will be created until the owner approves one option.**

## What the site needs

- One always-on Node.js server for the Next.js site and the Payload admin. It uses about 0.5 GB of RAM at low traffic.
- PostgreSQL. The data is tiny (well under 1 GB): kits, orders, pages.
- Object storage for photos uploaded in the admin.
- Email: one owner notification per order or contact message, plus an optional customer confirmation.
- A domain with HTTPS, a server close to Macedonia, backups, and the lowest possible upkeep for a non-technical owner.

Some parts are the same whichever option is chosen:

| Part | Choice | Cost |
|---|---|---|
| Photo storage | **Cloudflare R2**, S3-compatible. Already wired into the code and switched on by setting the `S3_*` variables. | Free up to 10 GB-month of storage and 1M/10M operations a month. Egress is always free. Then $0.015 per GB-month. |
| DNS + spam protection | Cloudflare DNS, plus Turnstile if spam becomes a problem | Free |
| Email | **Resend Free**: 3,000 emails a month, at most 100 a day, up to 3 domains | Free. The next plan is Pro at $20/month, which is not needed. |
| Domain | `.mk` from a local accredited registrar, e.g. Max Hosting: 900 MKD the first year, 700 MKD to renew. Registration needs a local presence, which the business has. | About 700–900 MKD a year |
| Uptime alert | Free uptime-monitor tier (e.g. UptimeRobot or Better Stack) checking `/api/health` every 5 minutes | Free |

## The three options

### A. Railway (Hobby plan, EU West: Amsterdam) — **recommended**

The site and PostgreSQL run as two services in one Railway project. Every push to `master` deploys automatically.

- **Price:** $5/month, which includes $5 of usage. Anything above that is billed by use: RAM $10 per GB-month, CPU $20 per vCPU-month, disk $0.15 per GB-month, egress $0.05 per GB.
- **Estimated bill:** about **$8–15/month**, most likely around $10. This assumes roughly 0.5 GB for the site, 0.15 GB for the database, very low CPU and a few GB of traffic.
- **Backups:** Railway's built-in scheduled volume backups (daily kept 6 days, weekly kept 27 days, monthly kept 89 days), billed like disk. We add a weekly off-platform `pg_dump` copy to R2.
- **Pros:**
  - Least upkeep: no operating system to patch, and HTTPS is automatic.
  - A single long-running server is exactly what the code assumes. The order rate limiter, cache and instant content updates work unchanged.
  - The Amsterdam region is close to Skopje.
- **Cons:**
  - The bill is usage-based, so it is not perfectly fixed. A usage limit can be set in the dashboard.
  - Hobby allows a 5 GB disk (the database needs far less) and 2 custom domains (`invento.mk` + `www.invento.mk`, exactly 2).
  - The database is a single node, with no automatic failover.
  - Railway describes Hobby as "for … personal projects". Its terms do not forbid a small business, but Pro ($20/month) is the safe upgrade if that ever matters.
- **To check at setup:** Railway's docs do not say whether disks (volumes) are offered in Amsterdam. If they are not, the database goes to **Neon** (Frankfurt, free plan) instead, and the site stays on Railway.

### B. A small virtual server (DigitalOcean, Frankfurt), self-managed

The site, PostgreSQL and a web server for HTTPS run in Docker on one machine. The site is built by GitHub Actions and pulled onto the server.

- **Price:** fixed. The 2 GB / 1 vCPU / 50 GB droplet is $12/month, and weekly backups add 20% ($2.40). **Total about $14.40/month.**
- **Pros:**
  - A fully predictable bill and full control.
  - The same single-server model as A, so no code changes.
- **Cons:**
  - Someone has to keep the server patched, watch disk space and handle failures. That is the most upkeep of the three, and not suited to a non-technical owner.
- **Why not Hetzner** (normally the cheapest at about €6/month): Hetzner has restricted new cloud servers since June 2026 ("Limited availability of cloud instances" on its status page). Its cheap plans are listed as unavailable today.

### C. Vercel Pro + Neon PostgreSQL (serverless)

The site runs as serverless functions on Vercel's global network. The database is Neon, in Frankfurt.

- **Price:** Vercel Pro is $20/month per developer seat and includes $20 of usage. Neon Free costs $0 (1 GB storage, scales to zero after 5 minutes) or Launch is pay-as-you-go ($0.106 per compute-hour, no minimum). **Total about $20–25/month.**
- **Vercel's free Hobby plan is not allowed for this site.** Vercel's terms say Hobby is "only … for your personal or non-commercial use".
- **Pros:**
  - The fastest pages worldwide.
  - Nothing to maintain.
- **Cons:**
  - The most expensive option.
  - The first request after a quiet period is slower, while the database wakes up.
  - Needs code changes:
    - The order rate limiter must move to the database, because serverless runs many copies of the site.
    - Admin photo uploads over 4.5 MB must go straight to R2.
  - Neon Free keeps only 6 hours of restore history, so our own backups would carry the weight.

## Side by side

| | A. Railway | B. DigitalOcean server | C. Vercel + Neon |
|---|---|---|---|
| Monthly cost | ~$8–15 (usage-based) | ~$14.40 (fixed) | ~$20–25 |
| Upkeep for the owner | Very low | High (server admin) | Very low |
| Code changes needed | None | None (Docker setup only) | Rate limiter, uploads |
| Server location | Amsterdam | Frankfurt | Global edge + Frankfurt DB |
| Backups | Built-in + weekly copy to R2 | Weekly snapshots + nightly copy to R2 | Own nightly copy to R2 |
| Commercial use | Not forbidden; Pro if needed | Yes | Only on Pro (Hobby forbids it) |

Shared extras: domain about 700–900 MKD a year. R2, Resend, DNS and the uptime check are free at this size.

## Recommendation

**Option A, Railway Hobby in EU West, with Cloudflare R2, Resend Free and a `.mk` domain.**

- **Expected cost:** about **$10 a month** plus **about 900 MKD a year** for the domain.
- **Why:**
  - It is the lowest-upkeep option at the lowest price.
  - It matches how the code already works.
  - It can be moved to B or C later without rewriting anything, because the code stays host-agnostic.

## What the owner needs to do or decide (Gate 3)

1. **Approve an option** (A, B or C) and the monthly cost.
2. **Choose the domain name**, e.g. `invento.mk`. Check that it is free and register it with a local registrar. The registrar asks for the business details.
3. **Create the accounts in the owner's name**, so they stay yours (I cannot create accounts or enter payment details):
   - the host (Railway for A),
   - Cloudflare (DNS + R2),
   - Resend.

   Then invite the developer, or create API keys and paste them into the host's environment settings. Never paste them into chat or the repo.
4. **Point the domain's nameservers to Cloudflare** (the registrar's control panel). I will give exact values at that step.
5. **Confirm the order inbox** (`ORDER_NOTIFY_EMAIL`) and the sender address, e.g. `porachki@invento.mk`.

After approval I will:
- set up production (migrations, R2, email domain, HTTPS),
- run a test order end to end,
- configure backups and test one restore,
- write `docs/RUNBOOK.md` and the bilingual `docs/OWNER-GUIDE.md`.

## Sources (read 2026-11-26)

- Railway: [railway.com/pricing](https://railway.com/pricing), [plans](https://docs.railway.com/pricing/plans), [backups](https://docs.railway.com/reference/backups), [regions](https://docs.railway.com/deployments/regions)
- DigitalOcean: [droplet pricing](https://www.digitalocean.com/pricing/droplets)
- Hetzner: [cloud](https://www.hetzner.com/cloud), [status: limited availability](https://status.hetzner.com/incident/0a75c7ae-3377-41dc-aabe-601063724d24)
- Vercel: [pricing](https://vercel.com/pricing), [terms (Hobby plan)](https://vercel.com/legal/terms)
- Neon: [pricing](https://neon.com/pricing)
- Cloudflare R2: [pricing](https://developers.cloudflare.com/r2/pricing/)
- Resend: [pricing](https://resend.com/pricing)
- `.mk` domain: [Max Hosting prices](https://maxhosting.mk/en/domains/), [registration requirements](https://maxhosting.mk/en/register-mk-domain/)
