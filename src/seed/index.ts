/**
 * `pnpm seed`: creates the admin user (from ADMIN_EMAIL / ADMIN_PASSWORD), sample content and settings.
 * Safe to re-run: existing items are left alone.
 *
 * Everything here that imitates real content is flagged `isPlaceholder: true` and is hidden
 * on the live site (SHOW_PLACEHOLDERS=false). Prices are deliberately null. Nothing is invented
 * as fact: policy pages are marked DRAFT and FAQ answers only state the agreed business model.
 */
import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import type { IllustrationName } from '../components/illustrations/Illustration'
import { placeholderPhoto } from './images'
import { richText } from './lexical'

const ctx = { disableRevalidate: true }

async function uploadPlaceholder(
  payload: Payload,
  name: IllustrationName,
  bg: 'yellow' | 'teal' | 'orange' | 'paper',
  label: string,
  alt: { mk: string; en: string },
) {
  const data = await placeholderPhoto(name, bg, label)
  const doc = await payload.create({
    collection: 'media',
    data: { alt: alt.mk },
    locale: 'mk',
    file: { data, mimetype: 'image/png', name: `placeholder-${name}-${bg}.png`, size: data.length },
    context: ctx,
  })
  await payload.update({ collection: 'media', id: doc.id, data: { alt: alt.en }, locale: 'en', context: ctx })
  return doc.id
}

async function seedAdmin(payload: Payload) {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    payload.logger.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set: skipping admin user.')
    return
  }
  const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (existing.totalDocs) {
    payload.logger.info('Admin user already exists.')
    return
  }
  await payload.create({ collection: 'users', data: { email, password, roles: ['admin'], name: 'Owner' } })
  payload.logger.info('Admin user created.')
}

type KitSeed = {
  slug: string
  art: IllustrationName
  bg: 'yellow' | 'teal' | 'orange'
  featured: boolean
  sortOrder: number
  difficulty: number
  buildTimeMinutes: number | null
  comingSoon?: boolean
  stockTotal?: number | null
  stockRemaining?: number | null
  mk: { title: string; short: string; body: string; box: string[]; home: string[]; materials: string }
  en: { title: string; short: string; body: string; box: string[]; home: string[]; materials: string }
}

// Sample kits (from the example ideas in the brief). Prices are null on purpose.
// Stock numbers are sample values to show the stock bar; they are placeholders like the kits.
const KITS: KitSeed[] = [
  {
    slug: 'mini-catapult',
    art: 'catapult',
    bg: 'yellow',
    featured: true,
    sortOrder: 1,
    difficulty: 1,
    buildTimeMinutes: 60,
    stockTotal: 20,
    stockRemaining: 14,
    mk: {
      title: 'Мини катапулта',
      short: 'ПРИМЕР: дрвена катапулта што фрла мало топче. Замени со вистинскиот опис.',
      body: 'ПРИМЕР-ТЕКСТ. Тука оди вистинскиот опис на кутијата: што се гради, што се учи и колку е забавно.',
      box: ['ПРИМЕР: дрвени делови', 'ПРИМЕР: упатство'],
      home: ['ПРИМЕР: шмиргла (опционално)'],
      materials: 'ПРИМЕР: шперплоча',
    },
    en: {
      title: 'Mini catapult',
      short: 'SAMPLE: a wooden catapult that launches a small ball. Replace with the real description.',
      body: 'SAMPLE TEXT. The real kit description goes here: what you build, what you learn and why it is fun.',
      box: ['SAMPLE: wooden parts', 'SAMPLE: instructions'],
      home: ['SAMPLE: sandpaper (optional)'],
      materials: 'SAMPLE: plywood',
    },
  },
  {
    slug: 'hydraulic-arm',
    art: 'wrench',
    bg: 'teal',
    featured: true,
    sortOrder: 2,
    difficulty: 3,
    buildTimeMinutes: 120,
    comingSoon: true,
    mk: {
      title: 'Хидраулична рака',
      short: 'ПРИМЕР: рака што се движи со шприцови и вода. Замени со вистинскиот опис.',
      body: 'ПРИМЕР-ТЕКСТ. Тука оди вистинскиот опис на кутијата.',
      box: ['ПРИМЕР: дрвени делови', 'ПРИМЕР: шприцови и цевки', 'ПРИМЕР: упатство'],
      home: ['ПРИМЕР: вода'],
      materials: 'ПРИМЕР: шперплоча, пластични шприцови',
    },
    en: {
      title: 'Hydraulic arm',
      short: 'SAMPLE: an arm that moves with syringes and water. Replace with the real description.',
      body: 'SAMPLE TEXT. The real kit description goes here.',
      box: ['SAMPLE: wooden parts', 'SAMPLE: syringes and tubes', 'SAMPLE: instructions'],
      home: ['SAMPLE: water'],
      materials: 'SAMPLE: plywood, plastic syringes',
    },
  },
  {
    slug: 'gear-machine',
    art: 'gear',
    bg: 'orange',
    featured: false,
    sortOrder: 3,
    difficulty: 2,
    buildTimeMinutes: 90,
    mk: {
      title: 'Машина со запчаници',
      short: 'ПРИМЕР: запчаници што се вртат еден со друг. Замени со вистинскиот опис.',
      body: 'ПРИМЕР-ТЕКСТ. Тука оди вистинскиот опис на кутијата.',
      box: ['ПРИМЕР: дрвени запчаници', 'ПРИМЕР: оски', 'ПРИМЕР: упатство'],
      home: [],
      materials: 'ПРИМЕР: шперплоча',
    },
    en: {
      title: 'Gear machine',
      short: 'SAMPLE: gears that turn each other. Replace with the real description.',
      body: 'SAMPLE TEXT. The real kit description goes here.',
      box: ['SAMPLE: wooden gears', 'SAMPLE: axles', 'SAMPLE: instructions'],
      home: [],
      materials: 'SAMPLE: plywood',
    },
  },
]

