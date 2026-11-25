import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { HomePage } from '@/payload-types'

import { Illustration, type IllustrationName } from '../illustrations/Illustration'
import { GiantTitle, Section } from './Section'

const ART: IllustrationName[] = ['box', 'bolt', 'bulb', 'rocket']
const TILTS = [-4, 3, -2, 5]

/** Teal "How it works": four paper manual pages. Static fan on desktop, stacked on mobile. */
export async function HowItWorks({ locale, home, title }: { locale: Locale; home: HomePage; title?: string | null }) {
  const th = await getTranslations({ locale, namespace: 'home' })
  const defaults = th.raw('steps') as { title: string; body: string }[]
  const cms = (home.howItWorks ?? []).filter((s) => s.title && s.body)
  const steps = cms.length === 4 ? cms : defaults

  return (
    <Section world="teal" id="how-it-works" anchor="how-it-works" labelledBy="hiw-title" side="left">
      <div className="container-x py-20 sm:py-28">
        <GiantTitle id="hiw-title">{title || th('howItWorksTitle')}</GiantTitle>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-0">
          {steps.map((step, i) => (
            <li
              key={i}
              data-hiw-card={i}
              className="tape bg-paper text-navy border-navy relative rounded-xl border-[3px] p-6 pt-8 shadow-[6px_6px_0_0_var(--color-navy)] lg:-mx-2"
              style={{ transform: `rotate(${TILTS[i % 4]}deg)` }}
            >
              <span className="display text-navy block text-7xl [text-shadow:4px_4px_0_var(--color-orange)]" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <Illustration name={ART[i % 4]} className="absolute top-6 right-5 w-16" />
              <h3 className="display mt-4 text-4xl">{step.title}</h3>
              <p className="mt-2">{step.body}</p>
              {i < steps.length - 1 ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 80 40"
                  className="absolute -right-10 bottom-6 z-10 hidden w-20 lg:block"
                  fill="none"
                  stroke="#0D1B2A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="6 7"
                >
                  <path d="M4 30 C 26 4, 52 4, 74 22" />
                  <path d="M64 14 L75 23 L62 28" strokeDasharray="none" />
                </svg>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
