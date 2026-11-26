/**
 * Builds every file for INVENTO box 01 (mini catapult):
 *   cut/       laser files (4 mm and 3 mm plywood) + fit test pieces
 *   images/    isometric pictures (cover + 8 steps), usable on the website too
 *   *.pdf      woodworker spec (mk), building guide (mk, en), printable target
 *
 *   pnpm kit:catapult              → standard 4 mm and 3 mm files
 *   pnpm kit:catapult --t=3.8      → also a cut file for a measured 3.8 mm sheet
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

import { GUIDE } from './content.mjs'
import { bbox, couponSvg, cutSvg, sheetPictureSvg } from './cutfile.mjs'
import { dowelSvg, partSvg, sideViewSvg, targetSvg } from './diagrams.mjs'
import { deg, makeKit } from './geometry.mjs'
import { camera, catapultScene, renderScene } from './render.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = join(ROOT, '..', '..')
const out = (...p) => join(ROOT, ...p)
mkdirSync(out('cut'), { recursive: true })
mkdirSync(out('images'), { recursive: true })

/* ---------------- cut files ---------------- */
const extraT = process.argv.find((a) => a.startsWith('--t='))?.slice(4)
const thicknesses = [4, 3, ...(extraT ? [Number(extraT)] : [])]
for (const T of thicknesses) {
  const kit = makeKit(T)
  writeFileSync(out('cut', `catapult-${T}mm.svg`), cutSvg(kit))
  writeFileSync(out('cut', `test-piece-${T}mm.svg`), couponSvg(kit))
}

const kit = makeKit(4)
const kit3 = makeKit(3)

/* ---------------- pictures ---------------- */
const cam = camera()
const ALL = [
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
]
const set = (...k) => new Set(k)
const P3 = [kit.P[0], 0, kit.P[1]]
const yc = kit.G / 2 + kit.T / 2
const cupWorld = (theta, lift = 0) => {
  const a = deg(theta)
  const dir = [Math.cos(a), 0, Math.sin(a)]
  const perp = [Math.cos(a - Math.PI / 2), 0, Math.sin(a - Math.PI / 2)]
  const u = kit.CUP.start + kit.CUP.holeAt
  const v = kit.W / 2 + 2 * kit.T + lift
  return [P3[0] + dir[0] * u + perp[0] * v, 0, P3[2] + dir[2] * u + perp[2] * v]
}

function flight() {
  const s = cupWorld(135, 11)
  const pts = []
  for (let X = 0; X <= 230; X += 10) pts.push([s[0] + X, 0, s[2] + X - (X * X) / 175])
  return { from: s, pts }
}

const IMG = {}
{
  const f = flight()
  const scene = catapultScene(kit, { theta: 135, band: true })
  scene.items.push({ kind: 'ball', at: f.pts[14] })
  IMG.cover = renderScene(scene, {
    cam,
    paths: [{ points: f.pts.slice(0, 14), color: '#FFD166', dash: '2 9', width: 3.4 }],
  })
}
IMG.step1 = sheetPictureSvg(kit)
IMG.step2 = renderScene(
  catapultScene(kit, {
    show: set('base', 'supportL', 'supportR'),
    highlight: set('supportL', 'supportR'),
    explode: { supportL: [0, 0, 34], supportR: [0, 0, 34] },
    stop: null,
  }),
  {
    cam,
    arrows: [
      { from: [147, -yc, 30], to: [147, -yc, 4] },
      { from: [91, -yc, 30], to: [91, -yc, 4] }, // rear tab (86-96)
    ],
    badges: [
      { at: [184, -30, 0], text: '1' },
      { at: [118, yc, 116], text: '2' },
      { at: [118, -yc - 14, 104], text: '3' },
    ],
  },
)
IMG.step3 = renderScene(
  catapultScene(kit, {
    theta: 180,
    show: set('arm', 'cup'),
    highlight: set('cup'),
    explode: { cup: [0, 0, 24], cupGap: 18 },
    stop: null,
  }),
  {
    cam,
    arrows: [
      { from: [kit.P[0] - 94, 0, kit.P[1] + 8 + 22], to: [kit.P[0] - 94, 0, kit.P[1] + 12] },
    ],
    badges: [
      { at: [kit.P[0] - 40, -10, kit.P[1]], text: '4' },
      { at: [kit.P[0] - 140, -24, kit.P[1] + 34], text: '5' },
      { at: [kit.P[0] - 140, -24, kit.P[1] + 58], text: '6' },
    ],
  },
)
IMG.step4 = renderScene(
  catapultScene(kit, {
    theta: 150,
    show: set('base', 'supportL', 'supportR', 'arm', 'cup', 'washers', 'axle'),
    highlight: set('arm', 'cup', 'washers', 'axle'),
    explode: { axle: [0, -46, 0] },
    stop: null,
  }),
  {
    cam,
    arrows: [{ from: [P3[0], -76, P3[2]], to: [P3[0], -30, P3[2]] }],
    badges: [
      { at: [P3[0], -88, P3[2] + 12], text: '9' },
      { at: [P3[0] - 22, 0, P3[2] - 18], text: '7' },
      { at: [P3[0] - 70, -14, P3[2] + 44], text: '4' },
    ],
  },
)
IMG.step5 = renderScene(
  catapultScene(kit, {
    theta: 150,
    show: set(...ALL.filter((k) => !k.startsWith('stop'))),
    highlight: set('axleCaps'),
    explode: { axleCaps: [0, -20, 0] },
    stop: null,
  }),
  {
    cam,
    arrows: [{ from: [P3[0], -48, P3[2]], to: [P3[0], -32, P3[2]] }],
    badges: [{ at: [P3[0] + 4, -52, P3[2] + 16], text: '8' }],
  },
)
{
  const sc = kit.STOPS[1].c
  IMG.step6 = renderScene(
    catapultScene(kit, {
      theta: 135,
      show: set(...ALL),
      highlight: set('stop', 'stopCaps'),
      explode: { stop: [0, -44, 0], stopCaps: [0, -56, 0] },
      stop: 1,
    }),
    {
      cam,
      arrows: [{ from: [sc[0], -84, sc[1]], to: [sc[0], -38, sc[1]] }],
      badges: [
        { at: [sc[0] + 6, -92, sc[1] + 14], text: '9' },
        { at: [sc[0] + 6, -68, sc[1] + 22], text: '8' },
      ],
    },
  )
}
IMG.step7 = renderScene(
  catapultScene(kit, {
    theta: 135,
    show: set(...ALL),
    highlight: set('band'),
    band: true,
    stop: 1,
    notch: 1,
  }),
  { cam },
)
{
  const scene = catapultScene(kit, {
    theta: 180,
    show: set(...ALL),
    band: true,
    ball: true,
    stop: 1,
  })
  const swing = []
  for (let a = 176; a >= 138; a -= 3)
    swing.push([P3[0] + 150 * Math.cos(deg(a)), 0, P3[2] + 150 * Math.sin(deg(a))])
  IMG.step8 = renderScene(scene, {
    cam,
    paths: [{ points: swing, color: '#FF7A00', dash: '1 0', width: 4, head: true }],
  })
}
for (const [k, svg] of Object.entries(IMG)) writeFileSync(out('images', `catapult-${k}.svg`), svg)

