/**
 * Builds every file for INVENTO box 02 (rubber-band racing car):
 *   cut/       laser files (4 mm and 3 mm plywood) + fit test pieces
 *   images/    isometric pictures (cover + 8 steps)
 *   *.pdf      building guide (mk, en) and the printable "finish" sheet
 *
 *   pnpm kit:car              → standard 4 mm and 3 mm files
 *   pnpm kit:car --t=3.8      → also a cut file for a measured 3.8 mm sheet
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { dowelSvg, FONT, head, loopD, partSvg, r2, targetSvg } from '../../shared/art.mjs'
import { BASE_CSS, FONTS, logo, printPdfs } from '../../shared/doc.mjs'
import { guideHtml, partCell, partWidth } from '../../shared/guide.mjs'
import { camera, COLORS as C, renderScene } from '../../shared/iso.mjs'
import { GUIDE } from './content.mjs'
import { circlePts, makeKit } from './geometry.mjs'
import { arcPoints, carScene, couponSvg, cutSvg, sheetPictureSvg } from './scene.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = (...p) => join(ROOT, ...p)
mkdirSync(out('cut'), { recursive: true })
mkdirSync(out('images'), { recursive: true })

/* ---------------- cut files ---------------- */
const extraT = process.argv.find((a) => a.startsWith('--t='))?.slice(4)
const thicknesses = [4, 3, ...(extraT ? [Number(extraT)] : [])]
for (const T of thicknesses) {
  const k = makeKit(T)
  writeFileSync(out('cut', `car-${T}mm.svg`), cutSvg(k))
  writeFileSync(out('cut', `test-piece-${T}mm.svg`), couponSvg(k))
}

const kit = makeKit(4)
const { REAR, FRONT, CROSS, G, T } = kit
const h = G / 2

