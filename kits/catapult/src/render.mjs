/** The catapult's 3D scene for the guide pictures (renderer: kits/shared/iso.mjs). */
import { add, COLORS as C, mul, norm, prism, r2 } from '../../shared/iso.mjs'
import { circlePts, deg } from './geometry.mjs'

export { camera, COLORS, renderScene } from '../../shared/iso.mjs'

/* ------------------------------------------------------------------------------------------ */

/**
 * Build the catapult as a list of prisms in paint order.
 * opts: theta (arm angle), stop (index into kit.STOPS or null), show (set of part keys),
 * highlight (set), explode ({ key: [dx, dy, dz] }), band (bool), ball (bool)
 */
export function catapultScene(kit, opts = {}) {
  const { T, G, W, P, D, DOWEL_LEN: Ld, CUP } = kit
  const theta = opts.theta ?? 135
  const show =
    opts.show ??
    new Set([
      'base',
      'supportL',
      'supportR',
      'arm',
      'cup',
      'washers',
      'axle',
      'axleCaps',
      'stop',
      'stopCaps',
    ])
  const hi = opts.highlight ?? new Set()
  const ex = opts.explode ?? {}
  const style = (key, base = 'wood') => (hi.has(key) ? 'new' : base)
  const off = (key) => ex[key] ?? [0, 0, 0]
  const t = deg(theta)
  const dir = [Math.cos(t), 0, Math.sin(t)]
  const perp = [Math.cos(t - Math.PI / 2), 0, Math.sin(t - Math.PI / 2)]
  const P3 = [P[0], 0, P[1]]
  const X = [1, 0, 0]
  const Y = [0, 1, 0]
  const Z = [0, 0, 1]
  const stop = opts.stop === null ? null : kit.STOPS[opts.stop ?? 1]
  const disc = (r, hole) => [circlePts(0, 0, r, 40), circlePts(0, 0, hole / 2, 24)]
  const rod = () => [circlePts(0, 0, D / 2, 28)]
  const items = []
  const push = (key, pr) => show.has(key) && items.push(pr)

  // xz-plane things (supports, dowels, washers, caps) use U = x, V = z, so n = -y.
  const xz = (loops, cx, cz, yStart, len, key, st) =>
    prism({
      loops,
      origin: [cx, yStart, cz],
      U: X,
      V: Z,
      t: len,
      style: style(key, st),
      offset: off(key),
      tag: key,
    })

  const yS = G / 2 + T // outer face of a support
  const capY = yS + T
  const seg = (key, c, y0, y1) => xz(rod(), c[0], c[1], y0, y0 - y1, key, 'dowel')

  push(
    'base',
    prism({
      loops: [kit.base.outline, ...kit.base.holes],
      origin: [0, 0, -T],
      U: X,
      V: Y,
      t: T,
      style: style('base'),
      engrave: kit.base.engrave,
      offset: off('base'),
      tag: 'base',
    }),
  )

  // far side (+y): dowel ends and caps, then the left support
  if (stop) push('stop', seg('stop', stop.c, Ld / 2, yS))
  push('axle', seg('axle', P, Ld / 2, yS))
  if (stop)
    push('stopCaps', xz(disc(6.5, kit.HOLE.tight), stop.c[0], stop.c[1], capY, T, 'stopCaps'))
  push('axleCaps', xz(disc(6.5, kit.HOLE.tight), P[0], P[1], capY, T, 'axleCaps'))
  push(
    'supportL',
    xz([kit.supportR.raw.outline, ...kit.supportR.raw.holes], 0, 0, G / 2 + T, T, 'supportL'),
  )

  // inside the gap: far halves of the dowels, far washer, the arm (+ cup), band, near halves
  if (stop) push('stop', seg('stop', stop.c, G / 2, T / 2))
  push('axle', seg('axle', P, G / 2, T / 2))
  push('washers', xz(disc(7, kit.HOLE.free), P[0], P[1], (3 * T) / 2, T, 'washers'))

  const armOrigin = [P3[0], -T / 2, P3[2]]
  push(
    'arm',
    prism({
      loops: [kit.arm.outline, ...kit.arm.holes],
      origin: armOrigin,
      U: dir,
      V: perp,
      t: T,
      style: style('arm'),
      offset: off('arm'),
      tag: 'arm',
    }),
  )
  // band: from the chosen notch round the stop dowel
  if (opts.band && stop) {
    const band = {
      kind: 'band',
      notch: kit.NOTCHES[opts.notch ?? 1],
      stop,
      dir,
      perp,
      pivot: P,
      halfW: W / 2,
      style: hi.has('band') ? 'new' : 'band',
    }
    items.push({ ...band, render: (cam, S) => renderBand(band, cam, S) })
  }
  if (stop) push('stop', seg('stop', stop.c, T / 2, -G / 2))
  push('axle', seg('axle', P, T / 2, -G / 2))
  push('washers', xz(disc(7, kit.HOLE.free), P[0], P[1], -T / 2, T, 'washers'))

  // near side (-y): right support, then dowel ends and caps
  push(
    'supportR',
    xz([kit.supportR.raw.outline, ...kit.supportR.raw.holes], 0, 0, -G / 2, T, 'supportR'),
  )
  const supportRItem = items[items.length - 1]
  if (supportRItem?.tag === 'supportR') supportRItem.engrave = kit.supportR.engrave
  if (stop) push('stop', seg('stop', stop.c, -yS, -Ld / 2))
  push('axle', seg('axle', P, -yS, -Ld / 2))
  if (stop)
    push('stopCaps', xz(disc(6.5, kit.HOLE.tight), stop.c[0], stop.c[1], -yS, T, 'stopCaps'))
  push('axleCaps', xz(disc(6.5, kit.HOLE.tight), P[0], P[1], -yS, T, 'axleCaps'))

  // cup plates sit on the arm's front edge; V = -y so that n points away from the arm
  const cupAt = (lift) => add(add(P3, mul(dir, CUP.start)), mul(perp, W / 2 + lift))
  const cupOff = off('cup')
  push(
    'cup',
    prism({
      loops: [kit.cupBottom.outline, ...kit.cupBottom.holes],
      origin: cupAt(0),
      U: dir,
      V: [0, -1, 0],
      t: T,
      style: style('cup'),
      offset: cupOff,
      tag: 'cup',
    }),
  )
  push(
    'cup',
    prism({
      loops: [kit.cupRing.outline, ...kit.cupRing.holes],
      origin: cupAt(T),
      U: dir,
      V: [0, -1, 0],
      t: T,
      style: style('cup'),
      offset: add(cupOff, mul(perp, ex.cupGap ?? 0)),
      tag: 'cup',
    }),
  )

  if (opts.ball) {
    const ball = {
      kind: 'ball',
      at: add(add(P3, mul(dir, CUP.start + CUP.holeAt)), mul(perp, W / 2 + 2 * T + 11)),
    }
    items.push({ ...ball, render: (cam, S) => renderBall(ball, cam, S) })
  }
  return { items, dir, perp, P3 }
}

