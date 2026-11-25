import config from '@payload-config'
import { getPayload } from 'payload'

import { checkFormToken, clientIp, rateLimit, verifyTurnstile } from '@/lib/antispam'
import { orderSchema } from '@/lib/order'
import { createOrder } from '@/lib/orders-server'

export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 16 * 1024
const RATE_LIMIT = Number(process.env.ORDER_RATE_LIMIT || 5)
const RATE_WINDOW_MS = 10 * 60 * 1000

const json = (status: number, body: unknown) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/**
 * The ONLY way an order is created. Public users cannot write to Payload collections directly.
 * Order of checks: size → rate limit → JSON → schema → honeypot → form token → Turnstile → pause switch → transaction.
 */
export async function POST(request: Request) {
  const length = Number(request.headers.get('content-length') || 0)
  if (length > MAX_BODY_BYTES) return json(413, { code: 'too_large' })

  const ip = clientIp(request.headers)
  if (!rateLimit(`order:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) return json(429, { code: 'rate_limited' })

  let raw: unknown
  try {
    const text = await request.text()
    if (text.length > MAX_BODY_BYTES) return json(413, { code: 'too_large' })
    raw = JSON.parse(text)
  } catch {
    return json(400, { code: 'bad_request' })
  }

  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (settings.ordersOpen === false) return json(403, { code: 'paused' })

  const parsed = orderSchema(settings.maxQuantityPerLine ?? 5).safeParse(raw)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      fields[key] ??= issue.message
    }
    return json(400, { code: 'validation', fields })
  }
  const data = parsed.data

  // Honeypot: real people never see or fill the "website" field.
  if (data.website) return json(400, { code: 'spam' })

  const token = checkFormToken(data.formToken)
  if (token === 'expired') return json(400, { code: 'expired' })
  if (token !== 'ok') return json(400, { code: 'spam' })

  if (!(await verifyTurnstile(data.turnstileToken, ip))) return json(400, { code: 'captcha' })

  const result = await createOrder(payload, data)
  if (!result.ok) return json(result.status, { code: result.code, kits: result.kits })
  return json(201, { token: result.token, ref: result.ref })
}
