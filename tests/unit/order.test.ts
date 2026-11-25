import { describe, expect, it } from 'vitest'

import { checkFormToken, issueFormToken, rateLimit } from '@/lib/antispam'
import {
  checkStock,
  computeTotals,
  formatOrderRef,
  mergeLines,
  normalisePhone,
  orderSchema,
  orderSummaryText,
  restoreQuantities,
} from '@/lib/order'

const valid = {
  customerName: 'Ана Петрова',
  phone: '070 123 456',
  email: '',
  city: 'Скопје',
  address: 'ул. Пример 1',
  notes: '',
  preferredContact: 'viber',
  privacyConsent: true,
  locale: 'mk',
  items: [{ kitId: 1, quantity: 2 }],
}

describe('order schema', () => {
  it('accepts a valid order', () => {
    expect(orderSchema().safeParse(valid).success).toBe(true)
  })

  it('requires consent, name, phone, city, address', () => {
    const r = orderSchema().safeParse({ ...valid, privacyConsent: false, customerName: '', city: '', address: '', phone: '' })
    expect(r.success).toBe(false)
    const codes = Object.fromEntries((r.error?.issues ?? []).map((i) => [i.path[0], i.message]))
    expect(codes).toMatchObject({ privacyConsent: 'consent', customerName: 'tooShort', city: 'required', address: 'required', phone: 'required' })
  })

  it('rejects bad phone and email', () => {
    const r = orderSchema().safeParse({ ...valid, phone: 'call me', email: 'nope' })
    const codes = (r.error?.issues ?? []).map((i) => i.message)
    expect(codes).toContain('phone')
    expect(codes).toContain('email')
  })

  it('enforces max quantity per line and an empty cart', () => {
    expect(orderSchema(5).safeParse({ ...valid, items: [{ kitId: 1, quantity: 6 }] }).success).toBe(false)
    expect(orderSchema(5).safeParse({ ...valid, items: [] }).success).toBe(false)
    expect(orderSchema(10).safeParse({ ...valid, items: [{ kitId: 1, quantity: 6 }] }).success).toBe(true)
  })

  it('limits field lengths', () => {
    expect(orderSchema().safeParse({ ...valid, notes: 'x'.repeat(1001) }).success).toBe(false)
  })
})

describe('phone', () => {
  it('accepts Macedonian numbers leniently and normalises to E.164', () => {
    expect(normalisePhone('070 123 456')).toBe('+38970123456')
    expect(normalisePhone('+389 70 123 456')).toBe('+38970123456')
    expect(normalisePhone('070/123-456')).toBe('+38970123456')
  })
  it('rejects junk', () => {
    expect(normalisePhone('hello')).toBeNull()
    expect(normalisePhone('12')).toBeNull()
  })
})

describe('totals', () => {
  it('sums known prices and adds the shipping fee', () => {
    expect(computeTotals([{ price: 1500, quantity: 2 }, { price: 900, quantity: 1 }], 150)).toEqual({
      subtotal: 3900,
      shippingFee: 150,
      total: 4050,
    })
  })
  it('null price anywhere → subtotal and total null', () => {
    expect(computeTotals([{ price: 1500, quantity: 1 }, { price: null, quantity: 1 }], 150)).toEqual({
      subtotal: null,
      shippingFee: 150,
      total: null,
    })
  })
  it('unknown shipping fee → total null, subtotal kept', () => {
    expect(computeTotals([{ price: 1500, quantity: 1 }], null)).toEqual({ subtotal: 1500, shippingFee: null, total: null })
  })
})

describe('reference', () => {
  it('is INV- plus at least four digits', () => {
    expect(formatOrderRef(1)).toBe('INV-0001')
    expect(formatOrderRef(42)).toBe('INV-0042')
    expect(formatOrderRef(12345)).toBe('INV-12345')
  })
})

describe('stock', () => {
  it('untracked kits always pass', () => {
    expect(checkStock(null, null, 99)).toEqual({ ok: true, remainingAfter: null })
  })
  it('decrements when enough remains', () => {
    expect(checkStock(20, 14, 3)).toEqual({ ok: true, remainingAfter: 11 })
    expect(checkStock(20, 3, 3)).toEqual({ ok: true, remainingAfter: 0 })
  })
  it('rejects sold out and insufficient stock', () => {
    expect(checkStock(20, 0, 1)).toEqual({ ok: false, reason: 'sold_out' })
    expect(checkStock(20, null, 1)).toEqual({ ok: false, reason: 'sold_out' })
    expect(checkStock(20, 2, 3)).toEqual({ ok: false, reason: 'insufficient' })
  })
  it('merges duplicate lines before checking', () => {
    expect(mergeLines([{ kitId: 2, quantity: 1 }, { kitId: 1, quantity: 2 }, { kitId: 2, quantity: 3 }])).toEqual([
      { kitId: 1, quantity: 2 },
      { kitId: 2, quantity: 4 },
    ])
  })
  it('restores quantities per kit, ignoring lines without a kit', () => {
    expect(
      restoreQuantities([
        { kit: 1, quantity: 2 },
        { kit: { id: 1 }, quantity: 1 },
        { kit: null, quantity: 5 },
        { kit: 3, quantity: 1 },
      ]),
    ).toEqual([
      { kitId: 1, quantity: 3 },
      { kitId: 3, quantity: 1 },
    ])
  })
})

describe('summary text', () => {
  it('contains the ref and lines, no personal data', () => {
    const s = orderSummaryText('INV-0007', [{ title: 'Мини катапулта', quantity: 2 }], { order: 'Нарачка' })
    expect(s).toBe('Нарачка INV-0007\n• Мини катапулта × 2')
  })
})

describe('anti-spam', () => {
  it('form token: valid only after the minimum time and only with our signature', () => {
    const t0 = 1_000_000
    const token = issueFormToken(t0)
    expect(checkFormToken(token, t0 + 500)).toBe('too_fast')
    expect(checkFormToken(token, t0 + 5_000)).toBe('ok')
    expect(checkFormToken(token, t0 + 7 * 60 * 60 * 1000)).toBe('expired')
    expect(checkFormToken(token.replace(/.$/, 'x'), t0 + 5_000)).toBe('invalid')
    expect(checkFormToken('garbage', t0)).toBe('invalid')
  })
  it('rate limit allows N per window', () => {
    const key = `test-${Math.random()}`
    const now = 0
    for (let i = 0; i < 5; i++) expect(rateLimit(key, 5, 600_000, now)).toBe(true)
    expect(rateLimit(key, 5, 600_000, now)).toBe(false)
    expect(rateLimit(key, 5, 600_000, now + 600_001)).toBe(true)
  })
})
