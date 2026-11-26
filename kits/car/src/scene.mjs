/**
 * The racing car's sheet layout and 3D scene (writers and renderer live in kits/shared).
 */
import { arc } from '../../shared/geom.mjs'
import { COLORS as C, mul, norm, prism, r2 } from '../../shared/iso.mjs'
import * as sheet from '../../shared/sheet.mjs'
import { circlePts } from './geometry.mjs'

export const SHEET = { w: 300, h: 240 }

/** Where every part goes on the 300 × 240 sheet (x, y = top-left of its box, y down). */
export function layout(kit) {
  const at = sheet.at
  const items = [
    at(kit.panelR, 6, 6),
    at(kit.panelL, 6, 60),
    at(kit.crossFront, 220, 6),
    at(kit.crossMid, 220, 34),
    at(kit.hub, 274, 6),
    at(kit.hub, 274, 32, 1),
  ]
  ;[6, 70, 134, 198].forEach((x, i) => items.push(at(kit.bigDisc, x, 116, i)))
  ;[
    [263, 116],
    [280, 116],
    [263, 134],
    [280, 134],
    [263, 152],
  ].forEach(([x, y], i) => items.push(at(kit.washer, x, y, i)))
  ;[6, 64].forEach((x, i) => items.push(at(kit.grooveDisc, x, 182, i)))
  ;[122, 166, 210, 254].forEach((x, i) => items.push(at(kit.smallDisc, x, 182, i)))
  return { ...SHEET, items }
}

export const cutSvg = (kit) =>
  sheet.cutSvg(
    layout(kit),
    `INVENTO box 02 · rubber-band racing car · ${kit.T} mm plywood · sheet ${SHEET.w} x ${SHEET.h} mm · red = cut, blue = engrave`,
  )
export const couponSvg = (kit) => sheet.couponSvg(kit.T, 'box 02')
export const sheetPictureSvg = (kit, opts) => sheet.sheetPictureSvg(layout(kit), opts)

/* ------------------------------------------------------------------------------------------ */

const X = [1, 0, 0]
const Y = [0, 1, 0]
const Z = [0, 0, 1]

/**
 * The car as prisms in paint order (camera at the front right, so +y is far).
 * opts: show (set of keys), highlight (set), explode ({ key: [dx, dy, dz] }), band, tyres
 * keys: panelL panelR crossFront crossMid rearAxle frontAxle hub washers rearWheels frontWheels tyres band
 */
