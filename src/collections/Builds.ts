import type { CollectionConfig } from 'payload'

import { isAdmin, isPublishedOrAdmin } from '../access'
import { isPlaceholderField, sortOrderField } from '../fields/seo'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'

export const CONSENT_REQUIRED_MESSAGE =
  'Tick "Parent consent confirmed" before publishing. / Потврдете согласност од родител пред објавување.'

/** A build can only be published when parental consent has been confirmed. */
export function validateBuildPublish(
  isPublished: boolean | null | undefined,
  consentConfirmed: boolean | null | undefined,
): true | string {
  if (isPublished && !consentConfirmed) return CONSENT_REQUIRED_MESSAGE
  return true
}

export const Builds: CollectionConfig = {
  slug: 'builds',
  labels: { singular: 'Customer build', plural: 'Customer builds' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kit', 'consentConfirmed', 'isPublished', 'isPlaceholder'],
    description:
      'Photos of real builds for the gallery. Prefer the build and hands; avoid children’s faces and never show full names. / Фотографии од градби. Без детски лица и полни имиња.',
  },
  defaultSort: 'sortOrder',
  access: {
    read: isPublishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateCollection('builds')],
    afterDelete: [revalidateCollectionDelete('builds')],
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, maxLength: 80 },
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      minRows: 1,
      admin: {
        description:
          'At least one photo. Show the build and hands, not faces. / Барем една слика. Градбата и рацете, не лица.',
      },
    },
    { name: 'caption', type: 'textarea', localized: true, maxLength: 240 },
    {
      name: 'kit',
      type: 'relationship',
      relationTo: 'kits',
      admin: { description: 'Optional: which kit this is. / Опционално: која кутија.' },
    },
    {
      name: 'builderFirstName',
      type: 'text',
      maxLength: 30,
      admin: {
        description:
          'Optional, FIRST name only, and only with parent consent. / Опционално, САМО име, со согласност.',
      },
    },
    {
      name: 'consentConfirmed',
      type: 'checkbox',
      defaultValue: false,
      label: 'Parent consent confirmed / Потврдена согласност од родител',
      admin: {
        position: 'sidebar',
        description:
          'I have the parent’s clear permission to publish this photo and name. / Имам јасна дозвола од родителот.',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      label: 'Published / Објавено',
      admin: { position: 'sidebar' },
      validate: (value: boolean | null | undefined, { siblingData }: { siblingData: unknown }) =>
        validateBuildPublish(
          value,
          (siblingData as { consentConfirmed?: boolean } | undefined)?.consentConfirmed,
        ),
    },
    sortOrderField,
    isPlaceholderField,
  ],
}
