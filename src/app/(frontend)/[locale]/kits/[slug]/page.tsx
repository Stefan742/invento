import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Lightbox, type LightboxPhoto } from '@/components/gallery/Lightbox'
import { Illustration } from '@/components/illustrations/Illustration'
import { KitCard } from '@/components/kits/KitCard'
import { KitAvailability, KitChips, KitPrice } from '@/components/kits/KitMeta'
import { ExternalButton, Ribbon } from '@/components/ui'
import type { Locale } from '@/i18n/routing'
import { getAvailability } from '@/lib/availability'
import { contactLinks } from '@/lib/contact'
import { getKitBySlug, getKits, getSiteSettings } from '@/lib/data'
import { mediaList, resolveImage } from '@/lib/media'
import { absoluteUrl, buildMetadata, jsonLd } from '@/lib/seo'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const kit = await getKitBySlug(slug, locale)
  if (!kit) return {}
  const og = resolveImage(kit.seo?.ogImage, 'og') || resolveImage(kit.heroImage, 'og')
  return buildMetadata({
    locale,
    path: `/kits/${kit.slug}`,
    title: kit.seo?.title || kit.title,
    description: kit.seo?.description || kit.shortDescription,
    image: og ? { url: og.src, width: og.width, height: og.height, alt: og.alt } : null,
  })
}

function toPhoto(m: Media): LightboxPhoto | null {
  const full = resolveImage(m, 'hero')
  const main = resolveImage(m, 'card')
  if (!full || !main) return null
  return {
    id: String(m.id),
    src: full.src,
    width: full.width,
    height: full.height,
    alt: full.alt,
    thumbSrc: main.src,
    thumbWidth: main.width,
    thumbHeight: main.height,
  }
}

