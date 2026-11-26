import { test, type Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

/**
 * Owner review material for the M4 gate: short screen recordings and screenshots of each
 * signature moment. Run against a production build for smooth motion:
 *   pnpm build && pnpm start -p 3100
 *   E2E_BASE_URL=http://localhost:3100 MILESTONE=m4 pnpm screenshots --grep @motion
 */
const MILESTONE = process.env.MILESTONE || 'm4'
const OUT = path.resolve(process.cwd(), 'docs', 'screenshots', MILESTONE)

const sizes = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1440, height: 900 },
} as const
type SizeName = keyof typeof sizes

async function scrollBy(page: Page, px: number, ms: number) {
  await page.evaluate(
    async ({ px, ms }) => {
      const start = scrollY
      const t0 = performance.now()
      await new Promise<void>((resolve) => {
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / ms)
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
          window.scrollTo(0, start + px * e)
          if (t < 1) requestAnimationFrame(step)
          else resolve()
        }
        requestAnimationFrame(step)
      })
    },
    { px, ms },
  )
}

async function scrollToSection(page: Page, anchor: string, offset = 0) {
  const y = await page.evaluate(
    ({ anchor, offset }) => {
      const el = document.querySelector(`section[data-track-anchor="${anchor}"]`)!
      const box = (el.parentElement as HTMLElement).dataset.stickyPin !== undefined ? el.parentElement! : el
      return box.getBoundingClientRect().top + scrollY + offset
    },
    { anchor, offset },
  )
  const current = await page.evaluate(() => scrollY)
  await scrollBy(page, y - current, 1200)
}

/** Record one moment as a video file named after it. */
async function record(browser: import('@playwright/test').Browser, name: string, size: SizeName, fn: (page: Page) => Promise<void>, opts: { preloader?: boolean } = {}) {
  fs.mkdirSync(OUT, { recursive: true })
  const tmp = path.join(OUT, '.video-tmp')
  const ctx = await browser.newContext({
    viewport: sizes[size],
    ...(size === 'mobile' ? { isMobile: true, hasTouch: true } : {}),
    recordVideo: { dir: tmp, size: { width: Math.min(sizes[size].width, 1280), height: Math.round(Math.min(sizes[size].width, 1280) * (sizes[size].height / sizes[size].width)) } },
  })
  if (!opts.preloader) await ctx.addInitScript(() => sessionStorage.setItem('invento-intro-seen', '1'))
  const page = await ctx.newPage()
  await fn(page)
  const video = page.video()
  await ctx.close()
  if (video) {
    const src = await video.path()
    fs.renameSync(src, path.join(OUT, `${name}.webm`))
  }
  fs.rmSync(tmp, { recursive: true, force: true })
}

const shot = (page: Page, name: string) => page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: 'jpeg', quality: 78 })

test.describe('@motion recordings', () => {
  test.setTimeout(120_000)

  test('1 preloader', async ({ browser }) => {
    await record(browser, '1-preloader-desktop', 'desktop', async (page) => {
      await page.goto('/mk')
      await page.waitForTimeout(7000)
    }, { preloader: true })
    await record(browser, '1-preloader-mobile', 'mobile', async (page) => {
      await page.goto('/mk')
      await page.waitForTimeout(7000)
    }, { preloader: true })
  })

  test('2 hero dive into the box', async ({ browser }) => {
    await record(browser, '2-hero-desktop', 'desktop', async (page) => {
      await page.goto('/mk', { waitUntil: 'networkidle' })
      await page.waitForTimeout(2800) // word micro-animations
      await scrollBy(page, 2400, 6000)
      await page.waitForTimeout(800)
    })
    await record(browser, '2-hero-mobile', 'mobile', async (page) => {
      await page.goto('/mk', { waitUntil: 'networkidle' })
      await page.waitForTimeout(2800)
      await scrollBy(page, 1900, 5000)
      await page.waitForTimeout(800)
    })
  })

  test('3 marble track, showcase and how-it-works', async ({ browser }) => {
    await record(browser, '3-track-showcase-desktop', 'desktop', async (page) => {
      await page.goto('/mk', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await scrollToSection(page, 'intro', -200)
      await scrollToSection(page, 'pick', 200)
      await page.waitForTimeout(500)
    })
    await record(browser, '3-track-mobile', 'mobile', async (page) => {
      await page.goto('/mk', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await scrollToSection(page, 'intro', -100)
      await scrollToSection(page, 'pick', 600)
    })
  })

  test('4 reveals, questions physics, gallery and footer wordmark', async ({ browser }) => {
    await record(browser, '4-lower-desktop', 'desktop', async (page) => {
      await page.goto('/mk', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await page.evaluate(() => {
        const el = document.querySelector('section[data-track-anchor="pick"]')!
        window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 400)
      })
      await page.waitForTimeout(800)
      await scrollToSection(page, 'questions', 0)
      await page.waitForTimeout(2500)
      // flick a part
      const part = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll<HTMLElement>('[data-physics-pile] > *'))
        const r = els.map((e) => e.getBoundingClientRect()).find((r) => r.top > 0 && r.bottom < innerHeight)
        return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null
      })
      if (part) {
        await page.mouse.move(part.x, part.y)
        await page.mouse.down()
        await page.mouse.move(part.x - 260, part.y - 320, { steps: 6 })
        await page.mouse.up()
        await page.waitForTimeout(1500)
      }
      await scrollToSection(page, 'gallery', 0)
      const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY)
      await scrollBy(page, H, 3500)
      await page.waitForTimeout(800)
    })
  })

  for (const size of Object.keys(sizes) as SizeName[]) {
    test(`screenshots ${size}`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: sizes[size], ...(size === 'mobile' ? { isMobile: true, hasTouch: true } : {}) })
      const page = await ctx.newPage()
      await page.goto('/mk')
      await page.waitForTimeout(1500)
      await shot(page, `${size}-1-preloader`)
      await page.waitForTimeout(6000)
      await shot(page, `${size}-2-hero`)
      const heroEnd = await page.evaluate(() => {
        const w = document.querySelector('[data-sticky-pin]') as HTMLElement | null
        return w ? w.offsetHeight - innerHeight : 0
      })
      await scrollBy(page, heroEnd * 0.55, 1500)
      await page.waitForTimeout(900)
      await shot(page, `${size}-3-hero-dive`)
      for (const [anchor, offset, name] of [
        ['intro', 60, '4-track-intro'],
        ['showcase', 0, '5-showcase'],
        ['how-it-works', 120, '6-how-it-works'],
        ['questions', 80, '7-questions-physics'],
      ] as const) {
        await scrollToSection(page, anchor, offset)
        await page.waitForTimeout(anchor === 'questions' ? 3000 : 1000)
        await shot(page, `${size}-${name}`)
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      await page.waitForTimeout(1500)
      await shot(page, `${size}-8-footer-wordmark`)
      await ctx.close()
    })
  }
})
