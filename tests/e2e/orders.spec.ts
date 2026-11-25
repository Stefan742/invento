import { expect, test, type APIRequestContext } from '@playwright/test'

/**
 * M3 order flow (docs/06). Creates its own test kits through the admin API and removes them after.
 * Requires ADMIN_EMAIL / ADMIN_PASSWORD (from .env) and a seeded database.
 */
test.describe.configure({ mode: 'serial' })

const fakeIp = () => `10.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}`
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

let jwt = ''
const auth = () => ({ Authorization: `JWT ${jwt}` })
const kits: Record<string, number> = {}

async function createKit(request: APIRequestContext, slug: string, data: Record<string, unknown>) {
  const existing = await request.get(`/api/kits?where[slug][equals]=${slug}&draft=true`, { headers: auth() })
  for (const d of (await existing.json()).docs ?? []) await request.delete(`/api/kits/${d.id}`, { headers: auth() })
  const res = await request.post('/api/kits?locale=mk', {
    headers: auth(),
    data: { slug, title: `E2E ${slug}`, _status: 'published', isPlaceholder: false, ...data },
  })
  expect(res.ok(), await res.text()).toBeTruthy()
  const id = (await res.json()).doc.id as number
  await request.patch(`/api/kits/${id}?locale=en`, { headers: auth(), data: { title: `E2E ${slug} EN`, _status: 'published' } })
  kits[slug] = id
  return id
}

async function setOrdersOpen(request: APIRequestContext, open: boolean) {
  const res = await request.post('/api/globals/site-settings', { headers: auth(), data: { ordersOpen: open } })
  expect(res.ok(), await res.text()).toBeTruthy()
}

/** A signed form token, read from the server-rendered order page (as a browser would get it). */
async function formToken(request: APIRequestContext, path = '/mk/order') {
  const html = await (await request.get(path)).text()
  const m = html.match(/formToken\\?":\\?"(\d+\.[A-Za-z0-9_-]+)/)
  expect(m, 'form token in page').not.toBeNull()
  return m![1]
}

const customer = {
  customerName: 'E2E Тест',
  phone: '070 123 456',
  email: '',
  city: 'Скопје',
  address: 'E2E улица 1',
  notes: '',
  preferredContact: 'viber',
  privacyConsent: true,
  locale: 'mk',
}

async function postOrder(request: APIRequestContext, body: Record<string, unknown>, ip = fakeIp()) {
  return request.post('/api/order', { data: { ...customer, ...body }, headers: { 'x-forwarded-for': ip } })
}

test.beforeAll(async ({ request }) => {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  expect(email && password, 'ADMIN_EMAIL / ADMIN_PASSWORD must be set').toBeTruthy()
  const res = await request.post('/api/users/login', { data: { email, password } })
  expect(res.ok()).toBeTruthy()
  jwt = (await res.json()).token
  await setOrdersOpen(request, true)
  await createKit(request, 'e2e-free', { priceMKD: 1200 }) // no stock tracking
  await createKit(request, 'e2e-last-one', { stockTotal: 5, stockRemaining: 1 })
  await createKit(request, 'e2e-sold-out', { stockTotal: 5, stockRemaining: 0 })
})

test.afterAll(async ({ request }) => {
  await setOrdersOpen(request, true)
  const orders = await request.get('/api/orders?where[customerName][like]=E2E&limit=200', { headers: auth() })
  for (const o of (await orders.json()).docs ?? []) await request.delete(`/api/orders/${o.id}`, { headers: auth() })
  for (const id of Object.values(kits)) await request.delete(`/api/kits/${id}`, { headers: auth() })
})

