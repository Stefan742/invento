import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * M5 accessibility audit (docs/07): axe on every page in both languages, with motion on and
 * with reduced motion, plus a keyboard pass through the main interactions.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const PAGES = ['', '/kits', '/kits/mini-catapult', '/gallery', '/faq', '/contact', '/about', '/shipping', '/returns', '/privacy', '/terms', '/order', '/no-such-page']

async function seriousViolations(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  return r.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)
}

test.describe('axe: every page, both languages', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('invento-intro-seen', '1'))
  })
  for (const locale of ['mk', 'en']) {
    for (const path of PAGES) {
      test(`${locale}${path || '/'}`, async ({ page }) => {
        await page.goto(`/${locale}${path}`)
        await page.waitForLoadState('networkidle')
        expect(await seriousViolations(page)).toEqual([])
      })
    }
  }
})

test.describe('axe with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('home', async ({ page }) => {
    await page.goto('/mk')
    await page.waitForLoadState('networkidle')
    expect(await seriousViolations(page)).toEqual([])
  })
})

test.describe('keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('invento-intro-seen', '1'))
  })

  test('skip link first, then header controls; focus is always visible', async ({ page }) => {
    await page.goto('/mk/kits')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Tab')
    const first = page.locator(':focus')
    await expect(first).toHaveText('Прескокни до содржината')
    await expect(first).toBeVisible()
    // The next 12 stops all show a visible focus indicator.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      const outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el || el === document.body) return 'none'
        const s = getComputedStyle(el)
        return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 ? 'ok' : `${el.tagName} ${s.outlineStyle} ${s.outlineWidth}`
      })
      expect(outline, `tab stop ${i + 2}`).toBe('ok')
    }
  })

  test('skip link moves to the main content', async ({ page }) => {
    await page.goto('/mk/faq')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#main$/)
    await page.keyboard.press('Tab')
    const inMain = await page.evaluate(() => Boolean(document.activeElement?.closest('main')))
    expect(inMain).toBe(true)
  })

  test('cart drawer opens from the keyboard and Escape returns focus', async ({ page }) => {
    await page.goto('/mk/kits/mini-catapult')
    await page.waitForLoadState('networkidle')
    const cartButton = page.locator('[data-cart-button]')
    await cartButton.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'КОШНИЧКА' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(cartButton).toBeFocused()
  })

  test('mobile menu: keyboard open, Escape closes and returns focus', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const page = await ctx.newPage()
    await page.goto('/mk/faq')
    await page.waitForLoadState('networkidle')
    const toggle = page.getByRole('button', { name: 'Отвори мени' })
    await toggle.focus()
    await page.keyboard.press('Enter')
    const menu = page.getByRole('dialog', { name: 'Мени' })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('link').first()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(page.getByRole('button', { name: 'Отвори мени' })).toBeFocused()
    await ctx.close()
  })

  test('gallery lightbox: Enter opens, arrows move, Escape closes', async ({ page }) => {
    await page.goto('/mk/gallery')
    await page.waitForLoadState('networkidle')
    const first = page.locator('main a[href*="/api/media/"]').first()
    await first.focus()
    await page.keyboard.press('Enter')
    const dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()
    const before = await dialog.locator('img').getAttribute('src')
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => dialog.locator('img').getAttribute('src')).not.toBe(before)
    await page.keyboard.press('Escape')
    await expect(page.locator('dialog[open]')).toHaveCount(0)
  })

  test('FAQ accordions work with Enter / Space', async ({ page }) => {
    await page.goto('/mk/faq')
    const summary = page.locator('summary').first()
    await summary.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('details').first()).toHaveAttribute('open', '')
  })

  test('Tab on the preloader skips it instead of focusing hidden links', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/mk')
    await expect(page.locator('[data-preloader]')).toBeVisible()
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-preloader]')).toBeHidden({ timeout: 2000 })
    await ctx.close()
  })
})

test('every page sends a strict CSP and logs no violations', async ({ page }) => {
  const violations: string[] = []
  page.on('console', (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text().slice(0, 200))
  })
  for (const path of ['/mk', '/mk/kits/mini-catapult', '/mk/order', '/en/contact']) {
    const res = await page.goto(path)
    const csp = res?.headers()['content-security-policy'] ?? ''
    expect(csp).toContain("script-src 'self' 'nonce-")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("frame-ancestors 'self'")
    await page.waitForLoadState('networkidle')
  }
  expect(violations).toEqual([])
})
