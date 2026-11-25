import type { CollectionConfig } from 'payload'

import { isAdmin, publishedOrAdmin } from '../access'
import { seoField } from '../fields/seo'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const PAGE_SLUGS = ['about', 'shipping', 'returns', 'privacy', 'terms'] as const
export type PageSlug = (typeof PAGE_SLUGS)[number]

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description:
      'About and policy pages. Policy texts are DRAFTS and need owner/legal review. / За нас и правила. Текстовите се НАЦРТИ.',
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateCollection('pages')],
    afterDelete: [revalidateCollectionDelete('pages')],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 80 },
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'About / За нас (/about)', value: 'about' },
        { label: 'Shipping / Достава (/shipping)', value: 'shipping' },
        { label: 'Returns / Враќање (/returns)', value: 'returns' },
        { label: 'Privacy / Приватност (/privacy)', value: 'privacy' },
        { label: 'Terms / Услови (/terms)', value: 'terms' },
      ],
      admin: { position: 'sidebar', description: 'Which page this is. / Која страница.' },
    },
    { name: 'content', type: 'richText', localized: true },
    seoField,
  ],
}