/* ---------------- pictures ---------------- */
const cam = camera([0.62, -1, 0.6])
const set = (...k) => new Set(k)
const FRAME = ['panelL', 'panelR', 'crossFront', 'crossMid']
const ALL = [
  ...FRAME,
  'rearAxle',
  'frontAxle',
  'hub',
  'washers',
  'rearWheels',
  'frontWheels',
  'tyres',
  'band',
]
const IMG = {}
{
  // cover: speed lines behind the car
  const lines = [
    [12, '#FFD166', -10],
    [30, '#FF7A00', -26],
    [48, '#FFD166', -14],
  ].map(([z, color, x0]) => ({
    points: [
      [x0, 0, z],
      [x0 - 60, 0, z],
    ],
    color,
    dash: '1 0',
    width: 5,
  }))
  IMG.cover = renderScene(carScene(kit), { cam, paths: lines })
}
IMG.step1 = sheetPictureSvg(kit)
IMG.step2 = renderScene(
  carScene(kit, {
    show: set(...FRAME),
    highlight: set('crossFront', 'crossMid', 'panelR'),
    explode: { panelR: [0, -34, 0] },
  }),
  {
    cam,
    arrows: [
      { from: [CROSS.front.x + 30, -h - 46, 34], to: [CROSS.front.x + 30, -h - 12, 34] },
      { from: [CROSS.mid.x - 20, -h - 46, 26], to: [CROSS.mid.x - 20, -h - 12, 26] },
    ],
    badges: [
      { at: [CROSS.front.x, 0, CROSS.front.body[1] + 12], text: '3' },
      { at: [CROSS.mid.x, 0, CROSS.mid.body[1] + 12], text: '4' },
      { at: [100, h + T, 66], text: '1' },
      { at: [112, -h - 40, 64], text: '2' },
    ],
  },
)
{
  // one back wheel, exploded along the axle
  const scene = carScene(kit, {
    show: set('rearWheels', 'tyres'),
    highlight: set('rearWheels'),
    tyres: false,
    explode: {},
  })
  // keep only the near wheel stack (the last three discs), spread them out
  const near = scene.items.filter((it) => it.tag === 'rearWheels' && it.place([0, 0])[1] < 0)
  near.forEach((pr, i) => {
    const shift = (i - 1) * 28
    const base = pr.place
    pr.place = (q) => {
      const p = base(q)
      return [p[0], p[1] - shift, p[2]]
    }
  })
  IMG.step3 = renderScene(
    { items: near },
    {
      cam,
      arrows: [{ from: [REAR.x, -h - 96, REAR.z], to: [REAR.x, -h - 72, REAR.z] }],
      badges: [
        { at: [REAR.x, -2, REAR.z + 36], text: '5' },
        { at: [REAR.x, -34, REAR.z + 33], text: '6' },
        { at: [REAR.x, -66, REAR.z + 36], text: '5' },
      ],
    },
  )
}
IMG.step4 = renderScene(
  carScene(kit, {
    show: set(...FRAME, 'rearAxle', 'hub', 'washers', 'rearWheels', 'tyres'),
    tyres: false,
    highlight: set('rearAxle', 'hub', 'washers', 'rearWheels'),
    explode: { 'rearWheels:near': [0, -26, 0], 'washers:near': [0, -14, 0] },
  }),
  {
    cam,
    arrows: [{ from: [REAR.x, -h - 66, REAR.z], to: [REAR.x, -h - 42, REAR.z] }],
    badges: [
      { at: [REAR.x + 14, 0, REAR.z + 16], text: '9' },
      { at: [REAR.x, -h - 70, REAR.z + 8], text: '10' },
    ],
  },
)
IMG.step5 = renderScene(
  carScene(kit, {
    show: set(...FRAME, 'rearAxle', 'hub', 'washers', 'rearWheels', 'frontAxle', 'frontWheels'),
    tyres: false,
    highlight: set('frontAxle', 'frontWheels'),
    explode: { 'frontWheels:near': [0, -24, 0] },
  }),
  {
    cam,
    arrows: [{ from: [FRONT.x, -h - 60, FRONT.z], to: [FRONT.x, -h - 38, FRONT.z] }],
    badges: [
      { at: [FRONT.x + 10, -h - 46, FRONT.z + 26], text: '7' },
      { at: [FRONT.x + 26, -h - 66, FRONT.z + 4], text: '11' },
    ],
  },
)
IMG.step6 = renderScene(
  carScene(kit, { show: set(...ALL.filter((k) => k !== 'band')), highlight: set('tyres') }),
  { cam },
)
IMG.step7 = renderScene(carScene(kit, { show: set(...ALL), highlight: set('band') }), {
  cam,
  badges: [
    { at: [CROSS.front.x + 6, 0, CROSS.front.body[1] + 14], text: '3' },
    { at: [REAR.x + 6, 0, REAR.z + 22], text: '9' },
  ],
})
{
  // roll back (curved arrow round the near back wheel), then the car shoots forward
  const y = -h - 5 * T - 6
  const swing = arcPoints(REAR.x, y, REAR.z, REAR.r + 9, 40, 150)
  IMG.step8 = renderScene(carScene(kit), {
    cam,
    paths: [
      { points: swing, color: C.navy, dash: '1 0', width: 4, head: true },
      {
        points: [
          [-14, -h, 6],
          [-50, -h, 6],
        ],
        color: C.navy,
        dash: '6 6',
        width: 3,
        head: true,
      },
      {
        points: [
          [220, -h, 6],
          [270, -h, 6],
        ],
        color: C.orange,
        dash: '1 0',
        width: 5,
        head: true,
      },
    ],
  })
}
for (const [k, svg] of Object.entries(IMG)) writeFileSync(out('images', `car-${k}.svg`), svg)

