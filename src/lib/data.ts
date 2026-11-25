import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { PageSlug } from '@/collections/Pages'
import type { CacheTag } from '@/hooks/revalidate'
import type { Locale } from '@/i18n/routing'
import type { Build, Faq, HomePage, Kit, Page, SiteSetting, Testimonial } from '@/payload-types'

import { filterPlaceholders, showPlaceholders } from './placeholders'

const payload = () => getPayload({ config })

/**
 * All public reads go through here:
 * - `overrideAccess: false` applies the public access rules (published only),
 * - results are cached under tags that Payload hooks expire on every admin edit.
 */
function cached<A extends unknown[], R>(
  key: string,
  tags: CacheTag[],
  fn: (...args: A) => Promise<R>,
) {
  return unstable_cache(fn, [key], { tags, revalidate: 3600 })
}

export const getSiteSettings = cached(
  'site-settings',
  ['site-settings', 'media'],
  async (locale: Locale): Promise<SiteSetting> =>
    (await payload()).findGlobal({ slug: 'site-settings', locale, depth: 1, overrideAccess: false }),
)

export const getHomePage = cached(
  'home-page',
  ['home-page', 'kits', 'media'],
  async (locale: Locale): Promise<HomePage> =>
    (await payload()).findGlobal({
      slug: 'home-page',
      locale,
      depth: 2,
      draft: false,
      overrideAccess: false,
    }),
)

const getKitsRaw = cached('kits', ['kits', 'media'], async (locale: Locale): Promise<Kit[]> => {
  const res = await (
    await payload()
  ).find({
    collection: 'kits',
    locale,
    depth: 1,
    limit: 100,
    sort: ['sortOrder', 'createdAt'],
    draft: false,
    overrideAccess: false,
  })
  return res.docs
})

export async function getKits(locale: Locale) {
  return filterPlaceholders(await getKitsRaw(locale), showPlaceholders())
}

const getKitBySlugRaw = cached(
  'kit-by-slug',
  ['kits', 'media'],
  async (slug: string, locale: Locale): Promise<Kit | null> => {
    const res = await (
      await payload()
    ).find({
      collection: 'kits',
      locale,
      depth: 1,
      limit: 1,
      where: { slug: { equals: slug } },
      draft: false,
      overrideAccess: false,
    })
    return res.docs[0] ?? null
  },
)

export async function getKitBySlug(slug: string, locale: Locale) {
  const kit = await getKitBySlugRaw(slug, locale)
  return kit && filterPlaceholders([kit], showPlaceholders()).length ? kit : null
}

export async function getFeaturedKits(locale: Locale, home?: HomePage): Promise<Kit[]> {
  const all = await getKits(locale)
  const chosen = (home?.featuredKits ?? [])
    .map((k) => (typeof k === 'object' ? all.find((a) => a.id === k.id) : all.find((a) => a.id === k)))
    .filter((k): k is Kit => Boolean(k))
  if (chosen.length) return chosen
  const featured = all.filter((k) => k.featured)
  return featured.length ? featured : all.slice(0, 3)
}

export const getFaqs = cached('faqs', ['faqs'], async (locale: Locale): Promise<Faq[]> => {
  const res = await (
    await payload()
  ).find({
    collection: 'faqs',
    locale,
    depth: 0,
    limit: 200,
    sort: ['sortOrder', 'createdAt'],
    overrideAccess: false,
  })
  return res.docs
})

const getTestimonialsRaw = cached(
  'testimonials',
  ['testimonials'],
  async (locale: Locale): Promise<Testimonial[]> => {
    const res = await (
      await payload()
    ).find({
      collection: 'testimonials',
      locale,
      depth: 0,
      limit: 50,
      sort: ['sortOrder', '-createdAt'],
      overrideAccess: false,
    })
    return res.docs
  },
)

export async function getTestimonials(locale: Locale) {
  return filterPlaceholders(await getTestimonialsRaw(locale), showPlaceholders())
}

const getBuildsRaw = cached(
  'builds',
  ['builds', 'media', 'kits'],
  async (locale: Locale): Promise<Build[]> => {
    const res = await (
      await payload()
    ).find({
      collection: 'builds',
      locale,
      depth: 1,
      limit: 60,
      sort: ['sortOrder', '-createdAt'],
      // Defence in depth: never return a build without consent, whatever the publish flag says.
      where: { consentConfirmed: { equals: true } },
      overrideAccess: false,
    })
    return res.docs
  },
)

export async function getBuilds(locale: Locale) {
  return filterPlaceholders(await getBuildsRaw(locale), showPlaceholders())
}

export const getPage = cached(
  'page',
  ['pages', 'media'],
  async (slug: PageSlug, locale: Locale): Promise<Page | null> => {
    const res = await (
      await payload()
    ).find({
      collection: 'pages',
      locale,
      depth: 1,
      limit: 1,
      where: { slug: { equals: slug } },
      draft: false,
      overrideAccess: false,
    })
    return res.docs[0] ?? null
  },
)
