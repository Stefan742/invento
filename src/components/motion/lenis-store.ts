'use client'

import type Lenis from 'lenis'

/** Shared Lenis instance so page-level motion (ScrollTrigger) can follow smooth scroll. */
let instance: Lenis | null = null
const listeners = new Set<(l: Lenis | null) => void>()

export function setLenis(l: Lenis | null) {
  instance = l
  for (const fn of listeners) fn(l)
}

export function getLenis() {
  return instance
}

export function onLenis(fn: (l: Lenis | null) => void) {
  listeners.add(fn)
  fn(instance)
  return () => {
    listeners.delete(fn)
  }
}
