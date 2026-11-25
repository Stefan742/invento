import { mediaList, resolveImage } from '@/lib/media'
import type { Build } from '@/payload-types'

import type { LightboxPhoto } from './Lightbox'

/** Flatten builds into lightbox photos (one per build: its first photo). */
export function buildPhotos(builds: Build[], builtBy: (name: string) => string): LightboxPhoto[] {
  const out: LightboxPhoto[] = []
  for (const b of builds) {
    const first = mediaList(b.photos)[0]
    const full = resolveImage(first, 'hero')
    const thumb = resolveImage(first, 'card')
    if (!full || !thumb) continue
    out.push({
      id: String(b.id),
      src: full.src,
      width: full.width,
      height: full.height,
      alt: full.alt || b.title,
      thumbSrc: thumb.src,
      thumbWidth: thumb.width,
      thumbHeight: thumb.height,
      caption: b.caption || b.title,
      credit: b.builderFirstName ? builtBy(b.builderFirstName) : null,
      isPlaceholder: b.isPlaceholder,
    })
  }
  return out
}
