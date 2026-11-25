import { Fira_Sans_Extra_Condensed, Onest } from 'next/font/google'

/**
 * Chosen after the /dev/fonts Macedonian glyph test (see DECISIONS.md).
 * Both include every Macedonian letter (Ѓ ѓ Ќ ќ Ѕ ѕ Љ љ Њ њ Џ џ) at every weight used.
 */
export const displayFont = Fira_Sans_Extra_Condensed({
  subsets: ['latin', 'cyrillic'],
  weight: ['800', '900'],
  display: 'swap',
  variable: '--font-display-family',
})

export const bodyFont = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body-family',
})