export default async function KitPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const kit = await getKitBySlug(slug, locale)
  if (!kit) notFound()

  const [t, tc, settings, allKits] = await Promise.all([
    getTranslations({ locale, namespace: 'kits' }),
    getTranslations({ locale, namespace: 'common' }),
    getSiteSettings(locale),
    getKits(locale),
  ])
  const c = contactLinks(settings)
  const availability = getAvailability(kit)
  const ordersOpen = settings.ordersOpen !== false
  const photos = [kit.heroImage, ...mediaList(kit.gallery)]
    .filter((m): m is Media => typeof m === 'object' && m !== null)
    .filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
    .map(toPhoto)
    .filter((p): p is LightboxPhoto => Boolean(p))
  const related = allKits.filter((k) => k.id !== kit.id).slice(0, 3)
  const ageMin = kit.ageMin ?? 6
  const ageMax = kit.ageMax ?? 12

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: kit.title,
    description: kit.shortDescription || undefined,
    brand: { '@type': 'Brand', name: 'INVENTO' },
    url: absoluteUrl(locale, `/kits/${kit.slug}`),
    ...(photos[0] ? { image: photos.map((p) => p.src) } : {}),
    // Offers only when a price exists (never invent one).
    ...(typeof kit.priceMKD === 'number'
      ? {
          offers: {
            '@type': 'Offer',
            price: kit.priceMKD,
            priceCurrency: 'MKD',
            availability:
              availability === 'available'
                ? 'https://schema.org/InStock'
                : availability === 'sold_out'
                  ? 'https://schema.org/SoldOut'
                  : 'https://schema.org/PreOrder',
            url: absoluteUrl(locale, `/kits/${kit.slug}`),
          },
        }
      : {}),
  }

  return (
    <main id="main" className="bg-paper text-navy">
      <div className="container-x grid gap-10 py-10 sm:py-16 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          {kit.featured ? <Ribbon>{tc('mostPopular')}</Ribbon> : null}
          {photos.length ? (
            <Lightbox
              photos={photos}
              labels={{
                close: tc('close'),
                previous: tc('previous'),
                next: tc('next'),
                open: `${t('gallery')}: {title}`,
                placeholder: tc('placeholder'),
              }}
              listClassName="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
              itemStyles={photos.map(() => ({ flex: '0 0 100%', scrollSnapAlign: 'center' }))}
            />
          ) : (
            <div className="bg-yellow border-navy grid aspect-square place-items-center rounded-3xl border-[3px]">
              <Illustration name="box" className="w-2/3" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h1 className="display text-[clamp(3rem,9vw,6.5rem)]">{kit.title}</h1>
          {kit.shortDescription ? <p className="text-xl font-medium">{kit.shortDescription}</p> : null}
          <KitPrice kit={kit} locale={locale} className="text-3xl" />
          <KitAvailability kit={kit} locale={locale} />

          <div className="bg-yellow border-navy rounded-2xl border-[3px] p-5 shadow-[5px_5px_0_0_var(--color-navy)]">
            {!ordersOpen ? (
              <p className="font-bold">{settings.ordersClosedMessage || tc('ordersPaused')}</p>
            ) : availability !== 'available' ? (
              <p className="font-bold">{t('notOrderable')}</p>
            ) : (
              <>
                <p className="font-semibold">{t('orderingSoon')}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <ExternalButton href={c.viber} variant="orange" disabledLabel={tc('contactSoon')}>
                    {tc('viberCta')}
                  </ExternalButton>
                  <ExternalButton href={c.instagram} variant="paper" disabledLabel={tc('contactSoon')}>
                    {tc('instagramCta')}
                  </ExternalButton>
                </div>
              </>
            )}
            <p className="mt-3 text-sm font-semibold">{tc('payOnDelivery')}</p>
          </div>

          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-sm font-bold tracking-wide uppercase opacity-80">{tc('agesLabel')}</dt>
              <dd className="font-semibold">{tc('ages', { min: ageMin, max: ageMax })}</dd>
            </div>
            <div>
              <dt className="text-sm font-bold tracking-wide uppercase opacity-80">{tc('difficulty')}</dt>
              <dd className="font-semibold">{tc('difficultyValue', { n: kit.difficulty ?? 1 })}</dd>
            </div>
            {kit.buildTimeMinutes ? (
              <div>
                <dt className="text-sm font-bold tracking-wide uppercase opacity-80">{tc('buildTime')}</dt>
                <dd className="font-semibold">{tc('minutes', { n: kit.buildTimeMinutes })}</dd>
              </div>
            ) : null}
            {kit.materials ? (
              <div>
                <dt className="text-sm font-bold tracking-wide uppercase opacity-80">{tc('materials')}</dt>
                <dd className="font-semibold">{kit.materials}</dd>
              </div>
            ) : null}
          </dl>
          <KitChips kit={kit} locale={locale} />
        </div>
      </div>

      <div className="container-x grid gap-10 pb-16 lg:grid-cols-[2fr_1fr]">
        <div className="prose-invento">{kit.description ? <RichText data={kit.description} /> : null}</div>
        <aside className="space-y-8">
          {kit.whatsInTheBox?.length ? (
            <section className="bg-orange border-navy rounded-2xl border-[3px] p-6">
              <h2 className="display text-3xl">{t('whatsInTheBox')}</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {kit.whatsInTheBox.map((x) => (
                  <li key={x.id}>{x.item}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {kit.whatYouNeedAtHome?.length ? (
            <section className="bg-teal border-navy rounded-2xl border-[3px] p-6">
              <h2 className="display text-3xl">{t('whatYouNeed')}</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {kit.whatYouNeedAtHome.map((x) => (
                  <li key={x.id}>{x.item}</li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="border-navy rounded-2xl border-[3px] border-dashed p-6">
            <h2 className="display text-3xl">{t('safety')}</h2>
            <p className="mt-3 whitespace-pre-line">
              {kit.safetyNotes || t('safetyDefault', { min: ageMin, max: ageMax })}
            </p>
          </section>
        </aside>
      </div>

      {related.length ? (
        <section className="bg-yellow border-navy border-t-[3px]" aria-labelledby="related-title">
          <div className="container-x py-16">
            <h2 id="related-title" className="display display-lg">
              {t('related')}
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((k, i) => (
                <li key={k.id}>
                  <KitCard kit={k} locale={locale} index={i + 1} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productLd) }} />
    </main>
  )
}
