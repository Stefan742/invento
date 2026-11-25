'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

export type LightboxPhoto = {
  id: string
  src: string
  width: number
  height: number
  alt: string
  thumbSrc: string
  thumbWidth: number
  thumbHeight: number
  caption?: string | null
  credit?: string | null
  isPlaceholder?: boolean | null
}

type Labels = { close: string; previous: string; next: string; open: string; placeholder: string }

/**
 * Accessible lightbox on the native <dialog> element: focus trap, Esc to close and
 * focus return come from the browser. Arrow keys move between photos.
 * Without JS each thumbnail is a plain link to the full image.
 */
export function Lightbox({
  photos,
  labels,
  variant = 'grid',
  listClassName,
  itemStyles,
  itemData,
}: {
  photos: LightboxPhoto[]
  labels: Labels
  /** grid: plain square thumbs. taped: paper-framed, taped photos (home drift layout). */
  variant?: 'grid' | 'taped'
  listClassName?: string
  itemStyles?: CSSProperties[]
  /** Optional per-item drift speed (home gallery parallax, M4). */
  itemData?: string[]
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState<number | null>(null)

  const open = useCallback((i: number) => {
    setIndex(i)
    dialogRef.current?.showModal()
  }, [])
  const close = () => dialogRef.current?.close()
  const move = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  )

  useEffect(() => {
    const dlg = dialogRef.current
    if (!dlg) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') move(1)
      if (e.key === 'ArrowLeft') move(-1)
    }
    const onClose = () => setIndex(null)
    dlg.addEventListener('keydown', onKey)
    dlg.addEventListener('close', onClose)
    return () => {
      dlg.removeEventListener('keydown', onKey)
      dlg.removeEventListener('close', onClose)
    }
  }, [move])

  const current = index !== null ? photos[index] : null

  return (
    <>
      <ul className={listClassName}>
        {photos.map((p, i) => (
          <li key={p.id} style={itemStyles?.[i]} data-drift={itemData?.[i]}>
            <a
              href={p.src}
              onClick={(e) => {
                e.preventDefault()
                open(i)
              }}
              aria-label={labels.open.replace('{title}', p.alt)}
              className="block"
            >
              {variant === 'taped' ? (
                <span className="tape bg-paper border-navy relative block rounded-md border-[3px] p-2 pb-8 shadow-[5px_5px_0_0_var(--color-navy)]">
                  <Image src={p.thumbSrc} alt={p.alt} width={p.thumbWidth} height={p.thumbHeight} sizes="(min-width: 1024px) 18rem, 45vw" className="aspect-square w-full rounded object-cover" />
                </span>
              ) : (
                <span className="border-navy block overflow-hidden rounded-2xl border-[3px] shadow-[5px_5px_0_0_var(--color-navy)]">
                  <Image src={p.thumbSrc} alt={p.alt} width={p.thumbWidth} height={p.thumbHeight} sizes="(min-width: 1024px) 25vw, 50vw" className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105" />
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current?.alt}
        data-anim="pop"
        className="bg-navy/95 text-paper m-0 h-dvh max-h-none w-screen max-w-none p-0 backdrop:bg-black/70"
        onClick={(e) => {
          if (e.target === e.currentTarget) close()
        }}
      >
        {current ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-4 sm:p-10">
            <figure className="flex max-h-full flex-col items-center gap-3">
              <Image
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                sizes="90vw"
                className="border-paper max-h-[75dvh] w-auto rounded-xl border-[3px] object-contain"
              />
              <figcaption className="text-center">
                {current.caption ? <span className="block font-semibold">{current.caption}</span> : null}
                {current.credit ? <span className="block opacity-80">{current.credit}</span> : null}
                {current.isPlaceholder ? (
                  <span className="bg-yellow text-navy mt-1 inline-block rounded px-2 text-xs font-black tracking-widest">
                    {labels.placeholder}
                  </span>
                ) : null}
              </figcaption>
            </figure>
            <div className="flex gap-3">
              {photos.length > 1 ? (
                <button type="button" onClick={() => move(-1)} className="border-paper min-h-12 rounded-full border-[3px] px-5 font-bold">
                  ← {labels.previous}
                </button>
              ) : null}
              <button type="button" onClick={close} autoFocus className="bg-orange text-navy border-navy min-h-12 rounded-full border-[3px] px-5 font-bold">
                {labels.close}
              </button>
              {photos.length > 1 ? (
                <button type="button" onClick={() => move(1)} className="border-paper min-h-12 rounded-full border-[3px] px-5 font-bold">
                  {labels.next} →
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  )
}