/* ---------------- side view for "how it works" ---------------- */
function sideViewSvg(t) {
  const k = 2.1
  const f = ([x, z]) => [x * k, -z * k]
  const o = []
  o.push(
    `<path d="M${f([-30, 0]).join(' ')} L${f([235, 0]).join(' ')}" stroke="${C.navy}" stroke-width="2.4" stroke-dasharray="1 7" stroke-linecap="round"/>`,
  )
  o.push(
    `<path d="${loopD(kit.panelR.raw.outline, f)}" fill="${C.wood}" stroke="${C.navy}" stroke-width="2"/>`,
  )
  // the band inside the frame (dashed: it runs between the side panels)
  const a = f([REAR.x, REAR.z + kit.HUB.r - kit.HUB.depth + 1])
  const b = f([CROSS.front.x, CROSS.front.body[1] - 4.5])
  o.push(
    `<path d="M${a.map(r2).join(' ')} L${b.map(r2).join(' ')}" stroke="${C.navy}" stroke-width="5.5" stroke-linecap="round"/><path d="M${a.map(r2).join(' ')} L${b.map(r2).join(' ')}" stroke="${C.teal}" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 4"/>`,
  )
  for (const c of [CROSS.front, CROSS.mid])
    o.push(
      `<path d="${loopD(
        [
          [c.x - 2, c.body[0]],
          [c.x + 2, c.body[0]],
          [c.x + 2, c.body[1]],
          [c.x - 2, c.body[1]],
        ],
        f,
      )}" fill="#F3DDB5" stroke="${C.navy}" stroke-width="1.4"/>`,
    )
  // wheels (tyre on the back one) and the hub
  o.push(
    `<path d="${loopD(circlePts(REAR.x, REAR.z, REAR.r, 64), f)}" fill="${C.wood}" stroke="${C.navy}" stroke-width="2"/>`,
  )
  o.push(
    `<path d="${loopD(circlePts(REAR.x, REAR.z, REAR.r - 1.2, 64), f)}" fill="none" stroke="${C.teal}" stroke-width="4"/>`,
  )
  o.push(
    `<path d="${loopD(circlePts(FRONT.x, FRONT.z, FRONT.r, 64), f)}" fill="${C.wood}" stroke="${C.navy}" stroke-width="2"/>`,
  )
  for (const W of [REAR, FRONT])
    o.push(
      `<path d="${loopD(circlePts(W.x, W.z, 3, 20), f)}" fill="#F1D29B" stroke="${C.navy}" stroke-width="1.6"/>`,
    )
  o.push(
    `<path d="${loopD(
      kit.hub.outline.map(([x, z]) => [REAR.x + x, REAR.z + z]),
      f,
    )}" fill="#F3DDB5" stroke="${C.navy}" stroke-width="1.4" opacity="0.9"/>`,
  )
  // arrows: roll back, then go
  const back = Array.from({ length: 12 }, (_, i) =>
    f([
      REAR.x + 40 * Math.cos(((60 + i * 9) * Math.PI) / 180),
      REAR.z + 40 * Math.sin(((60 + i * 9) * Math.PI) / 180),
    ]),
  )
  o.push(
    `<path d="M${back.map((p) => p.map(r2).join(' ')).join(' L')}" fill="none" stroke="${C.navy}" stroke-width="3" stroke-linecap="round"/>` +
      head(back[10], back[11], C.navy),
  )
  const g0 = f([212, 8])
  const g1 = f([248, 8])
  o.push(
    `<path d="M${g0.join(' ')} L${g1.join(' ')}" stroke="${C.orange}" stroke-width="4" stroke-linecap="round"/>` +
      head(g0, g1, C.orange),
  )
  const text = (p, s, anchor = 'start', color = C.navy) =>
    o.push(
      `<text x="${r2(p[0])}" y="${r2(p[1])}" ${FONT} font-size="18" fill="${color}" text-anchor="${anchor}">${s}</text>`,
    )
  const label = (at, dx, dy, s, anchor = 'start') => {
    const [x, y] = f(at)
    o.push(
      `<path d="M${r2(x)} ${r2(y)} L${r2(x + dx)} ${r2(y + dy)}" stroke="${C.navy}" stroke-width="1.4"/><circle cx="${r2(x)}" cy="${r2(y)}" r="2.6" fill="${C.navy}"/>`,
    )
    text([x + dx + (anchor === 'end' ? -4 : 4), y + dy + 5], s, anchor)
  }
  label([CROSS.front.x, CROSS.front.body[1] - 3], 30, -34, t.hook)
  label([100, 36.3], 14, -46, t.band)
  label([REAR.x + 4, REAR.z + 2], 70, 104, t.hub)
  label([REAR.x - 22, REAR.z - 20], -36, 34, t.tyre, 'end')
  text(f([REAR.x - 6, REAR.z + 46]), t.back, 'end')
  text(f([232, 16]), t.go, 'middle', C.orangeDeep)
  const body = o.join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r2(-30 * k - 70)} ${r2(-96 * k)} ${r2(290 * k + 80)} ${r2(128 * k)}" stroke-linejoin="round">${body}</svg>`
}