async function seedKits(payload: Payload) {
  const ids: number[] = []
  for (const k of KITS) {
    const existing = await payload.find({ collection: 'kits', where: { slug: { equals: k.slug } }, limit: 1, draft: true })
    if (existing.totalDocs) {
      ids.push(existing.docs[0].id)
      continue
    }
    const hero = await uploadPlaceholder(payload, k.art, k.bg, 'SAMPLE PHOTO', {
      mk: `Пример-слика: ${k.mk.title}`,
      en: `Sample photo: ${k.en.title}`,
    })
    const doc = await payload.create({
      collection: 'kits',
      locale: 'mk',
      context: ctx,
      data: {
        _status: 'published',
        slug: k.slug,
        title: k.mk.title,
        shortDescription: k.mk.short,
        description: richText([{ p: k.mk.body }]),
        heroImage: hero,
        priceMKD: null,
        comingSoon: k.comingSoon ?? false,
        stockTotal: k.stockTotal ?? null,
        stockRemaining: k.stockRemaining ?? null,
        ageMin: 6,
        ageMax: 12,
        difficulty: k.difficulty,
        buildTimeMinutes: k.buildTimeMinutes,
        whatsInTheBox: k.mk.box.map((item) => ({ item })),
        whatYouNeedAtHome: k.mk.home.map((item) => ({ item })),
        materials: k.mk.materials,
        featured: k.featured,
        sortOrder: k.sortOrder,
        isPlaceholder: true,
      },
    })
    await payload.update({
      collection: 'kits',
      id: doc.id,
      locale: 'en',
      context: ctx,
      data: {
        _status: 'published',
        title: k.en.title,
        shortDescription: k.en.short,
        description: richText([{ p: k.en.body }]),
        whatsInTheBox: k.en.box.map((item) => ({ item })),
        whatYouNeedAtHome: k.en.home.map((item) => ({ item })),
        materials: k.en.materials,
      },
    })
    ids.push(doc.id)
  }
  payload.logger.info(`Kits: ${ids.length}`)
  return ids
}

const FAQS: { category: 'orders' | 'delivery' | 'kits' | 'safety'; mk: [string, string]; en: [string, string] }[] = [
  {
    category: 'orders',
    mk: [
      'Како да порачам?',
      'Додајте кутија во кошничката и испратете ја кратката форма. Ќе ви пишеме на Viber за да ја потврдиме нарачката и деталите за достава.',
    ],
    en: [
      'How do I order?',
      'Add a box to your cart and send the short form. We will message you on Viber to confirm the order and the delivery details.',
    ],
  },
  {
    category: 'orders',
    mk: ['Може ли да платам онлајн?', 'Засега не. Плаќате во готово при достава.'],
    en: ['Can I pay online?', 'Not yet. You pay in cash on delivery.'],
  },
  {
    category: 'delivery',
    mk: ['Колку чини доставата?', 'Цената на доставата ја потврдуваме на Viber кога ја потврдуваме нарачката.'],
    en: ['How much is delivery?', 'We confirm the delivery cost on Viber when we confirm your order.'],
  },
  {
    category: 'kits',
    mk: ['За која возраст се кутиите?', 'Кутиите се дизајнирани за возраст од 6 до 12 години. Се препорачува надзор од возрасен.'],
    en: ['What age are the boxes for?', 'The boxes are designed for ages 6 to 12. Adult supervision is recommended.'],
  },
  {
    category: 'kits',
    mk: ['Што има во кутијата?', 'Дрвени делови и упатства за градење. Точната содржина е наведена на страницата на секоја кутија.'],
    en: ["What's in the box?", 'Wooden parts and building instructions. The exact contents are listed on each box page.'],
  },
  {
    category: 'orders',
    mk: ['Зошто некоја кутија е распродадена?', 'Ги правиме во мали серии. Кога серијата ќе заврши, на страницата ќе видите кога доаѓа следната.'],
    en: ['Why is a box sold out?', 'We make them in small batches. When a batch runs out, the page shows when the next one is coming.'],
  },
]

