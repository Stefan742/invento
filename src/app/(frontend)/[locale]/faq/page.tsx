import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { PageHeader } from '@/components/layout/PageHeader'
import { ExternalButton } from '@/components/ui'
import { FAQ_CATEGORIES } from '@/collections/FAQs'
import type { Locale } from '@/i18n/routing'
import { contactLinks } from '@/lib/contact'
import { getFaqs, getSiteSettings } from '@/lib/data'
import { buildMetadata, jsonLd } from '@/lib/seo'
import type { Faq } from '@/payload-types'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })
  const tn = await getTranslations({ locale, namespace: 'nav' })
  return buildMetadata({ locale, path: '/faq', title: tn('faq'), description: t('intro') })
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'faq' })
  const tc = await getTranslations({ locale, namespace: 'common' })
  const [faqs, settings] = await Promise.all([getFaqs(locale), getSiteSettings(locale)])
  const c = contactLinks(settings)

  const groups: { key: string; label: string | null; items: Faq[] }[] = []
  for (const cat of [...FAQ_CATEGORIES, null] as const) {
    const items = faqs.filter((f) => (f.category ?? null) === cat)
    if (items.length) groups.push({ key: cat ?? 'none', label: cat ? t(`categories.${cat}`) : null, items })
  }
  const ld = faqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: locale,
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }
    : null

  return (
    <main id="main">
      <PageHeader title={t('title')} intro={t('intro')} world="orange" art="bulb">
        <div className="mt-6 flex flex-wrap gap-3">
          <ExternalButton href={c.viber} variant="paper" disabledLabel={tc('contactSoon')}>
            {tc('viberCta')}
          </ExternalButton>
        </div>
      </PageHeader>
      <section className="bg-paper text-navy">
        <div className="container-x max-w-4xl py-16 sm:py-20">
          {groups.length ? (
            groups.map((g) => (
              <div key={g.key} className="mb-12">
                {g.label ? <h2 className="display mb-4 text-4xl">{g.label}</h2> : null}
                <ul className="border-navy divide-navy/20 divide-y-2 rounded-2xl border-[3px] bg-white/40 px-5">
                  {g.items.map((f) => (
                    <li key={f.id}>
                      <details className="group py-2">
                        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
                          {f.question}
                          <span aria-hidden="true" className="bg-orange border-navy grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-xl transition-transform group-open:rotate-45">
                            +
                          </span>
                        </summary>
                        <p className="pt-1 pb-3 whitespace-pre-line">{f.answer}</p>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-xl font-semibold">{t('empty')}</p>
          )}
        </div>
      </section>
      {ld ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} /> : null}
    </main>
  )
}
