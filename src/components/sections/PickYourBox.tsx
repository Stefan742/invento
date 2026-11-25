import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getAvailability } from '@/lib/availability'
import { formatDate, isUpcoming } from '@/lib/format'
import type { Kit } from '@/payload-types'

import { Illustration } from '../illustrations/Illustration'
import { KitCard } from '../kits/KitCard'
import { GiantTitle, Section } from './Section'

/** Earliest upcoming next-drop date across kits, or null. */
export function nextDrop(kits: Kit[]): string | null {
  const dates = kits.map((k) => k.nextDropDate).filter((d): d is string => isUpcoming(d))
  return dates.sort()[0] ?? null
}

export async function NextDropBlock({ locale, kits }: { locale: Locale; kits: Kit[] }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const drop = nextDrop(kits)
  return (
    <div className="bg-navy text-paper border-navy flex flex-col items-start gap-4 rounded-3xl border-[3px] p-8 sm:flex-row sm:items-center">
      <Illustration name="box-closed" className="w-28 shrink-0 [--ink:var(--color-paper)]" />
      <div>
        <p className="text-orange display text-4xl">{t('soldOut')}</p>
        <p className="mt-2 text-xl font-semibold">
          {drop ? t('nextDropDate', { date: formatDate(drop, locale) }) : t('nextBatchSoon')}
        </p>
      </div>
    </div>
  )
}

export async function PickYourBox({ locale, kits, title }: { locale: Locale; kits: Kit[]; title?: string | null }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const th = await getTranslations({ locale, namespace: 'home' })
  const allSoldOut = kits.length > 0 && kits.every((k) => getAvailability(k) === 'sold_out')

  return (
    <Section world="paper" id="pick" anchor="pick" labelledBy="pick-title">
      <div className="container-x py-20 sm:py-28">
        <GiantTitle id="pick-title">{title || th('pickTitle')}</GiantTitle>
        {allSoldOut ? (
          <div className="mt-10">
            <NextDropBlock locale={locale} kits={kits} />
          </div>
        ) : null}
        {kits.length === 0 ? <p className="mt-10 text-xl font-semibold">{th('noKitsYet')}</p> : null}
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {kits.slice(0, 5).map((kit, i) => (
            <li key={kit.id}>
              <KitCard kit={kit} locale={locale} index={i} />
            </li>
          ))}
          <li>
            <Link
              href="/kits"
              className="group bg-navy text-paper border-navy flex h-full min-h-72 flex-col justify-between rounded-3xl border-[3px] p-8 shadow-[6px_6px_0_0_var(--color-orange)]"
            >
              <span className="display text-6xl">{t('allBoxes')}</span>
              <span
                aria-hidden="true"
                className="bg-orange text-navy border-paper grid h-20 w-20 place-items-center self-end rounded-full border-[3px] text-4xl font-black transition-transform group-hover:rotate-[-30deg]"
              >
                →
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </Section>
  )
}
