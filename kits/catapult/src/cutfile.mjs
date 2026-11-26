/**
 * Laser cut files. Red hairline = cut through, blue hairline = engrave (score) line.
 * Nothing else is in the file (no text, no other colours), so it goes straight into the laser
 * software. Units: mm, 1:1.
 */
import { circlePts } from './geometry.mjs'
import { textPolylines } from './stroke-font.mjs'

export const SHEET = { w: 300, h: 200 }
const CUT = '#FF0000'
const ENGRAVE = '#0000FF'
const r3 = (n) => Math.round(n * 1000) / 1000

export function bbox(part) {
  const pts = part.outline
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  return {
    minx: Math.min(...xs),
    miny: Math.min(...ys),
    maxx: Math.max(...xs),
    maxy: Math.max(...ys),
  }
}

const loopPath = (loop) => `M${loop.map(([x, y]) => `${r3(x)} ${r3(y)}`).join(' L')} Z`
const linePath = (pl) => `M${pl.map(([x, y]) => `${r3(x)} ${r3(y)}`).join(' L')}`

/** Where every part goes on the 300 × 200 sheet (x, y = top-left corner of its box, y down). */
export function layout(kit) {
  const at = (part, x, y, copy = 0) => ({ part, x, y, copy, box: bbox(part) })
  const items = [
    at(kit.base, 6, 6),
    at(kit.supportR, 204, 6),
    at(kit.supportL, 204, 94),
    at(kit.arm, 6, 90),
    at(kit.cupBottom, 126, 90),
    at(kit.cupRing, 126, 128),
  ]
  // washers (3) and caps (6) in two rows under the arm
  const discs = [...Array(3).fill(kit.washer), ...Array(6).fill(kit.cap)]
  discs.forEach((d, i) => {
    const row = Math.floor(i / 6)
    const col = i % 6
    items.push(at(d, 6 + col * 18.5 + (row ? 9 : 0), 122 + row * 18, i))
  })
  return { ...SHEET, items }
}

/** transform for a part placed with its box top-left at (x, y), flipping y-up drawings. */
const place = (it) => `translate(${r3(it.x - it.box.minx)} ${r3(it.y + it.box.maxy)}) scale(1 -1)`

export function cutSvg(kit) {
  const L = layout(kit)
  const groups = L.items
    .map((it) => {
      const p = it.part
      const cuts = [p.outline, ...p.holes].map((l) => `<path d="${loopPath(l)}"/>`).join('')
      const eng = p.engrave.length
        ? `<g stroke="${ENGRAVE}">${p.engrave.map((pl) => `<path d="${linePath(pl)}"/>`).join('')}</g>`
        : ''
      return `<g transform="${place(it)}"><g stroke="${CUT}">${cuts}</g>${eng}</g>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- INVENTO box 01 · mini catapult · ${kit.T} mm plywood · sheet ${L.w} x ${L.h} mm · red = cut, blue = engrave -->
<svg xmlns="http://www.w3.org/2000/svg" width="${L.w}mm" height="${L.h}mm" viewBox="0 0 ${L.w} ${L.h}" fill="none" stroke-width="0.1" stroke-linejoin="round" stroke-linecap="round">
${groups}
</svg>
`
}

/**
 * Fit test piece: slots around the sheet thickness and holes around the dowel size, each
 * labelled. Cut this first, push a scrap of the sheet and a dowel in, and pick the best fit.
 */
export function couponSvg(kit) {
  const T = kit.T
  const W = 96
  const H = 40
  const slots = [-0.3, -0.2, -0.1, 0, 0.1].map((d) => +(T + d).toFixed(1))
  const holes = [5.6, 5.8, 6.0, 6.2, 6.4, 6.6, 6.8, 7.0]
  const cut = []
  const eng = []
  cut.push(`M2 2 L${W - 2} 2 L${W - 2} ${H - 2} L2 ${H - 2} Z`)
  slots.forEach((s, i) => {
    const cx = 12 + i * 18
    // closed slot, 10 mm long: push an edge of the sheet into it
    cut.push(
      `M${r3(cx - s / 2)} 6 L${r3(cx + s / 2)} 6 L${r3(cx + s / 2)} 16 L${r3(cx - s / 2)} 16 Z`,
    )
    eng.push(
      ...textPolylines(s.toFixed(1), cx, -21, 2.6, 'middle').map((pl) =>
        pl.map(([x, y]) => [x, -y]),
      ),
    )
  })
  holes.forEach((d, i) => {
    const cx = 9 + i * 11.2
    cut.push(loopPath(circlePts(cx, 30, d / 2, 40)))
    eng.push(
      ...textPolylines(d.toFixed(1), cx, -37.2, 2.2, 'middle').map((pl) =>
        pl.map(([x, y]) => [x, -y]),
      ),
    )
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- INVENTO box 01 · fit test piece for ${T} mm sheet · slots (sheet fit) and holes (6 mm dowel fit), sizes in mm -->
<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" fill="none" stroke-width="0.1" stroke-linejoin="round" stroke-linecap="round">
<g stroke="${CUT}">${cut.map((d) => `<path d="${d}"/>`).join('')}</g>
<g stroke="${ENGRAVE}">${eng.map((pl) => `<path d="${linePath(pl)}"/>`).join('')}</g>
</svg>
`
}

/** The sheet drawn for people (guide and spec): wood fill, navy lines, number badges. */
export function sheetPictureSvg(kit, { badges = true, engrave = true } = {}) {
  const L = layout(kit)
  const items = L.items
    .map((it) => {
      const p = it.part
      const d = [p.outline, ...p.holes].map(loopPath).join(' ')
      const eng = engrave
        ? `<g stroke="#7A5428" stroke-width="0.35" opacity="0.8">${p.engrave.map((pl) => `<path d="${linePath(pl)}"/>`).join('')}</g>`
        : ''
      return `<g transform="${place(it)}"><path d="${d}" fill="#E9B872" fill-rule="evenodd" stroke="#0D1B2A" stroke-width="0.7"/>${eng}</g>`
    })
    .join('')
  const seen = new Set()
  const tags = badges
    ? L.items
        .filter((it) => (seen.has(it.part.id) ? false : seen.add(it.part.id)))
        .map((it) => {
          const big = it.box.maxx - it.box.minx > 30
          const x = it.x + (big ? 6 : -1)
          const y = it.y + (big ? 6 : -1)
          return `<g transform="translate(${r3(x)} ${r3(y)})"><circle r="5.2" fill="#FF7A00" stroke="#0D1B2A" stroke-width="0.9"/><text y="2.3" text-anchor="middle" font-family="'Fira Sans Extra Condensed', sans-serif" font-weight="800" font-size="7" fill="#0D1B2A">${it.part.id}</text></g>`
        })
        .join('')
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 ${L.w + 8} ${L.h - 14}" stroke-linejoin="round" stroke-linecap="round" fill="none">
<rect x="0" y="0" width="${L.w}" height="${L.h - 20}" rx="3" fill="#F6E3C0" stroke="#0D1B2A" stroke-width="0.9" stroke-dasharray="3 2"/>
${items}${tags}</svg>`
}