async function seedFaqs(payload: Payload) {
  const count = await payload.count({ collection: 'faqs' })
  if (count.totalDocs) return
  for (const [i, f] of FAQS.entries()) {
    const doc = await payload.create({
      collection: 'faqs',
      locale: 'mk',
      context: ctx,
      data: { question: f.mk[0], answer: f.mk[1], category: f.category, sortOrder: i, isPublished: true },
    })
    await payload.update({ collection: 'faqs', id: doc.id, locale: 'en', context: ctx, data: { question: f.en[0], answer: f.en[1] } })
  }
  payload.logger.info(`FAQs: ${FAQS.length}`)
}

async function seedTestimonials(payload: Payload) {
  const count = await payload.count({ collection: 'testimonials' })
  if (count.totalDocs) return
  // Clearly labelled samples so the layout can be reviewed. Never shown in production.
  const names = ['Ана', 'Марко', 'Елена']
  for (const [i, name] of names.entries()) {
    const doc = await payload.create({
      collection: 'testimonials',
      locale: 'mk',
      context: ctx,
      data: {
        quote: `ПРИМЕР ${i + 1}: тука доаѓаат вистинските зборови на еден родител.`,
        authorName: name,
        authorNote: 'пример',
        isPublished: true,
        isPlaceholder: true,
        sortOrder: i,
      },
    })
    await payload.update({
      collection: 'testimonials',
      id: doc.id,
      locale: 'en',
      context: ctx,
      data: { quote: `SAMPLE ${i + 1}: a real parent's words go here.`, authorNote: 'sample' },
    })
  }
  payload.logger.info('Testimonials: 3 placeholders')
}

async function seedBuilds(payload: Payload, kitIds: number[]) {
  const count = await payload.count({ collection: 'builds' })
  if (count.totalDocs) return
  const art: { name: IllustrationName; bg: 'yellow' | 'teal' | 'orange' | 'paper' }[] = [
    { name: 'catapult', bg: 'teal' },
    { name: 'gear', bg: 'orange' },
    { name: 'rocket', bg: 'yellow' },
    { name: 'wrench', bg: 'paper' },
    { name: 'bulb', bg: 'teal' },
    { name: 'spring', bg: 'yellow' },
  ]
  for (const [i, a] of art.entries()) {
    const photo = await uploadPlaceholder(payload, a.name, a.bg, 'SAMPLE BUILD', {
      mk: `Пример-градба ${i + 1}`,
      en: `Sample build ${i + 1}`,
    })
    const doc = await payload.create({
      collection: 'builds',
      locale: 'mk',
      context: ctx,
      data: {
        title: `Пример-градба ${i + 1}`,
        caption: 'ПРИМЕР: опис на градбата.',
        photos: [photo],
        kit: kitIds[i % kitIds.length],
        consentConfirmed: true,
        isPublished: true,
        isPlaceholder: true,
        sortOrder: i,
      },
    })
    await payload.update({
      collection: 'builds',
      id: doc.id,
      locale: 'en',
      context: ctx,
      data: { title: `Sample build ${i + 1}`, caption: 'SAMPLE: build caption.' },
    })
  }
  payload.logger.info('Builds: 6 placeholders')
}

const DRAFT_MK = 'НАЦРТ: потребна е проверка од сопственикот/правник. Ова не е правен совет.'
const DRAFT_EN = 'DRAFT: needs owner/legal review. This is not legal advice.'

