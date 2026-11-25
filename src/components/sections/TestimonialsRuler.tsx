'use client'

import { useRef, useState, type KeyboardEvent } from 'react'

export type RulerItem = {
  id: number
  quote: string
  name: string
  note?: string | null
  isPlaceholder?: boolean | null
}

/**
 * "Parents say": a measuring-tape ruler, one labelled tick per testimonial.
 * Works without JS (the first quote is server-rendered; all quotes are in the HTML for no-JS users).
 * Keyboard: Left/Right arrows on the tick list (roving tabindex), plus prev/next buttons.
 */
export function TestimonialsRuler({
  items,
  labels,
}: {
  items: RulerItem[]
  labels: { previous: string; next: string; of: string; placeholder: string; placeholderNote: string; group: string }
}) {
  const [active, setActive] = useState(0)
  const tickRefs = useRef<(HTMLButtonElement | null)[]>([])
  const count = items.length
  const go = (i: number, focus = false) => {
    const next = (i + count) % count
    setActive(next)
    if (focus) tickRefs.current[next]?.focus()
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(active + 1, true)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(active - 1, true)
    }
  }
  const current = items[active]

  return (
    <div>
      <figure id="testimonial-panel" role="tabpanel" className="min-h-[14rem]" aria-live="polite">
        <blockquote key={current.id} className="quote-in display text-yellow text-[clamp(2.25rem,6.5vw,5.5rem)] leading-[0.95]">
          “{current.quote}”
        </blockquote>
        <figcaption className="mt-5 flex flex-wrap items-center gap-3 text-lg font-semibold">
          <span>
            {current.name}
            {current.note ? <span className="opacity-75">, {current.note}</span> : null}
          </span>
          {current.isPlaceholder ? (
            <span title={labels.placeholderNote} className="bg-yellow text-navy rounded px-2 py-0.5 text-xs font-black tracking-widest">
              {labels.placeholder}
            </span>
          ) : null}
        </figcaption>
      </figure>

      <div className="mt-12 flex items-center gap-3">
        <button
          type="button"
          onClick={() => go(active - 1)}
          className="border-paper grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] text-xl font-black"
        >
          <span aria-hidden="true">←</span>
          <span className="sr-only">{labels.previous}</span>
        </button>

        {/* the ruler */}
        <div className="bg-yellow text-navy border-paper relative flex-1 overflow-x-auto rounded-lg border-[3px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-[repeating-linear-gradient(90deg,var(--color-navy)_0_2px,transparent_2px_12px)] opacity-70"
          />
          <div
            role="tablist"
            aria-label={labels.group}
            onKeyDown={onKey}
            className="relative flex min-w-max justify-around gap-6 px-6 pt-6 pb-3"
          >
            {items.map((it, i) => (
              <button
                key={it.id}
                ref={(el) => {
                  tickRefs.current[i] = el
                }}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-controls="testimonial-panel"
                tabIndex={i === active ? 0 : -1}
                aria-label={`${labels.of.replace('{n}', String(i + 1)).replace('{total}', String(count))}: ${it.name}`}
                onClick={() => go(i)}
                className="flex min-h-11 flex-col items-center gap-1 font-bold"
              >
                <span
                  aria-hidden="true"
                  className={`bg-navy block w-1 rounded transition-all ${i === active ? 'h-8' : 'h-4'}`}
                />
                <span className={i === active ? 'text-lg underline underline-offset-4' : 'text-sm'}>{it.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(active + 1)}
          className="border-paper grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] text-xl font-black"
        >
          <span aria-hidden="true">→</span>
          <span className="sr-only">{labels.next}</span>
        </button>
      </div>
    </div>
  )
}
