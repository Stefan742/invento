import type { ComponentProps, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

import { Illustration } from '../illustrations/Illustration'

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

type Variant = 'orange' | 'navy' | 'paper' | 'yellow' | 'outline'

const VARIANTS: Record<Variant, string> = {
  // Orange/yellow/paper buttons carry navy text; navy buttons carry paper text.
  orange: 'bg-orange text-navy border-navy shadow-[4px_4px_0_0_var(--color-navy)]',
  yellow: 'bg-yellow text-navy border-navy shadow-[4px_4px_0_0_var(--color-navy)]',
  paper: 'bg-paper text-navy border-navy shadow-[4px_4px_0_0_var(--color-navy)]',
  navy: 'bg-navy text-paper border-navy shadow-[4px_4px_0_0_var(--color-orange)]',
  outline: 'bg-transparent text-current border-current',
}

const BTN =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-[3px] px-6 py-2.5 font-bold transition-transform duration-200 ease-[var(--ease-back)] hover:-translate-y-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60'

export function ButtonLink({
  variant = 'orange',
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cx(BTN, VARIANTS[variant], className)} {...props} />
}

export function ExternalButton({
  variant = 'orange',
  className,
  href,
  children,
  disabledLabel,
}: {
  variant?: Variant
  className?: string
  href: string | null
  children: ReactNode
  /** When href is missing (owner has not filled it in yet) a disabled pill with this text renders. */
  disabledLabel?: string
}) {
  if (!href) {
    return (
      <span aria-disabled="true" className={cx(BTN, VARIANTS[variant], 'cursor-not-allowed opacity-55', className)}>
        {children}
        {disabledLabel ? <span className="sr-only">: {disabledLabel}</span> : null}
      </span>
    )
  }
  const external = href.startsWith('http')
  return (
    <a
      href={href}
      className={cx(BTN, VARIANTS[variant], className)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}

export function Button({
  variant = 'orange',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: Variant }) {
  return <button className={cx(BTN, VARIANTS[variant], className)} {...props} />
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'border-navy bg-paper text-navy inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-semibold',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Difficulty shown as 1-3 gears. */
export function GearRating({ value, label }: { value: number; label: string }) {
  const v = Math.max(1, Math.min(3, Math.round(value || 1)))
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label}>
      {[1, 2, 3].map((i) => (
        <Illustration
          key={i}
          name="gear"
          className={cx('h-5 w-5', i > v && 'opacity-25 grayscale')}
        />
      ))}
    </span>
  )
}

export function StockBar({
  remaining,
  total,
  label,
}: {
  remaining: number
  total: number
  label: string
}) {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0
  return (
    <div className="w-full">
      <div className="mb-1 text-sm font-semibold">{label}</div>
      <div
        className="border-navy bg-paper h-3.5 w-full overflow-hidden rounded-full border-2"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={remaining}
        aria-label={label}
      >
        <div className="bg-orange h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function PlaceholderBadge({ label, title }: { label: string; title: string }) {
  return (
    <span
      title={title}
      className="bg-yellow text-navy border-navy inline-block rotate-[-4deg] rounded-md border-2 px-2 py-0.5 text-xs font-black tracking-widest"
    >
      {label}
    </span>
  )
}

export function Ribbon({ children }: { children: ReactNode }) {
  return (
    <span className="bg-orange text-navy border-navy absolute -top-3 -right-2 z-10 rotate-[6deg] rounded-full border-[3px] px-3 py-1 text-xs font-black tracking-wide uppercase shadow-[3px_3px_0_0_var(--color-navy)]">
      {children}
    </span>
  )
}
