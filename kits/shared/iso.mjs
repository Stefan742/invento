/**
 * Small isometric renderer shared by the INVENTO kit guides: every wooden part is a flat outline extruded by its
 * thickness (dowels, washers and caps too). Faces are painted far-to-near in a fixed order that
 * matches the build (the camera looks from the front-right), and each part outline gets the
 * INVENTO chunky navy line. Output: SVG strings.
 */
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
  edges = true,
}) {
  const n = norm(cross(U, V))
  const o = add(origin, offset)
  const place = ([u, v]) => add(o, add(mul(U, u), mul(V, v)))
  const [outer, ...holes] = loops.map((l) => (area2(l) < 0 ? [...l].reverse() : l))
  return { outer, holes, place, n, t, style, engrave, tag, edges }
}

const STYLES = {
  wood: { face: C.wood, side: C.woodSide },
  dowel: { face: C.dowel, side: C.dowelSide },
  new: { face: C.orange, side: C.orangeDeep },
  ghost: { face: '#E8E4DC', side: '#CFC8BA' },
  rubber: { face: C.teal, side: '#0089A8' },
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
  if (pr.edges)
    out.push(
      `<path d="${wallEdges}" fill="none" stroke="${C.navy}" stroke-width="${r2(S * 0.32)}" stroke-linejoin="round" opacity="0.9"/>`,
    )
  out.push(
    `<path d="${sil}" fill="none" stroke="${C.navy}" stroke-width="${r2(S * 0.42)}" stroke-linejoin="round"/>`,
  )
  return out.join('')
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
    // items with their own renderer (bands, balls...) draw themselves
    parts.push(it.render ? it.render(cam, S) : renderPrism(it, cam, S))
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

export function arrowHead(p0, p1, color) {
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

export const COLORS = C

export { add, cross, dot, mul, norm, r2 }
