import type { Media } from '@/payload-types'

export type ImageSize = 'thumb' | 'card' | 'hero' | 'og'

export type ResolvedImage = { src: string; width: number; height: number; alt: string }

/** Payload returns absolute URLs when serverURL is set; same-origin files are served relative. */
export function toRelative(url: string): string {
  if (url.startsWith('/')) return url
  try {
    const u = new URL(url)
    if (u.pathname.startsWith('/api/media/')) return `${u.pathname}${u.search}`
  } catch {
    // not a URL: leave as is
  }
  return url
}

/** Turn a Payload upload value (id or populated doc) into something next/image can use. */
export function resolveImage(
  value: number | Media | null | undefined,
  size?: ImageSize,
): ResolvedImage | null {
  if (!value || typeof value !== 'object') return null
  const sized = size ? value.sizes?.[size] : undefined
  const raw = sized?.url || value.url
  if (!raw) return null
  const src = toRelative(raw)
  return {
    src,
    width: sized?.width || value.width || 1200,
    height: sized?.height || value.height || 1200,
    alt: value.alt || '',
  }
}

export function mediaList(values: (number | Media)[] | null | undefined): Media[] {
  return (values ?? []).filter((v): v is Media => typeof v === 'object' && v !== null)
}
