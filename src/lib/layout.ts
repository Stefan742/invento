/**
 * Deterministic pseudo-random helpers (hydration-safe: same output on server and client).
 * Used for tilts and drifting photo layouts.
 */
export function seeded(seed: number): () => number {
  let s = (seed >>> 0) || 1
  return () => {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A tilt in degrees within ±max, deterministic for an index. */
export function tiltFor(index: number, max = 5): number {
  const r = seeded(index * 7919 + 17)()
  const sign = index % 2 === 0 ? -1 : 1
  return Math.round(sign * (1.5 + r * (max - 1.5)) * 10) / 10
}

export type DriftSlot = { x: number; y: number; rotate: number; scale: number; speed: number }

/** Positions (percent of container) for gallery photos around a central title. */
export function driftLayout(count: number, seed = 42): DriftSlot[] {
  const rand = seeded(seed)
  const slots: DriftSlot[] = []
  for (let i = 0; i < count; i++) {
    const col = i % 3
    const row = Math.floor(i / 3)
    slots.push({
      x: 4 + col * 33 + rand() * 12,
      y: row * 30 + rand() * 10,
      rotate: Math.round((rand() * 12 - 6) * 10) / 10,
      scale: 0.85 + rand() * 0.3,
      speed: 0.6 + rand() * 0.8,
    })
  }
  return slots
}
