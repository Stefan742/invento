'use client'

import { useEffect } from 'react'

import { motionEnabled, MQ } from '@/lib/motion-flags'

import { onLenis } from './lenis-store'
import { PRELOADER_DONE_EVENT, PRELOADER_SKIP_EVENT } from './preloader-script'

/**
 * Home page signature motion (docs/04, M4). Mounted only on the home page, loads GSAP lazily.
 * All content is already in the server HTML; this only adds motion on top and reverts cleanly.
 * gsap.matchMedia() branches: desktop (fine pointer), touch/mobile, reduced motion (= nothing).
 */
export function HomeMotion() {
  useEffect(() => {
    const main = document.querySelector<HTMLElement>('main[data-home]')
    if (!main) return
    if (new URLSearchParams(window.location.search).get('motion') === 'off') return

    let disposed = false
    const cleanups: (() => void)[] = []

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (disposed) return
      gsap.registerPlugin(ScrollTrigger)
      const [hero, track, sections] = await Promise.all([
        import('./home/hero'),
        import('./home/track'),
        import('./home/sections'),
      ])
      if (disposed) return

      // Keep ScrollTrigger in step with Lenis smooth scroll (desktop).
      cleanups.push(
        onLenis((lenis) => {
          if (lenis) lenis.on('scroll', ScrollTrigger.update)
        }),
      )

      const heroEl = main.querySelector<HTMLElement>('section[data-track-anchor="hero"]')
      const mm = gsap.matchMedia()
      let trackApi: ReturnType<typeof track.createTrack> | null = null
      let stopPhysics: (() => void) | null = null

      mm.add({ desktop: MQ.desktop, touch: MQ.touch }, (context) => {
        const { desktop } = context.conditions as { desktop: boolean; touch: boolean }
        const local: (() => void)[] = []

        if (heroEl && motionEnabled('hero')) {
          hero.closeHeroBox(gsap, heroEl)
          let started = false
          const startIntro = () => {
            if (started) return
            started = true
            local.push(hero.heroIntro(gsap, heroEl))
          }
          // Word animations start when the preloader hands over (or right away without one).
          if (document.documentElement.classList.contains('show-preloader')) {
            window.addEventListener(PRELOADER_DONE_EVENT, startIntro, { once: true })
            window.addEventListener(PRELOADER_SKIP_EVENT, startIntro, { once: true })
            local.push(() => {
              window.removeEventListener(PRELOADER_DONE_EVENT, startIntro)
              window.removeEventListener(PRELOADER_SKIP_EVENT, startIntro)
            })
          } else startIntro()
          const undoScroll = hero.heroScroll(gsap, heroEl, { desktop })
          if (undoScroll) local.push(undoScroll)
        }
        if (motionEnabled('showcase') && desktop) {
          const undo = sections.showcasePin(gsap, main)
          if (undo) local.push(undo)
        }
        if (motionEnabled('hiw')) sections.howItWorksCards(gsap, main, { desktop })
        if (motionEnabled('reveals') && desktop) sections.sectionReveals(gsap, main)
        if (motionEnabled('gallery') && desktop) sections.galleryDrift(gsap, main)
        if (motionEnabled('footer')) sections.footerWordmark(gsap)

        if (motionEnabled('marble')) {
          trackApi = track.createTrack(main, { mobile: !desktop, onPass: sections.marbleTriggers(gsap) })
          const rebuild = () => trackApi?.rebuild()
          ScrollTrigger.addEventListener('refresh', rebuild)
          local.push(() => ScrollTrigger.removeEventListener('refresh', rebuild))
          local.push(() => {
            trackApi?.destroy()
            trackApi = null
          })
        }

        if (motionEnabled('physics')) {
          const q = main.querySelector<HTMLElement>('section[data-track-anchor="questions"]')
          if (q) {
            // Load Matter.js only when the section comes near.
            const io = new IntersectionObserver(
              async (entries) => {
                if (!entries[0]?.isIntersecting) return
                io.disconnect()
                const { startPhysics } = await import('./home/physics')
                if (!disposed) stopPhysics = await startPhysics(q, { desktop })
              },
              { rootMargin: '400px 0px' },
            )
            io.observe(q)
            local.push(() => {
              io.disconnect()
              stopPhysics?.()
              stopPhysics = null
            })
          }
        }

        ScrollTrigger.refresh()
        return () => {
          for (const fn of local.reverse()) fn()
          main.style.backgroundColor = ''
        }
      })

      // Fonts change text sizes → re-measure everything once they are ready.
      void document.fonts?.ready.then(() => !disposed && ScrollTrigger.refresh())
      cleanups.push(() => mm.revert())
    })()

    return () => {
      disposed = true
      for (const fn of cleanups.reverse()) fn()
    }
  }, [])

  return null
}
