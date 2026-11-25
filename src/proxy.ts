import { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'
import { buildCsp, createNonce } from './lib/csp'

const intl = createMiddleware(routing)

/**
 * 1. Locale routing (next-intl): `/` → `/mk` or `/en`.
 * 2. Per-request CSP nonce. The nonce and policy are added to the *request* headers before
 *    next-intl runs; next-intl forwards request headers via NextResponse.next({ request }),
 *    so Next.js can nonce its own scripts and the layout can read `x-nonce`.
 */
export default function proxy(request: NextRequest) {
  const nonce = createNonce()
  const csp = buildCsp(nonce, {
    dev: process.env.NODE_ENV !== 'production',
    https: (process.env.NEXT_PUBLIC_SITE_URL || '').startsWith('https://'),
  })
  const headers = new Headers(request.headers)
  headers.set('x-nonce', nonce)
  headers.set('content-security-policy', csp)
  const forwarded = new NextRequest(request, { headers })

  const response = intl(forwarded)
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  // Everything except the Payload admin, API routes, Next internals and files with an extension.
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
