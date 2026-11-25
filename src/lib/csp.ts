/**
 * Content-Security-Policy for the public site (docs/07). Strict, nonce-based for scripts:
 * Next.js stamps the per-request nonce on its own scripts; our inline preloader script reads it
 * from the `x-nonce` request header. 'strict-dynamic' lets those trusted scripts load the
 * lazily imported chunks (GSAP, Matter.js, Turnstile).
 * Styles allow 'unsafe-inline' because React `style` attributes and animation libraries set
 * inline styles; that does not allow script execution.
 */
import { analyticsConfig } from './analytics'

export function buildCsp(nonce: string, { dev = false, https = false }: { dev?: boolean; https?: boolean } = {}) {
  const turnstile = 'https://challenges.cloudflare.com'
  const analytics = analyticsConfig()?.origins ?? []
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", turnstile, ...analytics, ...(dev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', ...(process.env.NEXT_PUBLIC_MEDIA_HOST ? [process.env.NEXT_PUBLIC_MEDIA_HOST] : [])],
    'font-src': ["'self'"],
    'connect-src': ["'self'", turnstile, ...analytics, ...(dev ? ['ws:', 'wss:'] : [])],
    'frame-src': [turnstile],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
  }
  const parts = Object.entries(directives).map(([k, v]) => `${k} ${v.join(' ')}`)
  if (https) parts.push('upgrade-insecure-requests')
  return parts.join('; ')
}

/** 16 random bytes, base64: a fresh nonce for every request. */
export function createNonce() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}
