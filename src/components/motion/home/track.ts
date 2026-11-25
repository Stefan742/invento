/**
 * Marble track (docs/04 C), drawn on ONE viewport-sized canvas that is redrawn each frame.
 * A canvas is used instead of a page-tall SVG because animating the "travelled" part of a
 * 9000 px SVG path would repaint a huge layer every frame; a viewport canvas costs ~1 ms.
 *
 * - Anchors: every [data-track-anchor] section inside <main> (+ data-track-side left/right/center).
 * - One smooth path (Catmull-Rom → cubic Bézier) through the anchors, with a small curl at the intro.
 * - The marble follows the viewport: for the target y (≈ 55% down the screen) it walks along the
 *   path to the matching point, eased (scrub smoothing).
 * - The travelled part is drawn bolder, in the accent colour of the section it runs through.
 * - Mobile: a near-vertical track in the right gutter with gentle curves.
 */
type Pt = { x: number; y: number }
type Sample = { x: number; y: number; len: number; band: number }
type Run = { band: number; pts: Sample[] }
type Band = { top: number; bottom: number; accent: string; ink: string }

import { layoutBox } from './sticky'

export type TrackOptions = { mobile: boolean; onPass?: (anchor: string) => void }

export function createTrack(main: HTMLElement, opts: TrackOptions) {
  const canvas = document.createElement('canvas')
  canvas.className = 'track-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  main.prepend(canvas)
  const ctx = canvas.getContext('2d')!

  let path: boolean = false
  let samples: Sample[] = []
  let total = 0
  let bands: Band[] = []
  let startY = 0
  let endY = 0
  let current = 0 // eased length along the path
  let raf = 0
  let running = true
  let dpr = 1
  let passed = new Set<string>()
  let anchorsY: { id: string; y: number }[] = []

  const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY

  function build() {
    const w = main.clientWidth
    const anchors = Array.from(main.querySelectorAll<HTMLElement>('section[data-track-anchor]'))
    const footer = document.querySelector<HTMLElement>('footer[data-track-anchor]')
    const pts: Pt[] = []
    bands = []
    anchorsY = []
    const gutterL = opts.mobile ? w - 22 : Math.max(26, w * 0.028)
    const gutterR = opts.mobile ? w - 12 : w - Math.max(26, w * 0.028)
    const xFor = (side: string | undefined, i: number) =>
      opts.mobile ? (i % 2 ? gutterR : gutterL) : side === 'left' ? gutterL : side === 'right' ? gutterR : w / 2

    anchors.forEach((sec, i) => {
      const { top, height: h } = layoutBox(sec)
      const name = sec.dataset.trackAnchor ?? ''
      bands.push({ top, bottom: top + h, accent: sec.dataset.accent ?? '#FF7A00', ink: sec.dataset.ink ?? '#0D1B2A' })
      anchorsY.push({ id: name, y: top + h * 0.35 })
      if (name === 'hero') return // the track starts where the hero dive ends
      const x = xFor(sec.dataset.trackSide, i)
      // Enter and leave each section inside its padding, so side changes cross no text.
      if (pts.length === 0) pts.push({ x: opts.mobile ? x : w * 0.5, y: top + 6 })
      pts.push({ x, y: top + Math.min(90, h * 0.12) })
      if (name === 'intro' && !opts.mobile) {
        // small curl in the free space under the intro paragraph
        const p = sec.querySelector<HTMLElement>('[data-track-anchor="intro-loop"]')
        if (p) {
          const r = p.getBoundingClientRect()
          const mainLeft = main.getBoundingClientRect().left
          const cx = r.left - mainLeft + 70
          const cy = docTop(p) + r.height + 56
          if (cy + 50 < top + h - 40) {
            pts.push({ x, y: cy - 30 }, { x: cx - 10, y: cy + 40 }, { x: cx + 55, y: cy }, { x: cx, y: cy - 42 }, { x: cx - 45, y: cy + 8 }, { x: cx + 20, y: cy + 48 })
          }
        }
      }
      pts.push({ x, y: top + h - Math.min(70, h * 0.1) })
    })
    if (footer) {
      const top = docTop(footer)
      bands.push({ top, bottom: top + footer.offsetHeight, accent: '#FF7A00', ink: '#F2F2F2' })
      pts.push({ x: w / 2, y: top + 40 })
    }
    if (pts.length < 2) {
      path = false
      return
    }
    // Path relative to <main>'s document top.
    const mainTop = docTop(main)
    const rel = pts.map((p) => ({ x: p.x, y: p.y - mainTop }))
    const d = catmullRom(rel)
    path = true
    startY = rel[0].y + mainTop
    endY = rel[rel.length - 1].y + mainTop

    // Sample the path for length lookups.
    const svgNS = 'http://www.w3.org/2000/svg'
    const tmp = document.createElementNS(svgNS, 'path')
    tmp.setAttribute('d', d)
    total = tmp.getTotalLength()
    samples = []
    const step = 6
    for (let len = 0; len <= total; len += step) {
      const p = tmp.getPointAtLength(len)
      const y = p.y + mainTop
      const band = Math.max(0, bands.findIndex((b) => y >= b.top && y < b.bottom))
      samples.push({ x: p.x, y, len, band })
    }
    // keep the eased position valid after a rebuild
    current = Math.min(current, total)
    resize()
  }

  function resize() {
    // Mobile: cap the canvas resolution (thin lines stay crisp enough, far fewer pixels to fill).
    dpr = Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.25 : 2)
    lastDraw = { scrollY: -1, current: -1 }
    canvas.width = Math.round(window.innerWidth * dpr)
    canvas.height = Math.round(window.innerHeight * dpr)
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
  }

  /** Walk the samples to the point whose y matches the target (keeps continuity through the curl). */
  let idx = 0
  let lastDraw = { scrollY: -1, current: -1 }
  function targetLength(targetY: number) {
    if (!samples.length) return 0
    if (targetY <= samples[0].y) return 0
    while (idx < samples.length - 1 && samples[idx + 1].y <= targetY) idx++
    while (idx > 0 && samples[idx].y > targetY) idx--
    // Run through the curl: while the next samples go up again, keep walking forward.
    let j = idx
    while (j < samples.length - 1 && samples[j + 1].y < samples[j].y && samples[j + 1].y > targetY - 400) j++
    return samples[Math.max(idx, j)].len
  }

  function pointAt(len: number) {
    if (!samples.length) return { x: 0, y: 0 }
    const i = Math.min(samples.length - 1, Math.max(0, Math.round(len / 6)))
    return samples[i]
  }

  function draw() {
    if (!running) return
    raf = requestAnimationFrame(draw)
    if (!path) return
    const vh = window.innerHeight
    const scrollY = window.scrollY
    const target = targetLength(scrollY + vh * 0.55)
    current += (target - current) * 0.12
    // Skip the frame when nothing moved (no scroll, marble settled).
    if (Math.abs(lastDraw.scrollY - scrollY) < 0.5 && Math.abs(lastDraw.current - current) < 0.3) return
    lastDraw = { scrollY, current }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, window.innerWidth, vh)
    // Nothing to draw while the track is entirely off-screen.
    if (scrollY + vh < startY - 50 || scrollY > endY + 50) return
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Draw only the samples inside the viewport, as polylines grouped by colour band.
    // (Stroking the whole page-long path every frame was too slow on mid-range phones.)
    const top = scrollY - 40
    const bottom = scrollY + vh + 40
    const runs: Run[] = []
    let run: Run | null = null
    for (const sp of samples) {
      if (sp.y < top || sp.y > bottom) {
        run = null
        continue
      }
      if (!run || run.band !== sp.band) {
        const prev: Sample | undefined = run ? run.pts[run.pts.length - 1] : undefined
        const next: Run = { band: sp.band, pts: prev ? [prev] : [] }
        runs.push(next)
        run = next
      }
      run.pts.push(sp)
    }
    const line = (pts: { x: number; y: number }[]) => {
      ctx.beginPath()
      pts.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y - scrollY) : ctx.moveTo(pt.x, pt.y - scrollY)))
      ctx.stroke()
    }
    for (const r of runs) {
      const band = bands[r.band]
      if (!band || r.pts.length < 2) continue
      // full track: thin, low contrast
      ctx.globalAlpha = 0.28
      ctx.strokeStyle = band.ink
      ctx.lineWidth = opts.mobile ? 3 : 5
      line(r.pts)
      // travelled part: bold, section accent, outlined in ink so it reads on every colour
      const done = r.pts.filter((pt) => pt.len <= current)
      if (done.length > 1) {
        ctx.globalAlpha = 1
        if (!opts.mobile) {
          ctx.strokeStyle = band.ink
          ctx.lineWidth = 12
          line(done)
        }
        ctx.strokeStyle = opts.mobile ? band.ink : band.accent
        ctx.lineWidth = opts.mobile ? 4 : 7
        line(done)
      }
    }
    ctx.globalAlpha = 1

    // the marble
    const p = pointAt(current)
    const y = p.y - scrollY
    const r = opts.mobile ? 9 : 14
    if (current > 1) {
      ctx.beginPath()
      ctx.arc(p.x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = '#FF7A00'
      ctx.fill()
      ctx.lineWidth = 3.5
      ctx.strokeStyle = '#0D1B2A'
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(p.x - r * 0.35, y - r * 0.38, r * 0.32, r * 0.2, -0.6, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(242,242,242,0.9)'
      ctx.fill()
    }

    // simple triggers when the marble passes an anchor
    if (opts.onPass) {
      for (const a of anchorsY) {
        if (!passed.has(a.id) && p.y >= a.y) {
          passed.add(a.id)
          opts.onPass(a.id)
        } else if (passed.has(a.id) && p.y < a.y - 200) {
          passed.delete(a.id)
        }
      }
    }
  }

  // Pause the loop when the tab is hidden.
  const onVis = () => {
    if (document.hidden) {
      running = false
      cancelAnimationFrame(raf)
    } else if (!running) {
      running = true
      raf = requestAnimationFrame(draw)
    }
  }
  document.addEventListener('visibilitychange', onVis)
  window.addEventListener('resize', resize)

  build()
  raf = requestAnimationFrame(draw)

  return {
    rebuild: () => {
      passed = new Set(passed)
      build()
    },
    destroy: () => {
      running = false
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', resize)
      canvas.remove()
    },
  }
}

/** Catmull-Rom spline through points, as cubic Bézier SVG path data. */
export function catmullRom(pts: Pt[], tension = 0.5): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = { x: p1.x + ((p2.x - p0.x) * tension) / 3, y: p1.y + ((p2.y - p0.y) * tension) / 3 }
    const c2 = { x: p2.x - ((p3.x - p1.x) * tension) / 3, y: p2.y - ((p3.y - p1.y) * tension) / 3 }
    d += ` C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}
