/**
 * A small isometric renderer for the guide: every wooden part is a flat outline extruded by its
 * thickness (dowels, washers and caps too). Faces are painted far-to-near in a fixed order that
 * matches the build (the camera looks from the front-right), and each part outline gets the
 * INVENTO chunky navy line. Output: SVG strings.
 */
import { circlePts, deg } from './geometry.mjs'

const C = {
  navy: '#0D1B2A',
  orange: '#FF7A00',
  orangeDeep: '#E06400',
  yellow: '#FFD166',
  teal: '#00B4DB',
  paper: '#F2F2F2',
  wood: '#E9B872',
  woodSide: '#C98E45',
  dowel: '#F1D29B',
  dowelSide: '#D6A862',
}

const norm = (v) => {
  const l = Math.hypot(...v)
  return v.map((c) => c / l)
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k]
const r2 = (n) => Math.round(n * 100) / 100

export function camera(eye = [0.62, -1, 0.78]) {
  const e = norm(eye)
  const right = norm(cross([0, 0, 1], e))
  const up = cross(e, right)
  return { e, proj: (p) => [dot(p, right), -dot(p, up)] }
}

const area2 = (loop) => {
  let a = 0
  for (let i = 0; i < loop.length; i++) {
    const [x0, y0] = loop[i]
    const [x1, y1] = loop[(i + 1) % loop.length]
    a += x0 * y1 - x1 * y0
  }
  return a / 2
}

/**
 * A flat part in 3D. place(u, v) maps the 2D drawing into the world; the part is extruded from
 * there along n = U × V by t.
 */
export function prism({
  loops,
  origin,
  U,
  V,
  t,
  style = 'wood',
  engrave = [],
  offset = [0, 0, 0],
  tag,
}) {
  const n = norm(cross(U, V))
  const o = add(origin, offset)
  const place = ([u, v]) => add(o, add(mul(U, u), mul(V, v)))
  const [outer, ...holes] = loops.map((l) => (area2(l) < 0 ? [...l].reverse() : l))
  return { outer, holes, place, n, t, style, engrave, tag }
}

const STYLES = {
  wood: { face: C.wood, side: C.woodSide },
  dowel: { face: C.dowel, side: C.dowelSide },
  new: { face: C.orange, side: C.orangeDeep },
  ghost: { face: '#E8E4DC', side: '#CFC8BA' },
}

function renderPrism(pr, cam, S) {
  const st = STYLES[pr.style] ?? STYLES.wood
  const P = (p) => cam.proj(p).map((c) => r2(c * S))
  const lift = mul(pr.n, pr.t)
  const topVisible = dot(pr.n, cam.e) > 0
  const faceShift = topVisible ? lift : [0, 0, 0]
  const loop3 = (l, shift) => l.map((q) => add(pr.place(q), shift))
  const out = []
  // side walls (outer edge and hole walls) facing the camera, far first
  const walls = []
  const addWalls = (loop, inward) => {
    for (let i = 0; i < loop.length; i++) {
      const a = pr.place(loop[i])
      const b = pr.place(loop[(i + 1) % loop.length])
      const d = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]])
      let wn = cross(d, pr.n)
      if (inward) wn = mul(wn, -1)
      if (dot(wn, cam.e) <= 1e-6) continue
      const quad = [a, b, add(b, lift), add(a, lift)]
      const depth = dot(add(a, b), cam.e)
      walls.push({ depth, quad })
    }
  }
  addWalls(pr.outer, false)
  pr.holes.forEach((h) => addWalls(h, true))
  walls.sort((x, y) => x.depth - y.depth)
  for (const w of walls) {
    out.push(
      `<path d="M${w.quad.map(P).join(' L')} Z" fill="${st.side}" stroke="${st.side}" stroke-width="0.6"/>`,
    )
  }
  // the visible face, holes cut out
  const d = [pr.outer, ...pr.holes]
    .map((l) => `M${loop3(l, faceShift).map(P).join(' L')} Z`)
    .join(' ')
  out.push(`<path d="${d}" fill="${st.face}" fill-rule="evenodd"/>`)
  if (topVisible && pr.engrave.length) {
    const ed = pr.engrave
      .map(
        (pl) =>
          `M${loop3(pl, add(faceShift, mul(pr.n, 0.01)))
            .map(P)
            .join(' L')}`,
      )
      .join(' ')
    out.push(
      `<path d="${ed}" stroke="#7A5428" stroke-width="${r2(S * 0.28)}" opacity="0.75" fill="none"/>`,
    )
  }
  // silhouette: outline the whole extruded shape in navy (face outline + visible wall edges)
  const sil = [pr.outer, ...pr.holes]
    .map((l) => `M${loop3(l, faceShift).map(P).join(' L')} Z`)
    .join(' ')
  const wallEdges = walls
    .map((w) => `M${P(w.quad[0])} L${P(w.quad[1])} L${P(w.quad[2])} L${P(w.quad[3])} Z`)
    .join(' ')
  out.push(
    `<path d="${wallEdges}" fill="none" stroke="${C.navy}" stroke-width="${r2(S * 0.32)}" stroke-linejoin="round" opacity="0.9"/>`,
  )
  out.push(
    `<path d="${sil}" fill="none" stroke="${C.navy}" stroke-width="${r2(S * 0.42)}" stroke-linejoin="round"/>`,
  )
  return out.join('')
}

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
    items.push({
      kind: 'band',
      notch: kit.NOTCHES[opts.notch ?? 1],
      stop,
      dir,
      perp,
      pivot: P,
      halfW: W / 2,
      style: hi.has('band') ? 'new' : 'band',
    })
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

  if (opts.ball)
    items.push({
      kind: 'ball',
      at: add(add(P3, mul(dir, CUP.start + CUP.holeAt)), mul(perp, W / 2 + 2 * T + 11)),
    })
  return { items, dir, perp, P3 }
}

