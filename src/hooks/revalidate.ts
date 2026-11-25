import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Cache tags used by the frontend data layer (src/lib/data.ts).
 * Owner edits in the admin call these hooks, which expire the matching cache
 * entries so changes go live within seconds, without a redeploy.
 */
export type CacheTag =
  | 'kits'
  | 'builds'
  | 'testimonials'
  | 'faqs'
  | 'pages'
  | 'media'
  | 'site-settings'
  | 'home-page'

export async function revalidateTags(tags: CacheTag[]) {
  try {
    const { revalidateTag } = await import('next/cache')
    for (const tag of tags) revalidateTag(tag, { expire: 0 })
  } catch {
    // Outside a Next.js request (e.g. the seed script) there is no cache to revalidate.
  }
}

type Ctx = { context?: { disableRevalidate?: boolean } }

export const revalidateCollection =
  (...tags: CacheTag[]): CollectionAfterChangeHook =>
  async ({ doc, req }) => {
    if (!(req as Ctx).context?.disableRevalidate) await revalidateTags(tags)
    return doc
  }

export const revalidateCollectionDelete =
  (...tags: CacheTag[]): CollectionAfterDeleteHook =>
  async ({ doc, req }) => {
    if (!(req as Ctx).context?.disableRevalidate) await revalidateTags(tags)
    return doc
  }

export const revalidateGlobal =
  (...tags: CacheTag[]): GlobalAfterChangeHook =>
  async ({ doc, req }) => {
    if (!(req as Ctx).context?.disableRevalidate) await revalidateTags(tags)
    return doc
  }
