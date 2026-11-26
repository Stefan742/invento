/** Flat drawings shared by the kit guides: a part, a dowel, the ring target, an arrow head. */
import { COLORS as C } from './iso.mjs'
import { bbox } from './sheet.mjs'

export const r2 = (n) => Math.round(n * 100) / 100
export const FONT = `font-family="'Fira Sans Extra Condensed', sans-serif" font-weight="800"`
export const loopD = (l, f) => `M${l.map((p) => f(p).map(r2).join(' ')).join(' L')} Z`

/** One part, flat, wood colour, at `k` px per mm. */
export function partSvg(part, k = 1.4) {
  const b = bbox(part)
  const f = ([x, y]) => [(x - b.minx) * k + 3, (b.maxy - y) * k + 3]
  const d = [part.outline, ...part.holes].map((l) => loopD(l, f)).join(' ')
  const e = part.engrave
    .map((pl) => `M${pl.map((p) => f(p).map(r2).join(' ')).join(' L')}`)
    .join(' ')
  const w = (b.maxx - b.minx) * k + 6
  const h = (b.maxy - b.miny) * k + 6
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r2(w)} ${r2(h)}" width="${r2(w)}" height="${r2(h)}" stroke-linejoin="round" stroke-linecap="round"><path d="${d}" fill="${C.wood}" fill-rule="evenodd" stroke="${C.navy}" stroke-width="1.6"/>${e ? `<path d="${e}" fill="none" stroke="#7A5428" stroke-width="0.6" opacity="0.8"/>` : ''}</svg>`
}

/** A wooden dowel drawn flat (side view), `len` mm long. */
export function dowelSvg(len, k = 1.4) {
  const w = len * k + 6
  const h = 6 * k + 6
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r2(w)} ${r2(h)}" width="${r2(w)}" height="${r2(h)}"><rect x="3" y="3" width="${r2(len * k)}" height="${r2(6 * k)}" rx="${r2(3 * k)}" fill="${C.dowel ?? '#F1D29B'}" stroke="${C.navy}" stroke-width="1.6"/></svg>`
}

export function head(p0, p1, color) {
  const dx = p1[0] - p0[0]
  const dy = p1[1] - p0[1]
  const l = Math.hypot(dx, dy) || 1
  const ux = dx / l
  const uy = dy / l
  const s = 11
  const a = [p1[0] - ux * s - uy * s * 0.6, p1[1] - uy * s + ux * s * 0.6]
  const b = [p1[0] - ux * s + uy * s * 0.6, p1[1] - uy * s - ux * s * 0.6]
  return `<path d="M${r2(a[0])} ${r2(a[1])} L${r2(p1[0])} ${r2(p1[1])} L${r2(b[0])} ${r2(b[1])}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
}

/** The printable target: four rings (10 / 20 / 30 / 50). */
export function targetSvg() {
  const rings = [
    [92, '#FFFFFF', 10],
    [68, C.teal, 20],
    [44, C.yellow, 30],
    [20, C.orange, 50],
  ]
  const out = rings.map(
    ([r, fill]) =>
      `<circle cx="0" cy="0" r="${r}" fill="${fill}" stroke="${C.navy}" stroke-width="2.4"/>`,
  )
  rings.forEach(([r, , pts], i) => {
    const y = i === 3 ? 6 : -(r - 12)
    out.push(
      `<text x="0" y="${y}" text-anchor="middle" ${FONT} font-size="${i === 3 ? 17 : 14}" fill="${C.navy}">${pts}</text>`,
    )
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-96 -96 192 192">${out.join('')}</svg>`
}
