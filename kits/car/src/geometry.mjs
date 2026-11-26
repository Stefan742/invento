/**
 * INVENTO box 02 · Rubber-band racing car · every measurement in one place.
 * Cut file, guide pictures and diagrams are generated from here. Sizes in mm; 2D drawings y-up.
 *
 * Side view (x = forward, z = up, the floor = 0; y = left):
 *   two side panels shaped like a race car hold a rear axle (big wheels, Ø60) and a front axle
 *   (small wheels, Ø40). Two cross pieces join the panels. A rubber band runs from a hook slot
 *   in the front cross piece to a hook hub in the middle of the rear axle. Roll the car backwards
 *   and the axle winds the band up; let go and it unwinds, driving the rear wheels. At the end
 *   the band slips off the hub's hook, so the car rolls on freely instead of braking.
 */
import { arc, circlePts, rect } from '../../shared/geom.mjs'
import { textPolylines } from '../../shared/stroke-font.mjs'

export { circlePts }
export { deg } from '../../shared/geom.mjs'

/** Chaikin corner cutting on a closed polygon: rounds the race-car silhouette. */
function smooth(pts, n = 2) {
  let p = pts
  for (let k = 0; k < n; k++) {
    const q = []
    for (let i = 0; i < p.length; i++) {
      const a = p[i]
      const b = p[(i + 1) % p.length]
      q.push(
        [a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25],
        [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75],
      )
    }
    p = q
  }
  return p
}

/** Engraved rim: a ring and five spokes, plus the part number between two spokes. */
function rim(R, id) {
  const lines = [[...circlePts(0, 0, R - 4, 64), [R - 4, 0]]]
  for (let k = 0; k < 5; k++) {
    const a = ((90 + k * 72) * Math.PI) / 180
    lines.push([
      [6 * Math.cos(a), 6 * Math.sin(a)],
      [(R - 7) * Math.cos(a), (R - 7) * Math.sin(a)],
    ])
  }
  const a = ((90 + 36) * Math.PI) / 180
  const r = (R - 4 + 6) / 2
  lines.push(...textPolylines(String(id), r * Math.cos(a), r * Math.sin(a) - 2, 4, 'middle'))
  return lines
}