/* ---------------- shared page styles ---------------- */
const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fira+Sans+Extra+Condensed:wght@800&family=Onest:wght@400..800&display=block" rel="stylesheet">'
const BASE_CSS = `
:root{--navy:#0D1B2A;--navy2:#1E3550;--orange:#FF7A00;--orange-d:#E06400;--yellow:#FFD166;--teal:#00B4DB;--paper:#F2F2F2;--wood:#E9B872}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:Onest,system-ui,sans-serif;color:var(--navy);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.d{font-family:'Fira Sans Extra Condensed',sans-serif;font-weight:800;text-transform:uppercase;line-height:.9;letter-spacing:.01em}
.page{position:relative;overflow:hidden;break-after:page;background:var(--paper)}
.page:last-child{break-after:auto}
.blob{position:absolute;border-radius:50%;pointer-events:none}
.sticker{display:inline-block;border:.6mm solid var(--navy);border-radius:99mm;padding:1.3mm 3.4mm 1mm;box-shadow:.8mm .8mm 0 var(--navy);font-family:'Fira Sans Extra Condensed',sans-serif;font-weight:800;text-transform:uppercase;line-height:1}
.card{background:#fff;border:.6mm solid var(--navy);border-radius:4mm;box-shadow:1.1mm 1.1mm 0 var(--navy)}
svg{display:block}
`
const logoMarkSvg = (onNavy) =>
  readFileSync(
    join(REPO, 'docs', 'brand', onNavy ? 'invento-mark-on-navy.svg' : 'invento-mark.svg'),
    'utf8',
  ).replace(/<\?xml.*?\?>\s*/, '')
const logo = (onNavy, size = 9) =>
  `<div style="display:flex;align-items:center;gap:1.6mm"><div style="width:${size}mm;height:${size}mm">${logoMarkSvg(onNavy)}</div><span class="d" style="font-size:${size * 0.75}mm;color:${onNavy ? 'var(--paper)' : 'var(--navy)'}">INVENTO</span></div>`

