import { describe, expect, it } from 'vitest'

import { catmullRom } from '@/components/motion/home/track'
import { PRELOADER_INLINE_SCRIPT } from '@/components/motion/preloader-script'
import { motionEnabled, parseMotionOff } from '@/lib/motion-flags'

describe('motion flags', () => {
  it('everything on by default', () => {
    expect(motionEnabled('marble', new Set())).toBe(true)
  })
  it('all / single features can be switched off', () => {
    expect(motionEnabled('marble', parseMotionOff('all'))).toBe(false)
    expect(motionEnabled('marble', parseMotionOff('preloader, Marble'))).toBe(false)
    expect(motionEnabled('physics', parseMotionOff('preloader,marble'))).toBe(true)
  })
})

describe('marble track path', () => {
  it('builds one cubic segment per gap, starting at the first point', () => {
    const d = catmullRom([
      { x: 0, y: 0 },
      { x: 10, y: 50 },
      { x: 0, y: 100 },
    ])
    expect(d.startsWith('M0.0,0.0')).toBe(true)
    expect(d.match(/C/g)).toHaveLength(2)
    expect(d.endsWith('0.0,100.0')).toBe(true)
  })
  it('needs at least two points', () => {
    expect(catmullRom([{ x: 1, y: 1 }])).toBe('')
  })
})

describe('preloader inline script', () => {
  it('is valid JavaScript and only targets the home page', () => {
    expect(() => new Function(PRELOADER_INLINE_SCRIPT)).not.toThrow()
    expect(PRELOADER_INLINE_SCRIPT).toContain('(mk|en)')
    expect(PRELOADER_INLINE_SCRIPT).toContain('prefers-reduced-motion')
  })
})
