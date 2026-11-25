/**
 * Pure order logic shared by the client form, the server route and the tests.
 * No database access here.
 */
import { parsePhoneNumberFromString } from 'libphonenumber-js/min'
import { z } from 'zod'

// Pure totals live in ./totals (no Zod / phone parsing) so the cart drawer stays light.
export { computeTotals, type PricedLine } from './totals'

export const MAX_LINES = 20
export const LIMITS = {
  name: 120,
  phone: 40,
  email: 160,
  city: 80,
  address: 200,
  notes: 1000,
} as const

/** Error codes; the UI maps each to a translated message (messages: order.errors.*). */
export type FieldError =
  | 'required'
  | 'tooLong'
  | 'tooShort'
  | 'phone'
  | 'email'
  | 'consent'
  | 'quantity'
  | 'cartEmpty'

/** Lenient phone check: anything libphonenumber considers a possible number (default region MK). */
export function normalisePhone(raw: string): string | null {
  const value = raw.trim()
  if (!/^[+\d\s().\-/]{6,40}$/.test(value)) return null
  const parsed = parsePhoneNumberFromString(value, 'MK')
  if (!parsed || !parsed.isPossible()) return null
  return parsed.number // E.164, e.g. +38970123456
}

const text = (max: number, min = 1) =>
  z
    .string({ error: 'required' })
    .trim()
    .min(min, { error: min > 1 ? 'tooShort' : 'required' })
    .max(max, { error: 'tooLong' })

export function orderSchema(maxQuantityPerLine = 5) {
  return z.object({
    customerName: text(LIMITS.name, 2),
    phone: z
      .string({ error: 'required' })
      .trim()
      .min(1, { error: 'required' })
      .max(LIMITS.phone, { error: 'tooLong' })
      .refine((v) => v === '' || normalisePhone(v) !== null, { error: 'phone' }),
    email: z
      .string()
      .trim()
      .max(LIMITS.email, { error: 'tooLong' })
      .refine((v) => v === '' || z.email().safeParse(v).success, { error: 'email' })
      .optional()
      .default(''),
    city: text(LIMITS.city),
    address: text(LIMITS.address),
    notes: z.string().trim().max(LIMITS.notes, { error: 'tooLong' }).optional().default(''),
    preferredContact: z.enum(['viber', 'phone', 'email']).default('viber'),
    privacyConsent: z.literal(true, { error: 'consent' }),
    locale: z.enum(['mk', 'en']).default('mk'),
    items: z
      .array(
        z.object({
          kitId: z.number().int().positive(),
          quantity: z
            .number()
            .int({ error: 'quantity' })
            .min(1, { error: 'quantity' })
            .max(maxQuantityPerLine, { error: 'quantity' }),
        }),
      )
      .min(1, { error: 'cartEmpty' })
      .max(MAX_LINES, { error: 'cartEmpty' }),
    // Anti-spam fields (not shown to people).
    website: z.string().max(200).optional().default(''), // honeypot: must stay empty
    formToken: z.string().max(200).optional().default(''),
    turnstileToken: z.string().max(4096).optional().default(''),
  })
}

export type OrderInput = z.input<ReturnType<typeof orderSchema>>
export type OrderData = z.output<ReturnType<typeof orderSchema>>

/** Customer fields only (the form validates these; items come from the cart). */
export function customerSchema() {
  return orderSchema().pick({
    customerName: true,
    phone: true,
    email: true,
    city: true,
    address: true,
    notes: true,
    preferredContact: true,
    privacyConsent: true,
  })
}

/** Merge duplicate kit lines so stock checks see the real quantity per kit. */
export function mergeLines(items: { kitId: number; quantity: number }[]) {
  const map = new Map<number, number>()
  for (const i of items) map.set(i.kitId, (map.get(i.kitId) ?? 0) + i.quantity)
  return [...map.entries()].map(([kitId, quantity]) => ({ kitId, quantity })).sort((a, b) => a.kitId - b.kitId)
}

export function formatOrderRef(n: number): string {
  return `INV-${String(n).padStart(4, '0')}`
}

export type StockCheck = { ok: true; remainingAfter: number | null } | { ok: false; reason: 'sold_out' | 'insufficient' }

/** Stock decision for one line. Kits without stockTotal are not tracked. */
export function checkStock(
  stockTotal: number | null | undefined,
  stockRemaining: number | null | undefined,
  quantity: number,
): StockCheck {
  if (typeof stockTotal !== 'number') return { ok: true, remainingAfter: null }
  const remaining = typeof stockRemaining === 'number' ? stockRemaining : 0
  if (remaining <= 0) return { ok: false, reason: 'sold_out' }
  if (remaining < quantity) return { ok: false, reason: 'insufficient' }
  return { ok: true, remainingAfter: remaining - quantity }
}

/** Stock to give back when an order is cancelled (once). Only lines linked to a kit. */
export function restoreQuantities(
  items: { kit?: number | { id: number } | null; quantity: number }[] | null | undefined,
): { kitId: number; quantity: number }[] {
  const lines = (items ?? [])
    .map((i) => ({ kitId: typeof i.kit === 'object' && i.kit ? i.kit.id : (i.kit as number | null | undefined), quantity: i.quantity }))
    .filter((l): l is { kitId: number; quantity: number } => typeof l.kitId === 'number' && l.quantity > 0)
  return mergeLines(lines)
}

/** Plain-text summary the customer can paste into Viber (no personal data). */
export function orderSummaryText(
  ref: string,
  lines: { title: string; quantity: number }[],
  labels: { order: string; total?: string | null },
): string {
  return [`${labels.order} ${ref}`, ...lines.map((l) => `• ${l.title} × ${l.quantity}`), labels.total ?? '']
    .filter(Boolean)
    .join('\n')
}
