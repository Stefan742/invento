'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { Link } from '@/i18n/navigation'

type Item = { href: string | { pathname: string; hash?: string }; label: string }

export function MobileMenu({
  items,
  openLabel,
  closeLabel,
  menuLabel,
  children,
}: {
  items: Item[]
  openLabel: string
  closeLabel: string
  menuLabel: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.querySelector<HTMLElement>('a')?.focus()
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="border-navy hover:bg-yellow relative z-[60] grid h-11 w-11 place-items-center rounded-full border-[3px] transition-colors"
      >
        <span className="sr-only">{open ? closeLabel : openLabel}</span>
        <span aria-hidden="true" className="flex flex-col gap-1.5">
          <span className={`bg-navy block h-[3px] w-5 rounded transition-transform ${open ? 'translate-y-[9px] rotate-45' : ''}`} />
          <span className={`bg-navy block h-[3px] w-5 rounded transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`bg-navy block h-[3px] w-5 rounded transition-transform ${open ? '-translate-y-[9px] -rotate-45' : ''}`} />
        </span>
      </button>
      <div
        id={id}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={menuLabel}
        hidden={!open}
        data-anim="lid"
        data-lenis-prevent
        // Any link inside (nav items, language switch) closes the menu.
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest('a')) setOpen(false)
        }}
        className="bg-orange text-navy fixed inset-0 z-50 overflow-y-auto pt-24 pb-10"
      >
        <nav className="container-x">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="display block py-1 text-[clamp(3rem,14vw,5rem)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">{children}</div>
        </nav>
      </div>
    </div>
  )
}
