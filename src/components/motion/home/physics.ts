/**
 * Questions section physics (docs/04 E), Matter.js loaded lazily.
 * The parts are the same SVG illustrations that form the static pile; Matter only computes
 * positions and we write `transform` on those elements each frame (transform-only, no layout).
 * - Engine pauses when the section is off-screen; bodies sleep when still.
 * - Desktop: up to 18 bodies, drag / flick with the mouse. Touch: 8 bodies, no dragging
 *   (so the page keeps scrolling natively). Reduced motion never gets here (static pile stays).
 */
export async function startPhysics(section: HTMLElement, { desktop }: { desktop: boolean }) {
  const pile = section.querySelector<HTMLElement>('[data-physics-pile]')
  if (!pile) return () => {}
  const Matter = (await import('matter-js')).default
  const { Engine, Bodies, Composite, Body, Mouse, MouseConstraint, Events } = Matter

  const template = Array.from(pile.children) as HTMLElement[]
  const max = desktop ? 18 : 8
  // Clone parts up to the body count (deterministic order).
  const els: HTMLElement[] = []
  for (let i = 0; i < max; i++) {
    const src = template[i % template.length]
    const el = i < template.length ? src : (src.cloneNode(true) as HTMLElement)
    if (i >= template.length) pile.appendChild(el)
    els.push(el)
  }
  // Hide any template parts beyond the body count.
  template.slice(max).forEach((el) => (el.style.display = 'none'))

  const engine = Engine.create({ enableSleeping: true, gravity: { x: 0, y: 1.1 } })
  let w = pile.clientWidth
  let h = pile.clientHeight
  const wallOpts = { isStatic: true, restitution: 0.2, friction: 0.6 }
  const thick = 200
  const floor = Bodies.rectangle(w / 2, h + thick / 2, w * 3, thick, wallOpts)
  const left = Bodies.rectangle(-thick / 2, h / 2, thick, h * 4, wallOpts)
  const right = Bodies.rectangle(w + thick / 2, h / 2, thick, h * 4, wallOpts)
  Composite.add(engine.world, [floor, left, right])

  // Make every part a body, start them above the section, deterministic spread.
  const bodies = els.map((el, i) => {
    el.style.left = '0'
    el.style.top = '0'
    el.style.willChange = 'transform'
    const size = el.getBoundingClientRect().width || 80
    const r = size / 2
    const x = ((i * 37) % 90) * (w / 100) + w * 0.05
    const y = -200 - i * 90
    const body = Bodies.circle(x, y, r * 0.82, { restitution: 0.35, friction: 0.4, frictionAir: 0.015, density: 0.002 })
    Body.setAngle(body, (i * 47 * Math.PI) / 180)
    return { el, body, r }
  })
  Composite.add(engine.world, bodies.map((b) => b.body))

  let mouseConstraint: Matter.MouseConstraint | null = null
  if (desktop) {
    const mouse = Mouse.create(pile)
    // Matter listens to the wheel and would block page scrolling: remove that listener.
    const m = mouse as unknown as { element: HTMLElement; mousewheel: EventListener }
    m.element.removeEventListener('wheel', m.mousewheel)
    m.element.removeEventListener('mousewheel', m.mousewheel)
    m.element.removeEventListener('DOMMouseScroll', m.mousewheel)
    mouseConstraint = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.18, render: { visible: false } } })
    Composite.add(engine.world, mouseConstraint)
    pile.style.pointerEvents = 'auto'
    pile.style.cursor = 'grab'
    Events.on(mouseConstraint, 'startdrag', () => (pile.style.cursor = 'grabbing'))
    Events.on(mouseConstraint, 'enddrag', () => (pile.style.cursor = 'grab'))
  }

  let raf = 0
  let last = performance.now()
  let active = false
  const frame = (now: number) => {
    const dt = Math.min(32, now - last)
    last = now
    Engine.update(engine, dt)
    for (const { el, body, r } of bodies) {
      el.style.transform = `translate3d(${body.position.x - r}px, ${body.position.y - r}px, 0) rotate(${body.angle}rad)`
    }
    raf = requestAnimationFrame(frame)
  }
  const start = () => {
    if (active) return
    active = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    active = false
    cancelAnimationFrame(raf)
  }
  // Run only while visible.
  const io = new IntersectionObserver((entries) => (entries[0]?.isIntersecting ? start() : stop()), { threshold: 0.05 })
  io.observe(section)

  const onResize = () => {
    w = pile.clientWidth
    h = pile.clientHeight
    Body.setPosition(floor, { x: w / 2, y: h + thick / 2 })
    Body.setPosition(right, { x: w + thick / 2, y: h / 2 })
  }
  window.addEventListener('resize', onResize)

  return () => {
    stop()
    io.disconnect()
    window.removeEventListener('resize', onResize)
    if (mouseConstraint) Composite.remove(engine.world, mouseConstraint)
    Engine.clear(engine)
    els.slice(template.length).forEach((el) => el.remove())
    for (const el of template) {
      el.style.transform = ''
      el.style.left = ''
      el.style.top = ''
      el.style.display = ''
      el.style.willChange = ''
    }
    pile.style.pointerEvents = ''
    pile.style.cursor = ''
  }
}
