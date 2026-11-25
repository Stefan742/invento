'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Script from 'next/script'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Link, useRouter } from '@/i18n/navigation'
import { customerSchema, LIMITS } from '@/lib/order'

import { CartLines, CartTotals } from '../cart/CartDrawer'
import { useResolvedLines } from '../cart/CartUI'
import { useCartContext } from '../cart/CartProvider'
import { useCart } from '../cart/store'

type FormValues = {
  customerName: string
  phone: string
  email: string
  city: string
  address: string
  notes: string
  preferredContact: 'viber' | 'phone' | 'email'
  privacyConsent: boolean
}

type ApiError = { code: string; kits?: string[]; fields?: Record<string, string> }

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void }) => void }
  }
}

const input =
  'border-navy bg-white text-navy w-full rounded-xl border-[3px] px-4 py-3 text-base outline-none focus-visible:shadow-[0_0_0_4px_var(--color-orange)]'

export function OrderForm({
  formToken,
  locale,
  turnstileSiteKey,
}: {
  formToken: string
  locale: 'mk' | 'en'
  turnstileSiteKey: string | null
}) {
  const t = useTranslations('order')
  const tc = useTranslations('common')
  const tcart = useTranslations('cart')
  const router = useRouter()
  const { hydrated } = useCartContext()
  const lines = useResolvedLines()
  const clear = useCart((s) => s.clear)
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const honeypotId = useId()
  const errorRef = useRef<HTMLDivElement>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    // Same schema as the server (src/lib/order.ts), minus the cart lines and anti-spam fields.
    resolver: zodResolver(customerSchema()) as never,
    defaultValues: { preferredContact: 'viber', privacyConsent: false, email: '', notes: '' },
    mode: 'onTouched',
  })

  useEffect(() => {
    if (serverError) errorRef.current?.focus()
  }, [serverError])

  const renderTurnstile = () => {
    if (turnstileSiteKey && turnstileRef.current && window.turnstile) {
      window.turnstile.render(turnstileRef.current, { sitekey: turnstileSiteKey, callback: setTurnstileToken })
    }
  }

  const msg = (code?: string) => (code ? (t.has(`errors.${code}`) ? t(`errors.${code}` as never) : t('errors.server')) : undefined)

  const orderable = lines.filter((l) => l.orderable)
  const blocked = lines.some((l) => !l.orderable)

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    if (!orderable.length || blocked) {
      setServerError(blocked ? t('errors.unavailable', { kits: lines.filter((l) => !l.orderable).map((l) => l.kit?.title ?? `#${l.kitId}`).join(', ') }) : t('errors.cartEmpty'))
      return
    }
    setSubmitting(true)
    const honeypot = (document.getElementById(honeypotId) as HTMLInputElement | null)?.value ?? ''
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          locale,
          items: orderable.map((l) => ({ kitId: l.kitId, quantity: l.quantity })),
          website: honeypot,
          formToken,
          turnstileToken,
        }),
      })
      if (res.status === 201) {
        const { token } = (await res.json()) as { token: string }
        clear()
        router.push(`/order/${token}`)
        return
      }
      const body = (await res.json().catch(() => ({ code: 'server' }))) as ApiError
      if (body.code === 'validation' && body.fields) {
        for (const [field, code] of Object.entries(body.fields)) {
          if (field in values) setError(field as keyof FormValues, { message: code })
        }
        setServerError(t('errors.required'))
      } else if (body.code === 'stock' || body.code === 'unavailable') {
        setServerError(t(`errors.${body.code}`, { kits: (body.kits ?? []).join(', ') }))
      } else {
        setServerError(msg(body.code) ?? t('errors.server'))
      }
    } catch {
      setServerError(t('errors.network'))
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name: keyof FormValues, label: string, opts: { type?: string; autoComplete?: string; hint?: string; max?: number; required?: boolean; textarea?: boolean } = {}) => {
    const id = `order-${name}`
    const err = msg(errors[name]?.message as string | undefined)
    const describedBy = [opts.hint ? `${id}-hint` : '', err ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined
    const common = {
      id,
      'aria-invalid': err ? true : undefined,
      'aria-describedby': describedBy,
      'aria-required': opts.required || undefined,
      maxLength: opts.max,
      className: input,
      ...register(name),
    }
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block font-bold">
          {label}
          {opts.required ? <span className="sr-only"> ({t('required')})</span> : null}
          {opts.required ? <span aria-hidden="true"> *</span> : null}
        </label>
        {opts.textarea ? <textarea rows={3} {...common} /> : <input type={opts.type ?? 'text'} autoComplete={opts.autoComplete} {...common} />}
        {opts.hint ? (
          <p id={`${id}-hint`} className="mt-1 text-sm">
            {opts.hint}
          </p>
        ) : null}
        {err ? (
          <p id={`${id}-err`} className="mt-1 text-sm font-bold text-[#B3261E]">
            {err}
          </p>
        ) : null}
      </div>
    )
  }

  if (hydrated && !lines.length) {
    return (
      <div className="space-y-4">
        <p className="text-xl font-semibold">{tcart('empty')}</p>
        <Link href="/kits" className="bg-orange border-navy inline-flex min-h-12 items-center rounded-full border-[3px] px-6 font-bold">
          {tcart('browse')}
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_26rem]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="order-2 space-y-5 lg:order-1" aria-labelledby="order-details-title">
        <h2 id="order-details-title" className="display text-4xl">
          {t('yourDetails')}
        </h2>
        {field('customerName', t('fields.customerName'), { autoComplete: 'name', max: LIMITS.name, required: true })}
        {field('phone', t('fields.phone'), { type: 'tel', autoComplete: 'tel', hint: t('hints.phone'), max: LIMITS.phone, required: true })}
        {field('email', t('fields.email'), { type: 'email', autoComplete: 'email', max: LIMITS.email })}
        <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
          {field('city', t('fields.city'), { autoComplete: 'address-level2', max: LIMITS.city, required: true })}
          {field('address', t('fields.address'), { autoComplete: 'street-address', max: LIMITS.address, required: true })}
        </div>
        {field('notes', t('fields.notes'), { textarea: true, max: LIMITS.notes })}

        <fieldset>
          <legend className="mb-2 font-bold">{t('fields.preferredContact')}</legend>
          <div className="flex flex-wrap gap-3">
            {(['viber', 'phone', 'email'] as const).map((v) => (
              <label key={v} className="border-navy has-[:checked]:bg-yellow flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-[3px] px-4 font-semibold">
                <input type="radio" value={v} {...register('preferredContact')} className="accent-[#0D1B2A]" />
                {t(`contact.${v}`)}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
        <div aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden">
          <label htmlFor={honeypotId}>{t('honeypot')}</label>
          <input id={honeypotId} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              {...register('privacyConsent')}
              aria-invalid={errors.privacyConsent ? true : undefined}
              aria-describedby={errors.privacyConsent ? 'order-consent-err' : undefined}
              className="mt-1 h-6 w-6 shrink-0 accent-[#FF7A00]"
            />
            <span>
              {t.rich('fields.privacyConsent', {
                link: (chunks) => (
                  <Link href="/privacy" target="_blank" className="font-bold underline underline-offset-2">
                    {chunks}
                  </Link>
                ),
              })}
              <span aria-hidden="true"> *</span>
            </span>
          </label>
          {errors.privacyConsent ? (
            <p id="order-consent-err" className="mt-1 text-sm font-bold text-[#B3261E]">
              {msg(errors.privacyConsent.message as string)}
            </p>
          ) : null}
        </div>

        {turnstileSiteKey ? (
          <>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={renderTurnstile} />
            <div ref={turnstileRef} />
          </>
        ) : null}

        <div ref={errorRef} tabIndex={-1} aria-live="assertive" className="outline-none">
          {serverError ? (
            <p className="bg-navy text-paper rounded-xl p-4 font-bold" role="alert" data-order-error>
              {serverError}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting || !hydrated}
          className="bg-orange text-navy border-navy flex min-h-14 w-full items-center justify-center rounded-full border-[3px] text-xl font-bold shadow-[4px_4px_0_0_var(--color-navy)] disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {submitting ? t('submitting') : t('submit')}
        </button>
        <p className="font-semibold">{tc('payOnDelivery')}</p>
      </form>

      <aside className="order-1 lg:order-2" aria-labelledby="order-summary-title">
        <div className="bg-yellow border-navy rounded-2xl border-[3px] p-5 shadow-[6px_6px_0_0_var(--color-navy)] lg:sticky lg:top-24">
          <h2 id="order-summary-title" className="display text-4xl">
            {t('summary')}
          </h2>
          {hydrated ? <CartLines /> : null}
          <div className="mt-2">
            <CartTotals />
          </div>
          <p className="mt-4 rounded-xl bg-white/60 p-3 text-center font-bold">{t('payOnDelivery')}</p>
        </div>
      </aside>
    </div>
  )
}
