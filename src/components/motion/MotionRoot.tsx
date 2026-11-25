'use client'

import { useEffect } from 'react'

import { isFinePointerDesktop, motionEnabled } from '@/lib/motion-flags'

import { setLenis } from './lenis-store'

/**
 * Site-wide motion, mounted once in the layout. Everything here is an enhancement:
 * nothing is hidden or moved until this runs, and each part has its own off switch.
 * - Lenis smooth scroll: fine pointer + desktop only (native scroll on touch)
 * - header hides on scroll down and returns on scroll up
 * - gear cursor: fine pointer only
 */
export function MotionRoot() {
  useEffect(() => {
    const cleanups: (() => void)[] = []
    const root = document.documentElement
    root.classList.add('js-motion')

    // --- Smooth scroll -----------------------------------------------------------
    if (motionEnabled('smooth') && isFinePointerDesktop()) {
      let cancelled = false
      void import('lenis').then(({ default: Lenis }) => {
        if (cancelled) return
        const lenis = new Lenis({
          autoRaf: true,
          anchors: { offset: -72 },
          // Let scrollable areas (cart, menu, lightbox, dialogs) scroll natively.
          prevent: (node) => Boolean(node.closest('[data-lenis-prevent], dialog')),
        })
        setLenis(lenis)
        // Pause smooth scroll while a modal dialog is open.
        const obs = new MutationObserver(() => {
          if (document.querySelector('dialog[open]')) lenis.stop()
          else lenis.start()
        })
        obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] })
        cleanups.push(() => {
          obs.disconnect()
          lenis.destroy()
          setLenis(null)
        })
      })
      cleanups.push(() => {
        cancelled = true
      })
    }

    // --- Header: hide on scroll down, show on scroll up ----------------------------
    const header = document.querySelector<HTMLElement>('[data-site-header]')
    if (header && motionEnabled('header')) {
      let lastY = window.scrollY
      let hidden = false
      let ticking = false
      const update = () => {
        ticking = false
        const y = window.scrollY
        const goingDown = y > lastY + 4
        const goingUp = y < lastY - 4
        const menuOpen = header.querySelector('[role="dialog"]:not([hidden])')
        if (goingDown && y > 160 && !hidden && !menuOpen) {
          hidden = true
          header.style.transform = 'translateY(-100%)'
        } else if ((goingUp || y < 80) && hidden) {
          hidden = false
          header.style.transform = ''
        }
        if (goingDown || goingUp) lastY = y
      }
      const onScroll = () => {
        if (!ticking) {
          ticking = true
          requestAnimationFrame(update)
        }
      }
      // Never keep the header hidden while something in it has keyboard focus.
      const onFocus = () => {
        hidden = false
        header.style.transform = ''
      }
      header.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
      window.addEventListener('scroll', onScroll, { passive: true })
      header.addEventListener('focusin', onFocus)
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll)
        header.removeEventListener('focusin', onFocus)
        header.style.transform = ''
        header.style.transition = ''
      })
    }

    // --- Gear cursor -------------------------------------------------------------
    if (motionEnabled('cursor') && isFinePointerDesktop()) {
      const el = document.createElement('div')
      el.className = 'gear-cursor'
      el.setAttribute('aria-hidden', 'true')
      el.innerHTML =
        '<svg viewBox="0 0 40 40" width="40" height="40"><path d="M17 2h6l1 5 4 2 4-3 4 4-3 4 2 4 5 1v6l-5 1-2 4 3 4-4 4-4-3-4 2-1 5h-6l-1-5-4-2-4 3-4-4 3-4-2-4-5-1v-6l5-1 2-4-3-4 4-4 4 3 4-2z" fill="#FF7A00" stroke="#0D1B2A" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="20" r="5" fill="#F2F2F2" stroke="#0D1B2A" stroke-width="2.5"/></svg>'
      document.body.appendChild(el)
      root.classList.add('has-gear-cursor')

      let x = -100
      let y = -100
      let tx = -100
      let ty = -100
      let angle = 0
      let scale = 1
      let targetScale = 1
      let raf = 0
      let visible = false
      const loop = () => {
        const dx = tx - x
        const dy = ty - y
        x += dx * 0.35
        y += dy * 0.35
        // Rotation follows pointer speed.
        angle += Math.min(40, Math.hypot(dx, dy) * 0.6)
        scale += (targetScale - scale) * 0.2
        el.style.transform = `translate3d(${x - 20}px, ${y - 20}px, 0) rotate(${angle}deg) scale(${scale})`
        raf = requestAnimationFrame(loop)
      }
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        tx = e.clientX
        ty = e.clientY
        if (!visible) {
          visible = true
          x = tx
          y = ty
          el.style.opacity = '1'
        }
        const target = e.target as HTMLElement | null
        const interactive = target?.closest('a, button, [role="button"], summary, label, select')
        // Text fields and open dialogs (browser top layer) use the normal cursor instead.
        const native = target?.closest('input, textarea, select, [contenteditable="true"], dialog')
        targetScale = interactive ? 1.8 : 1
        el.style.opacity = native ? '0' : '1'
      }
      const onLeave = () => {
        visible = false
        el.style.opacity = '0'
      }
      window.addEventListener('pointermove', onMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
      raf = requestAnimationFrame(loop)
      cleanups.push(() => {
        cancelAnimationFrame(raf)
        window.removeEventListener('pointermove', onMove)
        document.documentElement.removeEventListener('pointerleave', onLeave)
        el.remove()
        root.classList.remove('has-gear-cursor')
      })
    }

    return () => {
      for (const fn of cleanups.reverse()) fn()
      root.classList.remove('js-motion')
    }
  }, [])

  return null
}
