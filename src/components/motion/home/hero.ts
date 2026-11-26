import type { gsap as GSAP } from 'gsap'

import { flapHinge } from '../box-hinge'
import { stickyPin } from './sticky'

type G = typeof GSAP

/**
 * Hero (docs/04 B).
 * - On load: ГРАДИ letters drop and stack; ОТКРИВАЈ bulb flickers then a spotlight reveals the word;
 *   СОЗДАВАЈ gets a rocket that draws its underline. Replays on hover / tap.
 * - On scroll (pinned): the lid opens on its hinge, parts pop out, the camera dives into the box,
 *   the words split away and the background resolves to orange. The marble track (track.ts)
 *   picks up from there.
 */
export function heroIntro(gsap: G, hero: HTMLElement) {
  const chars = hero.querySelectorAll<HTMLElement>('[data-hero-char]')
  const w1 = hero.querySelector<HTMLElement>('[data-hero-word="1"]')
  const w2 = hero.querySelector<HTMLElement>('[data-hero-word="2"]')
  const w3 = hero.querySelector<HTMLElement>('[data-hero-word="3"]')
  const bulb = hero.querySelector<HTMLElement>('[data-hero-bulb]')
  const underline = hero.querySelector<HTMLElement>('[data-hero-underline]')
  const spotText = hero.querySelector<HTMLElement>('[data-hero-spot]')
  const rocket = hero.querySelector<HTMLElement>('[data-hero-rocket]')
  const cleanups: (() => void)[] = []

  const build = () =>
    gsap
      .timeline({ paused: true })
      .fromTo(
        chars,
        { y: () => -window.innerHeight * 0.5, rotation: (i) => (i % 2 ? 14 : -12), opacity: 0 },
        { y: 0, rotation: 0, opacity: 1, duration: 0.9, ease: 'bounce.out', stagger: 0.07 },
      )
  const dropLetters = build()

  const spot = gsap.timeline({ paused: true })
  if (spotText) {
    spot.set(spotText, { '--spot-r': '0%', '--spot-x': '50%' })
    if (bulb) spot.to(bulb, { keyframes: { opacity: [1, 0.2, 1, 0.3, 1, 0.15, 1] }, duration: 0.7, ease: 'none' })
    spot.to(spotText, { '--spot-r': '160%', duration: 0.9, ease: 'power2.out' })
  }

  const fly = gsap.timeline({ paused: true })
  if (w3 && underline && rocket) {
    fly
      .set(underline, { scaleX: 0, transformOrigin: '0% 50%' })
      .set(rocket, { x: 0, opacity: 1 })
      .to(rocket, { x: () => w3.offsetWidth * 0.88, duration: 0.9, ease: 'power2.inOut' })
      .to(underline, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, '<')
      .to(rocket, { opacity: 0, y: -30, duration: 0.25 })
  }

  const playAll = () => {
    dropLetters.restart()
    spot.restart(true).delay(0.35)
    fly.restart(true).delay(0.7)
  }
  playAll()

  // Replay each word on hover (fine pointer) or tap.
  const pairs: [HTMLElement | null, GSAPTimeline][] = [
    [w1, dropLetters],
    [w2, spot],
    [w3, fly],
  ]
  for (const [el, tl] of pairs) {
    if (!el) continue
    const replay = () => {
      if (!tl.isActive()) tl.delay(0).restart()
    }
    el.addEventListener('pointerenter', replay)
    el.addEventListener('click', replay)
    cleanups.push(() => {
      el.removeEventListener('pointerenter', replay)
      el.removeEventListener('click', replay)
    })
  }
  return () => cleanups.forEach((fn) => fn())
}

/** Put the hero box into its closed state (parts tucked inside). */
export function closeHeroBox(gsap: G, hero: HTMLElement) {
  const lidOpen = hero.querySelectorAll('[data-hero-boxart] [data-part="lid-open"]')
  const lidClosed = hero.querySelector('[data-hero-boxart] [data-part="lid-closed"]')
  const parts = hero.querySelectorAll('[data-hero-part]')
  if (lidOpen.length) gsap.set(lidOpen, { scaleY: 0, opacity: 1, transformOrigin: flapHinge })
  if (lidClosed) gsap.set(lidClosed, { opacity: 1, scaleY: 1, transformOrigin: '50% 0%' })
  gsap.set(parts, { yPercent: 160, scale: 0.3, opacity: 0 })
}

export function heroScroll(gsap: G, hero: HTMLElement, { desktop }: { desktop: boolean }) {
  const box = hero.querySelector<HTMLElement>('[data-hero-box]')
  const boxArt = hero.querySelector<HTMLElement>('[data-hero-boxart]')
  const lidOpen = hero.querySelectorAll('[data-hero-boxart] [data-part="lid-open"]')
  const lidClosed = hero.querySelector('[data-hero-boxart] [data-part="lid-closed"]')
  const parts = hero.querySelectorAll<HTMLElement>('[data-hero-part]')
  const words = hero.querySelectorAll<HTMLElement>('[data-hero-word]')
  const sub = hero.querySelector<HTMLElement>('[data-hero-sub]')
  const orange = hero.querySelector<HTMLElement>('[data-hero-orange]')
  if (!box || !boxArt || !orange) return

  // Circle centre = the box opening, measured relative to the hero (recomputed on refresh).
  const centre = () => {
    const h = hero.getBoundingClientRect()
    const b = boxArt.getBoundingClientRect()
    return `${b.left + b.width / 2 - h.left}px ${b.top + b.height * 0.4 - h.top}px`
  }

  const pin = stickyPin(hero, () => window.innerHeight * (desktop ? 1.8 : 1.1))
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: pin.wrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: desktop ? 0.8 : 0.5,
      invalidateOnRefresh: true,
      onRefreshInit: pin.size,
    },
  })

  // 1. lid swings open on its hinge
  if (lidClosed) tl.to(lidClosed, { scaleY: 0, duration: 0.18 }, 0)
  if (lidOpen.length) tl.to(lidOpen, { scaleY: 1, duration: 0.2, ease: 'back.out(2)' }, 0.16)
  // 2. parts pop out and hover
  tl.to(parts, { yPercent: 0, scale: 1, opacity: 1, duration: 0.25, stagger: 0.05, ease: 'back.out(1.8)' }, 0.3)
  // 3. words split outward, subline fades
  tl.to(words[0] ?? [], { xPercent: -70, opacity: 0, duration: 0.35 }, 0.55)
  tl.to(words[1] ?? [], { xPercent: 70, opacity: 0, duration: 0.35 }, 0.55)
  tl.to(words[2] ?? [], { xPercent: -70, opacity: 0, duration: 0.35 }, 0.6)
  if (sub) tl.to(sub, { opacity: 0, y: 40, duration: 0.25 }, 0.5)
  tl.to(parts, { opacity: 0, scale: 1.6, duration: 0.2 }, 0.7)
  // 4. camera dives into the box
  tl.to(box, { scale: desktop ? 9 : 7, transformOrigin: '50% 40%', duration: 0.5, ease: 'power2.in' }, 0.65)
  // 5. the inside (orange) takes over, circle grows from the opening
  tl.fromTo(
    orange,
    { clipPath: () => `circle(0% at ${centre()})` },
    { clipPath: () => `circle(150% at ${centre()})`, duration: 0.4, ease: 'power2.in' },
    0.8,
  )
  return () => {
    tl.scrollTrigger?.kill()
    tl.revert()
    pin.undo()
  }
}
