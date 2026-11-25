import type { SiteSetting } from '@/payload-types'

export type ContactLinks = {
  viber: string | null
  instagram: string | null
  instagramHandle: string | null
  email: string | null
  phone: string | null
  phoneDisplay: string | null
}

/**
 * Contact links come ONLY from SiteSettings; nothing is hardcoded.
 * Viber: `viber://chat?number=` opens a chat in the installed app on Android, iOS and desktop.
 * It needs the number in international format with the "+" encoded as %2B.
 */
export function contactLinks(s: Partial<SiteSetting> | null | undefined): ContactLinks {
  const digits = s?.viberNumber?.replace(/[^0-9+]/g, '') || ''
  const intl = digits ? (digits.startsWith('+') ? digits : `+${digits}`) : ''
  const handle = s?.instagramHandle?.replace(/^@/, '').trim() || null
  const instagram = s?.instagramUrl?.trim() || (handle ? `https://instagram.com/${handle}` : null)
  return {
    viber: intl ? `viber://chat?number=${encodeURIComponent(intl)}` : null,
    instagram,
    instagramHandle: handle,
    email: s?.email ? `mailto:${s.email}` : null,
    phone: intl ? `tel:${intl}` : null,
    phoneDisplay: s?.phoneDisplay || null,
  }
}
