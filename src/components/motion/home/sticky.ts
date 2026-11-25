/**
 * "Pin" a section with CSS position: sticky inside a tall wrapper, instead of ScrollTrigger's
 * pin (which toggles position: fixed and is recorded by browsers as a big layout shift / CLS).
 * Sticky offsets are scroll-driven, so they are not layout shifts, and they do not jitter
 * with native touch scrolling.
 */
export function stickyPin(el: HTMLElement, distance: () => number) {
  const wrap = document.createElement('div')
  wrap.dataset.stickyPin = ''
  el.parentNode!.insertBefore(wrap, el)
  wrap.appendChild(el)
  el.style.position = 'sticky'
  el.style.top = '0'
  const size = () => {
    wrap.style.height = `${el.offsetHeight + Math.max(0, distance())}px`
  }
  size()
  return {
    wrap,
    size,
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
