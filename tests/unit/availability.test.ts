import { describe, expect, it } from 'vitest'

import { getAvailability, getStockBar, isOrderable } from '@/lib/availability'

describe('getAvailability', () => {
  it('is coming_soon when flagged, whatever the stock', () => {
    expect(getAvailability({ comingSoon: true, stockTotal: 10, stockRemaining: 5 })).toBe('coming_soon')
    expect(getAvailability({ comingSoon: true, stockTotal: 10, stockRemaining: 0 })).toBe('coming_soon')
  })

  it('is sold_out when stock is tracked and nothing remains', () => {
    expect(getAvailability({ stockTotal: 20, stockRemaining: 0 })).toBe('sold_out')
    expect(getAvailability({ stockTotal: 20, stockRemaining: -1 })).toBe('sold_out')
    expect(getAvailability({ stockTotal: 20, stockRemaining: null })).toBe('sold_out')
  })

  it('is available when stock remains', () => {
    expect(getAvailability({ stockTotal: 20, stockRemaining: 1 })).toBe('available')
  })

  it('treats kits without stockTotal as available (no stock tracking)', () => {
    expect(getAvailability({})).toBe('available')
    expect(getAvailability({ stockTotal: null, stockRemaining: 0 })).toBe('available')
  })
})

describe('getStockBar', () => {
  it('returns null without stockTotal', () => {
    expect(getStockBar({})).toBeNull()
    expect(getStockBar({ stockTotal: 0 })).toBeNull()
  })

  it('clamps remaining into 0..total', () => {
    expect(getStockBar({ stockTotal: 20, stockRemaining: 14 })).toEqual({ remaining: 14, total: 20, ratio: 0.7 })
    expect(getStockBar({ stockTotal: 20, stockRemaining: 99 })?.remaining).toBe(20)
    expect(getStockBar({ stockTotal: 20, stockRemaining: -3 })?.remaining).toBe(0)
  })
})

describe('isOrderable', () => {
  it('requires orders open and the kit available', () => {
    expect(isOrderable({}, true)).toBe(true)
    expect(isOrderable({}, false)).toBe(false)
    expect(isOrderable({ comingSoon: true }, true)).toBe(false)
    expect(isOrderable({ stockTotal: 5, stockRemaining: 0 }, true)).toBe(false)
  })
})