/**
 * Render a scene to SVG. extras: arrows [{ from, to }] in world mm (dashed, navy),
 * badges [{ at, text }], arcs [{ points: [...] }] (dashed trajectory), pad (px).
 */
export function renderScene(
  scene,
  { cam: cam0 = camera(), S = 3, arrows = [], badges = [], paths = [], pad = 14 } = {},
) {
  // record every projected point, for the drawing's bounds
  const seen = []
  const cam = { ...cam0, proj: (p) => (seen.push(cam0.proj(p)), seen[seen.length - 1]) }
  const parts = []
  for (const it of scene.items) {
    if (it.kind === 'band') parts.push(renderBand(it, cam, S))
    else if (it.kind === 'ball') parts.push(renderBall(it, cam, S))
    else parts.push(renderPrism(it, cam, S))
  }
  const P = (p) => cam.proj(p).map((c) => r2(c * S))
  for (const pth of paths) {
    const pts = pth.points.map(P)
    parts.push(
      `<path d="M${pts.join(' L')}" fill="none" stroke="${pth.color ?? C.navy}" stroke-width="${pth.width ?? 2.2}" stroke-dasharray="${pth.dash ?? '6 6'}" stroke-linecap="round"/>`,
    )
    if (pth.head)
      parts.push(arrowHead(pts[pts.length - 2], pts[pts.length - 1], pth.color ?? C.navy))
  }
  for (const a of arrows) {
    const p0 = P(a.from)
    const p1 = P(a.to)
    parts.push(
      `<path d="M${p0} L${p1}" stroke="${C.navy}" stroke-width="2.2" stroke-dasharray="5 5" stroke-linecap="round" fill="none"/>`,
    )
    parts.push(arrowHead(p0, p1, C.navy))
  }
  for (const b of badges) {
    const [x, y] = P(b.at)
    parts.push(
      `<g transform="translate(${x} ${y})"><circle r="11" fill="${C.orange}" stroke="${C.navy}" stroke-width="2.4"/><text y="5.2" text-anchor="middle" font-family="'Fira Sans Extra Condensed', sans-serif" font-weight="800" font-size="15" fill="${C.navy}">${b.text}</text></g>`,
    )
  }
  const body = parts.join('\n')
  const xs = seen.map((n) => n[0] * S)
  const ys = seen.map((n) => n[1] * S)
  const minx = Math.min(...xs) - pad
  const miny = Math.min(...ys) - pad
  const w = Math.max(...xs) + pad - minx
  const h = Math.max(...ys) + pad - miny
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(minx)} ${r2(miny)} ${r2(w)} ${r2(h)}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
}

function arrowHead(p0, p1, color) {
  const dx = p1[0] - p0[0]
  const dy = p1[1] - p0[1]
  const l = Math.hypot(dx, dy) || 1
  const ux = dx / l
  const uy = dy / l
  const s = 9
  const a = [p1[0] - ux * s - uy * s * 0.6, p1[1] - uy * s + ux * s * 0.6]
  const b = [p1[0] - ux * s + uy * s * 0.6, p1[1] - uy * s - ux * s * 0.6]
  return `<path d="M${r2(a[0])} ${r2(a[1])} L${r2(p1[0])} ${r2(p1[1])} L${r2(b[0])} ${r2(b[1])}" fill="none" stroke="${color}" stroke-width="2.6"/>`
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

function renderBall({ at }, cam, S) {
  const [x, y] = cam.proj(at).map((c) => r2(c * S))
  const r = r2(12.5 * S)
  return `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${C.yellow}" stroke="${C.navy}" stroke-width="${r2(S * 0.45)}"/><circle cx="${x}" cy="${y}" r="${r2(r - S * 1.6)}" fill="none" stroke="#E8B740" stroke-width="${r2(S * 0.5)}" stroke-dasharray="${r2(S)} ${r2(S * 1.2)}"/><circle cx="${r2(x - r * 0.35)}" cy="${r2(y - r * 0.35)}" r="${r2(r * 0.22)}" fill="#FFF3D1"/></g>`
}

export const COLORS = C
