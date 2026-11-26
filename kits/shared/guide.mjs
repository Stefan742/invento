/**
 * The INVENTO building guide (A5, 12 pages), shared by the kits:
 *   1 cover · 2 what's in the box · 3-6 eight steps · 7 how it works · 8 lab · 9 game ·
 *   10 troubleshooting + care · 11 your invention · 12 back cover.
 * The kit passes its text (t) and its pictures; the layout and the INVENTO style live here.
 */
import { bbox } from './sheet.mjs'
import { BASE_CSS, FONTS, logo, logoMarkSvg } from './doc.mjs'

const fit = (svg) => svg.replace('<svg ', '<svg style="width:100%;height:100%" ')
const fill = (svg) => svg.replace(/width="[^"]+" height="[^"]+"/, 'width="100%"')
const badge = (id) =>
  `<span class="d" style="flex:none;width:6mm;height:6mm;border-radius:50%;background:var(--orange);border:.5mm solid var(--navy);display:grid;place-items:center;font-size:3.6mm">${id}</span>`

/** A part card for page 2. `svg` is the flat part drawing, `wood` its width in mm (true scale). */
export function partCell({ id, name, qty = '', svg, woodWidth, wide = false, scale = 0.27 }) {
  return `<div class="card" style="padding:2.4mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:1.5mm;${wide ? 'grid-column:span 2;' : ''}">
    <div style="width:${woodWidth * scale}mm;max-width:100%;margin-top:1mm">${fill(svg)}</div>
    <div style="display:flex;align-items:center;gap:1.6mm;width:100%">${badge(id)}<span style="font-size:2.9mm;font-weight:700;line-height:1.15">${name}${qty ? `<br><span style="font-weight:500;opacity:.8">${qty}</span>` : ''}</span></div></div>`
}
export const partWidth = (part) => {
  const b = bbox(part)
  return b.maxx - b.minx
}

/**
 * opts: lang, t (text), cover (svg), steps (8 svgs), partCells (html), how (svg),
 * labTip ({ title, text, art }), gameArt (svg)
 */
