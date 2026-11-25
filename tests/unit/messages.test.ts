import { describe, expect, it } from 'vitest'

import en from '@/i18n/messages/en.json'
import mk from '@/i18n/messages/mk.json'

const keys = (o: unknown, p = ''): string[] =>
  o && typeof o === 'object' && !Array.isArray(o)
    ? Object.entries(o).flatMap(([k, v]) => keys(v, `${p}${k}.`))
    : [p.slice(0, -1)]

describe('UI strings', () => {
  it('every key exists in both mk and en', () => {
    expect(keys(en).sort()).toEqual(keys(mk).sort())
  })
  it('no empty strings', () => {
    for (const [name, m] of [['mk', mk], ['en', en]] as const) {
      const empty = keys(m).filter((k) => k.split('.').reduce<unknown>((o, s) => (o as Record<string, unknown>)[s], m) === '')
      expect(empty, name).toEqual([])
    }
  })
})
