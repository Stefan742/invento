import type { CSSProperties, ReactNode } from 'react'

import { Illustration } from '../illustrations/Illustration'
import { SoftCircles } from '../illustrations/shapes'
import { cx } from '../ui'

export type World = 'navy' | 'orange' | 'yellow' | 'teal' | 'paper'

/** Hex values used by canvas/JS motion (marble track colour, reveal colours). */
export const WORLD_HEX: Record<World, { bg: string; accent: string; ink: string }> = {
  navy: { bg: '#0D1B2A', accent: '#FF7A00', ink: '#F2F2F2' },
  orange: { bg: '#FF7A00', accent: '#FFD166', ink: '#0D1B2A' },
  yellow: { bg: '#FFD166', accent: '#FF7A00', ink: '#0D1B2A' },
  teal: { bg: '#00B4DB', accent: '#FFD166', ink: '#0D1B2A' },
  paper: { bg: '#F2F2F2', accent: '#FF7A00', ink: '#0D1B2A' },
}

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
  side = 'center',
}: {
  world: World
  id?: string
  anchor: string
  children: ReactNode
  className?: string
  labelledBy?: string
  gears?: boolean
  /** Where the marble track runs through this section (M4). */
  side?: 'left' | 'right' | 'center'
}) {
  const w = WORLDS[world]
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-world={world}
      data-track-anchor={anchor}
      data-track-side={side}
      data-accent={WORLD_HEX[world].accent}
      data-bg={WORLD_HEX[world].bg}
      data-ink={WORLD_HEX[world].ink}
      // No `isolate`: decorations (z-0), the marble track (z-1, home only) and content (z-2)
      // all stack inside <main>, so the track runs between backgrounds and content.
      className={cx('relative overflow-hidden', w.cls, className)}
      style={{ '--track': w.accent, '--ink': w.ink } as CSSProperties}
    >
      <SoftCircles color={w.circle} className="pointer-events-none absolute inset-0 z-0 h-full w-full" preserveAspectRatio="xMidYMid slice" />
      {gears ? (
        <Illustration
          name="gear"
          className="spin-slow pointer-events-none absolute -right-24 -bottom-24 z-0 w-72 opacity-[0.12] sm:w-96"
        />
      ) : null}
      <div className="relative z-[2]">{children}</div>
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
