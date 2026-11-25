import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { adminOnly, isAdminUser, isPublishedOrAdmin, publishedOrAdmin } from '@/access'
import { validateBuildPublish } from '@/collections/Builds'
import { Kits } from '@/collections/Kits'
import { Orders } from '@/collections/Orders'
import { Users } from '@/collections/Users'

const req = (user: unknown) => ({ req: { user } as unknown as PayloadRequest }) as never
const admin = { id: 1, roles: ['admin'] }

describe('isAdminUser', () => {
  it('only accepts users with the admin role', () => {
    expect(isAdminUser(admin)).toBe(true)
    expect(isAdminUser({ roles: [] })).toBe(false)
    expect(isAdminUser({})).toBe(false)
    expect(isAdminUser(null)).toBe(false)
  })
})

describe('public read rules', () => {
  it('drafts collections: public sees published only, admin sees all', () => {
    expect(publishedOrAdmin(req(null))).toEqual({ _status: { equals: 'published' } })
    expect(publishedOrAdmin(req(admin))).toBe(true)
  })

  it('isPublished collections: public sees published only', () => {
    expect(isPublishedOrAdmin(req(null))).toEqual({ isPublished: { equals: true } })
    expect(isPublishedOrAdmin(req(admin))).toBe(true)
  })
})

describe('orders and users are closed to the public', () => {
  for (const [name, access] of [
    ['orders', Orders.access],
    ['users', Users.access],
  ] as const) {
    it(`${name}: every operation is denied without an admin`, () => {
      for (const op of ['create', 'read', 'update', 'delete'] as const) {
        const fn = access?.[op] as ((a: never) => unknown) | undefined
        expect(fn, `${name}.${op} must be defined`).toBeTypeOf('function')
        expect(fn!(req(null))).toBe(false)
        expect(fn!(req(admin))).toBe(true)
      }
    })
  }

  it('orders use the shared admin-only rules', () => {
    expect(Orders.access).toBe(adminOnly)
  })

  it('public cannot write kits', () => {
    for (const op of ['create', 'update', 'delete'] as const) {
      expect((Kits.access?.[op] as (a: never) => unknown)(req(null))).toBe(false)
    }
  })
})

describe('builds consent', () => {
  it('cannot be published without consent', () => {
    expect(validateBuildPublish(true, false)).toMatch(/consent/i)
    expect(validateBuildPublish(true, undefined)).toMatch(/consent/i)
  })
  it('can be published with consent, or saved unpublished without it', () => {
    expect(validateBuildPublish(true, true)).toBe(true)
    expect(validateBuildPublish(false, false)).toBe(true)
  })
})
