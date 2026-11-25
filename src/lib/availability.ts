export type Availability = 'available' | 'sold_out' | 'coming_soon'

export type StockInfo = {
  comingSoon?: boolean | null
  stockTotal?: number | null
  stockRemaining?: number | null
}

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)

/**
 * Derived availability (docs/03):
 * - `coming_soon` if comingSoon
 * - `sold_out` if stockTotal is set and stockRemaining <= 0 (missing remaining counts as 0)
 * - otherwise `available` (kits without stockTotal are available with no stock bar)
 */
export function getAvailability(kit: StockInfo): Availability {
  if (kit.comingSoon) return 'coming_soon'
  if (isNum(kit.stockTotal)) {
    const remaining = isNum(kit.stockRemaining) ? kit.stockRemaining : 0
    if (remaining <= 0) return 'sold_out'
  }
  return 'available'
}

/** Stock bar data, or null when the kit does not track stock. */
export function getStockBar(kit: StockInfo): { remaining: number; total: number; ratio: number } | null {
  if (!isNum(kit.stockTotal) || kit.stockTotal <= 0) return null
  const remaining = Math.max(0, Math.min(kit.stockTotal, isNum(kit.stockRemaining) ? kit.stockRemaining : 0))
  return { remaining, total: kit.stockTotal, ratio: remaining / kit.stockTotal }
}

export const isOrderable = (kit: StockInfo, ordersOpen: boolean) =>
  ordersOpen && getAvailability(kit) === 'available'
