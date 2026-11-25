import type { GlobalConfig } from 'payload'

import { anyone, isAdmin, isAdminField } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    group: 'Settings',
    description:
      'Contact details, the pause-orders switch, order rules and defaults. / Контакт, пауза на нарачки, правила.',
  },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal('site-settings')] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Orders',
          description:
            'Turn orders off in one click when you are at capacity. Kit pages stay visible. / Исклучете нарачки со еден клик.',
          fields: [
            {
              name: 'ordersOpen',
              type: 'checkbox',
              defaultValue: true,
              label: 'Orders are open / Примаме нарачки',
            },
            {
              name: 'ordersClosedMessage',
              type: 'textarea',
              localized: true,
              admin: {
                description:
                  'Shown instead of the order button while orders are paused. / Се прикажува додека нарачките се паузирани.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'maxQuantityPerLine',
                  type: 'number',
                  defaultValue: 5,
                  min: 1,
                  max: 50,
                  admin: { width: '50%', description: 'Max pieces of one kit per order.' },
                },
                {
                  name: 'shippingFlatFee',
                  type: 'number',
                  min: 0,
                  admin: {
                    width: '50%',
                    description:
                      'Delivery fee in MKD. Leave EMPTY until decided. / Цена за достава. ПРАЗНО додека не се одлучи.',
                  },
                },
              ],
            },
            {
              name: 'shippingNote',
              type: 'text',
              localized: true,
              admin: { description: 'e.g. "Delivery cost confirmed on Viber".' },
            },
            {
              name: 'orderSuccessNote',
              type: 'textarea',
              localized: true,
              admin: {
                description:
                  'What happens next, shown after an order is sent. Your words. / Што следува после нарачката.',
              },
            },
          ],
        },
        {
          label: 'Contact',
          description:
            'Buttons for Viber, Instagram and email appear only once these are filled in. / Копчињата се појавуваат кога ќе се пополнат.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'viberNumber',
                  type: 'text',
                  admin: {
                    width: '50%',
                    description: 'International format, e.g. +38970123456.',
                  },
                  validate: (v: string | null | undefined) =>
                    !v || /^\+?[0-9 ]{8,16}$/.test(v) ? true : 'Use digits, e.g. +38970123456',
                },
                {
                  name: 'phoneDisplay',
                  type: 'text',
                  admin: { width: '50%', description: 'How the phone is shown, e.g. 070 123 456.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'email', type: 'email', admin: { width: '50%' } },
                {
                  name: 'city',
                  type: 'text',
                  localized: true,
                  admin: { width: '50%', description: 'e.g. Скопје / Skopje' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'instagramHandle',
                  type: 'text',
                  admin: { width: '50%', description: 'Without the @, e.g. invento.mk' },
                },
                { name: 'instagramUrl', type: 'text', admin: { width: '50%' } },
              ],
            },
          ],
        },
        {
          label: 'Announcement',
          fields: [
            {
              name: 'announcementBar',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: false },
                { name: 'text', type: 'text', localized: true, maxLength: 140 },
                {
                  name: 'link',
                  type: 'text',
                  admin: { description: 'Optional, e.g. /kits or a full URL.' },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO defaults',
          fields: [
            { name: 'siteName', type: 'text', defaultValue: 'INVENTO', access: { update: isAdminField } },
            { name: 'siteDescription', type: 'textarea', localized: true, maxLength: 200 },
            { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
