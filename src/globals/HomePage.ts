import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home page',
  admin: {
    group: 'Content',
    description:
      'Texts and section switches on the home page. Empty fields fall back to sensible defaults. / Текстови и секции на почетната.',
  },
  versions: { drafts: true, max: 20 },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal('home-page')] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero & intro',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'heroWord1', type: 'text', localized: true, admin: { width: '33%', placeholder: 'ГРАДИ.' } },
                { name: 'heroWord2', type: 'text', localized: true, admin: { width: '33%', placeholder: 'ОТКРИВАЈ.' } },
                { name: 'heroWord3', type: 'text', localized: true, admin: { width: '33%', placeholder: 'СОЗДАВАЈ.' } },
              ],
            },
            { name: 'heroSubline', type: 'textarea', localized: true, maxLength: 160 },
            { name: 'intro', type: 'textarea', localized: true, maxLength: 400 },
          ],
        },
        {
          label: 'How it works',
          fields: [
            {
              name: 'howItWorks',
              type: 'array',
              minRows: 0,
              maxRows: 4,
              admin: { description: 'Exactly four steps look best. / Четири чекори.' },
              fields: [
                { name: 'title', type: 'text', required: true, localized: true, maxLength: 40 },
                { name: 'body', type: 'textarea', required: true, localized: true, maxLength: 160 },
              ],
            },
          ],
        },
        {
          label: 'Sections',
          fields: [
            {
              name: 'featuredKits',
              type: 'relationship',
              relationTo: 'kits',
              hasMany: true,
              admin: {
                description:
                  'Kits in the yellow showcase. Empty = kits marked "featured". / Кутии во излогот.',
              },
            },
            {
              name: 'sections',
              type: 'group',
              admin: { description: 'Hide whole sections. / Скриј цели секции.' },
              fields: [
                { name: 'showShowcase', type: 'checkbox', defaultValue: true, label: 'Kits showcase' },
                { name: 'showHowItWorks', type: 'checkbox', defaultValue: true, label: 'How it works' },
                { name: 'showPickYourBox', type: 'checkbox', defaultValue: true, label: 'Pick your box' },
                { name: 'showTestimonials', type: 'checkbox', defaultValue: true, label: 'Parents say' },
                { name: 'showQuestions', type: 'checkbox', defaultValue: true, label: 'Questions' },
                { name: 'showGallery', type: 'checkbox', defaultValue: true, label: 'Builds gallery' },
              ],
            },
            {
              name: 'titles',
              type: 'group',
              admin: { description: 'Optional custom section titles. / Наслови на секциите.' },
              fields: [
                { name: 'showcase', type: 'text', localized: true, admin: { placeholder: 'КУТИИ' } },
                { name: 'howItWorks', type: 'text', localized: true, admin: { placeholder: 'КАКО РАБОТИ?' } },
                { name: 'pickYourBox', type: 'text', localized: true, admin: { placeholder: 'ИЗБЕРИ КУТИЈА' } },
                { name: 'testimonials', type: 'text', localized: true, admin: { placeholder: 'РОДИТЕЛИТЕ ВЕЛАТ' } },
                { name: 'questions', type: 'text', localized: true, admin: { placeholder: 'ИМАТЕ ПРАШАЊА?' } },
                { name: 'gallery', type: 'text', localized: true, admin: { placeholder: 'НАЈДЕТЕ НÈ ТУКА' } },
              ],
            },
          ],
        },
      ],
    },
  ],
}
