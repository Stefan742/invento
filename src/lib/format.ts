import type { Locale } from '@/i18n/routing'

const intlLocale = (locale: Locale) => (locale === 'mk' ? 'mk-MK' : 'en-GB')

export function formatPrice(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 0 }).format(value)
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Skopje',
  }).format(new Date(iso))
}

/** Only show a next-drop date that is today or in the future. */
export function isUpcoming(iso: string | null | undefined, now: Date = new Date()): boolean {
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  return d.getTime() >= startOfToday.getTime()
}
