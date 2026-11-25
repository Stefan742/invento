import { test } from '@playwright/test'
import path from 'path'

/**
 * Review screenshots for the owner at the milestone gates.
 * Output: docs/screenshots/<milestone>/<locale>-<page>-<width>.png
 *   MILESTONE=m2 pnpm screenshots
 */
const MILESTONE = process.env.MILESTONE || 'm2'
const OUT = path.resolve(process.cwd(), 'docs', 'screenshots', MILESTONE)
const WIDTHS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 900 },
]
const PAGES = [
  { name: 'home', path: '' },
  { name: 'kits', path: '/kits' },
  { name: 'kit', path: '/kits/mini-catapult' },
  { name: 'gallery', path: '/gallery' },
  { name: 'faq', path: '/faq' },
  { name: 'contact', path: '/contact' },
  { name: 'about', path: '/about' },
  { name: 'privacy', path: '/privacy' },
  { name: '404', path: '/this-page-does-not-exist' },
]
const LOCALES = (process.env.SCREENSHOT_LOCALES || 'mk,en').split(',')

for (const locale of LOCALES) {
  for (const p of PAGES) {
    // The full matrix for the home page; other pages in mk at all widths, en at mobile + desktop.
    for (const w of WIDTHS) {
      if (p.name !== 'home' && locale === 'en' && w.name === 'tablet') continue
      test(`${locale} ${p.name} ${w.width}`, async ({ page }) => {
        await page.setViewportSize({ width: w.width, height: w.height })
        await page.goto(`/${locale}${p.path}`, { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        // Scroll through once so lazy-loaded images are fetched before the full-page capture.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 60))
          }
          window.scrollTo(0, 0)
        })
        await page.waitForLoadState('networkidle')
        await page.screenshot({
          path: path.join(OUT, `${locale}-${p.name}-${w.width}.jpg`),
          fullPage: true,
          animations: 'disabled',
          type: 'jpeg',
          quality: 78,
        })
      })
    }
  }
}
