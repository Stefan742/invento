/**
 * "Pin" a section with CSS position: sticky inside a tall wrapper, instead of ScrollTrigger's
 * pin (which toggles position: fixed and is recorded by browsers as a big layout shift / CLS).
 * Sticky offsets are scroll-driven, so they are not layout shifts, and they do not jitter
 * with native touch scrolling.
 */
export function stickyPin(el: HTMLElement, distance: () => number, { align = 'bottom' }: { align?: 'top' | 'bottom' } = {}) {
  const wrap = document.createElement('div')
  wrap.dataset.stickyPin = ''
  el.parentNode!.insertBefore(wrap, el)
  wrap.appendChild(el)
  el.style.position = 'sticky'
  el.style.top = '0'
  /** How far the element scrolls before it sticks: how much taller than the screen it is when
   * bottom-aligned (0 when it fits); always 0 when top-aligned. */
  const overflow = () => (align === 'top' ? 0 : Math.max(0, el.offsetHeight - window.innerHeight))
  const size = () => {
    wrap.style.height = `${el.offsetHeight + Math.max(0, distance())}px`
    // align 'bottom': a section taller than the screen sticks with its bottom edge on the
    // screen's bottom, so nothing (like the order buttons) is cut off while it is pinned.
    // align 'top': it sticks at the top, so its top part (the hero box) never slides under the header.
    el.style.top = `${-overflow()}px`
  }
  size()
  return {
    wrap,
    size,
    overflow,
    undo() {
      el.style.position = ''
      el.style.top = ''
      wrap.parentNode?.insertBefore(el, wrap)
      wrap.remove()
    },
  }
}

/** Document-space box of a section, using its sticky wrapper when it has one. */
export function layoutBox(el: HTMLElement) {
  const box = el.parentElement?.dataset.stickyPin !== undefined ? el.parentElement! : el
  const top = box.getBoundingClientRect().top + window.scrollY
  return { top, height: box.offsetHeight }
}
