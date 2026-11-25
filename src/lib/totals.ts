/**
 * Order totals, kept dependency-free: the cart drawer (on every page) imports this,
 * and must not pull in Zod or libphonenumber.
 */
export type PricedLine = { price: number | null | undefined; quantity: number }

/**
 * Totals with unknown prices (docs/06): if any line price is empty, subtotal and total are null
 * and the UI says the total is confirmed on Viber. A null shipping fee makes the total null too.
 */
export function computeTotals(lines: PricedLine[], shippingFee: number | null | undefined) {
  const known = lines.length > 0 && lines.every((l) => typeof l.price === 'number')
  const subtotal = known ? lines.reduce((sum, l) => sum + (l.price as number) * l.quantity, 0) : null
  const fee = typeof shippingFee === 'number' ? shippingFee : null
  const total = subtotal !== null && fee !== null ? subtotal + fee : null
  return { subtotal, shippingFee: fee, total }
}
