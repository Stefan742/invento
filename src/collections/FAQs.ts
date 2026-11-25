import type { CollectionConfig } from 'payload'

import { isAdmin, isPublishedOrAdmin } from '../access'
import { sortOrderField } from '../fields/seo'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const FAQ_CATEGORIES = ['orders', 'delivery', 'kits', 'safety', 'other'] as const

export const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: {
    group: 'Content',
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'sortOrder', 'isPublished'],
    description:
      'Questions and answers. The first 5 (by order) also appear on the home page. / Прашања и одговори; првите 5 се и на почетната.',
  },
  defaultSort: 'sortOrder',
  access: {
    read: isPublishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateCollection('faqs')],
    afterDelete: [revalidateCollectionDelete('faqs')],
  },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true, maxLength: 160 },
    { name: 'answer', type: 'textarea', required: true, localized: true, maxLength: 1500 },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Orders / Нарачки', value: 'orders' },
        { label: 'Delivery / Достава', value: 'delivery' },
        { label: 'Kits / Кутии', value: 'kits' },
        { label: 'Safety / Безбедност', value: 'safety' },
        { label: 'Other / Друго', value: 'other' },
      ],
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      label: 'Published / Објавено',
      admin: { position: 'sidebar' },
    },
    sortOrderField,
  ],
}
