import { Link } from '@/i18n/navigation'
import { contactLinks } from '@/lib/contact'
import type { SiteSetting } from '@/payload-types'

export function AnnouncementBar({ settings }: { settings: SiteSetting }) {
  const bar = settings.announcementBar
  if (!bar?.enabled || !bar.text) return null
  const inner = <span className="font-semibold">{bar.text}</span>
  const isInternal = bar.link?.startsWith('/')
  return (
    <div className="bg-yellow text-navy border-navy border-b-2 text-center text-sm">
      <div className="container-x py-2">
        {bar.link ? (
          isInternal ? (
            <Link href={bar.link} className="underline underline-offset-2">
              {inner}
            </Link>
          ) : (
            <a href={bar.link} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          )
        ) : (
          inner
        )}
      </div>
    </div>
  )
}

/** Small round Instagram / Viber buttons bottom-left (desktop only). Hidden until set in settings. */
export function SocialDock({ settings }: { settings: SiteSetting }) {
  const c = contactLinks(settings)
  if (!c.viber && !c.instagram) return null
  const btn =
    'bg-paper text-navy border-navy grid h-12 w-12 place-items-center rounded-full border-[3px] font-black shadow-[3px_3px_0_0_var(--color-navy)]'
  return (
    <div className="fixed bottom-6 left-6 z-30 hidden gap-3 lg:flex">
      {c.instagram ? (
        <a href={c.instagram} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Instagram">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
        </a>
      ) : null}
      {c.viber ? (
        <a href={c.viber} className={btn} aria-label="Viber">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M12 3c5 0 8.5 2.6 8.5 7.6S17 18 12 18c-.9 0-1.8-.1-2.6-.3L5.5 21v-4.2C4 15.5 3.5 13.4 3.5 10.6 3.5 5.6 7 3 12 3Z" />
            <path d="M9.2 8.2c.4 2.6 2 4.3 4.6 4.9l1-1.2 1.6.9c-.4 1-1.3 1.6-2.3 1.4-3-.6-5.2-2.8-5.8-5.8-.2-1 .4-1.9 1.4-2.3l.9 1.6-1.4.5Z" />
          </svg>
        </a>
      ) : null}
    </div>
  )
}
