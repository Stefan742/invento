import { describe, expect, it } from 'vitest'

import { contactLinks } from '@/lib/contact'
import { contrastRatio, PALETTE } from '@/lib/contrast'
import { isUpcoming } from '@/lib/format'
import { driftLayout, tiltFor } from '@/lib/layout'
import { toRelative } from '@/lib/media'
import { filterPlaceholders, showPlaceholders } from '@/lib/placeholders'
import { alternatesFor, jsonLd, localizedPath } from '@/lib/seo'
import { slugify } from '@/lib/slug'

describe('placeholders', () => {
  it('defaults: shown in dev, hidden in production', () => {
    expect(showPlaceholders({ NODE_ENV: 'development' })).toBe(true)
    expect(showPlaceholders({ NODE_ENV: 'production' })).toBe(false)
  })
  it('explicit flag wins', () => {
    expect(showPlaceholders({ NODE_ENV: 'production', SHOW_PLACEHOLDERS: 'true' })).toBe(true)
    expect(showPlaceholders({ NODE_ENV: 'development', SHOW_PLACEHOLDERS: 'false' })).toBe(false)
  })
  it('filters isPlaceholder items when hidden', () => {
    const items = [{ id: 1, isPlaceholder: true }, { id: 2, isPlaceholder: false }, { id: 3 }]
    expect(filterPlaceholders(items, false).map((i) => i.id)).toEqual([2, 3])
    expect(filterPlaceholders(items, true)).toHaveLength(3)
  })
})

describe('slugify', () => {
  it('transliterates Macedonian to clean Latin', () => {
    expect(slugify('Мини катапулта')).toBe('mini-katapulta')
    expect(slugify('Ѓубре Ќерка Ѕвезда Љубов Њива Џеб Жаба Шише Чаша')).toBe(
      'gjubre-kjerka-dzvezda-ljubov-njiva-dzheb-zhaba-shishe-chasha',
    )
  })
  it('keeps Latin slugs and strips junk', () => {
    expect(slugify('  Hydraulic Arm!! v2 ')).toBe('hydraulic-arm-v2')
  })
})

describe('contrast rule (docs/04)', () => {
  const AA = 4.5
  it('navy text passes AA on every light/accent background', () => {
    for (const bg of [PALETTE.paper, PALETTE.yellow, PALETTE.orange, PALETTE.teal]) {
      expect(contrastRatio(PALETTE.navy, bg)).toBeGreaterThanOrEqual(AA)
    }
  })
  it('accent and paper text pass AA on navy', () => {
    for (const fg of [PALETTE.paper, PALETTE.yellow, PALETTE.orange, PALETTE.teal]) {
      expect(contrastRatio(fg, PALETTE.navy)).toBeGreaterThanOrEqual(AA)
    }
  })
  it('accent colours on paper fail AA for body text (why they are not used as text there)', () => {
    expect(contrastRatio(PALETTE.orange, PALETTE.paper)).toBeLessThan(AA)
    expect(contrastRatio(PALETTE.yellow, PALETTE.paper)).toBeLessThan(AA)
    expect(contrastRatio(PALETTE.teal, PALETTE.paper)).toBeLessThan(AA)
  })
})

describe('deterministic layout (hydration-safe)', () => {
  it('same input, same output', () => {
    expect(driftLayout(9, 42)).toEqual(driftLayout(9, 42))
    expect(tiltFor(3)).toBe(tiltFor(3))
  })
  it('tilts stay within the limit', () => {
    for (let i = 0; i < 50; i++) expect(Math.abs(tiltFor(i, 5))).toBeLessThanOrEqual(5)
  })
})

describe('contact links', () => {
  it('builds nothing when settings are empty (no hardcoded contacts)', () => {
    const c = contactLinks({})
    expect(c.viber).toBeNull()
    expect(c.instagram).toBeNull()
    expect(c.email).toBeNull()
  })
  it('builds a Viber chat link with an encoded international number', () => {
    expect(contactLinks({ viberNumber: '+389 70 123 456' }).viber).toBe('viber://chat?number=%2B38970123456')
  })
  it('derives the Instagram URL from the handle', () => {
    expect(contactLinks({ instagramHandle: '@invento.mk' }).instagram).toBe('https://instagram.com/invento.mk')
  })
})

describe('seo helpers', () => {
  it('builds locale paths', () => {
    expect(localizedPath('mk')).toBe('/mk')
    expect(localizedPath('en', '/kits/')).toBe('/en/kits')
  })
  it('emits hreflang alternates for both locales plus x-default', () => {
    const a = alternatesFor('en', '/kits') as { canonical: string; languages: Record<string, string> }
    expect(a.canonical).toMatch(/\/en\/kits$/)
    expect(Object.keys(a.languages).sort()).toEqual(['en', 'mk', 'x-default'])
    expect(a.languages['x-default']).toMatch(/\/mk\/kits$/)
  })
  it('escapes < in JSON-LD', () => {
    expect(jsonLd({ a: '</script>' })).not.toContain('</script>')
  })
})

describe('misc', () => {
  it('next-drop dates in the past are hidden', () => {
    const now = new Date('2026-06-15T12:00:00Z')
    expect(isUpcoming('2026-06-20', now)).toBe(true)
    expect(isUpcoming('2026-06-01', now)).toBe(false)
    expect(isUpcoming(null, now)).toBe(false)
  })
  it('serves same-origin media relative', () => {
    expect(toRelative('http://localhost:3000/api/media/file/a.webp')).toBe('/api/media/file/a.webp')
    expect(toRelative('https://cdn.example.com/a.webp')).toBe('https://cdn.example.com/a.webp')
  })
})
