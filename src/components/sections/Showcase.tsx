import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getAvailability } from '@/lib/availability'
import { resolveImage } from '@/lib/media'
import type { Kit } from '@/payload-types'

import { Illustration } from '../illustrations/Illustration'
import { GearRating } from '../ui'
import { GiantTitle, Section } from './Section'

const pad = (n: number) => String(n).padStart(2, '0')

/** Yellow kits showcase. Static: a swipeable scroll-snap carousel. M4 pins it horizontally on desktop. */
export async function Showcase({ locale, kits, title }: { locale: Locale; kits: Kit[]; title?: string | null }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const th = await getTranslations({ locale, namespace: 'home' })
  if (!kits.length) return null

  return (
    <Section world="yellow" anchor="showcase" labelledBy="showcase-title">
      <div className="container-x pt-20 sm:pt-28">
        <div className="relative inline-block">
          <GiantTitle id="showcase-title">{title || th('showcaseTitle')}</GiantTitle>
          <Illustration
            name="gear-orange"
            className="absolute -top-6 -right-10 w-16 rotate-12 sm:-right-16 sm:w-24"
          />
        </div>
      </div>
      <ul
        className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(1rem,calc((100vw-88rem)/2+3rem))] pb-20 [scrollbar-width:thin] sm:pb-28"
        aria-label={title || th('showcaseTitle')}
      >
        {kits.map((kit, i) => {
          const img = resolveImage(kit.heroImage, 'card')
          const availability = getAvailability(kit)
          return (
            <li
              key={kit.id}
              className="relative w-[min(86vw,58rem)] shrink-0 snap-center"
              aria-label={`${pad(i + 1)} / ${pad(kits.length)}: ${kit.title}`}
            >
              <div className="grid items-center gap-6 md:grid-cols-[auto_1fr]">
                <p className="display text-[clamp(3.5rem,10vw,8rem)] md:hidden" aria-hidden="true">
                  {pad(i + 1)}
                  <span className="opacity-40">/{pad(kits.length)}</span>
                </p>
                <div className="relative mx-auto aspect-square w-[min(72vw,26rem)]">
                  {/* the disc */}
                  <div className="bg-orange border-navy absolute inset-0 rounded-full border-[3px]" />
                  <div className="absolute inset-[12%] overflow-hidden rounded-full">
                    {img ? (
                      <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="26rem" className="h-full w-full object-cover" />
                    ) : (
                      <Illustration name="box" className="mt-[12%] w-full" />
                    )}
                  </div>
                  {/* orbiting info buttons */}
                  <span className="bg-paper border-navy absolute top-[2%] left-[-4%] grid h-20 w-20 place-items-center rounded-full border-[3px] text-center text-sm leading-tight font-bold shadow-[3px_3px_0_0_var(--color-navy)]">
                    {t('ages', { min: kit.ageMin ?? 6, max: kit.ageMax ?? 12 })}
                  </span>
                  <span className="bg-paper border-navy absolute right-[-4%] bottom-[18%] grid h-20 w-20 place-items-center rounded-full border-[3px] shadow-[3px_3px_0_0_var(--color-navy)]">
                    <GearRating value={kit.difficulty ?? 1} label={t('difficultyValue', { n: kit.difficulty ?? 1 })} />
                  </span>
                  {kit.buildTimeMinutes ? (
                    <span className="bg-teal border-navy absolute bottom-[-2%] left-[14%] grid h-20 w-20 place-items-center rounded-full border-[3px] text-center text-sm font-bold shadow-[3px_3px_0_0_var(--color-navy)]">
                      ⏱ {t('minutes', { n: kit.buildTimeMinutes })}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-4">
                  <p className="display hidden text-[clamp(3.5rem,8vw,8rem)] md:block" aria-hidden="true">
                    {pad(i + 1)}
                    <span className="opacity-40">/{pad(kits.length)}</span>
                  </p>
                  <h3 className="display text-[clamp(2.75rem,7vw,6rem)]">{kit.title}</h3>
                  {kit.shortDescription ? <p className="max-w-md text-lg">{kit.shortDescription}</p> : null}
                  <Link
                    href={`/kits/${kit.slug}`}
                    className="bg-orange text-navy border-navy display inline-grid min-h-14 rotate-[-6deg] place-items-center rounded-full border-[3px] px-7 text-3xl shadow-[4px_4px_0_0_var(--color-navy)] transition-transform hover:rotate-[-2deg]"
                  >
                    {availability === 'available' ? t('order') : availability === 'sold_out' ? t('soldOut') : t('comingSoon')}
                    <span className="sr-only">: {kit.title}</span>
                  </Link>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
