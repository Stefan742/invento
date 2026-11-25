import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { contactLinks } from '@/lib/contact'
import { driftLayout } from '@/lib/layout'
import type { Build, Faq, SiteSetting, Testimonial } from '@/payload-types'

import { Lightbox } from '../gallery/Lightbox'
import { buildPhotos } from '../gallery/photos'
import { Illustration, type IllustrationName } from '../illustrations/Illustration'
import { ButtonLink, ExternalButton } from '../ui'
import { GiantTitle, Section } from './Section'
import { TestimonialsRuler } from './TestimonialsRuler'

export async function ParentsSay({
  locale,
  testimonials,
  title,
}: {
  locale: Locale
  testimonials: Testimonial[]
  title?: string | null
}) {
  // Hidden entirely when there are no (visible) testimonials. Never invent them.
  if (!testimonials.length) return null
  const t = await getTranslations({ locale, namespace: 'common' })
  const th = await getTranslations({ locale, namespace: 'home' })
  return (
    <Section world="navy" anchor="parents" labelledBy="parents-title">
      <div className="container-x py-20 sm:py-28">
        <GiantTitle id="parents-title" className="text-paper mb-12">
          {title || th('testimonialsTitle')}
        </GiantTitle>
        <TestimonialsRuler
          items={testimonials.map((x) => ({
            id: x.id,
            quote: x.quote,
            name: x.authorName,
            note: x.authorNote,
            isPlaceholder: x.isPlaceholder,
          }))}
          labels={{
            previous: t('previous'),
            next: t('next'),
            of: th.raw('testimonialOf') as string,
            placeholder: t('placeholder'),
            placeholderNote: t('placeholderNote'),
            group: t('parentsSay'),
          }}
        />
      </div>
    </Section>
  )
}

/** Deterministic static pile of parts (the physics version arrives in M4). */
const PILE: { name: IllustrationName; x: number; y: number; r: number; w: number }[] = [
  { name: 'bolt', x: 4, y: 62, r: -24, w: 13 },
  { name: 'gear', x: 16, y: 70, r: 12, w: 15 },
  { name: 'nut', x: 30, y: 78, r: 8, w: 9 },
  { name: 'spring', x: 40, y: 72, r: -10, w: 10 },
  { name: 'peg', x: 52, y: 74, r: 70, w: 9 },
  { name: 'gear-teal', x: 63, y: 70, r: -18, w: 13 },
  { name: 'bolt', x: 76, y: 74, r: 64, w: 11 },
  { name: 'nut', x: 87, y: 66, r: -30, w: 10 },
  { name: 'peg', x: 8, y: 84, r: -80, w: 8 },
  { name: 'gear-orange', x: 82, y: 82, r: 20, w: 12 },
]

export async function Questions({
  locale,
  faqs,
  settings,
  title,
}: {
  locale: Locale
  faqs: Faq[]
  settings: SiteSetting
  title?: string | null
}) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const th = await getTranslations({ locale, namespace: 'home' })
  const c = contactLinks(settings)
  return (
    <Section world="orange" id="questions" anchor="questions" labelledBy="questions-title" gears={false}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" data-physics-pile>
        {PILE.map((p, i) => (
          <Illustration
            key={i}
            name={p.name}
            className="absolute"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `clamp(3rem, ${p.w}vw, 9rem)`, transform: `rotate(${p.r}deg)` }}
          />
        ))}
      </div>
      <div className="container-x py-20 sm:py-28">
        <GiantTitle id="questions-title">{title || th('questionsTitle')}</GiantTitle>
        <div className="bg-paper text-navy border-navy relative mt-12 max-w-3xl rotate-[-1deg] rounded-2xl border-[3px] p-6 shadow-[8px_8px_0_0_var(--color-navy)] sm:p-10">
          {faqs.length ? (
            <ul className="divide-navy/20 divide-y-2">
              {faqs.slice(0, 5).map((f) => (
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
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <ExternalButton href={c.viber} variant="orange" disabledLabel={t('contactSoon')}>
              {t('viberCta')}
            </ExternalButton>
            <ExternalButton href={c.instagram} variant="paper" disabledLabel={t('contactSoon')}>
              {t('instagramCta')}
            </ExternalButton>
            <ButtonLink href="/faq" variant="outline" className="border-navy">
              {th('allFaqs')} →
            </ButtonLink>
          </div>
          {!c.viber && !c.instagram ? <p className="mt-3 text-sm">{t('contactSoon')}</p> : null}
        </div>
      </div>
    </Section>
  )
}

export async function BuildsGallery({
  locale,
  builds,
  settings,
  title,
}: {
  locale: Locale
  builds: Build[]
  settings: SiteSetting
  title?: string | null
}) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const th = await getTranslations({ locale, namespace: 'home' })
  const tg = await getTranslations({ locale, namespace: 'gallery' })
  const c = contactLinks(settings)
  const photos = buildPhotos(builds.slice(0, 9), (name) => tg('builtBy', { name }))
  const slots = driftLayout(Math.max(photos.length, 6))

  return (
    <Section world="paper" id="builds" anchor="gallery" labelledBy="gallery-title">
      <div className="container-x py-20 sm:py-28">
        <GiantTitle id="gallery-title" className="text-center">
          {title || th('galleryTitle')}
        </GiantTitle>
        {c.instagramHandle && c.instagram ? (
          <p className="mt-4 text-center">
            <a
              href={c.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="display inline-block text-[clamp(2.5rem,9vw,8rem)] break-all underline decoration-[0.06em] underline-offset-[0.12em]"
            >
              @{c.instagramHandle}
            </a>
          </p>
        ) : null}

        {photos.length ? (
          <Lightbox
            photos={photos}
            variant="taped"
            labels={{
              close: t('close'),
              previous: t('previous'),
              next: t('next'),
              open: tg.raw('open') as string,
              placeholder: t('placeholder'),
            }}
            listClassName="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:gap-10"
            itemStyles={photos.map((_, i) => ({
              transform: `rotate(${slots[i].rotate}deg) translateY(${(slots[i].y % 10) * 4}px)`,
            }))}
          />
        ) : (
          // No published builds yet: illustrated "Your build here" frames keep the section's rhythm.
          <ul className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:gap-10" aria-label={th('yourBuildHere')}>
            {slots.slice(0, 6).map((s, i) => (
              <li key={i} style={{ transform: `rotate(${s.rotate}deg)` }}>
                <div className="tape bg-paper border-navy relative grid aspect-[4/5] place-items-center rounded-md border-[3px] border-dashed p-4 text-center">
                  <div>
                    <Illustration name={(['gear', 'rocket', 'bulb', 'catapult', 'wrench', 'box'] as const)[i % 6]} className="mx-auto w-1/2" />
                    <p className="mt-3 font-bold">{th('yourBuildHere')}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-12 text-center">
          <ButtonLink href="/gallery" variant="navy">
            {tg('title')} →
          </ButtonLink>
        </div>
      </div>
    </Section>
  )
}
