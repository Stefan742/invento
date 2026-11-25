import type { MetadataRoute } from 'next'

import { PAGE_SLUGS } from '@/collections/Pages'
import { locales } from '@/i18n/routing'
import { getKits, getPage } from '@/lib/data'
import { absoluteUrl } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const kits = await getKits('mk')
  const pages = (await Promise.all(PAGE_SLUGS.map((s) => getPage(s, 'mk')))).filter(Boolean)

  const paths: { path: string; lastModified?: string; priority: number }[] = [
    { path: '', priority: 1 },
    { path: '/kits', priority: 0.9 },
    ...kits.map((k) => ({ path: `/kits/${k.slug}`, lastModified: k.updatedAt, priority: 0.8 })),
    { path: '/gallery', priority: 0.6 },
    { path: '/faq', priority: 0.6 },
    { path: '/contact', priority: 0.5 },
    ...pages.map((p) => ({ path: `/${p!.slug}`, lastModified: p!.updatedAt, priority: 0.3 })),
  ]

  return paths.flatMap(({ path, lastModified, priority }) =>
    locales.map((locale) => ({
      url: absoluteUrl(locale, path),
      lastModified,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(l, path)])),
      },
    })),
  )
}
