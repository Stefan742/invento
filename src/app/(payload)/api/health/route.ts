import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

/** Uptime check: 200 when the database answers, 503 otherwise. Leaks no details. */
export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.db.drizzle.execute(sql`select 1`)
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
