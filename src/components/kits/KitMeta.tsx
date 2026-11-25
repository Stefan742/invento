import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import { getAvailability, getStockBar } from '@/lib/availability'
import { formatDate, formatPrice, isUpcoming } from '@/lib/format'
import type { Kit } from '@/payload-types'

import { Chip, GearRating, StockBar, cx } from '../ui'

export async function KitPrice({ kit, locale, className }: { kit: Kit; locale: Locale; className?: string }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  return (
    <p className={cx('font-bold', className)}>
      {typeof kit.priceMKD === 'number'
        ? t('priceMKD', { price: formatPrice(kit.priceMKD, locale) })
        : t('priceSoon')}
    </p>
  )
}

export async function KitChips({ kit, locale }: { kit: Kit; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const difficulty = kit.difficulty ?? 1
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip>{t('ages', { min: kit.ageMin ?? 6, max: kit.ageMax ?? 12 })}</Chip>
      {kit.buildTimeMinutes ? <Chip>⏱ {t('minutes', { n: kit.buildTimeMinutes })}</Chip> : null}
      <Chip>
        <GearRating value={difficulty} label={t('difficultyValue', { n: difficulty })} />
      </Chip>
    </div>
  )
}

/** Availability state, stock bar, lead time / next drop. Shows only what the owner filled in. */
export async function KitAvailability({ kit, locale }: { kit: Kit; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const availability = getAvailability(kit)
  const bar = getStockBar(kit)
  const drop = isUpcoming(kit.nextDropDate) ? kit.nextDropDate : null

  return (
    <div className="space-y-2">
      {availability === 'sold_out' ? (
        <p className="bg-navy text-paper inline-block rounded-full px-3 py-1 text-sm font-bold">{t('soldOut')}</p>
      ) : availability === 'coming_soon' ? (
        <p className="bg-teal text-navy border-navy inline-block rounded-full border-2 px-3 py-1 text-sm font-bold">
          {t('comingSoon')}
        </p>
      ) : null}
      {bar && availability !== 'coming_soon' ? (
        <StockBar remaining={bar.remaining} total={bar.total} label={t('stockLeft', { n: bar.remaining, total: bar.total })} />
      ) : null}
      {availability !== 'available' && drop ? (
        <p className="text-sm font-semibold">{t('nextDropDate', { date: formatDate(drop, locale) })}</p>
      ) : null}
      {kit.leadTimeText && availability === 'available' ? (
        <p className="text-sm font-semibold">{kit.leadTimeText}</p>
      ) : null}
    </div>
  )
}
