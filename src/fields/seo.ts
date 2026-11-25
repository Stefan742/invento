import type { Field } from 'payload'

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO (optional)',
  admin: {
    description:
      'How this page looks on Google and when the link is shared on Instagram/Viber. Leave empty to use sensible defaults. / Како изгледа на Google и при споделување. Оставете празно за стандардни вредности.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      maxLength: 70,
      admin: { description: 'Max ~60 characters. / До ~60 знаци.' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      maxLength: 200,
      admin: { description: 'Max ~155 characters. / До ~155 знаци.' },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Share image, ideally 1200×630. / Слика за споделување, идеално 1200×630.' },
    },
  ],
}

export const isPlaceholderField: Field = {
  name: 'isPlaceholder',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    position: 'sidebar',
    description:
      'Sample content created by the seed script. Hidden on the live site. Untick only after replacing it with real content. / Пример-содржина. Скриена на живата страница.',
  },
}

export const sortOrderField: Field = {
  name: 'sortOrder',
  type: 'number',
  defaultValue: 0,
  admin: {
    position: 'sidebar',
    description: 'Lower numbers show first. / Помал број = прво се прикажува.',
  },
}
