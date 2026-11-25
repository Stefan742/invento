'use client'

import { useTranslations } from 'next-intl'

import { Illustration } from '@/components/illustrations/Illustration'
import { Link } from '@/i18n/navigation'

/** Branded error page. Shows no internals (no message, no stack). */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('error')
  const tc = useTranslations('common')
  return (
    <main id="main" className="bg-teal text-navy">
      <div className="container-x flex min-h-[70dvh] flex-col items-start justify-center gap-6 py-20">
        <Illustration name="wrench" className="w-24 rotate-12" />
        <h1 className="display display-xl">{t('title')}</h1>
        <p className="max-w-xl text-xl font-semibold">{t('body')}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-orange border-navy min-h-12 rounded-full border-[3px] px-6 font-bold shadow-[4px_4px_0_0_var(--color-navy)]"
          >
            {t('retry')}
          </button>
          <Link href="/" className="border-navy inline-flex min-h-12 items-center rounded-full border-[3px] px-6 font-bold">
            {tc('backHome')}
          </Link>
        </div>
      </div>
    </main>
  )
}
