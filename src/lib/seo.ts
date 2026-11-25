import type { Metadata } from 'next'

import { defaultLocale, locales, type Locale } from '@/i18n/routing'

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
}

/** Normalise a locale-less path like "/kits" or "" to "/kits" / "". */
function clean(path: string): string {
  if (!path || path === '/') return ''
  return '/' + path.replace(/^\/+|\/+$/g, '')
}

export function localizedPath(locale: Locale, path = ''): string {
  return `/${locale}${clean(path)}`
}

export function absoluteUrl(locale: Locale, path = ''): string {
  return `${siteUrl()}${localizedPath(locale, path)}`
}

/** canonical + hreflang alternates (incl. x-default → mk) for a locale-less path. */
export function alternatesFor(locale: Locale, path = ''): Metadata['alternates'] {
  const languages: Record<string, string> = {}
  for (const l of locales) languages[l] = absoluteUrl(l, path)
  languages['x-default'] = absoluteUrl(defaultLocale, path)
  return { canonical: absoluteUrl(locale, path), languages }
}

type MetaInput = {
  locale: Locale
  path?: string
  title?: string | null
  description?: string | null
  image?: { url: string; width?: number; height?: number; alt?: string } | null
}

export function buildMetadata({ locale, path = '', title, description, image }: MetaInput): Metadata {
  const url = absoluteUrl(locale, path)
  return {
    title: title || undefined,
    description: description || undefined,
    alternates: alternatesFor(locale, path),
    openGraph: {
      type: 'website',
      url,
      siteName: 'INVENTO',
      locale: locale === 'mk' ? 'mk_MK' : 'en_GB',
      title: title || undefined,
      description: description || undefined,
      ...(image ? { images: [{ url: image.url, width: image.width, height: image.height, alt: image.alt }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: title || undefined,
      description: description || undefined,
      ...(image ? { images: [image.url] } : {}),
    },
  }
}

/** Safely embed JSON-LD (escapes `<` so a value cannot close the script tag). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