/* ---------------- building guide (A5) ---------------- */
function guideHtml(lang) {
  const t = GUIDE[lang]
  const W = 148
  const H = 210
  const page = (bg, inner, extra = '') =>
    `<section class="page" style="width:${W}mm;height:${H}mm;background:${bg};padding:9mm;${extra}">${inner}</section>`
  const pageFoot = (n, dark = false) =>
    `<div style="position:absolute;bottom:5mm;left:9mm;right:9mm;display:flex;justify-content:space-between;font-size:2.6mm;font-weight:700;color:${dark ? 'var(--paper)' : 'var(--navy)'};opacity:.7"><span>INVENTO · ${t.backBox}</span><span>${n}</span></div>`
  const title = (txt, color = 'var(--navy)', size = 11) =>
    `<h2 class="d" style="font-size:${size}mm;margin:0 0 4mm;color:${color}">${txt}</h2>`

  // 1 · cover
  const cover = page(
    'var(--navy)',
    `<div class="blob" style="width:120mm;height:120mm;left:-40mm;top:-30mm;background:#13263B"></div>
     <div class="blob" style="width:150mm;height:150mm;right:-70mm;bottom:-60mm;background:#13263B"></div>
     <div style="position:relative;display:flex;justify-content:space-between;align-items:center">${logo(true, 10)}<span class="sticker" style="background:var(--yellow);font-size:4.2mm;transform:rotate(4deg)">${t.box}</span></div>
     <h1 class="d" style="position:relative;margin:9mm 0 0;font-size:22mm;color:var(--paper)">${t.title.split(' ')[0]}<br><span style="color:var(--orange)">${t.title.split(' ').slice(1).join(' ')}</span></h1>
     <div style="position:relative;margin:4mm -6mm 0;height:86mm;display:flex;justify-content:center"><div style="position:absolute;width:84mm;height:84mm;border-radius:50%;background:#1E3550;left:50%;top:1mm;transform:translateX(-50%)"></div><div style="position:relative;width:128mm;height:86mm">${IMG.cover.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div></div>
     <p style="position:relative;color:var(--paper);font-size:4mm;font-weight:600;line-height:1.35;margin:3mm 0 4mm;max-width:118mm">${t.intro}</p>
     <div style="position:relative;display:flex;flex-wrap:wrap;gap:2.4mm">${t.coverStickers
       .map(
         (s, i) =>
           `<span class="sticker" style="background:${['var(--yellow)', 'var(--teal)', 'var(--paper)'][i]};font-size:3.6mm;transform:rotate(${[-3, 2, -2][i]}deg);box-shadow:.8mm .8mm 0 #050b12">${s}</span>`,
       )
       .join('')}</div>
     <p class="d" style="position:absolute;bottom:7mm;left:9mm;margin:0;color:var(--yellow);font-size:4mm;letter-spacing:.12em">${t.slogan}</p>`,
  )

  // 2 · what's in the box
  const scale = 0.27 // mm on paper per mm of wood
  const partCell = (id, part, qty, wide = false) => {
    const b = bbox(part)
    const w = (b.maxx - b.minx) * scale
    return `<div class="card" style="padding:2.4mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:1.5mm;${wide ? 'grid-column:span 2;' : ''}">
      <div style="width:${w}mm;max-width:100%">${partSvg(part).replace(/width="[^"]+" height="[^"]+"/, 'width="100%"')}</div>
      <div style="display:flex;align-items:center;gap:1.6mm;width:100%"><span class="d" style="flex:none;width:6mm;height:6mm;border-radius:50%;background:var(--orange);border:.5mm solid var(--navy);display:grid;place-items:center;font-size:3.6mm">${id}</span><span style="font-size:2.9mm;font-weight:700;line-height:1.15">${t.parts[id]}${qty ? `<br><span style="font-weight:500;opacity:.8">${qty}</span>` : ''}</span></div></div>`
  }
  const dowelCell = `<div class="card" style="padding:2.4mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:1.5mm"><div style="width:${kit.DOWEL_LEN * scale}mm;margin-top:2mm">${dowelSvg(kit.DOWEL_LEN).replace(/width="[^"]+" height="[^"]+"/, 'width="100%"')}</div><div style="display:flex;align-items:center;gap:1.6mm;width:100%"><span class="d" style="flex:none;width:6mm;height:6mm;border-radius:50%;background:var(--orange);border:.5mm solid var(--navy);display:grid;place-items:center;font-size:3.6mm">9</span><span style="font-size:2.9mm;font-weight:700;line-height:1.15">${t.parts[9]}<br><span style="font-weight:500;opacity:.8">${t.qty[9]}</span></span></div></div>`
  const parts = page(
    'var(--paper)',
    `${title(t.partsTitle)}
     <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2.4mm">
       ${partCell(1, kit.base, '', true)}${partCell(4, kit.arm, '')}
       ${partCell(2, kit.supportL, '')}${partCell(3, kit.supportR, '')}${partCell(5, kit.cupBottom, '')}
       ${partCell(6, kit.cupRing, '')}${partCell(7, kit.washer, t.qty[7])}${partCell(8, kit.cap, t.qty[8])}
       ${dowelCell}
       <div class="card" style="grid-column:span 2;padding:2.6mm 3mm;font-size:2.9mm;line-height:1.5">${t.extras.map(([n, q]) => `<div style="display:flex;justify-content:space-between;border-bottom:.3mm dashed #0D1B2A55"><b>${n}</b><span>${q}</span></div>`).join('')}</div>
     </div>
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-top:4mm">
       <div><h3 class="d" style="font-size:5mm;margin:0 0 1.5mm">${t.beforeTitle}</h3><ul style="margin:0;padding-left:4mm;font-size:2.9mm;line-height:1.45">${t.before.map((b) => `<li>${b}</li>`).join('')}</ul></div>
       <div class="card" style="background:var(--yellow);padding:2.6mm 3mm"><h3 class="d" style="font-size:5mm;margin:0 0 1.2mm">⚠ ${t.safetyTitle}</h3><ul style="margin:0;padding-left:4mm;font-size:2.8mm;line-height:1.4;font-weight:600">${t.safety.map((b) => `<li>${b}</li>`).join('')}</ul></div>
     </div>${pageFoot(2)}`,
  )

  // 3-6 · steps, two per page
  const stepImgs = [
    IMG.step1,
    IMG.step2,
    IMG.step3,
    IMG.step4,
    IMG.step5,
    IMG.step6,
    IMG.step7,
    IMG.step8,
  ]
  const stepBlock = (i) => {
    const s = t.steps[i]
    return `<div class="card" style="padding:3mm 3.4mm 3.2mm;height:90mm;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;gap:2.6mm"><span class="d" style="flex:none;width:11mm;height:11mm;border-radius:50%;background:var(--orange);border:.6mm solid var(--navy);box-shadow:.6mm .6mm 0 var(--navy);display:grid;place-items:center;font-size:7mm">${i + 1}</span><div><div class="d" style="font-size:2.8mm;opacity:.65;letter-spacing:.12em">${t.step} ${i + 1} / 8</div><h3 class="d" style="font-size:6.2mm;margin:.6mm 0 0">${s.title}</h3></div></div>
      <p style="font-size:3.05mm;line-height:1.4;margin:2.2mm 0 1mm;font-weight:500">${s.text}</p>
      <div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center">${stepImgs[i].replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>
      <div style="display:flex;gap:2mm;align-items:flex-start;font-size:2.75mm;line-height:1.35;font-weight:600"><span class="sticker" style="background:var(--yellow);font-size:2.9mm;padding:.8mm 2.2mm .6mm;box-shadow:.5mm .5mm 0 var(--navy);flex:none;transform:rotate(-3deg)">${t.tip}</span><span>${s.tip}</span></div></div>`
  }
  const stepPages = [0, 2, 4, 6].map((i, n) =>
    page(
      'var(--paper)',
      `<div style="display:grid;gap:4.5mm">${stepBlock(i)}${stepBlock(i + 1)}</div>${pageFoot(3 + n)}`,
      'padding-top:8mm',
    ),
  )

  // 7 · how it works
  const how = page(
    'var(--teal)',
    `<div class="blob" style="width:110mm;height:110mm;right:-50mm;top:-50mm;background:#ffffff22"></div>
     ${title(t.howTitle)}
     <div class="card" style="padding:2mm 2mm 1mm">${sideViewSvg(kit, t.labels)}</div>
     <div style="display:grid;gap:3mm;margin-top:4mm">${t.science
       .map(
         (c, i) =>
           `<div class="card" style="padding:2.6mm 3.2mm;display:flex;gap:3mm;align-items:flex-start"><span class="d" style="flex:none;width:9mm;height:9mm;border-radius:2.4mm;background:${['var(--orange)', 'var(--yellow)', 'var(--paper)'][i]};border:.5mm solid var(--navy);display:grid;place-items:center;font-size:5.6mm;transform:rotate(${[-6, 4, -3][i]}deg)">${i + 1}</span><div><h3 class="d" style="font-size:5mm;margin:0 0 1mm">${c.title}</h3><p style="margin:0;font-size:2.95mm;line-height:1.4">${c.text}</p></div></div>`,
       )
       .join('')}</div>
     <div class="card" style="margin-top:3mm;padding:2.6mm 3.2mm;background:var(--yellow);transform:rotate(-1deg)"><h3 class="d" style="font-size:4.6mm;margin:0 0 .8mm">💡 ${t.didYouKnow[0]}</h3><p style="margin:0;font-size:2.95mm;line-height:1.4">${t.didYouKnow[1]}</p></div>${pageFoot(7)}`,
  )

  // 8 · lab
  const table = (rows) =>
    `<table style="width:100%;border-collapse:collapse;font-size:2.8mm;margin-top:2mm;background:#fff"><tr><th style="border:.4mm solid var(--navy);padding:1.4mm"></th>${t.cols.map((c) => `<th class="d" style="border:.4mm solid var(--navy);padding:1.6mm 1mm;font-size:3mm;background:var(--navy);color:var(--paper)">${c}</th>`).join('')}</tr>${rows
      .map(
        (r) =>
          `<tr><th class="d" style="border:.4mm solid var(--navy);padding:2.6mm 1.6mm;font-size:3.8mm;text-align:left">${r}</th>${t.cols.map(() => '<td style="border:.4mm solid var(--navy)"></td>').join('')}</tr>`,
      )
      .join('')}</table>`
  const lab = page(
    'var(--yellow)',
    `${title(t.labTitle)}
     ${[t.lab1, t.lab2]
       .map(
         (l) =>
           `<div class="card" style="padding:3mm 3.4mm;margin-bottom:4mm"><h3 class="d" style="font-size:5.4mm;margin:0 0 1.2mm">${l.title}</h3><p style="margin:0;font-size:2.95mm;line-height:1.4">${l.text}</p>${table(l.rows)}</div>`,
       )
       .join('')}
     <div class="card" style="padding:3.4mm;font-size:3.4mm;font-weight:700;line-height:1.6">${t.labFound}</div>
     <div class="card" style="margin-top:4mm;padding:2.6mm 3.2mm;display:flex;gap:3mm;align-items:center"><div style="flex:none;width:30mm">${partSvg(kit.base).replace(/width="[^"]+" height="[^"]+"/, 'width="100%"')}</div><div><h3 class="d" style="font-size:4.6mm;margin:0 0 .8mm">${t.rulerTip[0]}</h3><p style="margin:0;font-size:2.9mm;line-height:1.4">${t.rulerTip[1]}</p></div></div>${pageFoot(8)}`,
  )

  // 9 · game
  const game = page(
    'var(--orange)',
    `<div class="blob" style="width:90mm;height:90mm;left:-30mm;bottom:-30mm;background:#ffffff26"></div>
     ${title(t.gameTitle, 'var(--navy)', 10)}
     <div style="display:grid;grid-template-columns:44mm 1fr;gap:4mm;align-items:center"><div style="transform:rotate(-6deg)">${targetSvg()}</div><div class="card" style="padding:3mm;font-size:3mm;line-height:1.45;font-weight:500">${t.gameText}<div style="margin-top:2mm;font-weight:700">${t.targetNote}</div></div></div>
     <h3 class="d" style="font-size:5.4mm;margin:5mm 0 2mm">${t.challengesTitle}</h3>
     <div style="display:flex;flex-wrap:wrap;gap:2.4mm">${t.challenges.map((c, i) => `<span class="sticker" style="background:${['var(--paper)', 'var(--yellow)', 'var(--teal)', 'var(--paper)', 'var(--yellow)'][i]};font-size:3.4mm;transform:rotate(${[-3, 2, -1, 3, -2][i]}deg)">${c}</span>`).join('')}</div>
     <table style="width:100%;border-collapse:collapse;margin-top:6mm;background:#fff;font-size:3mm"><tr>${['', '1', '2', '3', '4', '5', t.total].map((h) => `<th class="d" style="border:.4mm solid var(--navy);padding:1.6mm;background:var(--navy);color:var(--paper);font-size:3.4mm">${h}</th>`).join('')}</tr>${[
       1, 2, 3, 4,
     ]
       .map(
         (p) =>
           `<tr><th class="d" style="border:.4mm solid var(--navy);padding:3.6mm 1.6mm;font-size:3.6mm">${t.player} ${p}</th>${Array(6).fill('<td style="border:.4mm solid var(--navy)"></td>').join('')}</tr>`,
       )
       .join('')}</table>${pageFoot(9)}`,
  )

  // 10 · troubleshooting
  const fix = page(
    'var(--paper)',
    `${title(t.fixTitle, 'var(--navy)', 10)}
     <div style="display:grid;gap:2.8mm">${t.fixes.map(([q, a]) => `<div class="card" style="padding:2.6mm 3.2mm"><div class="d" style="font-size:4.4mm;margin-bottom:.8mm">${q}</div><div style="font-size:2.95mm;line-height:1.4">${a}</div></div>`).join('')}</div>
     <div class="card" style="margin-top:4mm;padding:2.8mm 3.4mm;background:var(--teal)"><h3 class="d" style="font-size:4.8mm;margin:0 0 1.2mm">${t.careTitle}</h3><ul style="margin:0;padding-left:4mm;font-size:2.95mm;line-height:1.45;font-weight:600">${t.care.map((c) => `<li>${c}</li>`).join('')}</ul></div>${pageFoot(10)}`,
  )

  // 11 · your invention
  const invent = page(
    'var(--paper)',
    `${title(t.inventTitle)}<p style="font-size:3.4mm;font-weight:600;margin:-1mm 0 3mm">${t.inventText}</p>
     <div style="height:136mm;border:.7mm dashed var(--navy);border-radius:5mm;background:#fff;position:relative"><div style="position:absolute;right:4mm;bottom:4mm;width:26mm;opacity:.25">${logoMarkSvg(false)}</div></div>
     <div style="display:flex;flex-wrap:wrap;gap:2.4mm;margin-top:4mm">${t.inventIdeas.map((c, i) => `<span class="sticker" style="background:${['var(--yellow)', 'var(--teal)', 'var(--paper)', 'var(--yellow)'][i]};font-size:3.4mm;transform:rotate(${[-2, 3, -3, 2][i]}deg)">${c}</span>`).join('')}</div>${pageFoot(11)}`,
  )

  // 12 · back
  const back = page(
    'var(--navy)',
    `<div class="blob" style="width:160mm;height:160mm;left:-60mm;bottom:-70mm;background:#13263B"></div>
     <div style="position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6mm">
       <div style="width:44mm">${logoMarkSvg(true)}</div>
       <div class="d" style="font-size:15mm;color:var(--paper)">INVENTO</div>
       <div class="d" style="font-size:6mm;color:var(--yellow);letter-spacing:.1em">${t.slogan}</div>
       <div style="color:var(--paper);font-size:3.4mm;line-height:1.6;opacity:.85">${t.backBox}<br>${t.backMade}<br>${t.backNext}</div>
     </div>`,
  )

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}@page{size:${W}mm ${H}mm;margin:0}</style></head><body>${[cover, parts, ...stepPages, how, lab, game, fix, invent, back].join('')}</body></html>`
}

/* ---------------- woodworker spec (A4, Macedonian) ---------------- */
function bandNumbers(k) {
  const at = (theta, u) => {
    const a = deg(theta)
    return [k.P[0] + u * Math.cos(a), k.P[1] + u * Math.sin(a)]
  }
  const stop = k.STOPS[1].c
  const loop = (theta, u) => {
    const p = at(theta, u)
    const d = Math.hypot(p[0] - stop[0], p[1] - stop[1])
    return 2 * d + (Math.PI * k.D) / 2 + k.W
  }
  return k.NOTCHES.map((u) => ({ rest: loop(135, u), pulled: loop(180, u) }))
}

function specHtml() {
  const W = 210
  const H = 297
  const size = (p) => {
    const b = bbox(p)
    return `${(b.maxx - b.minx).toFixed(0)} × ${(b.maxy - b.miny).toFixed(0)}`
  }
  const band = bandNumbers(kit)
  const flat = Math.round(band[1].rest / 2 / 1.15) // flat length so the band is lightly stretched at rest (notch 2)
  const rows = [
    [1, 'Основа', 1, size(kit.base), '4 отвори за држачите, гравирани линијар, лого и стрелка'],
    [
      2,
      'Лев држач',
      1,
      size(kit.supportL),
      'огледален на 3; запчиња надолу; 4 дупки Ø' + kit.HOLE.snug,
    ],
    [3, 'Десен држач', 1, size(kit.supportR), '4 дупки Ø' + kit.HOLE.snug + ' (оска + 3 агли)'],
    [
      4,
      'Рака',
      1,
      size(kit.arm),
      'дупка Ø' + kit.HOLE.free + ', 3 жлеба од двете страни, запче за чашката',
    ],
    [
      5,
      'Дно на чашката',
      1,
      size(kit.cupBottom),
      'отвор ' + (kit.T + 0.1).toFixed(1) + ' × 12 за запчето',
    ],
    [6, 'Прстен на чашката', 1, size(kit.cupRing), 'исто + дупка Ø' + kit.CUP.hole],
    [7, 'Подлошка', '2 + 1 резервна', 'Ø14', 'дупка Ø' + kit.HOLE.free],
    [8, 'Капаче', '4 + 2 резервни', 'Ø13', 'дупка Ø' + kit.HOLE.tight + ' (тесно, се притиска)'],
  ]
  const fits = [
    [
      'Отвори во основата за држачите',
      `${kit.T} × 10 и ${kit.T} × 14 мм`,
      'Држачот влегува со притисок на прст и не испаѓа сам. Запчињата се различно долги намерно: држачот влегува само на правилниот начин.',
    ],
    [
      'Дупки во држачите (оска и агли)',
      `Ø ${kit.HOLE.snug} мм`,
      'Стапчето се лизга со мал отпор; дете може да го премести.',
    ],
    [
      'Дупка во раката и подлошките',
      `Ø ${kit.HOLE.free} мм`,
      'Раката слободно се врти на стапчето.',
    ],
    ['Капачиња', `Ø ${kit.HOLE.tight} мм`, 'Цврсто седат на стапчето и не паѓаат при игра.'],
    [
      'Отвор во чашката',
      `${(kit.T + 0.1).toFixed(1)} × 12 мм`,
      'Запчето на раката влегува цврсто.',
    ],
  ]
  const th =
    'style="text-align:left;background:var(--navy);color:var(--paper);padding:1.6mm 2mm;font-size:3mm"'
  const td = 'style="border-bottom:.3mm solid #0D1B2A33;padding:1.6mm 2mm;vertical-align:top"'
  const sec = (n, txt) =>
    `<h2 class="d" style="font-size:6.4mm;margin:6mm 0 2.4mm;display:flex;align-items:center;gap:2.4mm"><span style="width:8mm;height:8mm;border-radius:50%;background:var(--orange);border:.5mm solid var(--navy);display:grid;place-items:center;font-size:4.6mm">${n}</span>${txt}</h2>`
  const page = (inner) =>
    `<section class="page" style="width:${W}mm;height:${H}mm;padding:14mm 15mm;background:#fff">${inner}<div style="position:absolute;bottom:8mm;left:15mm;right:15mm;display:flex;justify-content:space-between;font-size:2.6mm;opacity:.6"><span>INVENTO · Кутија 01 · Мини катапулт · Спецификација за сечење</span><span>верзија 1 · ${new Date().toISOString().slice(0, 10)}</span></div></section>`
  const p1 = page(`
    <div style="display:flex;justify-content:space-between;align-items:center">${logo(false, 11)}<span class="sticker" style="background:var(--yellow);font-size:4mm">КУТИЈА 01</span></div>
    <h1 class="d" style="font-size:15mm;margin:6mm 0 1mm">МИНИ КАТАПУЛТ</h1>
    <p style="font-size:4.2mm;margin:0 0 4mm;font-weight:600">Спецификација за ласерско сечење · шперплоча ${kit.T} мм (или ${kit3.T} мм)</p>
    <div class="card" style="padding:3mm;box-shadow:none">${sheetPictureSvg(kit)}</div>
    <p style="font-size:2.9mm;opacity:.75;margin:1.6mm 0 0">Еден комплет = една плоча ${300} × ${200} мм. Броевите во портокалово се само за оваа слика; во фајлот нема текст.</p>
    ${sec(1, 'Фајлови')}
    <table style="width:100%;border-collapse:collapse;font-size:3mm"><tr><th ${th}>Фајл</th><th ${th}>За што</th></tr>
      <tr><td ${td}><b>cut/catapult-4mm.svg</b></td><td ${td}>Главен фајл, шперплоча ${kit.T} мм. Стапчиња ${kit.DOWEL_LEN} мм.</td></tr>
      <tr><td ${td}><b>cut/catapult-3mm.svg</b></td><td ${td}>Ако се сече на ${kit3.T} мм. Стапчиња ${kit3.DOWEL_LEN} мм.</td></tr>
      <tr><td ${td}><b>cut/test-piece-4mm.svg</b> (и 3mm)</td><td ${td}>Тест-парче за налегнување: отвори ${(kit.T - 0.3).toFixed(1)}–${(kit.T + 0.1).toFixed(1)} мм и дупки Ø5.6–7.0 мм.</td></tr></table>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-top:3mm;font-size:3mm;line-height:1.45">
      <div class="card" style="padding:2.6mm 3mm;box-shadow:none"><b style="color:#FF0000">● Црвена линија (#FF0000)</b><br>сечи низ целата плоча</div>
      <div class="card" style="padding:2.6mm 3mm;box-shadow:none"><b style="color:#0000FF">● Сина линија (#0000FF)</b><br>гравирај линиски, плитко (≈0.2–0.3 мм)</div>
    </div>
    <p style="font-size:3mm;line-height:1.45;margin:2.4mm 0 0"><b>Единици: мм, размер 1:1.</b> Не скалирај. Линиите се 0.1 мм; сите затворени форми се вистински делови.</p>`)
  const p2 = page(`
    ${sec(2, 'Материјал')}
    <ul style="font-size:3.2mm;line-height:1.55;margin:0;padding-left:5mm">
      <li>Брезова шперплоча <b>${kit.T} мм</b> (или ${kit3.T} мм со другиот фајл), рамна, без пукнатини и јазли.</li>
      <li>Лепак во плочата со низок формалдехид (класа E1 или подобра), погоден за играчки за деца.</li>
      <li>Без бои и лакови, освен ако INVENTO не потврди дека премазот е безбеден за играчки.</li>
    </ul>
    ${sec(3, 'Мерки и налегнување')}
    <p style="font-size:3.2mm;line-height:1.5;margin:0 0 2mm"><b>Сите мерки во фајлот се финални мерки на деловите.</b> Компензирај ја ширината на зракот (керф) во софтверот за ласерот. Плочите „4 мм“ често се 3.6–3.9 мм: измери ја вистинската дебелина.</p>
    <table style="width:100%;border-collapse:collapse;font-size:3mm"><tr><th ${th}>Место</th><th ${th}>Мерка</th><th ${th}>Како треба да налегне</th></tr>${fits.map((f) => `<tr><td ${td}><b>${f[0]}</b></td><td ${td} style="white-space:nowrap">${f[1]}</td><td ${td}>${f[2]}</td></tr>`).join('')}</table>
    <div class="card" style="background:var(--yellow);padding:3mm 3.4mm;margin-top:3mm;font-size:3.1mm;line-height:1.5"><b class="d" style="font-size:4.6mm">ПРВО ТЕСТ-ПАРЧЕТО</b><br>Исечи го <b>test-piece</b>, пробај парче од плочата во отворите и стапче Ø6 во дупките. Испрати ни кои мерки најдобро налегнуваат (и вистинската дебелина на плочата): ќе испратиме нов, прилагоден фајл за точно таа плоча.</div>
    ${sec(4, 'Делови во еден комплет')}
    <table style="width:100%;border-collapse:collapse;font-size:3mm"><tr><th ${th}>#</th><th ${th}>Дел</th><th ${th}>Кол.</th><th ${th}>Големина (мм)</th><th ${th}>Забелешка</th></tr>${rows.map((r) => `<tr><td ${td}><b>${r[0]}</b></td><td ${td}><b>${r[1]}</b></td><td ${td}>${r[2]}</td><td ${td} style="white-space:nowrap">${r[3]}</td><td ${td}>${r[4]}</td></tr>`).join('')}</table>`)
  const p3 = page(`
    ${sec(5, 'Стапчиња (не се сечат на ласер)')}
    <p style="font-size:3.2mm;line-height:1.5;margin:0">Тркалезно дрвено стапче (бука или бреза) <b>Ø6 мм</b>, должина <b>${kit.DOWEL_LEN} мм</b> за плоча ${kit.T} мм (<b>${kit3.DOWEL_LEN} мм</b> за ${kit3.T} мм). <b>2 парчиња по комплет.</b> Краевите малку исбрусени, без ивери.</p>
    ${sec(6, 'Обработка')}
    <ul style="font-size:3.2mm;line-height:1.55;margin:0;padding-left:5mm">
      <li>Исчисти го чадот и нагорените рабови (мека четка или малку влажна крпа).</li>
      <li>Ако има остри рабови или ивери, исбрусете ги (шмиргла 180–240).</li>
      <li>Гравираните броеви и агли треба јасно да се читаат: децата ги следат во упатството.</li>
    </ul>
    ${sec(7, 'Контрола: склопи го првиот комплет од секоја серија')}
    <div style="columns:2;column-gap:6mm;font-size:3.1mm;line-height:1.75">${[
      'Држачите цврсто седат во основата',
      'Раката слободно се врти на оската',
      'Стапчето за агол може да се префрли со детска рака',
      'Капачињата држат и не паѓаат',
      'Чашката цврсто седи на раката',
      'Катапултот фрла помпон напред',
      'Нема ивери и остри рабови',
      'Броеви на сите делови: 1–8',
    ]
      .map((c) => `<div>☐ ${c}</div>`)
      .join('')}</div>
    ${sec(8, 'Што оди во еден комплет')}
    <table style="width:100%;border-collapse:collapse;font-size:3mm"><tr><th ${th}>Ставка</th><th ${th}>Кол.</th><th ${th}>Забелешка</th></tr>
      ${[
        ['Дрвени делови 1–8 (една плоча)', '1 комплет', 'во кесичка'],
        ['Дрвено стапче Ø6 × ' + kit.DOWEL_LEN + ' мм', '2', ''],
        [
          'Ластик (природна гума)',
          '3',
          `≈${flat} мм долг кога е сплескан, 1.5–3 мм широк; да се потврди на прототипот`,
        ],
        ['Мек помпон Ø25 мм', '6', 'само меки помпони'],
        ['Упатство (A5) и мета (A4)', '1 + 1', 'PDF: catapult-guide-mk.pdf, catapult-target.pdf'],
      ]
        .map(
          (r) =>
            `<tr><td ${td}><b>${r[0]}</b></td><td ${td}>${r[1]}</td><td ${td}>${r[2]}</td></tr>`,
        )
        .join('')}</table>
    ${sec(9, 'Прототип')}
    <ol style="font-size:3.2mm;line-height:1.55;margin:0;padding-left:5mm">
      <li>Исечи го тест-парчето и јави ни ги резултатите.</li>
      <li>Исечи <b>1–2 прототипи</b>. INVENTO ќе ги тестира со деца (склопување, фрлање, ластици).</li>
      <li>По тестот го потврдуваме фајлот и количината за серијата.</li>
    </ol>
    <div class="card" style="margin-top:6mm;padding:3mm 3.4mm;font-size:3mm;line-height:1.5;background:var(--paper)"><b>Мерки за проверка:</b> оската е ${kit.P[1]} мм над основата; растојание помеѓу држачите ${kit.G} мм (рака ${kit.T} мм + подлошка ${kit.T} мм од секоја страна + 1 мм луфт). Стапчето за агол на 45° ја запира раката на 135°.</div>`)
  return `<!doctype html><html lang="mk"><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}@page{size:A4;margin:0}</style></head><body>${p1}${p2}${p3}</body></html>`
}

/* ---------------- printable target (A4, both languages) ---------------- */
function targetHtml() {
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}@page{size:A4;margin:0}</style></head><body><section class="page" style="width:210mm;height:297mm;padding:14mm;background:#fff">
    <div style="display:flex;justify-content:space-between;align-items:center">${logo(false, 11)}<span class="sticker" style="background:var(--yellow);font-size:4.6mm;transform:rotate(3deg)">МЕТА · TARGET</span></div>
    <div style="margin:14mm auto 0;width:178mm">${targetSvg()}</div>
    <div style="display:flex;justify-content:center;gap:4mm;margin-top:12mm">${[
      ['50', 'var(--orange)'],
      ['30', 'var(--yellow)'],
      ['20', 'var(--teal)'],
      ['10', '#fff'],
    ]
      .map(([n, c]) => `<span class="sticker" style="background:${c};font-size:5mm">${n}</span>`)
      .join('')}</div>
    <p class="d" style="text-align:center;font-size:5mm;margin-top:8mm;letter-spacing:.06em">1–2 м · 5 фрлања · најмногу поени победува<br><span style="opacity:.6">1–2 m · 5 launches · most points wins</span></p></section></body></html>`
}

/* ---------------- print ---------------- */
const browser = await chromium.launch()
async function pdf(html, file, opts) {
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.pdf({ path: out(file), printBackground: true, preferCSSPageSize: true, ...opts })
  writeFileSync(out('html', file.replace('.pdf', '.html')), html)
  await page.close()
}
mkdirSync(out('html'), { recursive: true })
await pdf(guideHtml('mk'), 'catapult-guide-mk.pdf')
await pdf(guideHtml('en'), 'catapult-guide-en.pdf')
await pdf(specHtml(), 'catapult-woodworker-mk.pdf')
await pdf(targetHtml(), 'catapult-target.pdf')
await browser.close()
console.log(
  'INVENTO box 01 built:',
  thicknesses.map((t) => `${t} mm`).join(', '),
  '· band loop (notch 2) rest/pulled mm:',
  bandNumbers(kit)[1],
)
