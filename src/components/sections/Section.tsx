import type { CSSProperties, ReactNode } from 'react'

import { Illustration } from '../illustrations/Illustration'
import { SoftCircles } from '../illustrations/shapes'
import { cx } from '../ui'

export type World = 'navy' | 'orange' | 'yellow' | 'teal' | 'paper'

const WORLDS: Record<World, { cls: string; accent: string; ink: string; circle: string }> = {
  // Text colour follows the contrast rule: paper on navy, navy on everything else.
  navy: { cls: 'bg-navy text-paper', accent: 'var(--color-orange)', ink: 'var(--color-paper)', circle: '#00B4DB' },
  orange: { cls: 'bg-orange text-navy', accent: 'var(--color-yellow)', ink: 'var(--color-navy)', circle: '#FFD166' },
  yellow: { cls: 'bg-yellow text-navy', accent: 'var(--color-orange)', ink: 'var(--color-navy)', circle: '#FF7A00' },
  teal: { cls: 'bg-teal text-navy', accent: 'var(--color-yellow)', ink: 'var(--color-navy)', circle: '#0D1B2A' },
  paper: { cls: 'bg-paper text-navy', accent: 'var(--color-orange)', ink: 'var(--color-navy)', circle: '#00B4DB' },
}

/** A home "colour world": background, text colour, track accent, soft circles and a gear. */
export function Section({
  world,
  id,
  anchor,
  children,
  className,
  labelledBy,
  gears = true,
}: {
  world: World
  id?: string
  anchor: string
  children: ReactNode
  className?: string
  labelledBy?: string
  gears?: boolean
}) {
  const w = WORLDS[world]
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-world={world}
      data-track-anchor={anchor}
      className={cx('relative isolate overflow-hidden', w.cls, className)}
      style={{ '--track': w.accent, '--ink': w.ink } as CSSProperties}
    >
      <SoftCircles color={w.circle} className="pointer-events-none absolute inset-0 -z-10 h-full w-full" preserveAspectRatio="xMidYMid slice" />
      {gears ? (
        <Illustration
          name="gear"
          className="spin-slow pointer-events-none absolute -right-24 -bottom-24 -z-10 w-72 opacity-[0.12] sm:w-96"
        />
      ) : null}
      {children}
    </section>
  )
}

export function GiantTitle({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cx('display display-xl break-words', className)}>
      {children}
    </h2>
  )
}
