import type { Payload } from 'payload'

import type { Order } from '@/payload-types'

import { formatPrice } from './format'
import { siteUrl } from './seo'

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function lines(order: Order, locale: 'mk' | 'en') {
  return (order.items ?? []).map((i) => {
    const price = typeof i.priceSnapshot === 'number' ? ` · ${formatPrice(i.priceSnapshot, locale)} ${locale === 'mk' ? 'ден.' : 'MKD'}` : ''
    return `${i.titleSnapshot} × ${i.quantity}${price}`
  })
}

function totalLine(order: Order, locale: 'mk' | 'en') {
  if (typeof order.total === 'number') {
    return locale === 'mk' ? `Вкупно: ${formatPrice(order.total, 'mk')} ден.` : `Total: ${formatPrice(order.total, 'en')} MKD`
  }
  return locale === 'mk' ? 'Вкупниот износ ќе го потврдиме на Viber.' : 'We will confirm the total on Viber.'
}

const html = (paragraphs: string[]) =>
  `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#0D1B2A">${paragraphs
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('')}</div>`

/** Owner notification for every new order. Contains personal data: goes only to the owner. */
export async function sendOwnerNotification(payload: Payload, order: Order) {
  const to = process.env.ORDER_NOTIFY_EMAIL
  if (!to) {
    payload.logger.warn({ msg: 'ORDER_NOTIFY_EMAIL not set: owner notification skipped', ref: order.ref })
    return
  }
  const body = [
    `Нова нарачка / New order: ${order.ref}`,
    lines(order, 'mk').join('\n'),
    totalLine(order, 'mk'),
    [
      `Име / Name: ${order.customerName}`,
      `Телефон / Phone: ${order.phone}`,
      order.email ? `Email: ${order.email}` : '',
      `Град / City: ${order.city}`,
      `Адреса / Address: ${order.address}`,
      `Контакт / Contact via: ${order.preferredContact}`,
      `Јазик / Language: ${order.locale}`,
    ]
      .filter(Boolean)
      .join('\n'),
    order.notes ? `Забелешка / Notes:\n${order.notes}` : '',
    `Admin: ${siteUrl()}/admin/collections/orders/${order.id}`,
  ].filter(Boolean)
  await payload.sendEmail({
    to,
    subject: `Нова нарачка ${order.ref} / New order`,
    text: body.join('\n\n'),
    html: html(body),
  })
}

/** Plain confirmation to the customer, only when they gave an email. */
export async function sendCustomerConfirmation(payload: Payload, order: Order, successNote?: string | null) {
  if (!order.email) return
  const mk = order.locale !== 'en'
  const body = mk
    ? [
        `Здраво ${order.customerName},`,
        `Ја примивме вашата нарачка ${order.ref}.`,
        lines(order, 'mk').join('\n'),
        totalLine(order, 'mk'),
        successNote || 'Ќе ви пишеме на Viber за да ја потврдиме нарачката и доставата. Плаќате при достава.',
        'INVENTO',
      ]
    : [
        `Hi ${order.customerName},`,
        `We received your order ${order.ref}.`,
        lines(order, 'en').join('\n'),
        totalLine(order, 'en'),
        successNote || "We'll message you on Viber to confirm the order and delivery. You pay on delivery.",
        'INVENTO',
      ]
  await payload.sendEmail({
    to: order.email,
    subject: mk ? `Вашата нарачка ${order.ref} · INVENTO` : `Your order ${order.ref} · INVENTO`,
    text: body.join('\n\n'),
    html: html(body),
  })
}
