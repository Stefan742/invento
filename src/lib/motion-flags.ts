/**
 * Every motion feature can be switched off on its own (docs/08, M4):
 *   NEXT_PUBLIC_MOTION_OFF=all                 → no JS motion at all
 *   NEXT_PUBLIC_MOTION_OFF=preloader,physics   → just those
 * For QA, `?motion=off` in the URL disables everything for that page view.
 * The site is fully usable with any combination switched off.
 */
export const MOTION_FEATURES = [
  'smooth', // Lenis smooth scroll (desktop / fine pointer only)
  'header', // header hides on scroll down, returns on scroll up
  'cursor', // gear cursor (fine pointer only)
  'preloader', // "Build to enter"
  'hero', // slogan micro-animations + lid opens / dive on scroll
  'marble', // marble track through the home page
  'reveals', // section colour hand-off (circle reveal)
  'showcase', // pinned horizontal kits carousel
  'hiw', // how-it-works fanned cards
  'gallery', // drifting photos parallax
  'physics', // falling parts in the Questions section
  'footer', // lid closes over the footer wordmark
] as const

export type MotionFeature = (typeof MOTION_FEATURES)[number]

export function parseMotionOff(value: string | undefined | null): Set<string> {
  return new Set(
    (value ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  )
}

const BUILD_OFF = parseMotionOff(process.env.NEXT_PUBLIC_MOTION_OFF)

export function motionEnabled(feature: MotionFeature, off: Set<string> = BUILD_OFF): boolean {
  if (off.has('all') || off.has(feature)) return false
  if (typeof window !== 'undefined') {
    try {
      // ?motion=off → everything off; ?motion=off:marble,physics → just those (QA / perf checks).
      const q = new URLSearchParams(window.location.search).get('motion')
      if (q === 'off') return false
      if (q?.startsWith('off:') && parseMotionOff(q.slice(4)).has(feature)) return false
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    } catch {
      // ignore
    }
  }
  return true
}

/** Media queries for the three gsap.matchMedia() branches (docs/04). */
export const MQ = {
  desktop: '(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 1024px)',
  touch: '(prefers-reduced-motion: no-preference) and (not ((pointer: fine) and (min-width: 1024px)))',
  reduced: '(prefers-reduced-motion: reduce)',
} as const

export const isFinePointerDesktop = () =>
  typeof window !== 'undefined' && window.matchMedia(MQ.desktop).matches