/** Rubber band in the arm's plane: from the notch (both edges) round the far side of the stop dowel. */
function renderBand({ notch, stop, dir, perp, pivot, halfW, style }, cam, S) {
  const p3 = (x, z) => [x, 0, z]
  const P = (p) => cam.proj(p).map((c) => r2(c * S))
  const at = (u, v) => p3(pivot[0] + dir[0] * u + perp[0] * v, pivot[1] + dir[2] * u + perp[2] * v)
  const nTop = at(notch, halfW - 1)
  const nBot = at(notch, -halfW + 1)
  const c = stop.c
  const r = 4.2
  // loop: notch (cup edge) -> over the far side of the dowel -> back to notch (back edge)
  const toward = norm([c[0] - (nTop[0] + nBot[0]) / 2, 0, c[1] - (nTop[2] + nBot[2]) / 2])
  const side = [toward[2], 0, -toward[0]]
  const a1 = p3(c[0] + side[0] * r, c[1] + side[2] * r)
  const a2 = p3(c[0] + toward[0] * r, c[1] + toward[2] * r)
  const a3 = p3(c[0] - side[0] * r, c[1] - side[2] * r)
  const pts = [nTop, a1, a2, a3, nBot].map(P)
  const color = style === 'new' ? C.orange : C.teal
  return `<path d="M${pts[0]} L${pts[1]} Q${pts[2]} ${pts[3]} L${pts[4]}" fill="none" stroke="${C.navy}" stroke-width="${r2(S * 1.5)}"/><path d="M${pts[0]} L${pts[1]} Q${pts[2]} ${pts[3]} L${pts[4]}" fill="none" stroke="${color}" stroke-width="${r2(S * 0.95)}"/>`
}

export function renderBall({ at }, cam, S) {
  const [x, y] = cam.proj(at).map((c) => r2(c * S))
  const r = r2(12.5 * S)
  return `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${C.yellow}" stroke="${C.navy}" stroke-width="${r2(S * 0.45)}"/><circle cx="${x}" cy="${y}" r="${r2(r - S * 1.6)}" fill="none" stroke="#E8B740" stroke-width="${r2(S * 0.5)}" stroke-dasharray="${r2(S)} ${r2(S * 1.2)}"/><circle cx="${r2(x - r * 0.35)}" cy="${r2(y - r * 0.35)}" r="${r2(r * 0.22)}" fill="#FFF3D1"/></g>`
}