export function makeKit(T = 4) {
  const D = 6
  const HOLE = { free: D + 0.8, tight: D - 0.2 }
  const G = 40 // inside width between the side panels (room for the band and the hub)
  const REAR = { x: 30, z: 30, r: 30, groove: 27 } // big wheels: Ø60, middle disc Ø54
  const FRONT = { x: 175, z: 20, r: 20 } // small wheels: Ø40
  // cross pieces (x position, body z range, tab z range); the tab heights differ on purpose
  const CROSS = {
    front: { x: 140, body: [18, 40], tab: [22, 36] },
    mid: { x: 70, body: [14, 28], tab: [18, 28] },
  }
  const HUB = { r: 11, notch: 3.4, depth: 4.6 }
  const rearLen = G + 2 * T + 2 * T + 6 * T + 2 // panels, washers, 3-layer wheels, 1 mm out each side
  const frontLen = G + 2 * T + 2 * T + 4 * T + 2

  /* ---------- 1 / 2 · side panels ---------- */
  const silhouette = smooth([
    [8, 17],
    [60, 14],
    [196, 11],
    [204, 14],
    [207, 22],
    [192, 28],
    [152, 36],
    [134, 52],
    [100, 54],
    [86, 43],
    [42, 42],
    [30, 50],
    [6, 59],
    [1, 53],
    [4, 40],
  ])
  const slot = (c, [z0, z1]) => rect(c.x - T / 2, z0, c.x + T / 2, z1)
  const panelHoles = [
    circlePts(REAR.x, REAR.z, HOLE.free / 2, 32),
    circlePts(FRONT.x, FRONT.z, HOLE.free / 2, 32),
    slot(CROSS.front, CROSS.front.tab),
    slot(CROSS.mid, CROSS.mid.tab),
  ]
  function panel(id, mirror) {
    const M = 208
    const mx = (x) => (mirror ? M - x : x)
    const flip = (loop) => (mirror ? loop.map(([x, y]) => [mx(x), y]).reverse() : loop)
    const engrave = []
    // race number on the door
    engrave.push([...circlePts(mx(112), 34, 10, 48), [mx(112) + 10, 34]])
    engrave.push(...textPolylines('01', mx(112), 29.8, 9, 'middle'))
    engrave.push(...textPolylines('INVENTO', mx(49), 34.5, 4, 'middle'))
    // speed lines on the bonnet
    for (const [x0, x1, z] of [
      [150, 168, 26.5],
      [146, 162, 30.5],
    ])
      engrave.push([
        [mx(x0), z],
        [mx(x1), z],
      ])
    engrave.push(...textPolylines(String(id), mx(197), 15, 4, 'middle'))
    return {
      id,
      outline: flip(silhouette),
      holes: panelHoles.map(flip),
      engrave,
      raw: { outline: silhouette, holes: panelHoles },
    }
  }

  /* ---------- 3 / 4 · cross pieces (drawn in y, z) ---------- */
  const h = G / 2
  function cross(id, c, hook) {
    const [b0, b1] = c.body
    const [t0, t1] = c.tab
    const o = [
      [-h, b0],
      [h, b0],
      [h, t0],
      [h + T, t0],
      [h + T, t1],
    ]
    if (t1 < b1) o.push([h, t1], [h, b1])
    if (hook) {
      // the band hooks into this slot from the top
      o.push(
        [1.75, b1],
        [1.75, b1 - 4.5],
        ...arc(0, b1 - 4.5, 1.75, 0, -180, 6).slice(1, -1),
        [-1.75, b1 - 4.5],
        [-1.75, b1],
      )
    }
    if (t1 < b1) o.push([-h, b1], [-h, t1])
    o.push([-h - T, t1], [-h - T, t0], [-h, t0])
    const engrave = textPolylines(String(id), hook ? -11 : 0, b0 + 3, 5, 'middle')
    return { id, outline: o, holes: [], engrave }
  }

  /* ---------- 5 / 6 / 7 · wheel discs, 8 · washer, 9 · hook hub ---------- */
  const disc = (id, r, hole, engrave = []) => ({
    id,
    outline: circlePts(0, 0, r, 72),
    holes: [circlePts(0, 0, hole / 2, 32)],
    engrave,
  })
  const bigDisc = disc(5, REAR.r, HOLE.tight, rim(REAR.r, 5))
  const grooveDisc = disc(6, REAR.groove, HOLE.tight, textPolylines('6', 0, 12, 4, 'middle'))
  const smallDisc = disc(7, FRONT.r, HOLE.tight, rim(FRONT.r, 7))
  const washer = disc(8, 7, HOLE.free)
  const hub = (() => {
    const d = (Math.asin(HUB.notch / 2 / HUB.r) * 180) / Math.PI
    const pts = arc(0, 0, HUB.r, 90 + d, 450 - d, 40)
    const inner = HUB.r - HUB.depth
    pts.push([HUB.notch / 2, inner], [-HUB.notch / 2, inner])
    return { id: 9, outline: pts, holes: [circlePts(0, 0, HOLE.tight / 2, 32)], engrave: [] }
  })()

  const panelL = panel(1, true)
  const panelR = panel(2, false)
  const crossFront = cross(3, CROSS.front, true)
  const crossMid = cross(4, CROSS.mid, false)

  return {
    T,
    D,
    HOLE,
    G,
    REAR,
    FRONT,
    CROSS,
    HUB,
    rearLen,
    frontLen,
    panelL,
    panelR,
    crossFront,
    crossMid,
    bigDisc,
    grooveDisc,
    smallDisc,
    washer,
    hub,
  }
}
