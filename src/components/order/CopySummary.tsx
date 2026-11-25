'use client'

import { useState } from 'react'

/** Copies the non-personal order summary so the customer can paste it into Viber. */
export function CopySummary({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Older in-app browsers: fall back to a temporary textarea.
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 4000)
  }
  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="bg-yellow text-navy border-navy inline-flex min-h-12 items-center rounded-full border-[3px] px-6 font-bold shadow-[4px_4px_0_0_var(--color-navy)]"
      >
        {copied ? copiedLabel : label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? copiedLabel : ''}
      </span>
    </>
  )
}
