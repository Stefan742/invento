import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, Endpoint } from 'payload'

import { isAdminUser } from '../access'
import { revalidateTags } from './revalidate'
import { lockKit } from '../lib/db'
import { sendOwnerNotification } from '../lib/email'
import { restoreQuantities } from '../lib/order'
import type { Order } from '../payload-types'

export const ANONYMIZED = 'ANONYMIZED'

/**
 * On status → cancelled: put the pieces back into stock, ONCE (guarded by `stockRestored`).
 * Runs inside the admin save transaction and locks the kit rows like the order route does.
 * Stock is never pushed above the batch size.
 */
export const restoreStockOnCancel: CollectionBeforeChangeHook<Order> = async ({ data, originalDoc, operation, req }) => {
  if (operation !== 'update' || !originalDoc) return data
  const becomesCancelled = data.status === 'cancelled' && originalDoc.status !== 'cancelled'
  if (!becomesCancelled || originalDoc.stockRestored) return data

  for (const line of restoreQuantities(originalDoc.items)) {
    if (!(await lockKit(req.payload, req, line.kitId))) continue
    const kit = await req.payload.findByID({ collection: 'kits', id: line.kitId, depth: 0, draft: false, req })
    if (typeof kit.stockTotal !== 'number') continue
    const current = typeof kit.stockRemaining === 'number' ? kit.stockRemaining : 0
    await req.payload.update({
      collection: 'kits',
      id: kit.id,
      data: { stockRemaining: Math.min(kit.stockTotal, current + line.quantity) },
      req,
    })
  }
  await revalidateTags(['kits'])
  return { ...data, stockRestored: true }
}

/** One-way anonymisation of personal fields (privacy requests). The order, items and totals stay. */
export const anonymizeOrder: CollectionBeforeChangeHook<Order> = async ({ data }) => {
  if (!data.anonymizeNow) return data
  return {
    ...data,
    customerName: ANONYMIZED,
    phone: ANONYMIZED,
    email: null,
    city: ANONYMIZED,
    address: ANONYMIZED,
    notes: null,
    internalNotes: null,
    anonymizeNow: false,
    anonymizedAt: new Date().toISOString(),
  }
}

/** Owner email for orders created anywhere except the order route (which sends after commit). */
export const notifyOnCreate: CollectionAfterChangeHook<Order> = async ({ doc, operation, req }) => {
  if (operation !== 'create' || (req.context as { deferNotify?: boolean })?.deferNotify) return doc
  try {
    await sendOwnerNotification(req.payload, doc)
  } catch (err) {
    req.payload.logger.error({ msg: 'owner notification failed', ref: doc.ref, err: (err as Error).message })
  }
  return doc
}

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  // Quote everything; neutralise spreadsheet formulas. E.164 phone numbers (+389…) are safe as they are.
  const safe = /^\+\d{6,15}$/.test(s) || !/^[=+\-@\t\r]/.test(s) ? s : `'${s}`
  return `"${safe.replace(/"/g, '""')}"`
}

/** GET /api/orders/export.csv: all orders as CSV for the accountant (admin only). */
export const exportOrdersCsv: Endpoint = {
  path: '/export.csv',
  method: 'get',
  handler: async (req) => {
    if (!isAdminUser(req.user as { roles?: string[] } | null)) {
      return Response.json({ message: 'Forbidden' }, { status: 403 })
    }
    const res = await req.payload.find({ collection: 'orders', limit: 10000, depth: 0, sort: '-createdAt', req })
    const header = ['ref', 'createdAt', 'status', 'customerName', 'phone', 'email', 'city', 'address', 'items', 'subtotal', 'shippingFee', 'total', 'paymentMethod', 'notes']
    const rows = res.docs.map((o) => [
      o.ref,
      o.createdAt,
      o.status,
      o.customerName,
      o.phone,
      o.email,
      o.city,
      o.address,
      (o.items ?? []).map((i) => `${i.titleSnapshot} x${i.quantity}${typeof i.priceSnapshot === 'number' ? ` @${i.priceSnapshot}` : ''}`).join('; '),
      o.subtotal,
      o.shippingFee,
      o.total,
      o.paymentMethod,
      o.notes,
    ])
    const csv = '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
    const date = new Date().toISOString().slice(0, 10)
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="invento-orders-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  },
}
