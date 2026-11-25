import config from '@payload-config'
import { getPayload } from 'payload'
import { z } from 'zod'

import { checkFormToken, clientIp, rateLimit, verifyTurnstile } from '@/lib/antispam'

export const dynamic = 'force-dynamic'

const contactSchema = z.object({
  name: z.string().trim().min(2, { error: 'tooShort' }).max(120, { error: 'tooLong' }),
  contact: z.string().trim().min(3, { error: 'required' }).max(160, { error: 'tooLong' }),
  message: z.string().trim().min(5, { error: 'tooShort' }).max(2000, { error: 'tooLong' }),
  website: z.string().max(200).optional().default(''),
  formToken: z.string().max(200).optional().default(''),
  turnstileToken: z.string().max(4096).optional().default(''),
})

const json = (status: number, body: unknown) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/** Contact form: emails the owner directly. Nothing is stored. Same anti-spam as the order route. */
export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > 8 * 1024) return json(413, { code: 'too_large' })
  const ip = clientIp(request.headers)
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) return json(429, { code: 'rate_limited' })

  let raw: unknown
  try {
    raw = JSON.parse(await request.text())
  } catch {
    return json(400, { code: 'bad_request' })
  }
  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const i of parsed.error.issues) fields[String(i.path[0])] ??= i.message
    return json(400, { code: 'validation', fields })
  }
  const d = parsed.data
  if (d.website || checkFormToken(d.formToken) !== 'ok') return json(400, { code: 'spam' })
  if (!(await verifyTurnstile(d.turnstileToken, ip))) return json(400, { code: 'captcha' })

  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const to = process.env.ORDER_NOTIFY_EMAIL || settings.email
  if (!to) {
    payload.logger.warn({ msg: 'contact form: no recipient configured (ORDER_NOTIFY_EMAIL / settings email)' })
    return json(503, { code: 'server' })
  }
  try {
    await payload.sendEmail({
      to,
      subject: `Порака од страницата / Website message: ${d.name}`,
      text: `Име / Name: ${d.name}\nКонтакт / Contact: ${d.contact}\n\n${d.message}`,
    })
  } catch (err) {
    payload.logger.error({ msg: 'contact email failed', err: (err as Error).message })
    return json(500, { code: 'server' })
  }
  return json(200, { ok: true })
}
