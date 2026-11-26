'use client'

import { useEffect, useRef } from 'react'

import { renderFlaps } from '../illustrations/box-flaps'
import { Illustration, type IllustrationName } from '../illustrations/Illustration'

import { PRELOADER_DONE_EVENT, PRELOADER_SKIP_EVENT } from './preloader-script'

const PARTS: { name: IllustrationName; x: string; rot: number }[] = [
  { name: 'gear', x: '-34%', rot: -14 },
  { name: 'rocket', x: '-16%', rot: 8 },
  { name: 'bulb', x: '2%', rot: -6 },
  { name: 'wrench', x: '20%', rot: 18 },
  { name: 'bolt', x: '38%', rot: -10 },
]

const MIN_MS = 1600
const MAX_MS = 4000

/**
 * "Build to enter" (docs/04 A). Rendered on the home page only; visible only when the inline
 * script in the layout added `html.show-preloader` (first visit this session, motion allowed).
 * Progress = real readiness (fonts + window load) blended with a 1.6 s minimum, hard cap 4 s.
 */
export function Preloader({ line, skipLabel }: { line: string; skipLabel: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const partRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const html = document.documentElement
    if (!html.classList.contains('show-preloader')) return

    let disposed = false
    let raf = 0
    const cleanups: (() => void)[] = []
    const done = () => {
      html.classList.remove('show-preloader')
      window.dispatchEvent(new Event(PRELOADER_DONE_EVENT))
    }
    // Very slow device: the CSS failsafe already hid the overlay. Just hand over.
    if (performance.now() > 5500) {
      done()
      return
    }
    // Skip / Escape are handled by the inline script (works before React loads); stop here too.
    const onSkip = () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.dispatchEvent(new Event(PRELOADER_DONE_EVENT))
    }
    window.addEventListener(PRELOADER_SKIP_EVENT, onSkip)
    cleanups.push(() => window.removeEventListener(PRELOADER_SKIP_EVENT, onSkip))

    void import('gsap').then(({ gsap }) => {
      if (disposed) return
      const root = rootRef.current!
      const box = boxRef.current!
      const parts = partRefs.current.filter(Boolean) as HTMLButtonElement[]
      root.style.animation = 'none' // JS is in control: cancel the CSS failsafe

      const dropped = new Set<number>()
      const drop = (i: number) => {
        if (dropped.has(i)) return
        dropped.add(i)
        const p = parts[i]
        gsap.killTweensOf(p)
        // Fall into the box opening (measured, so it works at any screen size).
        const pr = p.getBoundingClientRect()
        const br = box.getBoundingClientRect()
        const dy = br.top + br.height * 0.42 - (pr.top + pr.height / 2)
        const dx = br.left + br.width / 2 - (pr.left + pr.width / 2)
        gsap
          .timeline()
          .to(p, { y: `+=${dy}`, x: `+=${dx * 0.6}`, rotation: 0, scale: 0.5, duration: 0.55, ease: 'power3.in' })
          .to(box, { scaleY: 0.9, scaleX: 1.06, duration: 0.08, transformOrigin: '50% 100%', ease: 'power1.out' })
          .to(box, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' })
          .set(p, { opacity: 0 }, '<')
        spark(i)
      }
      const spark = (i: number) => {
        const s = document.createElement('span')
        s.className = 'pointer-events-none absolute left-1/2 top-[38%] block h-3 w-3 rounded-full bg-orange'
        box.appendChild(s)
        gsap.fromTo(
          s,
          { x: 0, y: 0, opacity: 1 },
          { x: (i - 2) * 40, y: -60 - i * 6, opacity: 0, duration: 0.6, delay: 0.55, ease: 'power2.out', onComplete: () => s.remove() },
        )
      }
      parts.forEach((p, i) => {
        gsap.fromTo(p, { y: -20 }, { y: 20, duration: 1.2 + i * 0.13, repeat: -1, yoyo: true, ease: 'sine.inOut' })
        const onTap = () => drop(i)
        p.addEventListener('click', onTap)
        cleanups.push(() => p.removeEventListener('click', onTap))
      })

      // Readiness: fonts + window load.
      let ready = 0
      const fonts = (document.fonts?.ready ?? Promise.resolve()).then(() => (ready += 0.5))
      const loaded =
        document.readyState === 'complete'
          ? Promise.resolve().then(() => (ready += 0.5))
          : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true })).then(() => (ready += 0.5))
      void Promise.all([fonts, loaded])

      const start = performance.now()
      let shown = 0
      let finished = false

      const finish = (fast: boolean) => {
        if (finished) return
        finished = true
        cancelAnimationFrame(raf)
        if (fast) {
          gsap.to(root, { opacity: 0, duration: 0.3, onComplete: done })
          return
        }
        parts.forEach((_, i) => drop(i))
        const heroBox = document.querySelector<HTMLElement>('[data-hero-boxart]')
        const tl = gsap.timeline({ delay: 0.7, onComplete: done })
        // The flaps fold shut (the two underneath first, then the two on top), with a small shake…
        const flaps = { p: 1 }
        tl.to(flaps, { p: 0, duration: 0.6, ease: 'power2.in', onUpdate: () => renderFlaps(box, flaps.p) })
        tl.to(box, { keyframes: { x: [-10, 9, -6, 4, 0] }, duration: 0.35, ease: 'none' })
        // …then hands off to the hero box (same position and size), and the overlay fades.
        if (heroBox) {
          const a = box.getBoundingClientRect()
          const b = heroBox.getBoundingClientRect()
          if (b.width > 0) {
            tl.to(box, {
              x: b.left + b.width / 2 - (a.left + a.width / 2),
              y: b.top + b.height / 2 - (a.top + a.height / 2),
              scale: b.width / a.width,
              duration: 0.7,
              ease: 'power3.inOut',
            })
          }
        }
        tl.to(root.querySelectorAll('[data-preloader-fade]'), { opacity: 0, duration: 0.3 }, '<')
        tl.to(root, { backgroundColor: 'rgba(13,27,42,0)', duration: 0.45 }, '<0.25')
        tl.to(box, { opacity: 0, duration: 0.2 })
      }

      const tick = () => {
        const elapsed = performance.now() - start
        const timeP = Math.min(1, elapsed / MIN_MS)
        const target = elapsed >= MAX_MS ? 1 : Math.min(timeP, 0.15 + ready * 0.85)
        shown += (target - shown) * 0.12
        if (target === 1 && shown > 0.995) shown = 1
        const pct = Math.round(shown * 100)
        if (counterRef.current) counterRef.current.textContent = `${pct}%`
        // Parts drop in one by one as the counter rises.
        parts.forEach((_, i) => {
          if (shown >= (i + 1) / (parts.length + 1)) drop(i)
        })
        if (shown >= 1) finish(false)
        else raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

    })

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      for (const fn of cleanups) fn()
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="preloader bg-navy text-paper fixed inset-0 z-[80] flex-col items-center justify-center overflow-hidden [--ink:var(--color-paper)]"
      data-preloader
    >
      <div className="relative flex w-[min(70vw,24rem)] flex-col items-center">
        <div aria-hidden="true" className="relative h-[28vh] w-full">
          {PARTS.map((p, i) => (
            <button
              key={p.name}
              ref={(el) => {
                partRefs.current[i] = el
              }}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="absolute top-[30%] left-1/2 grid h-16 w-16 -translate-x-1/2 place-items-center"
              style={{ marginLeft: p.x, rotate: `${p.rot}deg` }}
            >
              <Illustration name={p.name} className="h-14 w-14" />
            </button>
          ))}
        </div>
        <div ref={boxRef} aria-hidden="true" className="relative w-full">
          <Illustration name="box" className="w-full" />
        </div>
      </div>
      <span
        ref={counterRef}
        data-preloader-fade
        aria-hidden="true"
        className="display absolute bottom-4 left-4 text-[clamp(4rem,16vw,11rem)] sm:bottom-6 sm:left-8"
      >
        0%
      </span>
      <p data-preloader-fade className="absolute right-4 bottom-6 max-w-[16rem] text-right text-sm font-semibold sm:right-8 sm:bottom-10 sm:max-w-xs sm:text-base">
        {line}
      </p>
      {/* Fades in after ~800 ms (CSS). Clicks are handled by the inline script. */}
      <button
        type="button"
        data-preloader-fade
        data-preloader-skip
        className="preloader-skip border-paper absolute top-4 right-4 min-h-12 rounded-full border-[3px] px-5 font-bold sm:top-6 sm:right-8"
      >
        {skipLabel}
      </button>
    </div>
  )
}
