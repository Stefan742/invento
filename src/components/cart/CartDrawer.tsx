'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'

import { Link } from '@/i18n/navigation'
import { computeTotals } from '@/lib/order'

import { Stepper, useResolvedLines } from './CartUI'
import { useCartContext } from './CartProvider'
import { useCart } from './store'

export function useMoney() {
  const locale = useLocale()
  const tc = useTranslations('common')
  return (n: number) => tc('priceMKD', { price: new Intl.NumberFormat(locale === 'mk' ? 'mk-MK' : 'en-GB').format(n) })
}

/** Totals block shared by the drawer and the order page. */
export function CartTotals() {
  const t = useTranslations('cart')
  const money = useMoney()
  const { rules } = useCartContext()
  const lines = useResolvedLines().filter((l) => l.orderable)
  const totals = computeTotals(lines.map((l) => ({ price: l.kit?.price, quantity: l.quantity })), rules.shippingFee)
  return (
    <dl className="space-y-1">
      {totals.subtotal !== null ? (
        <div className="flex justify-between gap-4">
          <dt>{t('subtotal')}</dt>
          <dd className="font-bold">{money(totals.subtotal)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between gap-4">
        <dt>{t('shipping')}</dt>
        <dd className="text-right font-bold">
          {totals.shippingFee !== null ? money(totals.shippingFee) : rules.shippingNote || t('shippingOnViber')}
        </dd>
      </div>
      <div className="border-navy/30 flex justify-between gap-4 border-t-2 pt-2 text-lg">
        <dt className="font-bold">{t('total')}</dt>
        <dd className="text-right font-black">{totals.total !== null ? money(totals.total) : t('totalOnViber')}</dd>
      </div>
    </dl>
  )
}

export function CartLines({ editable = true }: { editable?: boolean }) {
  const t = useTranslations('cart')
  const tc = useTranslations('common')
  const money = useMoney()
  const { rules } = useCartContext()
  const setQuantity = useCart((s) => s.setQuantity)
  const remove = useCart((s) => s.remove)
  const lines = useResolvedLines()

  return (
    <ul className="divide-navy/15 divide-y-2">
      {lines.map((l) => {
        const title = l.kit?.title ?? `#${l.kitId}`
        return (
          <li key={l.kitId} className="flex gap-4 py-4" data-cart-line={l.kit?.slug}>
            <div className="bg-yellow border-navy h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2">
              {l.kit?.image ? (
                <Image src={l.kit.image.src} alt="" width={160} height={160} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold">{title}</p>
                <p className="shrink-0 font-semibold">
                  {typeof l.kit?.price === 'number' ? money(l.kit.price * l.quantity) : tc('priceSoon')}
                </p>
              </div>
              {!l.orderable ? (
                <p className="bg-navy text-paper inline-block self-start rounded-full px-3 py-0.5 text-sm font-bold" role="alert">
                  {t('unavailable', { title })}
                </p>
              ) : null}
              {editable ? (
                <div className="flex items-center justify-between gap-3">
                  {l.orderable ? (
                    <Stepper
                      size="sm"
                      value={l.quantity}
                      max={rules.maxQuantityPerLine}
                      onChange={(n) => setQuantity(l.kitId, n, rules.maxQuantityPerLine)}
                      label={t('quantityOf', { title })}
                    />
                  ) : (
                    <span />
                  )}
                  <button type="button" onClick={() => remove(l.kitId)} className="min-h-11 px-2 text-sm font-semibold underline underline-offset-2">
                    {t('remove', { title: '' }).trim() || '×'}
                    <span className="sr-only">: {title}</span>
                  </button>
                </div>
              ) : (
                <p className="text-sm">× {l.quantity}</p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Cart drawer on the native <dialog> element (focus trap, Esc, focus return from the browser). */
export function CartDrawer() {
  const t = useTranslations('cart')
  const tc = useTranslations('common')
  const ref = useRef<HTMLDialogElement>(null)
  const isOpen = useCart((s) => s.isOpen)
  const close = useCart((s) => s.close)
  const { rules, hydrated } = useCartContext()
  const lines = useResolvedLines()
  const hasBlocked = lines.some((l) => !l.orderable)

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (isOpen && !dlg.open) dlg.showModal()
    if (!isOpen && dlg.open) dlg.close()
  }, [isOpen])

  return (
    <dialog
      ref={ref}
      aria-labelledby="cart-title"
      data-anim="drawer"
      onClose={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      className="bg-paper text-navy border-navy fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-md border-l-[3px] p-0 backdrop:bg-black/60"
    >
      <div className="flex h-full flex-col">
        <div className="bg-orange border-navy flex items-center justify-between border-b-[3px] px-5 py-4">
          <h2 id="cart-title" className="display text-5xl">
            {t('title')}
          </h2>
          <button type="button" onClick={close} className="border-navy bg-paper grid h-12 w-12 place-items-center rounded-full border-[3px] text-2xl font-black" aria-label={t('close')}>
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5" data-lenis-prevent>
          {hydrated && lines.length ? (
            <CartLines />
          ) : (
            <div className="space-y-4 py-10">
              <p className="text-lg font-semibold">{t('empty')}</p>
              <Link href="/kits" onClick={close} className="bg-orange border-navy inline-flex min-h-12 items-center rounded-full border-[3px] px-6 font-bold">
                {t('browse')}
              </Link>
            </div>
          )}
        </div>
        {hydrated && lines.length ? (
          <div className="border-navy space-y-4 border-t-[3px] px-5 py-5">
            <CartTotals />
            {!rules.ordersOpen ? (
              <p className="bg-navy text-paper rounded-xl p-3 font-bold" role="alert">
                {rules.ordersClosedMessage || tc('ordersPaused')}
              </p>
            ) : (
              <Link
                href="/order"
                onClick={close}
                aria-disabled={hasBlocked || undefined}
                className={`bg-orange text-navy border-navy flex min-h-14 w-full items-center justify-center rounded-full border-[3px] text-lg font-bold shadow-[4px_4px_0_0_var(--color-navy)] ${hasBlocked ? 'pointer-events-none opacity-50' : ''}`}
              >
                {t('checkout')} →
              </Link>
            )}
            <p className="text-center text-sm font-semibold">{tc('payOnDelivery')}</p>
          </div>
        ) : null}
      </div>
    </dialog>
  )
}
