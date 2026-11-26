'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Link } from '@/i18n/navigation'

import { useCartContext, type CatalogKit } from './CartProvider'
import { cartCount, useCart, type CartLine } from './store'

export type ResolvedLine = CartLine & { kit: CatalogKit | null; orderable: boolean }

/** Join persisted lines with the live catalog. Lines whose kit vanished or can't be ordered are flagged. */
export function useResolvedLines(): ResolvedLine[] {
  const lines = useCart((s) => s.lines)
  const { catalog } = useCartContext()
  return lines.map((l) => {
    const kit = catalog.find((k) => k.id === l.kitId) ?? null
    return { ...l, kit, orderable: Boolean(kit?.orderable) }
  })
}

export function Stepper({
  value,
  max,
  onChange,
  label,
  size = 'md',
}: {
  value: number
  max: number
  onChange: (n: number) => void
  label: string
  size?: 'sm' | 'md'
}) {
  const t = useTranslations('cart')
  const btn = `${size === 'sm' ? 'h-10 w-10' : 'h-12 w-12'} grid place-items-center rounded-full border-[3px] border-navy bg-paper text-navy text-xl font-black disabled:opacity-40`
  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={t('decrease')}>
        −
      </button>
      <output className="min-w-8 text-center text-lg font-bold" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={t('increase')}>
        +
      </button>
    </div>
  )
}

/** Header cart button with a count badge. */
export function CartButton() {
  const t = useTranslations('cart')
  const lines = useCart((s) => s.lines)
  const open = useCart((s) => s.open)
  const { hydrated } = useCartContext()
  const count = hydrated ? cartCount(lines) : 0
  return (
    <button
      type="button"
      onClick={open}
      data-cart-button
      className="bg-orange text-navy border-navy relative grid h-11 w-11 place-items-center rounded-full border-[3px] transition duration-200 ease-[var(--ease-back)] hover:-translate-y-0.5 hover:-rotate-6 hover:shadow-[3px_3px_0_0_var(--color-navy)] active:translate-y-0"
      aria-label={`${t('open')}: ${t('items', { count })}`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9h18l-2 11H5L3 9Z" />
        <path d="M8 9V7a4 4 0 0 1 8 0v2" />
      </svg>
      {count > 0 ? (
        <span aria-hidden="true" className="bg-navy text-paper border-paper absolute -top-2 -right-2 grid h-6 min-w-6 place-items-center rounded-full border-2 px-1 text-xs font-black">
          {count}
        </span>
      ) : null}
    </button>
  )
}

/** The tilted "Порачај / Order" sticker (same pop hover as Add to cart): opens the cart when it has items, otherwise goes to the kits. */
export function OrderSticker({ label }: { label: string }) {
  const lines = useCart((s) => s.lines)
  const open = useCart((s) => s.open)
  const { hydrated } = useCartContext()
  const cls =
    'btn-pop bg-orange text-navy border-navy display fixed right-4 bottom-4 z-30 inline-flex min-h-14 rotate-[-8deg] items-center gap-2 rounded-full border-[3px] px-6 text-2xl shadow-[4px_4px_0_0_var(--color-navy)] hover:rotate-[-3deg] sm:right-6 sm:bottom-6 sm:text-3xl'
  if (hydrated && cartCount(lines) > 0) {
    return (
      <button type="button" onClick={open} className={cls} data-order-sticker>
        <svg viewBox="0 0 24 24" className="btn-pop-icon h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9h18l-2 11H5L3 9Z" /><path d="M8 9V7a4 4 0 0 1 8 0v2" /></svg>
        {label}
      </button>
    )
  }
  return (
    <Link href="/kits" className={cls} data-order-sticker>
      <svg viewBox="0 0 24 24" className="btn-pop-icon h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9h18l-2 11H5L3 9Z" /><path d="M8 9V7a4 4 0 0 1 8 0v2" /></svg>
      {label}
    </Link>
  )
}

/** Stepper + "Add to cart" (kit page) or a compact single button (cards). */
export function AddToCart({
  kitId,
  title,
  orderable,
  compact = false,
  blockedMessage,
}: {
  kitId: number
  title: string
  orderable: boolean
  compact?: boolean
  blockedMessage?: string | null
}) {
  const t = useTranslations('cart')
  const tc = useTranslations('common')
  const { rules, announce } = useCartContext()
  const add = useCart((s) => s.add)
  const openCart = useCart((s) => s.open)
  const [qty, setQty] = useState(1)
  const max = rules.maxQuantityPerLine
  const canOrder = rules.ordersOpen && orderable

  if (!canOrder) {
    if (compact) return null
    return (
      <p className="font-bold" data-order-blocked>
        {!rules.ordersOpen ? rules.ordersClosedMessage || tc('ordersPaused') : blockedMessage}
      </p>
    )
  }

  const onAdd = () => {
    add(kitId, qty, max)
    announce(t('added', { title }))
    openCart()
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="btn-pop bg-orange text-navy border-navy relative z-10 inline-flex min-h-11 items-center gap-1.5 rounded-full border-[3px] px-4 text-sm font-bold shadow-[3px_3px_0_0_var(--color-navy)]"
      >
        <svg viewBox="0 0 24 24" className="btn-pop-icon h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9h18l-2 11H5L3 9Z" /><path d="M8 9V7a4 4 0 0 1 8 0v2" /></svg>
        {tc('addToCart')}
        <span className="sr-only">: {title}</span>
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Stepper value={qty} max={max} onChange={(n) => setQty(Math.max(1, Math.min(max, n)))} label={t('quantityOf', { title })} />
      <button
        type="button"
        onClick={onAdd}
        className="btn-pop bg-orange text-navy border-navy inline-flex min-h-12 items-center gap-2 rounded-full border-[3px] px-6 font-bold shadow-[4px_4px_0_0_var(--color-navy)]"
      >
        <svg viewBox="0 0 24 24" className="btn-pop-icon h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9h18l-2 11H5L3 9Z" /><path d="M8 9V7a4 4 0 0 1 8 0v2" /></svg>
        {tc('addToCart')}
      </button>
    </div>
  )
}
