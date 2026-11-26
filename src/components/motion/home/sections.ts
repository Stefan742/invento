import type { gsap as GSAP } from 'gsap'

import { stickyPin } from './sticky'

type G = typeof GSAP

/**
 * Section hand-off (docs/04): the next colour world grows as a circle from where the marble runs
 * (the section's track side), over the previous colour. <main> temporarily takes the previous
 * section's colour so the area outside the circle matches. Desktop only (mobile = hard edge).
 */
export function sectionReveals(gsap: G, main: HTMLElement) {
  const sections = Array.from(main.querySelectorAll<HTMLElement>('section[data-world]'))
  sections.forEach((sec, i) => {
    // hero → intro is the hero dive; the pinned showcase keeps a hard edge
    if (i === 0 || ['hero', 'intro', 'showcase'].includes(sec.dataset.trackAnchor ?? '')) return
    const prev = sections[i - 1]
    const side = sec.dataset.trackSide
    const x = side === 'left' ? '4%' : side === 'right' ? '96%' : '50%'
    gsap.fromTo(
      sec,
      { clipPath: `circle(0% at ${x} 0%)` },
      {
        clipPath: `circle(150% at ${x} 0%)`,
        ease: 'power1.in',
        scrollTrigger: {
          trigger: sec,
          start: 'top bottom',
          end: 'top 25%',
          scrub: 0.6,
          onToggle: (self) => {
            main.style.backgroundColor = self.isActive ? (prev.dataset.bg ?? '') : ''
          },
        },
      },
    )
  })
}

/** Kits showcase: pinned horizontal carousel on desktop (mobile keeps the native swipe). */
export function showcasePin(gsap: G, main: HTMLElement) {
  const sec = main.querySelector<HTMLElement>('section[data-track-anchor="showcase"]')
  const track = sec?.querySelector<HTMLElement>('[data-showcase-track]')
  if (!sec || !track) return
  const slides = track.children.length
  if (slides < 2) return
  // Switch the list from native scrolling to a transformed strip while pinned.
  track.style.overflow = 'visible'
  track.style.scrollSnapType = 'none'
  // While pinned the section fills the screen, with its content centred vertically.
  Object.assign(sec.style, { minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' })
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)
  const pin = stickyPin(sec, distance)
  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: pin.wrap,
      // The strip moves only while the section is actually stuck (see stickyPin overflow).
      start: () => `top+=${pin.overflow()} top`,
      end: 'bottom bottom',
      scrub: 0.7,
      invalidateOnRefresh: true,
      onRefreshInit: pin.size,
    },
  })
  return () => {
    tween.scrollTrigger?.kill()
    tween.revert()
    pin.undo()
    Object.assign(sec.style, { minHeight: '', display: '', flexDirection: '', justifyContent: '' })
    track.style.overflow = ''
    track.style.scrollSnapType = ''
  }
}

/** How it works: four manual pages fly in tilted and settle into a fan. */
export function howItWorksCards(gsap: G, main: HTMLElement, { desktop }: { desktop: boolean }) {
  const cards = Array.from(main.querySelectorAll<HTMLElement>('[data-hiw-card]'))
  if (!cards.length) return
  if (desktop) {
    const list = cards[0].parentElement!
    gsap
      .timeline({ scrollTrigger: { trigger: list, start: 'top 85%', end: 'top 35%', scrub: 0.8 } })
      .from(cards, {
        x: (i) => (i % 2 ? 1 : -1) * window.innerWidth * 0.6,
        y: (i) => 160 + i * 40,
        rotation: (i) => (i % 2 ? 28 : -24),
        opacity: 0,
        stagger: 0.12,
        ease: 'power3.out',
      })
  } else {
    // Mobile: each card reveals on enter, alternating tilt.
    cards.forEach((card, i) => {
      gsap.from(card, {
        x: (i % 2 ? 1 : -1) * 80,
        rotation: i % 2 ? 10 : -10,
        opacity: 0,
        duration: 0.7,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
      })
    })
  }
}

/** Builds gallery: taped photos drift at different speeds (deterministic speeds from the server). */
export function galleryDrift(gsap: G, main: HTMLElement) {
  const items = main.querySelectorAll<HTMLElement>('[data-drift]')
  items.forEach((el) => {
    const speed = Number(el.dataset.drift || 1)
    gsap.fromTo(
      el,
      { y: 60 * speed },
      {
        y: -60 * speed,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    )
  })
}

/**
 * Footer: the INVENTO letters pop up out of the box rim one after another, with a little
 * deterministic tilt, finishing upright exactly at the bottom of the page.
 */
export function footerWordmark(gsap: G) {
  const wordmark = document.querySelector<HTMLElement>('[data-footer-wordmark]')
  const letters = wordmark ? Array.from(wordmark.querySelectorAll<HTMLElement>('[data-footer-letter]')) : []
  if (!wordmark || !letters.length) return
  const tween = gsap.from(letters, {
    yPercent: 105,
    rotation: (i) => [-14, 10, -8, 12, -10, 8, -12][i % 7],
    ease: 'back.out(1.7)',
    stagger: 0.08,
    scrollTrigger: { trigger: wordmark, start: 'top bottom', end: 'max', scrub: 0.6 },
  })
  return () => {
    tween.scrollTrigger?.kill()
    tween.revert()
  }
}

/** Simple marble triggers (v1 scope): spin a gear, pop the order sticker, flick the catapult. */
export function marbleTriggers(gsap: G) {
  return (anchor: string) => {
    if (anchor === 'showcase') {
      const gear = document.querySelector('[data-marble-trigger="spin"]')
      if (gear) gsap.fromTo(gear, { rotation: 12 }, { rotation: 372, duration: 1.4, ease: 'power3.out' })
    }
    if (anchor === 'pick') {
      const sticker = document.querySelector('[data-order-sticker]')
      if (sticker) gsap.fromTo(sticker, { scale: 1 }, { scale: 1.25, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', clearProps: 'transform' })
    }
    if (anchor === 'intro') {
      const cat = document.querySelector('[data-intro-catapult]')
      if (cat) gsap.fromTo(cat, { rotation: 0 }, { keyframes: { rotation: [-6, 4, 0] }, duration: 0.6, ease: 'power2.out' })
    }
  }
}