const PAGES = {
  about: {
    mk: {
      title: 'За нас',
      body: [
        { bold: DRAFT_MK },
        { p: 'INVENTO прави дрвени комплети за градење за деца од 6 до 12 години. Секоја кутија е мала инженерска авантура: дрвени делови, јасни упатства и еден момент кога сè ќе „кликне“.' },
        { p: 'Кутиите ги изработуваме во мали серии, во соработка со локален мајстор за дрво. [Сопственикот: додадете ја вашата приказна.]' },
      ],
    },
    en: {
      title: 'About',
      body: [
        { bold: DRAFT_EN },
        { p: 'INVENTO makes wooden build-it-yourself kits for children aged 6 to 12. Every box is a small engineering adventure: wooden parts, clear instructions, and that moment when it all clicks.' },
        { p: 'We make the boxes in small batches together with a local woodworker. [Owner: add your story here.]' },
      ],
    },
  },
  shipping: {
    mk: {
      title: 'Достава',
      body: [
        { bold: DRAFT_MK },
        { p: 'Доставуваме само во Северна Македонија. По секоја нарачка ви пишуваме на Viber за да ја потврдиме нарачката, цената на доставата и времето на испорака.' },
        { p: 'Плаќањето е во готово при достава. [Сопственикот: додадете курир, цена и рокови кога ќе се одлучат.]' },
      ],
    },
    en: {
      title: 'Shipping',
      body: [
        { bold: DRAFT_EN },
        { p: 'We deliver within North Macedonia only. After every order we message you on Viber to confirm the order, the delivery cost and the delivery time.' },
        { p: 'Payment is cash on delivery. [Owner: add courier, cost and timing once decided.]' },
      ],
    },
  },
  returns: {
    mk: {
      title: 'Враќање',
      body: [
        { bold: DRAFT_MK },
        { p: 'Ако нешто не е во ред со вашата кутија, пишете ни на Viber и ќе најдеме решение.' },
        { p: '[Сопственикот: проверете ги законските правила за продажба на далечина (рок за враќање, состојба на производот, трошоци) и дополнете ги овде.]' },
      ],
    },
    en: {
      title: 'Returns',
      body: [
        { bold: DRAFT_EN },
        { p: 'If something is wrong with your box, message us on Viber and we will sort it out.' },
        { p: '[Owner: check the legal rules for distance selling (return period, product condition, costs) and add them here.]' },
      ],
    },
  },
  privacy: {
    mk: {
      title: 'Приватност',
      body: [
        { bold: DRAFT_MK },
        { h2: 'Што собираме' },
        { p: 'Кога праќате нарачка: име и презиме, телефон, град, адреса и, ако сакате, е-пошта и забелешка. Ги користиме само за да ја потврдиме и доставиме нарачката.' },
        { h2: 'Што не собираме' },
        { p: 'Немаме кориснички профили и не користиме колачиња за следење. Кошничката се чува само во вашиот прелистувач.' },
        { h2: 'Колку долго' },
        { p: '[Сопственикот: одредете колку долго ги чувате податоците од нарачките, на пр. за сметководство.]' },
        { h2: 'Вашите права' },
        { p: 'Можете да побарате да ги избришеме вашите податоци. Пишете ни на Viber или е-пошта.' },
      ],
    },
    en: {
      title: 'Privacy',
      body: [
        { bold: DRAFT_EN },
        { h2: 'What we collect' },
        { p: 'When you send an order: full name, phone, city, address and, if you choose, email and a note. We use them only to confirm and deliver your order.' },
        { h2: "What we don't collect" },
        { p: 'There are no customer accounts and no tracking cookies. Your cart is stored only in your own browser.' },
        { h2: 'How long' },
        { p: '[Owner: decide how long you keep order data, e.g. for accounting.]' },
        { h2: 'Your rights' },
        { p: 'You can ask us to delete your data. Message us on Viber or by email.' },
      ],
    },
  },
  terms: {
    mk: {
      title: 'Услови',
      body: [
        { bold: DRAFT_MK },
        { p: 'Нарачката преку страницата е барање за нарачка. Договорот е склучен кога ќе ја потврдиме нарачката на Viber.' },
        { p: 'Кутиите се дизајнирани за возраст од 6 до 12 години; се препорачува надзор од возрасен. [Сопственикот: проверете ги барањата за безбедност на играчки.]' },
      ],
    },
    en: {
      title: 'Terms',
      body: [
        { bold: DRAFT_EN },
        { p: 'An order on the website is an order request. The agreement is made when we confirm your order on Viber.' },
        { p: 'The boxes are designed for ages 6 to 12; adult supervision is recommended. [Owner: check toy safety requirements.]' },
      ],
    },
  },
} as const