for (const locale of ['mk', 'en'] as const) {
  test(`happy path order in ${locale}`, async ({ page, request }) => {
    await page.setExtraHTTPHeaders({ 'x-forwarded-for': fakeIp() })
    await page.goto(`/${locale}/kits/e2e-free`)
    await page.getByRole('button', { name: locale === 'mk' ? 'Повеќе' : 'More' }).click()
    await page.getByRole('button', { name: locale === 'mk' ? 'Додај во кошничка' : 'Add to cart' }).first().click()
    const drawer = page.getByRole('dialog', { name: locale === 'mk' ? 'КОШНИЧКА' : 'CART' })
    await expect(drawer).toBeVisible()
    await expect(drawer.locator('[data-cart-line="e2e-free"]')).toContainText('2')
    await drawer.getByRole('link', { name: locale === 'mk' ? /Продолжи кон нарачка/ : /Continue to order/ }).click()

    await expect(page).toHaveURL(new RegExp(`/${locale}/order$`))
    const L = locale === 'mk'
    await page.getByLabel(L ? 'Име и презиме' : 'Full name').fill(`E2E ${locale}`)
    await page.getByLabel(L ? 'Телефон (Viber)' : 'Phone (Viber)').fill('070 123 456')
    await page.getByLabel(L ? /^Град/ : /^City/).fill('Скопје')
    await page.getByLabel(L ? 'Адреса за достава' : 'Delivery address').fill('E2E 1')
    await page.getByRole('checkbox').check()
    await wait(3200) // the server rejects forms submitted faster than a person could
    await page.getByRole('button', { name: L ? 'Испрати нарачка' : 'Send order' }).click()

    await expect(page).toHaveURL(new RegExp(`/${locale}/order/[A-Za-z0-9_-]{20,}$`))
    const ref = await page.locator('[data-order-ref]').innerText()
    expect(ref).toMatch(/^INV-\d{4,}$/)
    // No personal data on the success page.
    await expect(page.locator('main')).not.toContainText('070 123 456')
    await expect(page.locator('main')).not.toContainText('E2E 1')
    // Cart is cleared.
    await expect(page.locator('[data-cart-button]')).toHaveAccessibleName(/(Празна кошничка|Empty cart)/)

    const stored = await request.get(`/api/orders?where[ref][equals]=${ref}`, { headers: auth() })
    const doc = (await stored.json()).docs[0]
    expect(doc.locale).toBe(locale)
    expect(doc.items[0].quantity).toBe(2)
    expect(doc.items[0].priceSnapshot).toBe(1200)
    expect(doc.subtotal).toBe(2400)
    expect(doc.phone).toBe('+38970123456')
  })
}

