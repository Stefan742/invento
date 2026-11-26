/**
 * INVENTO box 01 · Mini catapult · the single source of truth for every measurement.
 * The cut file, the woodworker sheet and the guide illustrations are all generated from here,
 * so they can never disagree. All sizes in millimetres. 2D part drawings use y-up coordinates.
 *
 * How it works (side view, x = forward, z = up, top of the base = 0):
 *   the arm turns on an axle dowel near the base; a rubber band runs from a notch on the arm to a
 *   second "stop" dowel. Pull the arm back (flat, pointing to the rear) and let go: the band
 *   swings it up until it hits the stop dowel, and the pom-pom keeps flying. The stop dowel has
 *   three holes, so the arm stops at 150° / 135° / 120°, which launches at 60° / 45° / 30°.
 */
import { arc, circlePts, deg, hull, rect, roundedRect } from '../../shared/geom.mjs'
import { textPolylines } from '../../shared/stroke-font.mjs'

export { circlePts, deg }

/**
 * Build the whole kit for a given sheet thickness T.
 * @param {number} T plywood thickness (nominal; measure the real sheet and regenerate)
 */
export function makeKit(T = 4) {
  const D = 6 // dowel diameter
  const HOLE = { snug: D + 0.2, free: D + 0.8, tight: D - 0.2 }
  const G = 3 * T + 1 // gap between the two supports: arm + a washer each side + 1 mm play
  const W = 16 // arm width
  const P = [135, 20] // axle (pivot), side view
  const R = 45 // where the arm meets the stop dowel, measured along the arm
  const NOTCHES = [52, 66, 80] // band notches on the arm (power 1 / 2 / 3)
  const TIP = 104 // end of the arm
  const CUP = { start: 86, len: 48, width: 32, mortise: [2, 14], hole: 24, holeAt: 33 } // along the arm
  // Support tabs / base slots (x ranges). Different lengths on purpose: a support pushed in the
  // wrong way round (engraving inwards) does not fit, so its holes always line up.
  const TABS = [
    [86, 96],
    [140, 154],
  ]
  const FOOT = [78, 160] // support footprint on the base
  const BASE = { len: 190, width: 76, r: 6 }
  const DOWEL_LEN = Math.ceil((4 * T + G + 3) / 2) * 2
  const off = W / 2 + D / 2 + 0.5 // stop dowel centre sits just off the arm's front edge

  const STOPS = [
    { theta: 150, launch: 60 },
    { theta: 135, launch: 45 },
    { theta: 120, launch: 30 },
  ].map((s) => {
    const t = deg(s.theta)
    const dir = [Math.cos(t), Math.sin(t)]
    const perp = [Math.cos(t - Math.PI / 2), Math.sin(t - Math.PI / 2)]
    return { ...s, c: [P[0] + R * dir[0] + off * perp[0], P[1] + R * dir[1] + off * perp[1]] }
  })

  /* ---------- 1 · base (top view: x forward, y left) ---------- */
  const yc = G / 2 + T / 2 // slot centre lines
  const base = {
    id: 1,
    outline: roundedRect(0, -BASE.width / 2, BASE.len, BASE.width / 2, BASE.r),
    holes: TABS.flatMap(([a, b]) => [
      rect(a, yc - T / 2, b, yc + T / 2),
      rect(a, -yc - T / 2, b, -yc + T / 2),
    ]),
    engrave: [],
  }
  // ruler along the right edge: 0-18 cm
  for (let k = 0; k <= 18; k++) {
    const x = 5 + 10 * k
    base.engrave.push([
      [x, -BASE.width / 2],
      [x, -BASE.width / 2 + 5],
    ])
    if (k < 18)
      base.engrave.push([
        [x + 5, -BASE.width / 2],
        [x + 5, -BASE.width / 2 + 2.5],
      ])
    base.engrave.push(...textPolylines(String(k), x, -BASE.width / 2 + 7, 2.6, 'middle'))
  }
  base.engrave.push(...textPolylines('CM', 5, -BASE.width / 2 + 12.5, 2.6, 'start'))
  // INVENTO box + wordmark at the rear, launch arrow at the front
  base.engrave.push(...boxLogo(10, 12, 22))
  base.engrave.push(...textPolylines('INVENTO', 37, 17, 6.5, 'start'))
  base.engrave.push(
    [
      [166, 0],
      [184, 0],
    ],
    [
      [178, 5],
      [184, 0],
      [178, -5],
    ],
  )
  base.engrave.push(...textPolylines('1', 180, -24, 5, 'middle'))

  /* ---------- 2 / 3 · supports (side view) ---------- */
  function support(id, mirror) {
    const pts = hull([
      ...circlePts(P[0], P[1], 11),
      ...STOPS.flatMap((s) => circlePts(s.c[0], s.c[1], 13)),
      ...circlePts(FOOT[0] + 4, 4, 4),
      ...circlePts(FOOT[1] - 4, 4, 4),
    ])
    // replace the flat bottom edge with the two tabs that go into the base
    const outline = []
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]
      const b = pts[(i + 1) % pts.length]
      outline.push(a)
      if (Math.abs(a[1]) < 1e-6 && Math.abs(b[1]) < 1e-6 && b[0] > a[0]) {
        for (const [t0, t1] of TABS) outline.push([t0, 0], [t0, -T], [t1, -T], [t1, 0])
      }
    }
    const holes = [
      circlePts(P[0], P[1], HOLE.snug / 2, 32),
      ...STOPS.map((s) => circlePts(s.c[0], s.c[1], HOLE.snug / 2, 32)),
    ]
    const mx = (x) => (mirror ? FOOT[0] + FOOT[1] - x : x)
    const flip = (loop) => (mirror ? loop.map(([x, y]) => [mx(x), y]).reverse() : loop)
    const engrave = []
    for (const s of STOPS) {
      const d = [s.c[0] - P[0], s.c[1] - P[1]]
      const l = Math.hypot(...d)
      const at = [s.c[0] + (d[0] / l) * 8.2, s.c[1] + (d[1] / l) * 8.2]
      engrave.push(...textPolylines(`${s.launch}°`, mx(at[0]), at[1] - 1.5, 3, 'middle'))
    }
    engrave.push(...textPolylines(String(id), mx(119), 4, 5, 'middle'))
    return { id, outline: flip(outline), holes: holes.map(flip), engrave, raw: { outline, holes } }
  }

  /* ---------- 4 · arm (u along the arm from the axle, v towards the cup side) ---------- */
  const h = W / 2
  const arm = { id: 4, outline: [], holes: [circlePts(0, 0, HOLE.free / 2, 32)], engrave: [] }
  {
    const o = arm.outline
    o.push(...arc(0, 0, h, 90, 270, 16)) // round end around the axle
    for (const u of NOTCHES) o.push(...arc(u, -h, 2, 180, 0, 6)) // notches on the back edge
    o.push([TIP, -h], [TIP, h])
    const [m0, m1] = CUP.mortise.map((m) => CUP.start + m)
    o.push([m1, h], [m1, h + 2 * T], [m0, h + 2 * T], [m0, h]) // cup tab
    for (const u of [...NOTCHES].reverse()) o.push(...arc(u, h, 2, 0, -180, 6)) // notches on the cup edge
    o.push([0, h])
    NOTCHES.forEach((u, i) => arm.engrave.push(...textPolylines(String(i + 1), u, -2, 4, 'middle')))
    arm.engrave.push(...textPolylines('4', 22, -2.5, 5, 'middle'))
  }

  /* ---------- 5 / 6 · cup bottom and cup ring (a along the arm, b across) ---------- */
  const cupOutline = roundedRect(0, -CUP.width / 2, CUP.len, CUP.width / 2, 4)
  const mortise = rect(CUP.mortise[0], -T / 2 - 0.05, CUP.mortise[1], T / 2 + 0.05)
  const cupBottom = {
    id: 5,
    outline: cupOutline,
    holes: [mortise],
    engrave: textPolylines('5', CUP.holeAt, -2.5, 5, 'middle'),
  }
  const cupRing = {
    id: 6,
    outline: cupOutline,
    holes: [mortise, circlePts(CUP.holeAt, 0, CUP.hole / 2, 48)],
    engrave: textPolylines('6', 8, -12, 4, 'middle'),
  }

  /* ---------- 7 / 8 · washers and caps ---------- */
  const washer = {
    id: 7,
    outline: circlePts(0, 0, 7, 40),
    holes: [circlePts(0, 0, HOLE.free / 2, 32)],
    engrave: [],
  }
  const cap = {
    id: 8,
    outline: circlePts(0, 0, 6.5, 40),
    holes: [circlePts(0, 0, HOLE.tight / 2, 32)],
    engrave: [],
  }

  const supportR = support(3, false)
  const supportL = support(2, true)

  /** Parts as they go on the sheet (qty includes spares). */
  const parts = [
    { part: base, qty: 1, key: 'base' },
    { part: supportL, qty: 1, key: 'supportL' },
    { part: supportR, qty: 1, key: 'supportR' },
    { part: arm, qty: 1, key: 'arm' },
    { part: cupBottom, qty: 1, key: 'cupBottom' },
    { part: cupRing, qty: 1, key: 'cupRing' },
    { part: washer, qty: 3, key: 'washer', spare: 1 },
    { part: cap, qty: 6, key: 'cap', spare: 2 },
  ]

  return {
    T,
    D,
    HOLE,
    G,
    W,
    P,
    R,
    NOTCHES,
    TIP,
    CUP,
    TABS,
    FOOT,
    BASE,
    DOWEL_LEN,
    STOPS,
    base,
    supportL,
    supportR,
    arm,
    cupBottom,
    cupRing,
    washer,
    cap,
    parts,
  }
}

/** The closed INVENTO box (as on the site), as engraving lines; (x, y) = bottom-left, w = width. */
function boxLogo(x, y, w) {
  // brand geometry, 400 × 380, y down
  const L = [52, 150]
  const F = [200, 218]
  const R = [348, 150]
  const B = [200, 82]
  const h = 142
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
  const down = (p) => [p[0], p[1] + h]
  const k = w / 300
  const tr = ([px, py]) => [x + (px - 50) * k, y + (380 - py - 15) * k]
  const lines = [
    [L, B, R, F, L],
    [L, down(L), down(F), down(R), R],
    [F, down(F)],
    [lerp(L, B, 0.42), lerp(F, R, 0.42)],
    [lerp(L, B, 0.58), lerp(F, R, 0.58)],
  ]
  return lines.map((pl) => pl.map(tr))
}
