import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { PageHeader } from '@/components/layout/PageHeader'
import { ContactForm } from '@/components/order/ContactForm'
import { ExternalButton } from '@/components/ui'
import type { Locale } from '@/i18n/routing'
import { issueFormToken } from '@/lib/antispam'
import { contactLinks } from '@/lib/contact'
import { getSiteSettings } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  const tn = await getTranslations({ locale, namespace: 'nav' })
  return buildMetadata({ locale, path: '/contact', title: tn('contact'), description: t('intro') })
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'contact' })
  const tc = await getTranslations({ locale, namespace: 'common' })
  const settings = await getSiteSettings(locale)
  const c = contactLinks(settings)
  const nothing = !c.viber && !c.instagram && !c.email

  const rows = [
    { label: t('viber'), value: c.phoneDisplay || settings.viberNumber, href: c.viber, cta: tc('viberCta'), variant: 'orange' as const },
    { label: t('instagram'), value: c.instagramHandle ? `@${c.instagramHandle}` : null, href: c.instagram, cta: tc('instagramCta'), variant: 'yellow' as const },
    { label: t('email'), value: settings.email, href: c.email, cta: tc('emailCta'), variant: 'paper' as const },
  ]

  return (
    <main id="main">
      <PageHeader title={t('title')} intro={t('intro')} world="navy" art="rocket" />
      <section className="bg-paper text-navy">
        <div className="container-x py-16 sm:py-20">
          {nothing ? <p className="mb-8 text-xl font-semibold">{tc('contactSoon')}</p> : null}
          <ul className="grid gap-6 md:grid-cols-3">
            {rows.map((r) => (
              <li key={r.label} className="border-navy flex flex-col gap-4 rounded-2xl border-[3px] p-6 shadow-[5px_5px_0_0_var(--color-navy)]">
                <h2 className="display text-4xl">{r.label}</h2>
                <p className="font-semibold break-words">{r.value || '—'}</p>
                <ExternalButton href={r.href} variant={r.variant} className="mt-auto" disabledLabel={tc('contactSoon')}>
                  {r.cta}
                </ExternalButton>
              </li>
            ))}
          </ul>
          {settings.city ? (
            <p className="mt-8 font-semibold">
              {t('city')}: {settings.city}
            </p>
          ) : null}
          <div className="mt-14">
            <ContactForm formToken={issueFormToken()} />
          </div>
        </div>
      </section>
    </main>
  )
}
