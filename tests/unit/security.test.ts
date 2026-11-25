import { describe, expect, it } from 'vitest'

import { analyticsConfig } from '@/lib/analytics'
import { buildCsp, createNonce } from '@/lib/csp'

describe('CSP', () => {
  const csp = buildCsp('abc123')
  it('is nonce-based and strict for scripts', () => {
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'")
    expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/)
    expect(csp).not.toContain("'unsafe-eval'")
  })
  it('blocks plugins, base hijacking, foreign framing and form posts', () => {
    for (const d of ["object-src 'none'", "base-uri 'self'", "frame-ancestors 'self'", "form-action 'self'"]) {
      expect(csp).toContain(d)
    }
  })
  it('only relaxes eval and websockets in development', () => {
    const dev = buildCsp('n', { dev: true })
    expect(dev).toContain("'unsafe-eval'")
    expect(dev).toContain('ws:')
  })
  it('upgrades insecure requests only on https', () => {
    expect(buildCsp('n', { https: true })).toContain('upgrade-insecure-requests')
    expect(csp).not.toContain('upgrade-insecure-requests')
  })
  it('nonces are random and base64', () => {
    const a = createNonce()
    const b = createNonce()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^[A-Za-z0-9+/]+=*$/)
  })
})

describe('analytics', () => {
  it('is off unless a provider and id are configured', () => {
    expect(analyticsConfig({})).toBeNull()
    expect(analyticsConfig({ NEXT_PUBLIC_ANALYTICS_PROVIDER: 'umami' })).toBeNull()
  })
  it('builds the Cloudflare beacon with its reporting origin', () => {
    const c = analyticsConfig({ NEXT_PUBLIC_ANALYTICS_PROVIDER: 'cloudflare', NEXT_PUBLIC_ANALYTICS_ID: 'tok' })!
    expect(c.attrs['data-cf-beacon']).toBe('{"token":"tok"}')
    expect(c.origins).toEqual(['https://static.cloudflareinsights.com', 'https://cloudflareinsights.com'])
  })
  it('supports Umami and Plausible, including a self-hosted script URL', () => {
    expect(analyticsConfig({ NEXT_PUBLIC_ANALYTICS_PROVIDER: 'plausible', NEXT_PUBLIC_ANALYTICS_ID: 'invento.mk' })!.attrs).toEqual({
      'data-domain': 'invento.mk',
    })
    const u = analyticsConfig({
      NEXT_PUBLIC_ANALYTICS_PROVIDER: 'umami',
      NEXT_PUBLIC_ANALYTICS_ID: 'site-1',
      NEXT_PUBLIC_ANALYTICS_SRC: 'https://stats.example.com/script.js',
    })!
    expect(u.origins).toEqual(['https://stats.example.com'])
  })
})
