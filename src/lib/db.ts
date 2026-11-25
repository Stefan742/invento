import { sql } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'

type Executor = { execute: (q: ReturnType<typeof sql>) => Promise<{ rows: Record<string, unknown>[] }> }

/** The Drizzle handle for the request's open transaction (same lookup Payload's adapter uses). */
export async function txFor(payload: Payload, req: Partial<PayloadRequest>): Promise<Executor> {
  const adapter = payload.db as unknown as { drizzle: Executor; sessions?: Record<string, { db: Executor }> }
  const id = req.transactionID ? await req.transactionID : undefined
  return (id && adapter.sessions?.[String(id)]?.db) || adapter.drizzle
}

/**
 * Lock a kit row until the transaction ends, so two simultaneous orders (or an order and a
 * cancellation) cannot read the same stock value. Returns false if the kit does not exist.
 */
export async function lockKit(payload: Payload, req: Partial<PayloadRequest>, kitId: number): Promise<boolean> {
  const tx = await txFor(payload, req)
  const res = await tx.execute(sql`select id from kits where id = ${kitId} for update`)
  return res.rows.length > 0
}

let sequenceReady = false

/** Next order number from a PostgreSQL sequence: atomic and never reused (gaps are fine). */
export async function nextOrderNumber(payload: Payload, req: Partial<PayloadRequest>): Promise<number> {
  const tx = await txFor(payload, req)
  if (!sequenceReady) {
    // Created by migration in production; dev uses schema push, so make sure it exists.
    await tx.execute(sql`create sequence if not exists order_ref_seq start 1`)
    sequenceReady = true
  }
  const res = await tx.execute(sql`select nextval('order_ref_seq') as n`)
  return Number(res.rows[0].n)
}
