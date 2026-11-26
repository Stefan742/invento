/**
 * Geometry of the INVENTO box (three-quarter view) and its four top flaps, shared by the
 * server-rendered SVG (shapes.tsx) and the open / close animation (hero, preloader).
 *
 * Like a real cardboard box: two OUTER flaps (front-left, back-right) meet in the middle under
 * the tape; two INNER flaps (back-left, front-right) lie underneath them. Opening = the outer
 * flaps swing out, then the inner ones. Each flap turns on its hinge edge: its free edge is
 *   hinge + cos(angle) * inward + sin(angle) * up
 * and the side facing the viewer (navy outside / orange inside) follows from the winding.
 */
export type Pt = readonly [number, number]

export const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]]
export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const scale = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k]
export const poly = (...pts: Pt[]) => `M${pts.map((p) => `${+p[0].toFixed(1)} ${+p[1].toFixed(1)}`).join(' L')} Z`

/** Corners of the box opening (left, front, right, back) and the wall height, in the 400×380 viewBox. */
export const BOX = { L: [52, 150] as Pt, F: [200, 218] as Pt, R: [348, 150] as Pt, B: [200, 82] as Pt, h: 142 }
/** How tall a flap standing straight up looks on screen. */
const UP: Pt = [0, -50]

const NAVY_OUT = '#2E5079'
const ORANGE = '#FF7A00'
const ORANGE_DEEP = '#E06400'

type FlapId = 'bl' | 'fr' | 'br' | 'fl'
type Flap = { id: FlapId; a: Pt; b: Pt; inward: Pt; openDeg: number; outer: boolean; inside: string }

const { L, F, R, B } = BOX
const half = (from: Pt, to: Pt): Pt => scale([to[0] - from[0], to[1] - from[1]], 0.5)

export const FLAPS: Flap[] = [
  { id: 'bl', a: L, b: B, inward: half(L, F), openDeg: 114, outer: false, inside: ORANGE },
  { id: 'fr', a: F, b: R, inward: half(F, L), openDeg: 240, outer: false, inside: ORANGE_DEEP },
  { id: 'br', a: B, b: R, inward: half(B, L), openDeg: 114, outer: true, inside: ORANGE_DEEP },
  { id: 'fl', a: L, b: F, inward: half(L, B), openDeg: 240, outer: true, inside: ORANGE },
]

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (x: number) => x * x * (3 - 2 * x)
const cross = (u: Pt, v: Pt) => u[0] * v[1] - u[1] * v[0]

/** Outer flaps open over the first half of `progress`, inner flaps over the second. */
const flapProgress = (f: Flap, progress: number) =>
  smooth(clamp01(f.outer ? progress / 0.5 : (progress - 0.45) / 0.55))

export type FlapShape = { id: FlapId; d: string; fill: string; tape: string | null }

/** Shapes of the four flaps at `progress` (0 = closed and taped, 1 = fully open), in paint order. */
export function flapShapes(progress: number): FlapShape[] {
  const shapes = FLAPS.map((f) => {
    const t = (f.openDeg * flapProgress(f, progress) * Math.PI) / 180
    const o = add(scale(f.inward, Math.cos(t)), scale(UP, Math.sin(t)))
    const hinge: Pt = [f.b[0] - f.a[0], f.b[1] - f.a[1]]
    const outsideShowing = Math.sign(cross(hinge, o)) === Math.sign(cross(hinge, f.inward))
    // The tape runs along the outer flaps' free edges (where they meet when closed).
    const tape =
      f.outer && outsideShowing ? poly(add(f.a, scale(o, 0.84)), add(f.b, scale(o, 0.84)), add(f.b, o), add(f.a, o)) : null
    return { id: f.id, d: poly(f.a, f.b, add(f.b, o), add(f.a, o)), fill: outsideShowing ? NAVY_OUT : f.inside, tape }
  })
  // While the outer flaps move, the back-right one lies over the inner flaps; once it has
  // swung behind the box, the inner front-right flap comes in front of it.
  const order: FlapId[] = progress < 0.45 ? ['bl', 'fr', 'br', 'fl'] : ['bl', 'br', 'fr', 'fl']
  return order.map((id) => shapes.find((s) => s.id === id)!)
}

/** Redraw the flaps of a rendered Box SVG (inside `root`) at `progress`. */
export function renderFlaps(root: Element, progress: number) {
  const holder = root.querySelector('[data-flaps]')
  if (!holder) return
  for (const s of flapShapes(progress)) {
    const g = holder.querySelector(`[data-flap="${s.id}"]`)
    if (!g) continue
    const face = g.querySelector('[data-face]')
    const tape = g.querySelector('[data-tape]')
    face?.setAttribute('d', s.d)
    face?.setAttribute('fill', s.fill)
    if (tape) {
      tape.setAttribute('d', s.tape ?? '')
      tape.setAttribute('visibility', s.tape ? 'visible' : 'hidden')
    }
    holder.appendChild(g) // paint order
  }
}
