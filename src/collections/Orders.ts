import type { CollectionConfig } from 'payload'

import { adminOnly } from '../access'

export const ORDER_STATUSES = [
  'new',
  'confirmed',
  'in_production',
  'shipped',
  'delivered',
  'cancelled',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New / Нова',
  confirmed: 'Confirmed / Потврдена',
  in_production: 'In production / Во изработка',
  shipped: 'Shipped / Испратена',
  delivered: 'Delivered / Доставена',
  cancelled: 'Cancelled / Откажана',
}

/**
 * Orders are created ONLY by the validated server order route (local API, M3).
 * The public REST/GraphQL API can neither read nor write them.
 */
export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Order', plural: 'Orders' },
  admin: {
    group: 'Shop',
    useAsTitle: 'ref',
    defaultColumns: ['ref', 'status', 'customerName', 'phone', 'total', 'createdAt'],
    listSearchableFields: ['ref', 'customerName', 'phone', 'email'],
    description:
      'Order requests from the website. Confirm each on Viber, then move the status along. / Нарачки од страницата.',
  },
  defaultSort: '-createdAt',
  access: adminOnly,
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'ref',
          type: 'text',
          unique: true,
          index: true,
          admin: { readOnly: true, width: '50%', description: 'e.g. INV-0007' },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          index: true,
          options: ORDER_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] })),
          admin: {
            width: '50%',
            description:
              'Cancelling puts the pieces back into stock (once). / Откажувањето ги враќа парчињата на залиха.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Customer / Купувач',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'customerName', type: 'text', required: true, maxLength: 120, admin: { width: '50%' } },
            { name: 'phone', type: 'text', required: true, maxLength: 40, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'email', type: 'email', admin: { width: '50%' } },
            {
              name: 'preferredContact',
              type: 'select',
              defaultValue: 'viber',
              options: [
                { label: 'Viber', value: 'viber' },
                { label: 'Phone / Телефон', value: 'phone' },
                { label: 'Email', value: 'email' },
              ],
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'city', type: 'text', required: true, maxLength: 80, admin: { width: '50%' } },
            { name: 'address', type: 'text', required: true, maxLength: 200, admin: { width: '50%' } },
          ],
        },
        { name: 'notes', type: 'textarea', maxLength: 1000 },
        {
          name: 'locale',
          type: 'select',
          defaultValue: 'mk',
          options: [
            { label: 'Македонски', value: 'mk' },
            { label: 'English', value: 'en' },
          ],
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Line', plural: 'Lines' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'kit', type: 'relationship', relationTo: 'kits', admin: { width: '40%' } },
            { name: 'titleSnapshot', type: 'text', required: true, admin: { width: '30%' } },
            {
              name: 'priceSnapshot',
              type: 'number',
              admin: { width: '15%', description: 'Empty = price was not set.' },
            },
            { name: 'quantity', type: 'number', required: true, min: 1, admin: { width: '15%' } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          admin: { width: '33%', description: 'Empty when any price is unknown.' },
        },
        {
          name: 'shippingFee',
          type: 'number',
          admin: { width: '33%', description: 'Empty when not set in settings.' },
        },
        { name: 'total', type: 'number', admin: { width: '33%' } },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      defaultValue: 'cash_on_delivery',
      options: [{ label: 'Cash on delivery / Плаќање при достава', value: 'cash_on_delivery' }],
      admin: { position: 'sidebar' },
    },
    {
      name: 'privacyConsent',
      type: 'checkbox',
      required: true,
      defaultValue: false,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'publicToken',
      type: 'text',
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'stockRestored',
      type: 'checkbox',
      defaultValue: false,
      admin: { hidden: true },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Only you see this. / Само вие го гледате ова.',
      },
    },
  ],
  timestamps: true,
}
