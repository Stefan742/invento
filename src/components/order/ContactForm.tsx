'use client'

import { useTranslations } from 'next-intl'
import { useId, useState, type FormEvent } from 'react'

const input =
  'border-navy bg-white text-navy w-full rounded-xl border-[3px] px-4 py-3 text-base outline-none focus-visible:shadow-[0_0_0_4px_var(--color-orange)]'

/** Simple contact form: name, how to reach you, message. Emails the owner. */
export function ContactForm({ formToken }: { formToken: string }) {
  const t = useTranslations('contactForm')
  const te = useTranslations('order.errors')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const hp = useId()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setState('sending')
    setError(null)
    setFieldErrors({})
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name'),
          contact: f.get('contact'),
          message: f.get('message'),
          website: f.get('website'),
          formToken,
        }),
      })
      if (res.ok) {
        setState('sent')
        return
      }
      const body = (await res.json().catch(() => ({ code: 'server' }))) as { code: string; fields?: Record<string, string> }
      if (body.code === 'validation' && body.fields) setFieldErrors(body.fields)
      setError(te.has(body.code) ? te(body.code as never) : te('server'))
    } catch {
      setError(te('network'))
    }
    setState('idle')
  }

  if (state === 'sent') {
    return (
      <p className="bg-teal border-navy rounded-2xl border-[3px] p-6 text-lg font-bold" role="status">
        {t('sent')}
      </p>
    )
  }

  const row = (name: 'name' | 'contact' | 'message', label: string, textarea = false, autoComplete?: string) => {
    const id = `contact-${name}`
    const err = fieldErrors[name] ? (te.has(fieldErrors[name]) ? te(fieldErrors[name] as never) : te('required')) : null
    const props = {
      id,
      name,
      required: true,
      className: input,
      'aria-invalid': err ? true : undefined,
      'aria-describedby': err ? `${id}-err` : undefined,
      autoComplete,
    }
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block font-bold">
          {label}
        </label>
        {textarea ? <textarea rows={5} maxLength={2000} {...props} /> : <input type="text" maxLength={160} {...props} />}
        {err ? (
          <p id={`${id}-err`} className="mt-1 text-sm font-bold text-[#B3261E]">
            {err}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5" aria-labelledby="contact-form-title">
      <h2 id="contact-form-title" className="display text-4xl">
        {t('title')}
      </h2>
      {row('name', t('name'), false, 'name')}
      {row('contact', t('contact'), false, 'email')}
      {row('message', t('message'), true)}
      <div aria-hidden="true" className="absolute left-[-10000px] h-px w-px overflow-hidden">
        <label htmlFor={hp}>website</label>
        <input id={hp} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {error ? (
        <p className="bg-navy text-paper rounded-xl p-4 font-bold" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="bg-orange text-navy border-navy inline-flex min-h-12 items-center rounded-full border-[3px] px-8 font-bold shadow-[4px_4px_0_0_var(--color-navy)] disabled:opacity-60"
      >
        {state === 'sending' ? t('sending') : t('send')}
      </button>
      <p className="text-sm">{t('privacy')}</p>
    </form>
  )
}
