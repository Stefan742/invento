import { expect, test } from '@playwright/test'

/** M4: motion is an enhancement. These tests check the rules around it, not the visuals. */

test.describe('preloader', () => {
  test('shows on the first home visit, can be skipped, and not again this session', async ({ page }) => {
    await page.goto('/mk')
    const overlay = page.locator('[data-preloader]')
    await expect(overlay).toBeVisible()
    // Skip appears after ~800 ms
    const skip = page.getByRole('button', { name: 'Прескокни' })
    await expect(skip).toBeVisible({ timeout: 4000 })
    await skip.click()
    await expect(overlay).toBeHidden({ timeout: 3000 })
    await expect(page.locator('html')).not.toHaveClass(/show-preloader/)

    await page.goto('/en')
    await expect(page.locator('[data-preloader]')).toBeHidden()
  })

  test('finishes on its own within the hard cap', async ({ page }) => {
    await page.goto('/mk')
    await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 9000 })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('Escape skips it', async ({ page }) => {
    await page.goto('/mk')
    await expect(page.locator('[data-preloader]')).toBeVisible()
    await page.waitForTimeout(400)
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 3000 })
  })

  test('a reload of the home page starts at the top and shows it again', async ({ page }) => {
    await page.goto('/mk')
    await expect(page.locator('[data-preloader]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 3000 })
    await page.evaluate(() => window.scrollTo(0, 2500))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)
    await page.reload()
    await expect(page.locator('[data-preloader]')).toBeVisible()
    await page.waitForLoadState('load')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('?intro shows it again in the same session', async ({ page }) => {
    await page.goto('/mk?skip')
    await page.evaluate(() => sessionStorage.setItem('invento-intro-seen', '1'))
    await page.goto('/mk')
    await expect(page.locator('[data-preloader]')).toBeHidden()
    await page.goto('/mk?intro')
    await expect(page.locator('[data-preloader]')).toBeVisible()
  })

  test('?skip and other pages never show it', async ({ page }) => {
    await page.goto('/mk?skip')
    await expect(page.locator('[data-preloader]')).toBeHidden()
    await page.goto('/mk/kits')
    await expect(page.locator('[data-preloader]')).toHaveCount(0)
  })

  test('never shows without JavaScript', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false })
    const page = await ctx.newPage()
    await page.goto('/mk')
    await expect(page.locator('[data-preloader]')).toBeHidden()
    await ctx.close()
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('no preloader, no pinning, no track, static pile, full content', async ({ page }) => {
    await page.goto('/mk')
    await expect(page.locator('[data-preloader]')).toBeHidden()
    await page.waitForTimeout(1500)
    await expect(page.locator('[data-sticky-pin]')).toHaveCount(0)
    await expect(page.locator('canvas.track-canvas')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveClass(/has-gear-cursor/)
    // All slogan words and section titles are readable.
    for (const word of ['ГРАДИ', 'ОТКРИВАЈ', 'СОЗДАВАЈ']) {
      await expect(page.getByRole('heading', { level: 1 })).toContainText(word)
    }
    await expect(page.locator('#how-it-works [data-hiw-card]')).toHaveCount(4)
    const pileMoved = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-physics-pile] > *')).some((el) => el.style.transform.includes('translate3d')),
    )
    expect(pileMoved).toBe(false)
  })
})

test.describe('motion off switch', () => {
  test('?motion=off leaves a static page', async ({ page }) => {
    await page.goto('/mk?motion=off')
    await expect(page.locator('[data-preloader]')).toBeHidden()
    await page.waitForTimeout(1500)
    await expect(page.locator('[data-sticky-pin]')).toHaveCount(0)
    await expect(page.locator('canvas.track-canvas')).toHaveCount(0)
  })
})

test.describe('motion on (desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('invento-intro-seen', '1'))
  })

  test('hero pins, track draws, no page errors, clean navigation away and back', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('/mk')
    await expect(page.locator('canvas.track-canvas')).toHaveCount(1, { timeout: 8000 })
    await expect(page.locator('[data-sticky-pin]').first()).toBeAttached()
    await page.mouse.wheel(0, 2500)
    await page.waitForTimeout(800)
    await page.goto('/mk/kits')
    await expect(page.locator('canvas.track-canvas')).toHaveCount(0)
    await page.goBack()
    await expect(page.locator('canvas.track-canvas')).toHaveCount(1, { timeout: 8000 })
    expect(errors).toEqual([])
  })

  test('header is a navy bar at the top and a sticky pill once scrolled', async ({ page }) => {
    await page.goto('/mk/faq')
    await expect(page.locator('html')).toHaveClass(/js-motion/)
    await expect(page.locator('html')).toHaveClass(/lenis/) // smooth scroll attached
    const header = page.locator('[data-site-header]')
    await expect(header).not.toHaveAttribute('data-scrolled')
    await page.mouse.wheel(0, 900)
    await expect(header).toHaveAttribute('data-scrolled', '')
    // It stays on screen while scrolling down.
    await page.waitForTimeout(1200)
    expect((await header.boundingBox())?.y).toBe(0)
    await expect(header.getByRole('link', { name: 'INVENTO, home' })).toBeInViewport()
    await page.mouse.wheel(0, -5000)
    await expect(header).not.toHaveAttribute('data-scrolled')
  })
})
