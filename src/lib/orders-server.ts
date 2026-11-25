import 'server-only'

import { randomBytes } from 'crypto'
import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type Payload,
} from 'payload'

import { revalidateTags } from '@/hooks/revalidate'
import type { Order } from '@/payload-types'

import { lockKit, nextOrderNumber } from './db'
import { sendCustomerConfirmation, sendOwnerNotification } from './email'
import { checkStock, computeTotals, formatOrderRef, mergeLines, normalisePhone, type OrderData } from './order'
import { showPlaceholders } from './placeholders'

export type CreateOrderResult =
  | { ok: true; token: string; ref: string }
  | { ok: false; status: number; code: 'paused' | 'stock' | 'unavailable' | 'server'; kits?: string[] }

const ctx = { disableRevalidate: true, deferNotify: true }

class LineError extends Error {
  constructor(
    public code: 'stock' | 'unavailable',
    public kits: string[],
  ) {
    super(code)
  }
}

/**
 * Create an order inside ONE database transaction:
 * lock each kit row → check availability and stock → decrement stock → take the next
 * order number → create the order. Any failure rolls everything back, so two simultaneous
 * orders can never oversell a batch.
 */
export async function createOrder(payload: Payload, data: OrderData): Promise<CreateOrderResult> {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (settings.ordersOpen === false) return { ok: false, status: 403, code: 'paused' }

  const req = await createLocalReq({ context: ctx, locale: data.locale }, payload)
  await initTransaction(req)

  try {
    const lines = mergeLines(data.items)
    const snapshots: { kit: number; titleSnapshot: string; priceSnapshot: number | null; quantity: number }[] = []
    const stockProblems: string[] = []
    const unavailable: string[] = []
    const allowPlaceholders = showPlaceholders()
    const max = settings.maxQuantityPerLine ?? 5

    for (const line of lines) {
      // Lines are sorted by kit id, so concurrent orders lock rows in the same order (no deadlocks).
      const exists = await lockKit(payload, req, line.kitId)
      if (!exists) {
        unavailable.push(`#${line.kitId}`)
        continue
      }
      const kit = await payload.findByID({
        collection: 'kits',
        id: line.kitId,
        locale: data.locale,
        depth: 0,
        draft: false,
        req,
      })
      const title = kit.title || `#${kit.id}`
      if (kit._status !== 'published' || kit.comingSoon || (kit.isPlaceholder && !allowPlaceholders) || line.quantity > max) {
        unavailable.push(title)
        continue
      }
      const stock = checkStock(kit.stockTotal, kit.stockRemaining, line.quantity)
      if (!stock.ok) {
        stockProblems.push(title)
        continue
      }
      if (stock.remainingAfter !== null) {
        await payload.update({
          collection: 'kits',
          id: kit.id,
          data: { stockRemaining: stock.remainingAfter },
          locale: data.locale,
          req,
        })
      }
      snapshots.push({
        kit: kit.id,
        titleSnapshot: title,
        priceSnapshot: typeof kit.priceMKD === 'number' ? kit.priceMKD : null,
        quantity: line.quantity,
      })
    }

    if (unavailable.length) throw new LineError('unavailable', unavailable)
    if (stockProblems.length) throw new LineError('stock', stockProblems)

    const totals = computeTotals(
      snapshots.map((s) => ({ price: s.priceSnapshot, quantity: s.quantity })),
      settings.shippingFlatFee,
    )
    const ref = formatOrderRef(await nextOrderNumber(payload, req))
    const token = randomBytes(24).toString('base64url')

    const order = (await payload.create({
      collection: 'orders',
      data: {
        ref,
        publicToken: token,
        status: 'new',
        customerName: data.customerName,
        phone: normalisePhone(data.phone) ?? data.phone,
        email: data.email || null,
        city: data.city,
        address: data.address,
        notes: data.notes || null,
        preferredContact: data.preferredContact,
        locale: data.locale,
        items: snapshots,
        ...totals,
        paymentMethod: 'cash_on_delivery',
        privacyConsent: true,
      },
      req,
    })) as Order

    await commitTransaction(req)

    // After commit: refresh the public stock numbers and send emails (failures never undo an order).
    await revalidateTags(['kits'])
    await notify(payload, order, settings.orderSuccessNote, order.locale === 'en' ? 'en' : 'mk')
    return { ok: true, token, ref }
  } catch (err) {
    await killTransaction(req)
    if (err instanceof LineError) return { ok: false, status: 409, code: err.code, kits: err.kits }
    // Never log personal data: only the error itself.
    payload.logger.error({ msg: 'order creation failed', err: err instanceof Error ? err.message : String(err) })
    return { ok: false, status: 500, code: 'server' }
  }
}

async function notify(payload: Payload, order: Order, mkNote: string | null | undefined, locale: 'mk' | 'en') {
  try {
    await sendOwnerNotification(payload, order)
  } catch (err) {
    payload.logger.error({ msg: 'owner notification failed', ref: order.ref, err: (err as Error).message })
  }
  try {
    let note = mkNote
    if (locale === 'en') {
      const en = await payload.findGlobal({ slug: 'site-settings', locale: 'en', depth: 0 })
      note = en.orderSuccessNote
    }
    await sendCustomerConfirmation(payload, order, note)
  } catch (err) {
    payload.logger.error({ msg: 'customer confirmation failed', ref: order.ref, err: (err as Error).message })
  }
}

/** Non-personal view of an order for the public success page. */
export async function getOrderByToken(payload: Payload, token: string) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null
  const res = await payload.find({
    collection: 'orders',
    where: { publicToken: { equals: token } },
    limit: 1,
    depth: 0,
    select: { ref: true, items: true, subtotal: true, shippingFee: true, total: true, locale: true, status: true },
  })
  const o = res.docs[0]
  if (!o) return null
  return {
    ref: o.ref as string,
    status: o.status,
    items: (o.items ?? []).map((i) => ({ title: i.titleSnapshot, quantity: i.quantity, price: i.priceSnapshot ?? null })),
    subtotal: o.subtotal ?? null,
    shippingFee: o.shippingFee ?? null,
    total: o.total ?? null,
  }
}
