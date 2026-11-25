import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getAvailability } from '@/lib/availability'
import { tiltFor } from '@/lib/layout'
import { resolveImage } from '@/lib/media'
import type { Kit } from '@/payload-types'

import { AddToCart } from '../cart/CartUI'
import { Illustration } from '../illustrations/Illustration'
import { Ribbon } from '../ui'
import { KitAvailability, KitChips, KitPrice } from './KitMeta'

export async function KitCard({ kit, locale, index = 0 }: { kit: Kit; locale: Locale; index?: number }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const img = resolveImage(kit.heroImage, 'card')

  return (
    <article
      // Whole card shows a focus ring while its title link has keyboard focus.
      className="group border-navy bg-paper text-navy relative flex h-full flex-col rounded-3xl border-[3px] shadow-[6px_6px_0_0_var(--color-navy)] has-[a:focus-visible]:outline-[3px] has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-orange has-[a:focus-visible]:outline"
      style={{ transform: `rotate(${tiltFor(index, 2.5)}deg)` }}
    >
      {kit.featured ? <Ribbon>{t('mostPopular')}</Ribbon> : null}
      <div className="bg-yellow border-navy relative aspect-square overflow-hidden rounded-t-[1.3rem] border-b-[3px]">
        {img ? (
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            sizes="(min-width: 1024px) 28rem, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center p-10">
            <Illustration name="box" className="w-3/4" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="display text-4xl">
          <Link href={`/kits/${kit.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {kit.title}
          </Link>
        </h3>
        {kit.shortDescription ? <p className="text-[0.98rem]">{kit.shortDescription}</p> : null}
        <KitChips kit={kit} locale={locale} />
        <div className="mt-auto space-y-3 pt-2">
          <KitAvailability kit={kit} locale={locale} />
          <div className="flex items-center justify-between gap-3">
            <KitPrice kit={kit} locale={locale} className="text-xl" />
            {getAvailability(kit) === 'available' ? (
              <AddToCart kitId={kit.id} title={kit.title} orderable compact />
            ) : (
              <span
                aria-hidden="true"
                className="bg-orange border-navy grid h-12 w-12 place-items-center rounded-full border-[3px] text-xl font-black transition-transform group-hover:rotate-[-20deg]"
              >
                →
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
