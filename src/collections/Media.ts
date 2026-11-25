import type { CollectionConfig } from 'payload'

import { anyone, isAdmin } from '../access'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Images' },
  admin: {
    group: 'Content',
    description:
      'Photos and images used on the site. JPG, PNG, WebP or AVIF, up to 8 MB. / Слики за страницата, до 8 MB.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateCollection('media', 'kits', 'builds')],
    afterDelete: [revalidateCollectionDelete('media', 'kits', 'builds')],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description:
          'Describe the image for people who cannot see it, e.g. "Wooden catapult kit, assembled". / Опишете ја сликата, на пр. „Склопена дрвена катапулта“.',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    focalPoint: true,
    formatOptions: { format: 'webp', options: { quality: 82 } },
    resizeOptions: { width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'thumb', width: 400, height: 400, fit: 'cover', formatOptions: { format: 'webp' } },
      { name: 'card', width: 800, height: 800, fit: 'cover', formatOptions: { format: 'webp' } },
      { name: 'hero', width: 1600, withoutEnlargement: true, formatOptions: { format: 'webp' } },
      { name: 'og', width: 1200, height: 630, fit: 'cover', formatOptions: { format: 'jpeg' } },
    ],
    adminThumbnail: 'thumb',
  },
}