test('sold-out kit cannot be added or ordered', async ({ page, request }) => {
  await page.goto('/mk/kits/e2e-sold-out')
  await expect(page.locator('[data-order-blocked]')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Додај во кошничка', exact: true })).toHaveCount(0)

  const token = await formToken(request)
  await wait(3200)
  const res = await postOrder(request, { formToken: token, items: [{ kitId: kits['e2e-sold-out'], quantity: 1 }] })
  expect(res.status()).toBe(409)
  expect(await res.json()).toMatchObject({ code: 'stock', kits: ['E2E e2e-sold-out'] })
})

test('concurrent orders cannot oversell the last piece', async ({ request }) => {
  const [t1, t2] = [await formToken(request), await formToken(request)]
  await wait(3200)
  const body = (token: string) => ({ formToken: token, items: [{ kitId: kits['e2e-last-one'], quantity: 1 }] })
  const results = await Promise.all([postOrder(request, body(t1)), postOrder(request, body(t2))])
  expect(results.map((r) => r.status()).sort()).toEqual([201, 409])

  const kit = await request.get(`/api/kits/${kits['e2e-last-one']}`, { headers: auth() })
  expect((await kit.json()).stockRemaining).toBe(0)
})

test('honeypot submissions are rejected', async ({ request }) => {
  const token = await formToken(request)
  await wait(3200)
  const res = await postOrder(request, { formToken: token, website: 'http://spam.example', items: [{ kitId: kits['e2e-free'], quantity: 1 }] })
  expect(res.status()).toBe(400)
  expect((await res.json()).code).toBe('spam')
})

test('instant submissions and forged tokens are rejected', async ({ request }) => {
  const fast = await postOrder(request, { formToken: await formToken(request), items: [{ kitId: kits['e2e-free'], quantity: 1 }] })
  expect((await fast.json()).code).toBe('spam')
  const forged = await postOrder(request, { formToken: `${Date.now() - 10_000}.forged`, items: [{ kitId: kits['e2e-free'], quantity: 1 }] })
  expect((await forged.json()).code).toBe('spam')
})

test('invalid input is rejected server-side with field codes', async ({ request }) => {
  const token = await formToken(request)
  await wait(3200)
  const res = await postOrder(request, { formToken: token, phone: 'nope', privacyConsent: false, items: [{ kitId: kits['e2e-free'], quantity: 99 }] })
  expect(res.status()).toBe(400)
  const body = await res.json()
  expect(body.code).toBe('validation')
  expect(body.fields).toMatchObject({ phone: 'phone', privacyConsent: 'consent' })
})

test('rate limit: the 6th request from one IP within 10 minutes is refused', async ({ request }) => {
  const ip = fakeIp()
  const statuses: number[] = []
  for (let i = 0; i < 6; i++) statuses.push((await postOrder(request, { items: [] }, ip)).status())
  expect(statuses.slice(0, 5).every((s) => s !== 429)).toBeTruthy()
  expect(statuses[5]).toBe(429)
})

test('paused orders: form replaced, server refuses, kit pages stay visible', async ({ page, request }) => {
  const token = await formToken(request)
  await setOrdersOpen(request, false)
  try {
    await page.goto('/mk/order')
    await expect(page.locator('[data-orders-paused]')).toBeVisible()
    await page.goto('/mk/kits/e2e-free')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('E2E')
    await expect(page.locator('[data-order-blocked]')).toBeVisible()

    await wait(3200)
    const res = await postOrder(request, { formToken: token, items: [{ kitId: kits['e2e-free'], quantity: 1 }] })
    expect(res.status()).toBe(403)
    expect((await res.json()).code).toBe('paused')
  } finally {
    await setOrdersOpen(request, true)
  }
})

test('the public API still cannot read orders', async ({ request }) => {
  expect((await request.get('/api/orders')).status()).toBe(403)
  expect((await request.get('/api/orders/export.csv')).status()).toBe(403)
})

test('order and success pages pass axe (WCAG 2.2 AA, no serious issues)', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright')
  const scan = async () => {
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
    return r.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)
  }
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': fakeIp() })
  await page.goto('/mk/kits/e2e-free')
  await page.getByRole('button', { name: 'Додај во кошничка', exact: true }).click()
  expect(await scan(), 'cart drawer').toEqual([])
  await page.getByRole('link', { name: /Продолжи кон нарачка/ }).click()
  await expect(page).toHaveURL(/\/mk\/order$/)
  expect(await scan(), 'order page').toEqual([])
  await page.getByLabel('Име и презиме').fill('E2E axe')
  await page.getByLabel('Телефон (Viber)').fill('070 123 456')
  await page.getByLabel(/^Град/).fill('Скопје')
  await page.getByLabel('Адреса за достава').fill('E2E 1')
  await page.getByRole('checkbox').check()
  await wait(3200)
  await page.getByRole('button', { name: 'Испрати нарачка' }).click()
  await expect(page).toHaveURL(/\/mk\/order\/[A-Za-z0-9_-]{20,}$/)
  expect(await scan(), 'success page').toEqual([])
})

test('client validation shows translated errors without sending', async ({ page }) => {
  await page.goto('/mk/kits/e2e-free')
  await page.getByRole('button', { name: 'Додај во кошничка', exact: true }).click()
  await page.getByRole('link', { name: /Продолжи кон нарачка/ }).click()
  await page.getByRole('button', { name: 'Испрати нарачка' }).click()
  await expect(page.getByText('Ова поле е задолжително.').first()).toBeVisible()
  await expect(page.getByText('Потребна е вашата согласност.')).toBeVisible()
  await expect(page).toHaveURL(/\/mk\/order$/)
})

test('contact form rejects honeypot and instant submissions', async ({ request }) => {
  const token = await formToken(request, '/mk/contact')
  const base = { name: 'E2E', contact: '070 123 456', message: 'Hello from the test' }
  const fast = await request.post('/api/contact', { data: { ...base, formToken: token }, headers: { 'x-forwarded-for': fakeIp() } })
  expect((await fast.json()).code).toBe('spam')
  await wait(3200)
  const bot = await request.post('/api/contact', { data: { ...base, formToken: token, website: 'x' }, headers: { 'x-forwarded-for': fakeIp() } })
  expect((await bot.json()).code).toBe('spam')
})
