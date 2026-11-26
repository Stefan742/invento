/** Page styles, logo and PDF printing shared by the INVENTO kit documents. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

export const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fira+Sans+Extra+Condensed:wght@800&family=Onest:wght@400..800&display=block" rel="stylesheet">'
export const BASE_CSS = `
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
export const logoMarkSvg = (onNavy) =>
  readFileSync(
    join(REPO, 'docs', 'brand', onNavy ? 'invento-mark-on-navy.svg' : 'invento-mark.svg'),
    'utf8',
  ).replace(/<\?xml.*?\?>\s*/, '')
export const logo = (onNavy, size = 9) =>
  `<div style="display:flex;align-items:center;gap:1.6mm"><div style="width:${size}mm;height:${size}mm">${logoMarkSvg(onNavy)}</div><span class="d" style="font-size:${size * 0.75}mm;color:${onNavy ? 'var(--paper)' : 'var(--navy)'}">INVENTO</span></div>`

/**
 * Print HTML documents to PDF with Chromium (fonts load from Google Fonts). Each HTML is also
 * kept in html/ (git-ignored) for quick previews.
 * docs: [{ html, file }], out: (...p) => absolute path in the kit folder
 */
export async function printPdfs(docs, out) {
  mkdirSync(out('html'), { recursive: true })
  const browser = await chromium.launch()
  for (const { html, file } of docs) {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.pdf({ path: out(file), printBackground: true, preferCSSPageSize: true })
    writeFileSync(out('html', file.replace('.pdf', '.html')), html)
    await page.close()
  }
  await browser.close()
}
