import 'server-only'

import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Signed form token: proves the form was rendered by us, and lets the server enforce a
 * minimum time-to-submit (bots submit instantly) without trusting the client clock.
 */
const MIN_MS = 3_000
const MAX_MS = 6 * 60 * 60 * 1000

function sign(ts: string) {
  return createHmac('sha256', process.env.PAYLOAD_SECRET || 'dev').update(`order-form:${ts}`).digest('base64url')
}

export function issueFormToken(now = Date.now()): string {
  const ts = String(now)
  return `${ts}.${sign(ts)}`
}

export type TokenCheck = 'ok' | 'invalid' | 'too_fast' | 'expired'

export function checkFormToken(token: string, now = Date.now(), minMs = MIN_MS): TokenCheck {
  const [ts, sig] = token.split('.')
  if (!ts || !sig || !/^\d+$/.test(ts)) return 'invalid'
  const expected = Buffer.from(sign(ts))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'invalid'
  const age = now - Number(ts)
  if (age < minMs) return 'too_fast'
  if (age > MAX_MS) return 'expired'
  return 'ok'
}

/**
 * Fixed-window per-key rate limiter (in memory, per server instance).
 * Enough for a single small server; see DECISIONS.md for the multi-instance note.
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const b = buckets.get(key)
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
    }
    return true
  }
  b.count += 1
  return b.count <= limit
}

/** Client IP from the first X-Forwarded-For hop (set by the hosting proxy), else X-Real-IP. */
export function clientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim().slice(0, 64)
  return (headers.get('x-real-ip') || 'unknown').slice(0, 64)
}

/** Optional Cloudflare Turnstile verification; skipped when no secret is configured. */
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip })
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
