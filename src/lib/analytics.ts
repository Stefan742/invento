/**
 * Optional cookieless analytics (M5 proposal, docs/ANALYTICS.md). OFF unless configured.
 * The owner picks a provider; set these at build time:
 *   NEXT_PUBLIC_ANALYTICS_PROVIDER = cloudflare | umami | plausible
 *   NEXT_PUBLIC_ANALYTICS_ID       = Cloudflare beacon token | Umami website id | Plausible domain
 *   NEXT_PUBLIC_ANALYTICS_SRC      = optional script URL override (e.g. self-hosted Umami)
 * The CSP automatically allows the chosen provider's script and reporting origins.
 */
export type AnalyticsConfig = {
  provider: 'cloudflare' | 'umami' | 'plausible'
  src: string
  attrs: Record<string, string>
  origins: string[]
}

export function analyticsConfig(env: Record<string, string | undefined> = process.env): AnalyticsConfig | null {
  const provider = env.NEXT_PUBLIC_ANALYTICS_PROVIDER
  const id = env.NEXT_PUBLIC_ANALYTICS_ID
  if (!provider || !id) return null
  const origin = (u: string) => new URL(u).origin
  if (provider === 'cloudflare') {
    const src = env.NEXT_PUBLIC_ANALYTICS_SRC || 'https://static.cloudflareinsights.com/beacon.min.js'
    return {
      provider,
      src,
      attrs: { 'data-cf-beacon': JSON.stringify({ token: id }) },
      origins: [origin(src), 'https://cloudflareinsights.com'],
    }
  }
  if (provider === 'umami') {
    const src = env.NEXT_PUBLIC_ANALYTICS_SRC || 'https://cloud.umami.is/script.js'
    return { provider, src, attrs: { 'data-website-id': id }, origins: [origin(src)] }
  }
  if (provider === 'plausible') {
    const src = env.NEXT_PUBLIC_ANALYTICS_SRC || 'https://plausible.io/js/script.js'
    return { provider, src, attrs: { 'data-domain': id }, origins: [origin(src)] }
  }
  return null
}
