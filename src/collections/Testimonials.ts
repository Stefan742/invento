import type { CollectionConfig } from 'payload'

import { isAdmin, isPublishedOrAdmin } from '../access'
import { isPlaceholderField, sortOrderField } from '../fields/seo'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: {
    group: 'Content',
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'quote', 'isPublished', 'isPlaceholder'],
    description:
      'Only real words from real customers, with their permission. The "Parents say" section hides itself when there are none. / Само вистински зборови од вистински купувачи.',
  },
  defaultSort: 'sortOrder',
  access: {
    read: isPublishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateCollection('testimonials')],
    afterDelete: [revalidateCollectionDelete('testimonials')],
  },
  fields: [
    { name: 'quote', type: 'textarea', required: true, localized: true, maxLength: 280 },
    {
      name: 'authorName',
      type: 'text',
      required: true,
      maxLength: 30,
      admin: { description: 'First name only. / Само име.' },
    },
    {
      name: 'authorNote',
      type: 'text',
      localized: true,
      maxLength: 60,
      admin: { description: 'e.g. "mum of two" / на пр. „мајка на две деца“' },
    },
    { name: 'kit', type: 'relationship', relationTo: 'kits' },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      label: 'Published / Објавено',
      admin: { position: 'sidebar' },
    },
    sortOrderField,
    isPlaceholderField,
  ],
}
