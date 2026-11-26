/**
 * A tiny single-line ("stroke") font for laser engraving: the woodworker's software needs no
 * fonts, and the laser draws each character as a few fast lines. Glyphs are drawn on a 4 × 6
 * grid, y up, baseline at 0.
 */
const G = {
  0: {
    w: 4,
    s: [
      [
        [0, 0],
        [4, 0],
        [4, 6],
        [0, 6],
        [0, 0],
      ],
    ],
  },
  1: {
    w: 3,
    s: [
      [
        [0.5, 5],
        [2, 6],
        [2, 0],
      ],
      [
        [0.5, 0],
        [3, 0],
      ],
    ],
  },
  2: {
    w: 4,
    s: [
      [
        [0, 6],
        [4, 6],
        [4, 3],
        [0, 3],
        [0, 0],
        [4, 0],
      ],
    ],
  },
  3: {
    w: 4,
    s: [
      [
        [0, 6],
        [4, 6],
        [4, 0],
        [0, 0],
      ],
      [
        [1, 3],
        [4, 3],
      ],
    ],
  },
  4: {
    w: 4,
    s: [
      [
        [0, 6],
        [0, 3],
        [4, 3],
      ],
      [
        [4, 6],
        [4, 0],
      ],
    ],
  },
  5: {
    w: 4,
    s: [
      [
        [4, 6],
        [0, 6],
        [0, 3],
        [4, 3],
        [4, 0],
        [0, 0],
      ],
    ],
  },
  6: {
    w: 4,
    s: [
      [
        [4, 6],
        [0, 6],
        [0, 0],
        [4, 0],
        [4, 3],
        [0, 3],
      ],
    ],
  },
  7: {
    w: 4,
    s: [
      [
        [0, 6],
        [4, 6],
        [1.5, 0],
      ],
    ],
  },
  8: {
    w: 4,
    s: [
      [
        [0, 0],
        [4, 0],
        [4, 6],
        [0, 6],
        [0, 0],
      ],
      [
        [0, 3],
        [4, 3],
      ],
    ],
  },
  9: {
    w: 4,
    s: [
      [
        [4, 3],
        [0, 3],
        [0, 6],
        [4, 6],
        [4, 0],
        [0, 0],
      ],
    ],
  },
  '°': {
    w: 1.6,
    s: [
      [
        [0, 6],
        [1.6, 6],
        [1.6, 4.4],
        [0, 4.4],
        [0, 6],
      ],
    ],
  },
  I: {
    w: 0,
    s: [
      [
        [0, 0],
        [0, 6],
      ],
    ],
  },
  N: {
    w: 4,
    s: [
      [
        [0, 0],
        [0, 6],
        [4, 0],
        [4, 6],
      ],
    ],
  },
  V: {
    w: 4,
    s: [
      [
        [0, 6],
        [2, 0],
        [4, 6],
      ],
    ],
  },
  E: {
    w: 4,
    s: [
      [
        [4, 6],
        [0, 6],
        [0, 0],
        [4, 0],
      ],
      [
        [0, 3],
        [3, 3],
      ],
    ],
  },
  T: {
    w: 4,
    s: [
      [
        [0, 6],
        [4, 6],
      ],
      [
        [2, 6],
        [2, 0],
      ],
    ],
  },
  O: {
    w: 4,
    s: [
      [
        [0, 0],
        [4, 0],
        [4, 6],
        [0, 6],
        [0, 0],
      ],
    ],
  },
  C: {
    w: 4,
    s: [
      [
        [4, 6],
        [0, 6],
        [0, 0],
        [4, 0],
      ],
    ],
  },
  M: {
    w: 4,
    s: [
      [
        [0, 0],
        [0, 6],
        [2, 3],
        [4, 6],
        [4, 0],
      ],
    ],
  },
  '.': {
    w: 0.6,
    s: [
      [
        [0, 0],
        [0.6, 0],
        [0.6, 0.6],
        [0, 0.6],
        [0, 0],
      ],
    ],
  },
  ' ': { w: 2, s: [] },
}
const GAP = 1.6

function measure(str) {
  let w = 0
  for (const ch of str) w += (G[ch]?.w ?? 3) + GAP
  return w - GAP
}

/**
 * Polylines for `str` with its baseline at y, `h` = cap height (mm).
 * anchor: 'start' | 'middle' | 'end' (relative to x).
 */
export function textPolylines(str, x, y, h, anchor = 'start') {
  const k = h / 6
  const width = measure(str) * k
  let cx = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x
  const out = []
  for (const ch of str) {
    const g = G[ch]
    if (!g) throw new Error(`stroke font: no glyph for "${ch}"`)
    for (const line of g.s) out.push(line.map(([gx, gy]) => [cx + gx * k, y + gy * k]))
    cx += (g.w + GAP) * k
  }
  return out
}