/* ---------------- guide ---------------- */
function cells(t) {
  const c = (id, part, wide = false) =>
    partCell({
      id,
      name: t.parts[id],
      qty: t.qty[id] ?? '',
      svg: partSvg(part),
      woodWidth: partWidth(part),
      wide,
    })
  const dowel = (id, len) =>
    partCell({ id, name: t.parts[id], qty: '×1', svg: dowelSvg(len), woodWidth: len })
  return [
    c(2, kit.panelR, true),
    c(3, kit.crossFront),
    c(4, kit.crossMid),
    c(1, kit.panelL, true),
    c(5, kit.bigDisc),
    c(6, kit.grooveDisc),
    c(7, kit.smallDisc),
    c(8, kit.washer),
    c(9, kit.hub),
    dowel(10, kit.rearLen),
    dowel(11, kit.frontLen),
  ].join('')
}

const guide = (lang) => {
  const t = GUIDE[lang]
  return guideHtml({
    lang,
    t,
    cover: IMG.cover,
    steps: [IMG.step1, IMG.step2, IMG.step3, IMG.step4, IMG.step5, IMG.step6, IMG.step7, IMG.step8],
    partCells: cells(t),
    how: sideViewSvg(t.labels),
    labTip: { title: t.labTip[0], text: t.labTip[1], art: partSvg(kit.bigDisc) },
    gameArt: targetSvg(),
    partsCols: 4,
  })
}

/* ---------------- finish sheet (A4, both languages) ---------------- */
function finishHtml() {
  const mk = GUIDE.mk
  const en = GUIDE.en
  const squares = Array.from({ length: 2 * 14 }, (_, i) => {
    const r = Math.floor(i / 14)
    const col = i % 14
    return `<rect x="${col * 10}" y="${r * 10}" width="10" height="10" fill="${(r + col) % 2 ? C.paper : C.navy}"/>`
  }).join('')
  const flag = `<svg viewBox="0 0 140 20" style="width:100%;display:block">${squares}</svg>`
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}@page{size:A4;margin:0}</style></head><body><section class="page" style="width:210mm;height:297mm;padding:14mm;background:#fff">
    <div style="display:flex;justify-content:space-between;align-items:center">${logo(false, 11)}<span class="sticker" style="background:var(--yellow);font-size:4.6mm;transform:rotate(3deg)">${mk.finish} · ${en.finish}</span></div>
    <div style="margin:8mm -14mm 0;border-block:.8mm solid var(--navy)">${flag}</div>
    <div style="margin:10mm auto 0;width:170mm">${targetSvg()}</div>
    <div style="display:flex;justify-content:center;gap:4mm;margin-top:10mm">${[
      ['50', 'var(--orange)'],
      ['30', 'var(--yellow)'],
      ['20', 'var(--teal)'],
      ['10', '#fff'],
    ]
      .map(([n, c]) => `<span class="sticker" style="background:${c};font-size:5mm">${n}</span>`)
      .join('')}</div>
    <p class="d" style="text-align:center;font-size:5mm;margin-top:7mm;letter-spacing:.06em">${mk.finishHint}<br><span style="opacity:.6">${en.finishHint}</span></p></section></body></html>`
}

await printPdfs(
  [
    { html: guide('mk'), file: 'car-guide-mk.pdf' },
    { html: guide('en'), file: 'car-guide-en.pdf' },
    { html: finishHtml(), file: 'car-finish.pdf' },
  ],
  out,
)
console.log(
  'INVENTO box 02 built:',
  thicknesses.map((x) => `${x} mm`).join(', '),
  `· dowels ${kit.rearLen} / ${kit.frontLen} mm`,
)