export function guideHtml({
  lang,
  t,
  cover,
  steps,
  partCells,
  how,
  labTip,
  gameArt,
  cols,
  partsCols = 3,
}) {
  const W = 148
  const H = 210
  const page = (bg, inner, extra = '') =>
    `<section class="page" style="width:${W}mm;height:${H}mm;background:${bg};padding:9mm;${extra}">${inner}</section>`
  const pageFoot = (n) =>
    `<div style="position:absolute;bottom:5mm;left:9mm;right:9mm;display:flex;justify-content:space-between;font-size:2.6mm;font-weight:700;color:var(--navy);opacity:.7"><span>INVENTO · ${t.backBox}</span><span>${n}</span></div>`
  const title = (txt, size = 11) =>
    `<h2 class="d" style="font-size:${size}mm;margin:0 0 4mm">${txt}</h2>`
  const words = t.title.split(' ')

  const coverPage = page(
    'var(--navy)',
    `<div class="blob" style="width:120mm;height:120mm;left:-40mm;top:-30mm;background:#13263B"></div>
     <div class="blob" style="width:150mm;height:150mm;right:-70mm;bottom:-60mm;background:#13263B"></div>
     <div style="position:relative;display:flex;justify-content:space-between;align-items:center">${logo(true, 10)}<span class="sticker" style="background:var(--yellow);font-size:4.2mm;transform:rotate(4deg)">${t.box}</span></div>
     <h1 class="d" style="position:relative;margin:9mm 0 0;font-size:${t.titleSize ?? 22}mm;color:var(--paper)">${words[0]}<br><span style="color:var(--orange)">${words.slice(1).join(' ')}</span></h1>
     <div style="position:relative;margin:4mm -6mm 0;height:86mm;display:flex;justify-content:center"><div style="position:absolute;width:84mm;height:84mm;border-radius:50%;background:#1E3550;left:50%;top:1mm;transform:translateX(-50%)"></div><div style="position:relative;width:128mm;height:86mm">${fit(cover)}</div></div>
     <p style="position:relative;color:var(--paper);font-size:4mm;font-weight:600;line-height:1.35;margin:3mm 0 4mm;max-width:118mm">${t.intro}</p>
     <div style="position:relative;display:flex;flex-wrap:wrap;gap:2.4mm">${t.coverStickers
       .map(
         (s, i) =>
           `<span class="sticker" style="background:${['var(--yellow)', 'var(--teal)', 'var(--paper)'][i]};font-size:3.6mm;transform:rotate(${[-3, 2, -2][i]}deg);box-shadow:.8mm .8mm 0 #050b12">${s}</span>`,
       )
       .join('')}</div>
     <p class="d" style="position:absolute;bottom:7mm;left:9mm;margin:0;color:var(--yellow);font-size:4mm;letter-spacing:.12em">${t.slogan}</p>`,
  )

  const partsPage = page(
    'var(--paper)',
    `${title(t.partsTitle)}
     <div style="display:grid;grid-template-columns:repeat(${partsCols},1fr);gap:2.4mm">
       ${partCells}
       <div class="card" style="grid-column:span ${partsCols};padding:2.4mm 3mm;font-size:2.9mm;line-height:1.5;display:grid;grid-template-columns:1fr 1fr;column-gap:5mm">${t.extras.map(([n, q]) => `<div style="display:flex;justify-content:space-between;border-bottom:.3mm dashed #0D1B2A55"><b>${n}</b><span>${q}</span></div>`).join('')}</div>
     </div>
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-top:3.4mm">
       <div><h3 class="d" style="font-size:5mm;margin:0 0 1.5mm">${t.beforeTitle}</h3><ul style="margin:0;padding-left:4mm;font-size:2.9mm;line-height:1.45">${t.before.map((b) => `<li>${b}</li>`).join('')}</ul></div>
       <div class="card" style="background:var(--yellow);padding:2.6mm 3mm"><h3 class="d" style="font-size:5mm;margin:0 0 1.2mm">⚠ ${t.safetyTitle}</h3><ul style="margin:0;padding-left:4mm;font-size:2.8mm;line-height:1.4;font-weight:600">${t.safety.map((b) => `<li>${b}</li>`).join('')}</ul></div>
     </div>${pageFoot(2)}`,
  )

  const stepBlock = (i) => {
    const s = t.steps[i]
    return `<div class="card" style="padding:3mm 3.4mm 3.2mm;height:90mm;display:flex;flex-direction:column">
      <div style="display:flex;align-items:center;gap:2.6mm"><span class="d" style="flex:none;width:11mm;height:11mm;border-radius:50%;background:var(--orange);border:.6mm solid var(--navy);box-shadow:.6mm .6mm 0 var(--navy);display:grid;place-items:center;font-size:7mm">${i + 1}</span><div><div class="d" style="font-size:2.8mm;opacity:.65;letter-spacing:.12em">${t.step} ${i + 1} / 8</div><h3 class="d" style="font-size:6.2mm;margin:.6mm 0 0">${s.title}</h3></div></div>
      <p style="font-size:3.05mm;line-height:1.4;margin:2.2mm 0 1mm;font-weight:500">${s.text}</p>
      <div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center">${fit(steps[i])}</div>
      <div style="display:flex;gap:2mm;align-items:flex-start;font-size:2.75mm;line-height:1.35;font-weight:600"><span class="sticker" style="background:var(--yellow);font-size:2.9mm;padding:.8mm 2.2mm .6mm;box-shadow:.5mm .5mm 0 var(--navy);flex:none;transform:rotate(-3deg)">${t.tip}</span><span>${s.tip}</span></div></div>`
  }
  const stepPages = [0, 2, 4, 6].map((i, n) =>
    page(
      'var(--paper)',
      `<div style="display:grid;gap:4.5mm">${stepBlock(i)}${stepBlock(i + 1)}</div>${pageFoot(3 + n)}`,
      'padding-top:8mm',
    ),
  )

  const howPage = page(
    'var(--teal)',
    `<div class="blob" style="width:110mm;height:110mm;right:-50mm;top:-50mm;background:#ffffff22"></div>
     ${title(t.howTitle)}
     <div class="card" style="padding:2mm 2mm 1mm">${how}</div>
     <div style="display:grid;gap:3mm;margin-top:4mm">${t.science
       .map(
         (c, i) =>
           `<div class="card" style="padding:2.6mm 3.2mm;display:flex;gap:3mm;align-items:flex-start"><span class="d" style="flex:none;width:9mm;height:9mm;border-radius:2.4mm;background:${['var(--orange)', 'var(--yellow)', 'var(--paper)'][i]};border:.5mm solid var(--navy);display:grid;place-items:center;font-size:5.6mm;transform:rotate(${[-6, 4, -3][i]}deg)">${i + 1}</span><div><h3 class="d" style="font-size:5mm;margin:0 0 1mm">${c.title}</h3><p style="margin:0;font-size:2.95mm;line-height:1.4">${c.text}</p></div></div>`,
       )
       .join('')}</div>
     <div class="card" style="margin-top:3mm;padding:2.6mm 3.2mm;background:var(--yellow);transform:rotate(-1deg)"><h3 class="d" style="font-size:4.6mm;margin:0 0 .8mm">💡 ${t.didYouKnow[0]}</h3><p style="margin:0;font-size:2.95mm;line-height:1.4">${t.didYouKnow[1]}</p></div>${pageFoot(7)}`,
  )

  const tcols = cols ?? t.cols
  const table = (rows) =>
    `<table style="width:100%;border-collapse:collapse;font-size:2.8mm;margin-top:2mm;background:#fff"><tr><th style="border:.4mm solid var(--navy);padding:1.4mm"></th>${tcols.map((c) => `<th class="d" style="border:.4mm solid var(--navy);padding:1.6mm 1mm;font-size:3mm;background:var(--navy);color:var(--paper)">${c}</th>`).join('')}</tr>${rows
      .map(
        (r) =>
          `<tr><th class="d" style="border:.4mm solid var(--navy);padding:2.6mm 1.6mm;font-size:3.6mm;text-align:left">${r}</th>${tcols.map(() => '<td style="border:.4mm solid var(--navy)"></td>').join('')}</tr>`,
      )
      .join('')}</table>`
  const labPage = page(
    'var(--yellow)',
    `${title(t.labTitle)}
     ${[t.lab1, t.lab2]
       .map(
         (l) =>
           `<div class="card" style="padding:3mm 3.4mm;margin-bottom:4mm"><h3 class="d" style="font-size:5.4mm;margin:0 0 1.2mm">${l.title}</h3><p style="margin:0;font-size:2.95mm;line-height:1.4">${l.text}</p>${table(l.rows)}</div>`,
       )
       .join('')}
     <div class="card" style="padding:3.4mm;font-size:3.4mm;font-weight:700;line-height:1.6">${t.labFound}</div>
     <div class="card" style="margin-top:4mm;padding:2.6mm 3.2mm;display:flex;gap:3mm;align-items:center"><div style="flex:none;width:30mm">${fill(labTip.art)}</div><div><h3 class="d" style="font-size:4.6mm;margin:0 0 .8mm">${labTip.title}</h3><p style="margin:0;font-size:2.9mm;line-height:1.4">${labTip.text}</p></div></div>${pageFoot(8)}`,
  )

  const gamePage = page(
    'var(--orange)',
    `<div class="blob" style="width:90mm;height:90mm;left:-30mm;bottom:-30mm;background:#ffffff26"></div>
     ${title(t.gameTitle, 10)}
     <div style="display:grid;grid-template-columns:44mm 1fr;gap:4mm;align-items:center"><div style="transform:rotate(-6deg)">${gameArt}</div><div class="card" style="padding:3mm;font-size:3mm;line-height:1.45;font-weight:500">${t.gameText}<div style="margin-top:2mm;font-weight:700">${t.targetNote}</div></div></div>
     <h3 class="d" style="font-size:5.4mm;margin:5mm 0 2mm">${t.challengesTitle}</h3>
     <div style="display:flex;flex-wrap:wrap;gap:2.4mm">${t.challenges.map((c, i) => `<span class="sticker" style="background:${['var(--paper)', 'var(--yellow)', 'var(--teal)', 'var(--paper)', 'var(--yellow)'][i % 5]};font-size:3.4mm;transform:rotate(${[-3, 2, -1, 3, -2][i % 5]}deg)">${c}</span>`).join('')}</div>
     <table style="width:100%;border-collapse:collapse;margin-top:6mm;background:#fff;font-size:3mm"><tr>${['', '1', '2', '3', '4', '5', t.total].map((h) => `<th class="d" style="border:.4mm solid var(--navy);padding:1.6mm;background:var(--navy);color:var(--paper);font-size:3.4mm">${h}</th>`).join('')}</tr>${[
       1, 2, 3, 4,
     ]
       .map(
         (p) =>
           `<tr><th class="d" style="border:.4mm solid var(--navy);padding:3.6mm 1.6mm;font-size:3.6mm">${t.player} ${p}</th>${Array(6).fill('<td style="border:.4mm solid var(--navy)"></td>').join('')}</tr>`,
       )
       .join('')}</table>${pageFoot(9)}`,
  )

  const fixPage = page(
    'var(--paper)',
    `${title(t.fixTitle, 10)}
     <div style="display:grid;gap:2.8mm">${t.fixes.map(([q, a]) => `<div class="card" style="padding:2.6mm 3.2mm"><div class="d" style="font-size:4.4mm;margin-bottom:.8mm">${q}</div><div style="font-size:2.95mm;line-height:1.4">${a}</div></div>`).join('')}</div>
     <div class="card" style="margin-top:4mm;padding:2.8mm 3.4mm;background:var(--teal)"><h3 class="d" style="font-size:4.8mm;margin:0 0 1.2mm">${t.careTitle}</h3><ul style="margin:0;padding-left:4mm;font-size:2.95mm;line-height:1.45;font-weight:600">${t.care.map((c) => `<li>${c}</li>`).join('')}</ul></div>${pageFoot(10)}`,
  )

  const inventPage = page(
    'var(--paper)',
    `${title(t.inventTitle)}<p style="font-size:3.4mm;font-weight:600;margin:-1mm 0 3mm">${t.inventText}</p>
     <div style="height:136mm;border:.7mm dashed var(--navy);border-radius:5mm;background:#fff;position:relative"><div style="position:absolute;right:4mm;bottom:4mm;width:26mm;opacity:.25">${logoMarkSvg(false)}</div></div>
     <div style="display:flex;flex-wrap:wrap;gap:2.4mm;margin-top:4mm">${t.inventIdeas.map((c, i) => `<span class="sticker" style="background:${['var(--yellow)', 'var(--teal)', 'var(--paper)', 'var(--yellow)'][i % 4]};font-size:3.4mm;transform:rotate(${[-2, 3, -3, 2][i % 4]}deg)">${c}</span>`).join('')}</div>${pageFoot(11)}`,
  )

  const backPage = page(
    'var(--navy)',
    `<div class="blob" style="width:160mm;height:160mm;left:-60mm;bottom:-70mm;background:#13263B"></div>
     <div style="position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6mm">
       <div style="width:44mm">${logoMarkSvg(true)}</div>
       <div class="d" style="font-size:15mm;color:var(--paper)">INVENTO</div>
       <div class="d" style="font-size:6mm;color:var(--yellow);letter-spacing:.1em">${t.slogan}</div>
       <div style="color:var(--paper);font-size:3.4mm;line-height:1.6;opacity:.85">${t.backBox}<br>${t.backMade}<br>${t.backNext}</div>
     </div>`,
  )

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">${FONTS}<style>${BASE_CSS}@page{size:${W}mm ${H}mm;margin:0}</style></head><body>${[coverPage, partsPage, ...stepPages, howPage, labPage, gamePage, fixPage, inventPage, backPage].join('')}</body></html>`
}