async function seedPages(payload: Payload) {
  for (const [slug, p] of Object.entries(PAGES)) {
    const existing = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, draft: true })
    if (existing.totalDocs) continue
    const doc = await payload.create({
      collection: 'pages',
      locale: 'mk',
      context: ctx,
      data: { _status: 'published', slug: slug as never, title: p.mk.title, content: richText([...p.mk.body]) },
    })
    await payload.update({
      collection: 'pages',
      id: doc.id,
      locale: 'en',
      context: ctx,
      data: { _status: 'published', title: p.en.title, content: richText([...p.en.body]) },
    })
  }
  payload.logger.info('Pages: about + 4 policy drafts')
}

async function seedGlobals(payload: Payload) {
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  if (!settings.orderSuccessNote) {
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'mk',
      context: ctx,
      data: {
        ordersOpen: true,
        ordersClosedMessage: 'Моментално не примаме нарачки. Пробајте повторно наскоро.',
        maxQuantityPerLine: 5,
        shippingFlatFee: null,
        shippingNote: 'Цената на доставата ја потврдуваме на Viber.',
        orderSuccessNote: 'Ви благодариме! Ќе ви пишеме на Viber за да ја потврдиме нарачката и доставата. [Сопственикот: прилагодете го текстот.]',
        siteName: 'INVENTO',
        siteDescription: 'Дрвени комплети за градење за љубопитни умови од 6 до 12 години.',
      },
    })
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'en',
      context: ctx,
      data: {
        ordersClosedMessage: "We're not taking orders right now. Please check back soon.",
        shippingNote: 'We confirm the delivery cost on Viber.',
        orderSuccessNote: "Thank you! We'll message you on Viber to confirm your order and delivery. [Owner: adjust this text.]",
        siteDescription: 'Wooden build-it-yourself kits for curious minds aged 6 to 12.',
      },
    })
  }

  const home = await payload.findGlobal({ slug: 'home-page', draft: true })
  if (!home.howItWorks?.length) {
    const mkSteps = [
      ['Избери кутија', 'Одбери ја градбата што ти се допаѓа.'],
      ['Испрати нарачка', 'Пополни кратка форма, без онлајн плаќање.'],
      ['Потврда на Viber', 'Ќе ти пишеме за детали и испорака.'],
      ['Гради!', 'Плаќаш при достава. Отвори ја кутијата и започни.'],
    ]
    const enSteps = [
      ['Pick a box', 'Choose the build you like.'],
      ['Send your order', 'Fill in a short form, no online payment.'],
      ['We confirm on Viber', "We'll message you the details and delivery."],
      ['Build it!', 'You pay on delivery. Open the box and start.'],
    ]
    const created = await payload.updateGlobal({
      slug: 'home-page',
      locale: 'mk',
      context: ctx,
      data: {
        _status: 'published',
        heroWord1: 'ГРАДИ.',
        heroWord2: 'ОТКРИВАЈ.',
        heroWord3: 'СОЗДАВАЈ.',
        heroSubline: 'Дрвени комплети за градење за љубопитни умови од 6 до 12 години.',
        intro: 'Секоја INVENTO кутија е мала инженерска авантура: дрвени делови, јасни упатства и еден момент кога сè ќе „кликне“.',
        howItWorks: mkSteps.map(([title, body]) => ({ title, body })),
      },
    })
    await payload.updateGlobal({
      slug: 'home-page',
      locale: 'en',
      context: ctx,
      data: {
        _status: 'published',
        heroWord1: 'BUILD.',
        heroWord2: 'DISCOVER.',
        heroWord3: 'CREATE.',
        heroSubline: 'Wooden build-it-yourself kits for curious minds aged 6 to 12.',
        intro: 'Every INVENTO box is a small engineering adventure: wooden parts, clear instructions, and that moment when it all clicks.',
        // Same array rows, English text (localized fields inside a non-localized array keep row ids).
        howItWorks: (created.howItWorks ?? []).map((row, i) => ({ id: row.id, title: enSteps[i][0], body: enSteps[i][1] })),
      },
    })
  }
  payload.logger.info('Globals: site settings + home page')
}

async function main() {
  const payload = await getPayload({ config })
  await seedAdmin(payload)
  const kitIds = await seedKits(payload)
  await seedFaqs(payload)
  await seedTestimonials(payload)
  await seedBuilds(payload, kitIds)
  await seedPages(payload)
  await seedGlobals(payload)
  payload.logger.info('Seed complete.')
}

// `payload run` exits as soon as this module finishes loading, so await at top level.
try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
