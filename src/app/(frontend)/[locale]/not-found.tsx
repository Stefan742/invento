import { getLocale, getTranslations } from 'next-intl/server'

import { Illustration } from '@/components/illustrations/Illustration'
import { ButtonLink } from '@/components/ui'

/** Branded 404: a marble that rolled off the track. */
export default async function NotFound() {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'notFound' })
  return (
    <main id="main" className="bg-orange text-navy relative overflow-hidden">
      <div className="container-x flex min-h-[70dvh] flex-col items-start justify-center gap-6 py-20">
        <svg aria-hidden="true" viewBox="0 0 600 160" className="w-full max-w-2xl" fill="none" strokeLinecap="round">
          <path d="M10 40 C 160 40, 260 60, 380 110" stroke="#0D1B2A" strokeWidth="14" />
          <path d="M10 40 C 160 40, 260 60, 380 110" stroke="#FFD166" strokeWidth="6" />
        </svg>
        <Illustration name="marble" className="absolute top-[34%] right-[12%] w-16 sm:w-24" />
        <h1 className="display display-giant">{t('title')}</h1>
        <p className="max-w-xl text-xl font-semibold">{t('body')}</p>
        <ButtonLink href="/" variant="navy">
          {t('cta')}
        </ButtonLink>
      </div>
    </main>
  )
}
