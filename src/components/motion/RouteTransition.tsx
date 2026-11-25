'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { motionEnabled } from '@/lib/motion-flags'

const CLOSE_MS = 260
const OPEN_MS = 320
const FAILSAFE_MS = 1200

/**
 * Lid wipe between pages (docs/04, M5 nice-to-have). Purely visual and non-blocking:
 * the click navigates as normal while a navy "lid" closes over the old page; when the new
 * route renders, the lid opens (~580 ms in total). If a navigation is slow or cancelled, the
 * lid opens on its own after 1.2 s. Web Animations API only (no animation library).
 * Off for reduced motion and when the `transitions` motion flag is off.
 */
export function RouteTransition() {
  const lidRef = useRef<HTMLDivElement>(null)
  const openRef = useRef<() => void>(() => {})
  const pathname = usePathname()

  useEffect(() => {
    if (!motionEnabled('transitions')) return
    let closing = false
    let closedAt = 0
    let failsafe = 0
    let pending = 0

    const open = () => {
      const lid = lidRef.current
      if (!lid || !closing) return
      // Let the lid finish closing first, so the wipe reads as one motion.
      const wait = Math.max(0, CLOSE_MS - (performance.now() - closedAt))
      if (wait > 0) {
        window.clearTimeout(pending)
        pending = window.setTimeout(open, wait)
        return
      }
      closing = false
      window.clearTimeout(failsafe)
      lid.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-101%)' }], {
        duration: OPEN_MS,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      })
    }
    openRef.current = open

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest('a')
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return
      const url = new URL(a.href, window.location.href)
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname) return // same page / hash links
      if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return
      const lid = lidRef.current
      if (!lid) return
      closing = true
      closedAt = performance.now()
      lid.animate([{ transform: 'translateY(-101%)' }, { transform: 'translateY(0)' }], {
        duration: CLOSE_MS,
        easing: 'cubic-bezier(0.55, 0, 0.75, 0.2)',
        fill: 'forwards',
      })
      window.clearTimeout(failsafe)
      failsafe = window.setTimeout(open, FAILSAFE_MS)
    }
    // Capture phase: runs before Next's Link handler and never prevents the navigation.
    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', open)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', open)
      window.clearTimeout(failsafe)
      window.clearTimeout(pending)
      openRef.current = () => {}
    }
  }, [])

  // New route rendered → open the lid.
  useEffect(() => {
    openRef.current()
  }, [pathname])

  return (
    <div
      ref={lidRef}
      aria-hidden="true"
      data-route-lid
      className="bg-navy border-orange pointer-events-none fixed inset-0 z-[70] border-b-[6px]"
      style={{ transform: 'translateY(-101%)' }}
    >
      <span className="bg-orange absolute bottom-6 left-1/2 block h-2.5 w-28 -translate-x-1/2 rounded-full" />
    </div>
  )
}
