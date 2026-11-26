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
      // A symmetric 8-tooth gear centred in its box, with room for the outline on every side
      // (the old drawing touched the edges, so its teeth looked cut off).
      el.innerHTML =
        '<svg viewBox="-22 -22 44 44" width="40" height="40" overflow="visible"><path d="M-3 -12.1L-2.5 -17.3L2.5 -17.3L3 -12.1L4.8 -11.5L6.4 -10.7L10.5 -14L14 -10.5L10.7 -6.4L11.5 -4.8L12.1 -3L17.3 -2.5L17.3 2.5L12.1 3L11.5 4.8L10.7 6.4L14 10.5L10.5 14L6.4 10.7L4.8 11.5L3 12.1L2.5 17.3L-2.5 17.3L-3 12.1L-4.8 11.5L-6.4 10.7L-10.5 14L-14 10.5L-10.7 6.4L-11.5 4.8L-12.1 3L-17.3 2.5L-17.3 -2.5L-12.1 -3L-11.5 -4.8L-10.7 -6.4L-14 -10.5L-10.5 -14L-6.4 -10.7L-4.8 -11.5Z" fill="#FF7A00" stroke="#0D1B2A" stroke-width="2.5" stroke-linejoin="round"/><circle r="5" fill="#F2F2F2" stroke="#0D1B2A" stroke-width="2.5"/></svg>'
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
