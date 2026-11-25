import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Hero, Intro } from '@/components/sections/Hero'
import { BuildsGallery, ParentsSay, Questions } from '@/components/sections/HomeLower'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { PickYourBox } from '@/components/sections/PickYourBox'
import { Showcase } from '@/components/sections/Showcase'
import type { Locale } from '@/i18n/routing'
import {
  getBuilds,
  getFaqs,
  getFeaturedKits,
  getHomePage,
  getKits,
  getSiteSettings,
  getTestimonials,
} from '@/lib/data'
import { alternatesFor, jsonLd } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { alternates: alternatesFor(locale, '') }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const [home, settings, kits, faqs, testimonials, builds] = await Promise.all([
    getHomePage(locale),
    getSiteSettings(locale),
    getKits(locale),
    getFaqs(locale),
    getTestimonials(locale),
    getBuilds(locale),
  ])
  const featured = await getFeaturedKits(locale, home)
  const s = home.sections ?? {}
  const titles = home.titles ?? {}
  const show = (v: boolean | null | undefined) => v !== false
  const tf = await getTranslations({ locale, namespace: 'faq' })

  const topFaqs = faqs.slice(0, 5)
  const faqLd = topFaqs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: locale,
        name: tf('title'),
        mainEntity: topFaqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }
    : null

  return (
    <main id="main" data-home>
      <Hero locale={locale} home={home} />
      <Intro locale={locale} home={home} />
      {show(s.showShowcase) ? <Showcase locale={locale} kits={featured} title={titles.showcase} /> : null}
      {show(s.showHowItWorks) ? <HowItWorks locale={locale} home={home} title={titles.howItWorks} /> : null}
      {show(s.showPickYourBox) ? <PickYourBox locale={locale} kits={kits} title={titles.pickYourBox} /> : null}
      {show(s.showTestimonials) ? (
        <ParentsSay locale={locale} testimonials={testimonials} title={titles.testimonials} />
      ) : null}
      {show(s.showQuestions) ? (
        <Questions locale={locale} faqs={topFaqs} settings={settings} title={titles.questions} />
      ) : null}
      {show(s.showGallery) ? (
        <BuildsGallery locale={locale} builds={builds} settings={settings} title={titles.gallery} />
      ) : null}
      {faqLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqLd) }} /> : null}
    </main>
  )
}
