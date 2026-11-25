import type { CollectionConfig } from 'payload'

import { isAdmin, publishedOrAdmin } from '../access'
import { isPlaceholderField, seoField, sortOrderField } from '../fields/seo'
import { revalidateCollection, revalidateCollectionDelete } from '../hooks/revalidate'
import { slugify } from '../lib/slug'

export const Kits: CollectionConfig = {
  slug: 'kits',
  labels: { singular: 'Kit', plural: 'Kits' },
  admin: {
    group: 'Shop',
    useAsTitle: 'title',
    defaultColumns: ['title', 'priceMKD', 'stockRemaining', 'stockTotal', 'comingSoon', '_status'],
    description:
      'Your boxes. "Save draft" keeps it private; "Publish" shows it on the site. / Вашите кутии. „Publish“ ја прикажува на страницата.',
    listSearchableFields: ['title', 'slug'],
  },
  defaultSort: 'sortOrder',
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: publishedOrAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateCollection('kits')],
    afterDelete: [revalidateCollectionDelete('kits')],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              maxLength: 80,
              admin: { description: 'Kit name, e.g. "Mini catapult". / Име на кутијата.' },
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
              maxLength: 220,
              admin: {
                description: 'One or two sentences for cards. / Една-две реченици за картичките.',
              },
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              admin: { description: 'Full description on the kit page. / Целосен опис.' },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Main photo. Square works best. / Главна слика, најдобро квадратна.',
              },
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'Extra photos for the kit page. / Дополнителни слики.' },
            },
          ],
        },
        {
          label: 'Price & stock',
          fields: [
            {
              name: 'priceMKD',
              type: 'number',
              min: 0,
              admin: {
                description:
                  'Price in MKD (денари). Leave EMPTY if not decided: the site then shows "price coming soon". / Цена во денари. Оставете ПРАЗНО ако не е одлучено.',
              },
            },
            {
              name: 'comingSoon',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Visible on the site but cannot be ordered yet. / Видлива, но сè уште не може да се порача.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'stockTotal',
                  type: 'number',
                  min: 0,
                  admin: {
                    width: '50%',
                    description:
                      'Batch size. Leave empty to not track stock. / Големина на серијата. Празно = без следење.',
                  },
                },
                {
                  name: 'stockRemaining',
                  type: 'number',
                  min: 0,
                  admin: {
                    width: '50%',
                    description:
                      'Pieces left. Goes down automatically with each order; your edit here always wins. / Преостанати парчиња; се намалува автоматски со секоја нарачка.',
                  },
                },
              ],
            },
            {
              name: 'nextDropDate',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
                description:
                  'Optional: when the next batch is ready. / Опционално: кога е готова следната серија.',
              },
            },
            {
              name: 'leadTimeText',
              type: 'text',
              localized: true,
              maxLength: 120,
              admin: {
                description:
                  'Your own words, e.g. "Ships within 5 days". Leave empty if unknown. / На пр. „Се испраќа за 5 дена“. Празно ако не знаете.',
              },
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'ageMin',
                  type: 'number',
                  defaultValue: 6,
                  min: 3,
                  max: 18,
                  admin: { width: '25%' },
                },
                {
                  name: 'ageMax',
                  type: 'number',
                  defaultValue: 12,
                  min: 3,
                  max: 18,
                  admin: { width: '25%' },
                },
                {
                  name: 'difficulty',
                  type: 'number',
                  defaultValue: 1,
                  min: 1,
                  max: 3,
                  admin: {
                    width: '25%',
                    description: '1 = easy, 3 = tricky (shown as gears). / 1 = лесно, 3 = тешко.',
                  },
                },
                {
                  name: 'buildTimeMinutes',
                  type: 'number',
                  min: 0,
                  admin: { width: '25%', description: 'Approx. minutes. / Приближно минути.' },
                },
              ],
            },
            {
              name: 'whatsInTheBox',
              type: 'array',
              localized: true,
              labels: { singular: 'Item', plural: 'Items' },
              admin: { description: 'What is in the box. / Што има во кутијата.' },
              fields: [{ name: 'item', type: 'text', required: true, maxLength: 120 }],
            },
            {
              name: 'whatYouNeedAtHome',
              type: 'array',
              localized: true,
              labels: { singular: 'Item', plural: 'Items' },
              admin: {
                description: 'What you need at home (glue, scissors…). / Што ви треба дома.',
              },
              fields: [{ name: 'item', type: 'text', required: true, maxLength: 120 }],
            },
            {
              name: 'safetyNotes',
              type: 'textarea',
              localized: true,
              admin: {
                description:
                  'Leave empty to show the neutral default ("Recommended for ages X–Y. Adult supervision recommended."). / Празно = стандарден неутрален текст.',
              },
            },
            {
              name: 'materials',
              type: 'text',
              localized: true,
              admin: {
                description: 'E.g. "Birch plywood, cotton string". / На пр. „Брезова шперплоча“.',
              },
            },
          ],
        },
        { label: 'SEO', fields: [seoField] },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Web address, Latin letters only, e.g. "mini-catapult". Filled from the title if empty. / Адреса, само латиница.',
      },
      validate: (value: string | null | undefined) =>
        !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
          ? true
          : 'Use lowercase Latin letters, numbers and dashes only.',
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === 'string' && value.trim()) return slugify(value)
            const title = data?.title
            return typeof title === 'string' && title ? slugify(title) : value
          },
        ],
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Shows the "Most popular" ribbon and puts the kit in the home showcase. / Лента „Најпопуларна“.',
      },
    },
    sortOrderField,
    isPlaceholderField,
  ],
}
