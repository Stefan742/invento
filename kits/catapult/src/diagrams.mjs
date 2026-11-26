/** The catapult's side-view diagram (shared drawings: kits/shared/art.mjs). */
import { FONT, head, loopD, r2 } from '../../shared/art.mjs'
import { circlePts, deg } from './geometry.mjs'
import { COLORS as C } from './render.mjs'

export { dowelSvg, partSvg, targetSvg } from '../../shared/art.mjs'

/**
 * Side view of the mechanism with labels (lang strings in `t`): arm pulled back (dashed) and at
 * rest on the 45° stop, the band, and three launch paths.
 */
export function sideViewSvg(kit, t) {
  const k = 2.2 // px per mm
  const { P, W, T, STOPS, NOTCHES, CUP } = kit
  const f = ([x, z]) => [x * k, -z * k]
  const out = []
  const armAt = (theta) => {
    const a = deg(theta)
    const dir = [Math.cos(a), Math.sin(a)]
    const perp = [Math.cos(a - Math.PI / 2), Math.sin(a - Math.PI / 2)]
    const map = ([u, v]) => [P[0] + dir[0] * u + perp[0] * v, P[1] + dir[1] * u + perp[1] * v]
    return { map, dir, perp }
  }
  // base and support
  out.push(
    `<path d="${loopD(
      [
        [0, -T],
        [190, -T],
        [190, 0],
        [0, 0],
      ],
      f,
    )}" fill="${C.wood}" stroke="${C.navy}" stroke-width="2"/>`,
  )
  out.push(
    `<path d="${loopD(kit.supportR.raw.outline, f)}" fill="#F3DDB5" stroke="${C.navy}" stroke-width="2"/>`,
  )
  for (const s of STOPS) {
    const active = s.launch === 45
    out.push(
      `<path d="${loopD(circlePts(s.c[0], s.c[1], 3.1, 24), f)}" fill="${active ? '#F1D29B' : '#fff'}" stroke="${C.navy}" stroke-width="1.6"/>`,
    )
  }
  // pulled-back arm (ghost) and the swing arrow
  const pulled = armAt(180)
  out.push(
    `<path d="${loopD(kit.arm.outline.map(pulled.map), f)}" fill="none" stroke="${C.navy}" stroke-width="1.6" stroke-dasharray="5 4" opacity="0.55"/>`,
  )
  const swing = Array.from({ length: 16 }, (_, i) => {
    const a = deg(172 - i * 2.3)
    return f([P[0] + 128 * Math.cos(a), P[1] + 128 * Math.sin(a)])
  })
  out.push(
    `<path d="M${swing.map((p) => p.map(r2).join(' ')).join(' L')}" fill="none" stroke="${C.orange}" stroke-width="3" stroke-linecap="round"/>`,
  )
  out.push(head(swing[swing.length - 2], swing[swing.length - 1], C.orange))
  // arm at rest on the 45° stop
  const rest = armAt(135)
  out.push(
    `<path d="${loopD(kit.arm.outline.map(rest.map), f)}" fill="${C.wood}" stroke="${C.navy}" stroke-width="2"/>`,
  )
  const cupBox = [
    [CUP.start, W / 2],
    [CUP.start + CUP.len, W / 2],
    [CUP.start + CUP.len, W / 2 + 2 * T],
    [CUP.start, W / 2 + 2 * T],
  ]
  out.push(
    `<path d="${loopD(cupBox.map(rest.map), f)}" fill="${C.wood}" stroke="${C.navy}" stroke-width="2"/>`,
  )
  // band, dowels
  const stop = STOPS[1]
  const notch = rest.map([NOTCHES[1], 0])
  out.push(
    `<path d="M${f(notch).map(r2).join(' ')} L${f(stop.c).map(r2).join(' ')}" stroke="${C.navy}" stroke-width="5.5" stroke-linecap="round"/><path d="M${f(notch).map(r2).join(' ')} L${f(stop.c).map(r2).join(' ')}" stroke="${C.teal}" stroke-width="3" stroke-linecap="round"/>`,
  )
  for (const c of [P, stop.c])
    out.push(
      `<path d="${loopD(circlePts(c[0], c[1], 3, 24), f)}" fill="#F1D29B" stroke="${C.navy}" stroke-width="1.8"/>`,
    )
  // launch paths from the cup
  const cup = rest.map([CUP.start + CUP.holeAt, W / 2 + 2 * T + 12])
  out.push(
    `<path d="${loopD(circlePts(cup[0], cup[1], 12.5, 32), f)}" fill="${C.yellow}" stroke="${C.navy}" stroke-width="1.8"/>`,
  )
  for (const [ang, dash, col] of [
    [30, '6 6', C.navy],
    [45, '', C.orange],
    [60, '6 6', C.navy],
  ]) {
    const a = deg(ang)
    // flight path from the cup, stopped where it lands on the table (z = 0)
    const x0 = cup[0] + 14 * Math.cos(a)
    const z0 = cup[1] + 14 * Math.sin(a)
    const pts = []
    for (let X = 0; X < 600; X += 4) {
      const Z = z0 + X * Math.tan(a) - (X * X) / (2 * 120 * Math.cos(a) ** 2)
      pts.push(f([x0 + X, Math.max(0, Z)]))
      if (Z <= 0) break
    }
    out.push(
      `<path d="M${pts.map((p) => p.map(r2).join(' ')).join(' L')}" fill="none" stroke="${col}" stroke-width="${ang === 45 ? 3 : 2}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round"/>`,
    )
    const lab = pts[Math.round(pts.length * 0.32)]
    out.push(
      `<text x="${r2(lab[0] - 4)}" y="${r2(lab[1] - 8)}" ${FONT} font-size="20" fill="${col === C.orange ? C.orangeDeep : C.navy}" text-anchor="end">${ang}°</text>`,
    )
  }
  // labels with leader lines
  const label = (at, dx, dy, text, anchor = 'start') => {
    const [x, y] = f(at)
    out.push(
      `<path d="M${r2(x)} ${r2(y)} L${r2(x + dx)} ${r2(y + dy)}" stroke="${C.navy}" stroke-width="1.4"/><circle cx="${r2(x)}" cy="${r2(y)}" r="2.6" fill="${C.navy}"/>`,
    )
    out.push(
      `<text x="${r2(x + dx + (anchor === 'end' ? -4 : 4))}" y="${r2(y + dy + 5)}" ${FONT} font-size="19" fill="${C.navy}" text-anchor="${anchor}">${text}</text>`,
    )
  }
  label(P, 40, 22, t.axle)
  label(rest.map([30, -W / 2]), -60, 8, t.arm, 'end')
  label([(notch[0] + stop.c[0]) / 2, (notch[1] + stop.c[1]) / 2], 50, -30, t.band)
  label([stop.c[0] + 3, stop.c[1] - 2], 56, 16, t.stop)
  label(rest.map([CUP.start + 10, W / 2 + 2 * T]), -40, -22, t.cup, 'end')
  const body = out.join('')
  const nums = [...body.matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((m) => [+m[1], +m[2]])
  const xs = nums.map((n) => n[0])
  const ys = nums.map((n) => n[1])
  const x0 = Math.min(...xs) - 70
  const y0 = Math.min(...ys) - 20
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(x0)} ${r2(y0)} ${r2(Math.max(...xs) + 60 - x0)} ${r2(Math.max(...ys) + 16 - y0)}" stroke-linejoin="round">${body}</svg>`
}
