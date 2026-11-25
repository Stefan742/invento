import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** M0-M2 acceptance: routing, locales, static pages, public API closed, a11y. Needs a seeded DB. */

test.describe('locale routing', () => {
  test('/ redirects to /mk for a non-English browser', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'de-DE', extraHTTPHeaders: { 'Accept-Language': 'de-DE,de;q=0.9' } })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page).toHaveURL(/\/mk$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'mk')
    await ctx.close()
  })

  test('/ redirects to /en for a clearly English browser', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'en-US', extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' } })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await ctx.close()
  })

  test('language switch keeps the page', async ({ page }) => {
    await page.goto('/mk/kits')
    await page.getByRole('navigation', { name: 'Јазик' }).first().getByRole('link', { name: 'EN' }).click()
    await expect(page).toHaveURL(/\/en\/kits$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('pages emit hreflang alternates', async ({ page }) => {
    await page.goto('/mk/faq')
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en\/faq$/)
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', /\/mk\/faq$/)
  })
})

test.describe('static site', () => {
  for (const locale of ['mk', 'en']) {
    for (const path of ['', '/kits', '/kits/mini-catapult', '/gallery', '/faq', '/contact', '/about', '/shipping', '/returns', '/privacy', '/terms']) {
      test(`${locale}${path || '/'} renders with one h1`, async ({ page }) => {
        const res = await page.goto(`/${locale}${path}`)
        expect(res?.status()).toBe(200)
        await expect(page.locator('h1')).toHaveCount(1)
      })
    }
  }

  test('unknown pages show the branded 404', async ({ page }) => {
    const res = await page.goto('/mk/does-not-exist')
    expect(res?.status()).toBe(404)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ОПА')
  })

  test('works with JavaScript disabled', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false })
    const page = await ctx.newPage()
    await page.goto('/mk')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ГРАДИ')
    await expect(page.locator('#how-it-works')).toBeVisible()
    await ctx.close()
  })

  test('sitemap and robots', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('/en/kits')
    const robots = await request.get('/robots.txt')
    expect(await robots.text()).toContain('Disallow: /admin')
  })
})

test.describe('public API is closed', () => {
  for (const collection of ['orders', 'users']) {
    test(`cannot read ${collection}`, async ({ request }) => {
      const res = await request.get(`/api/${collection}`)
      expect(res.status()).toBe(403)
    })
  }

  test('cannot create an order through the REST API', async ({ request }) => {
    const res = await request.post('/api/orders', { data: { customerName: 'x', phone: '1', city: 'x', address: 'x' } })
    expect(res.status()).toBe(403)
  })

  test('cannot create kits', async ({ request }) => {
    const res = await request.post('/api/kits', { data: { title: 'x', slug: 'x' } })
    expect(res.status()).toBe(403)
  })

  test('health endpoint answers', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
  })
})

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  for (const path of ['/mk', '/en', '/mk/kits', '/mk/kits/mini-catapult', '/mk/faq', '/mk/gallery', '/mk/contact']) {
    test(`no serious violations on ${path}`, async ({ page }) => {
      await page.goto(path)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([])
    })
  }
})