export function carScene(kit, opts = {}) {
  const { T, G, REAR, FRONT, CROSS } = kit
  const show =
    opts.show ??
    new Set([
      'panelL',
      'panelR',
      'crossFront',
      'crossMid',
      'rearAxle',
      'frontAxle',
      'hub',
      'washers',
      'rearWheels',
      'frontWheels',
      'tyres',
      'band',
    ])
  const hi = opts.highlight ?? new Set()
  const ex = opts.explode ?? {}
  const style = (key, base = 'wood') => (hi.has(key) ? 'new' : base)
  // explode can be per side: `${key}:near` / `${key}:far`
  const off = (key, side) => ex[`${key}:${side}`] ?? ex[key] ?? [0, 0, 0]
  const items = []
  const push = (key, pr) => show.has(key) && items.push(pr)
  const xz = (loops, cx, cz, yStart, len, key, st, side, engrave = []) =>
    prism({
      loops,
      origin: [cx, yStart, cz],
      U: X,
      V: Z,
      t: len,
      style: style(key, st),
      offset: off(key, side),
      engrave,
      tag: key,
      edges: st !== 'dowel',
    })
  const discLoops = (part) => [part.outline, ...part.holes]
  const rod = () => [circlePts(0, 0, kit.D / 2, 28)]
  const ring = (ro, ri) => [circlePts(0, 0, ro, 64), circlePts(0, 0, ri, 64)]
  const rl = kit.rearLen / 2
  const fl = kit.frontLen / 2
  const h = G / 2

  // one side's wheel stack, listed from the outside in (s = +1 far side, -1 near side)
  const side = (s) => {
    const sd = s > 0 ? 'far' : 'near'
    const layer = (y0) => (s > 0 ? y0 + T : -y0) // xz prisms extrude towards -y
    const out = []
    // rear wheel: outer big disc, groove disc (+ tyre), inner big disc
    const rearStack = [
      ['rearWheels', kit.bigDisc, h + T + T + 2 * T, kit.bigDisc.engrave],
      ['rearWheels', kit.grooveDisc, h + T + T + T, []],
      ['tyres', null, h + T + T + T, []],
      ['rearWheels', kit.bigDisc, h + T + T, kit.bigDisc.engrave],
    ]
    const frontStack = [
      ['frontWheels', kit.smallDisc, h + T + T + T, kit.smallDisc.engrave],
      ['frontWheels', kit.smallDisc, h + T + T, kit.smallDisc.engrave],
    ]
    const stack = (list, A) => {
      const ordered = s > 0 ? list : [...list].reverse()
      for (const [key, part, y0, eng] of ordered) {
        if (key === 'tyres') {
          if (opts.tyres !== false && A === REAR)
            out.push([
              'tyres',
              xz(
                ring(REAR.groove + 2.2, REAR.groove - 0.6),
                A.x,
                A.z,
                layer(y0),
                T,
                'tyres',
                'rubber',
                sd,
              ),
            ])
          continue
        }
        out.push([
          key,
          xz(discLoops(part), A.x, A.z, layer(y0), T, key, 'wood', sd, s < 0 ? eng : []),
        ])
      }
    }
    // only the 1 mm of each axle that sticks out past the wheel is drawn here
    const rearOut = h + 5 * T
    const frontOut = h + 4 * T
    const tips = [
      [
        'rearAxle',
        xz(rod(), REAR.x, REAR.z, s > 0 ? rl : -rearOut, rl - rearOut, 'rearAxle', 'dowel', sd),
      ],
      [
        'frontAxle',
        xz(
          rod(),
          FRONT.x,
          FRONT.z,
          s > 0 ? fl : -frontOut,
          fl - frontOut,
          'frontAxle',
          'dowel',
          sd,
        ),
      ],
    ]
    const washers = [
      [
        'washers',
        xz(discLoops(kit.washer), REAR.x, REAR.z, layer(h + T), T, 'washers', 'wood', sd),
      ],
      [
        'washers',
        xz(discLoops(kit.washer), FRONT.x, FRONT.z, layer(h + T), T, 'washers', 'wood', sd),
      ],
    ]
    if (s > 0) {
      out.push(...tips)
      stack(rearStack, REAR)
      stack(frontStack, FRONT)
      out.push(...washers)
    } else {
      out.push(...washers)
      stack(rearStack, REAR)
      stack(frontStack, FRONT)
      out.push(...tips)
    }
    return out
  }

  for (const [key, pr] of side(+1)) push(key, pr)
  push('panelL', xz([kit.panelR.raw.outline, ...kit.panelR.raw.holes], 0, 0, h + T, T, 'panelL'))

  // inside: axles, hub, mid cross piece, band, front cross piece
  push('rearAxle', xz(rod(), REAR.x, REAR.z, h, G, 'rearAxle', 'dowel', 'mid'))
  push('frontAxle', xz(rod(), FRONT.x, FRONT.z, h, G, 'frontAxle', 'dowel', 'mid'))
  push(
    'hub',
    xz([kit.hub.outline, ...kit.hub.holes], REAR.x, REAR.z, T / 2, T, 'hub', 'wood', 'mid'),
  )
  const crossPrism = (part, c, key) =>
    prism({
      loops: [part.outline, ...part.holes],
      origin: [c.x - T / 2, 0, 0],
      U: Y,
      V: Z,
      t: T,
      style: style(key),
      offset: off(key, 'mid'),
      tag: key,
    })
  push('crossMid', crossPrism(kit.crossMid, CROSS.mid, 'crossMid'))
  if (show.has('band')) {
    const band = {
      from: [REAR.x, 0, REAR.z + kit.HUB.r - kit.HUB.depth + 1],
      to: [CROSS.front.x - T / 2, 0, CROSS.front.body[1] - 4.5],
      hot: hi.has('band'),
    }
    items.push({ render: (cam, S) => renderBand(band, cam, S) })
  }
  push('crossFront', crossPrism(kit.crossFront, CROSS.front, 'crossFront'))

  push(
    'panelR',
    xz(
      [kit.panelR.raw.outline, ...kit.panelR.raw.holes],
      0,
      0,
      -h,
      T,
      'panelR',
      'wood',
      'near',
      kit.panelR.engrave,
    ),
  )
  for (const [key, pr] of side(-1)) push(key, pr)
  return { items }
}

/** The motor band: a doubled rubber band from the hub's hook to the front hook slot. */
function renderBand({ from, to, hot }, cam, S) {
  const P = (p) => cam.proj(p).map((c) => r2(c * S))
  const a = P(from)
  const b = P(to)
  const color = hot ? C.orange : C.teal
  const d = `M${a} L${b}`
  return `<path d="${d}" stroke="${C.navy}" stroke-width="${r2(S * 2.2)}" stroke-linecap="round"/><path d="${d}" stroke="${color}" stroke-width="${r2(S * 1.3)}" stroke-linecap="round"/>`
}

/** Arc of world points around (cx, ?, cz) in the plane y = y0 (for "roll back" arrows). */
export function arcPoints(cx, y0, cz, r, a0, a1, n = 14) {
  return arc(cx, cz, r, a0, a1, n).map(([x, z]) => [x, y0, z])
}

export { mul, norm }
