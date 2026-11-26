/** 2D helpers shared by the INVENTO kits (mm, y up). */

export const deg = (a) => (a * Math.PI) / 180

export function circlePts(cx, cy, r, n = 48) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 2 * Math.PI
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  })
}

/** Convex hull (Andrew's monotone chain), counter-clockwise, starting at the lowest-left point. */
export function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower = []
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 1e-9)
      lower.pop()
    lower.push(q)
  }
  const upper = []
  for (const q of [...p].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 1e-9)
      upper.pop()
    upper.push(q)
  }
  upper.pop()
  lower.pop()
  return lower.concat(upper)
}

export function roundedRect(x0, y0, x1, y1, r, n = 8) {
  const pts = []
  const corners = [
    [x1 - r, y0 + r, -90],
    [x1 - r, y1 - r, 0],
    [x0 + r, y1 - r, 90],
    [x0 + r, y0 + r, 180],
  ]
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= n; i++) {
      const a = deg(a0 + (90 * i) / n)
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
    }
  }
  return pts
}

export const rect = (x0, y0, x1, y1) => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
]

/** Arc points from angle a0 to a1 (degrees, either direction), excluding nothing. */
export function arc(cx, cy, r, a0, a1, n = 8) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = deg(a0 + ((a1 - a0) * i) / n)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  })
}
