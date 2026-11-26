import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/i18n/routing'
import type { HomePage } from '@/payload-types'

import { Illustration } from '../illustrations/Illustration'
import { ButtonLink } from '../ui'
import { Section } from './Section'

/** Fact stickers next to the box: yellow, teal, paper (navy text on all three), each tilted. */
const TAG_STYLES = ['bg-yellow -rotate-3', 'bg-teal rotate-2', 'bg-paper -rotate-2']

export async function Hero({ locale, home }: { locale: Locale; home: HomePage }) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const th = await getTranslations({ locale, namespace: 'home' })
  const other = locale === 'mk' ? 'en' : 'mk'
  const tOther = await getTranslations({ locale: other, namespace: 'common' })
  const tn = await getTranslations({ locale, namespace: 'nav' })
  const tags = [...(th.raw('heroTags') as string[]), t('madeIn')]
  const defaults = t.raw('sloganWords') as string[]
  const words = [
    home.heroWord1 || defaults[0],
    home.heroWord2 || defaults[1],
    home.heroWord3 || defaults[2],
  ]

  return (
    <Section
      world="navy"
      anchor="hero"
      labelledBy="hero-title"
      className="min-h-[100dvh] pt-[var(--header-h)]"
      gears={false}
    >
      {/* Orange "inside of the box" that the scroll dive reveals (M4). Invisible without JS. */}
      <div
        aria-hidden="true"
        data-hero-orange
        className="bg-orange pointer-events-none absolute inset-0 z-[1]"
        style={{ clipPath: 'circle(0% at 50% 50%)' }}
      />
      {/* Below xl everything stacks: word / box + word / word, then subline, tags and buttons.
          xl and up (3 columns, the middle one is the box):
            word 1 | box | word 2
            subline | box | tags
                  word 3 (centred)
                 buttons (centred)
          The <h1> is a subgrid spanning the first three rows, so its words and the box sit in
          the same tracks as the subline and tags while the heading stays one element. */}
      <div className="container-x relative flex min-h-[calc(100dvh-var(--header-h))] flex-col justify-center py-[clamp(1rem,3svh,2.5rem)] xl:max-w-none">
        <div className="relative flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_var(--hero-box)_minmax(0,1fr)] xl:grid-rows-[auto_auto_auto_auto] xl:gap-x-8 xl:[--hero-box:min(24rem,40svh,24vw)]">
          <h1
            id="hero-title"
            className="display grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 text-[clamp(3.4rem,min(13.5vw,15svh),12rem)] [grid-template-areas:'w1_w1'_'box_w2'_'w3_w3'] xl:col-[1/4] xl:row-[1/4] xl:grid-cols-subgrid xl:grid-rows-subgrid xl:text-[clamp(3.4rem,min(18svh,calc((100vw-var(--hero-box)-10rem)/8.4)),13rem)]"
          >
            {/* Letters are split on the server (aria-hidden) with a screen-reader copy of the word,
              so the heading reads normally and works with or without JavaScript. */}
            <span
              className="text-paper justify-self-start [grid-area:w1] xl:[grid-area:1/1/2/2] xl:self-start"
              data-hero-word="1"
            >
              <span className="sr-only">{words[0]}</span>
              <span aria-hidden="true" className="inline-block whitespace-nowrap">
                {Array.from(words[0]).map((ch, i) => (
                  <span key={i} data-hero-char className="inline-block">
                    {ch}
                  </span>
                ))}
              </span>
            </span>
            {/* The box sits in the middle of the slogan. Parts hover above the open lid
                (on xl the box is pushed down so they have room under the header). */}
            <span
              aria-hidden="true"
              className="relative block w-[min(30vw,17rem,28svh)] justify-self-center [grid-area:box] [--ink:var(--color-paper)] xl:mt-[calc(var(--hero-box)*0.22)] xl:w-full xl:self-end xl:[grid-area:1/2/3/3]"
              data-hero-box
            >
              <span
                data-hero-part
                className="absolute -top-[14%] left-[2%] block w-[24%] rotate-[-12deg]"
              >
                <Illustration name="gear" className="w-full" />
              </span>
              <span
                data-hero-part
                className="absolute -top-[30%] left-[38%] block w-[22%] rotate-[6deg]"
              >
                <Illustration name="bulb" className="w-full" />
              </span>
              <span data-hero-part className="absolute -top-[18%] right-[0%] block w-[26%]">
                <Illustration name="rocket" className="w-full" />
              </span>
              <span data-hero-boxart className="block">
                <Illustration name="box" className="w-full" />
              </span>
            </span>
            <span
              className="relative justify-self-end [grid-area:w2] xl:[grid-area:1/3/2/4] xl:self-start"
              data-hero-word="2"
            >
              <span
                aria-hidden="true"
                data-hero-bulb
                className="absolute -top-[0.32em] -left-[0.2em] block w-[0.42em] rotate-[-14deg]"
              >
                <Illustration name="bulb" className="w-full" />
              </span>
              <span className="text-orange" data-hero-spot>
                {words[1]}
              </span>
            </span>
            <span
              className="text-yellow relative inline-block justify-self-start [grid-area:w3] xl:mt-[clamp(0.5rem,2svh,1.5rem)] xl:justify-self-center xl:[grid-area:3/1/4/4]"
              data-hero-word="3"
            >
              {words[2]}
              <span
                aria-hidden="true"
                data-hero-underline
                className="absolute -bottom-[0.03em] left-0 block h-[0.06em] w-[92%] origin-left rounded-full bg-current"
              />
              <span
                aria-hidden="true"
                data-hero-rocket
                className="absolute -bottom-[0.25em] left-0 block w-[0.45em] opacity-0"
              >
                <Illustration name="rocket" className="w-full rotate-[55deg]" />
              </span>
            </span>
          </h1>

          {/* Subline: under the slogan, or left of the box on xl. */}
          <div
            data-hero-sub
            className="relative z-10 mt-8 flex flex-col gap-[clamp(0.5rem,1.6svh,1rem)] sm:mt-[clamp(1.5rem,4svh,3rem)] sm:max-w-xl xl:mt-0 xl:max-w-[30rem] xl:self-center xl:[grid-area:2/1/3/2]"
          >
            <p className="text-xl font-semibold sm:text-2xl xl:text-[clamp(1.25rem,1.6vw,1.75rem)] xl:leading-snug">
              {home.heroSubline || th('heroSubline')}
            </p>
            <p className="text-yellow text-sm font-bold tracking-[0.2em]" lang={other}>
              {tOther('slogan')}
            </p>
          </div>

          {/* Fact stickers: a row under the subline, or a stack right of the box on xl. */}
          <ul
            data-hero-sub
            className="display relative z-10 mt-6 flex flex-wrap items-center gap-3 text-lg xl:mt-[clamp(1rem,3.5svh,2.5rem)] xl:flex-col xl:items-end xl:gap-[clamp(0.75rem,2.4svh,1.5rem)] xl:self-center xl:text-[clamp(1.25rem,1.7vw,1.9rem)] xl:[grid-area:2/3/3/4]"
          >
            {tags.map((tag, i) => (
              <li
                key={tag}
                className={`text-navy rounded-xl px-4 pt-2 pb-1.5 tracking-wide shadow-[4px_4px_0_0_#050b12] xl:px-6 xl:pt-3 xl:pb-2 ${TAG_STYLES[i % TAG_STYLES.length]}`}
              >
                {tag}
              </li>
            ))}
          </ul>

          {/* Buttons: under everything, centred on xl. */}
          <div
            data-hero-sub
            className="relative z-10 mt-6 flex flex-wrap items-center gap-4 xl:mt-[clamp(1rem,3svh,2rem)] xl:justify-center xl:[grid-area:4/1/5/4]"
          >
            <ButtonLink href="/kits" variant="orange" className="text-lg">
              {t('seeTheBoxes')}
            </ButtonLink>
            <a
              href="#how-it-works"
              className="inline-flex min-h-12 items-center gap-2 font-semibold underline underline-offset-4"
            >
              {tn('howItWorks')} <span aria-hidden="true">↓</span>
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
        <p
          className="max-w-[24ch] text-[clamp(1.75rem,4.6vw,3.6rem)] leading-[1.1] font-bold"
          data-track-anchor="intro-loop"
        >
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
