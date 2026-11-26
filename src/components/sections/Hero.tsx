import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { HomePage } from '@/payload-types'

import { Illustration } from '../illustrations/Illustration'
import { ButtonLink } from '../ui'
import { Section } from './Section'

export async function Hero({ locale, home }: { locale: Locale; home: HomePage }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const th = await getTranslations({ locale, namespace: 'home' })
  const other = locale === 'mk' ? 'en' : 'mk'
  const tOther = await getTranslations({ locale: other, namespace: 'common' })
  const defaults = t.raw('sloganWords') as string[]
  const words = [home.heroWord1 || defaults[0], home.heroWord2 || defaults[1], home.heroWord3 || defaults[2]]

  return (
    <Section world="navy" anchor="hero" labelledBy="hero-title" className="min-h-[100dvh] pt-[var(--header-h)]" gears={false}>
      {/* Orange "inside of the box" that the scroll dive reveals (M4). Invisible without JS. */}
      <div aria-hidden="true" data-hero-orange className="bg-orange pointer-events-none absolute inset-0 z-[1]" style={{ clipPath: 'circle(0% at 50% 50%)' }} />
      <div className="container-x relative flex min-h-[calc(100dvh-var(--header-h))] flex-col justify-center py-[clamp(1rem,3svh,2.5rem)]">
        <h1
          id="hero-title"
          className="display grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 text-[clamp(3.4rem,min(13.5vw,15svh),12rem)] [grid-template-areas:'w1_w1'_'box_w2'_'w3_w3']"
        >
          {/* Letters are split on the server (aria-hidden) with a screen-reader copy of the word,
              so the heading reads normally and works with or without JavaScript. */}
          <span className="text-paper [grid-area:w1]" data-hero-word="1">
            <span className="sr-only">{words[0]}</span>
            <span aria-hidden="true" className="inline-block whitespace-nowrap">
              {Array.from(words[0]).map((ch, i) => (
                <span key={i} data-hero-char className="inline-block">
                  {ch}
                </span>
              ))}
            </span>
          </span>
          {/* The box sits in the middle of the slogan. Parts hover above the open lid. */}
          <span aria-hidden="true" className="relative block w-[min(30vw,17rem,28svh)] justify-self-center [grid-area:box] [--ink:var(--color-paper)]" data-hero-box>
            <span data-hero-part className="absolute -top-[14%] left-[2%] block w-[24%] rotate-[-12deg]">
              <Illustration name="gear" className="w-full" />
            </span>
            <span data-hero-part className="absolute -top-[30%] left-[38%] block w-[22%] rotate-[6deg]">
              <Illustration name="bulb" className="w-full" />
            </span>
            <span data-hero-part className="absolute -top-[18%] right-[0%] block w-[26%]">
              <Illustration name="rocket" className="w-full" />
            </span>
            <span data-hero-boxart className="block">
              <Illustration name="box" className="w-full" />
            </span>
          </span>
          <span className="relative justify-self-end [grid-area:w2]" data-hero-word="2">
            <span aria-hidden="true" data-hero-bulb className="absolute -top-[0.32em] -left-[0.2em] block w-[0.42em] rotate-[-14deg]">
              <Illustration name="bulb" className="w-full" />
            </span>
            <span className="text-orange" data-hero-spot>
              {words[1]}
            </span>
          </span>
          <span className="text-yellow relative inline-block justify-self-start [grid-area:w3]" data-hero-word="3">
            {words[2]}
            <span aria-hidden="true" data-hero-underline className="absolute -bottom-[0.03em] left-0 block h-[0.06em] w-[92%] origin-left rounded-full bg-current" />
            <span aria-hidden="true" data-hero-rocket className="absolute -bottom-[0.25em] left-0 block w-[0.45em] opacity-0">
              <Illustration name="rocket" className="w-full rotate-[55deg]" />
            </span>
          </span>
        </h1>

        <div data-hero-sub className="relative z-10 mt-8 flex flex-col gap-[clamp(0.75rem,2.4svh,1.25rem)] sm:mt-[clamp(1.5rem,4svh,3rem)] sm:max-w-xl">
          <p className="text-xl font-semibold sm:text-2xl">{home.heroSubline || th('heroSubline')}</p>
          <p className="text-paper/70 text-sm font-bold tracking-[0.2em]" lang={other}>
            {tOther('slogan')}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink href="/kits" variant="orange" className="text-lg">
              {t('seeTheBoxes')}
            </ButtonLink>
            <a href="#intro" className="inline-flex min-h-12 items-center gap-2 font-semibold underline underline-offset-4">
              {t('scrollCue')} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  )
}

export async function Intro({ locale, home }: { locale: Locale; home: HomePage }) {
  const th = await getTranslations({ locale, namespace: 'home' })
  return (
    <Section world="orange" id="intro" anchor="intro" side="left">
      <div className="container-x grid items-center gap-10 py-24 sm:py-32 lg:grid-cols-[1fr_auto]">
        <p className="max-w-[24ch] text-[clamp(1.75rem,4.6vw,3.6rem)] leading-[1.1] font-bold" data-track-anchor="intro-loop">
          {home.intro || th('intro')}
        </p>
        <div aria-hidden="true" data-intro-catapult className="relative mx-auto w-56 sm:w-72">
          <Illustration name="catapult" className="w-full" />
          <Illustration name="marble" className="absolute -top-10 left-2 w-12" />
        </div>
      </div>
    </Section>
  )
}
