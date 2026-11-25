import { defineRouting } from 'next-intl/routing'

export const locales = ['mk', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'mk'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // `/` uses Accept-Language only to choose `en` for clearly English browsers; otherwise `mk`.
  localeDetection: true,
  // No locale cookie: the public site sets no cookies at all (privacy, no consent banner).
  localeCookie: false,
  // hreflang alternates are emitted in page metadata instead of Link headers.
  alternateLinks: false,
})
