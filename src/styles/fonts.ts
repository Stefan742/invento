import { Fira_Sans_Extra_Condensed, Onest } from 'next/font/google'

/**
 * Chosen after the /dev/fonts Macedonian glyph test (see DECISIONS.md).
 * Both include every Macedonian letter (Ѓ ѓ Ќ ќ Ѕ ѕ Љ љ Њ њ Џ џ) at every weight used.
 * M5: only the weights actually used are loaded (display 800; Onest as one variable file).
 */
export const displayFont = Fira_Sans_Extra_Condensed({
  subsets: ['latin', 'cyrillic'],
  weight: ['800'],
  display: 'swap',
  variable: '--font-display-family',
})

// Variable font: one file per subset covers every weight from 400 to 900.
export const bodyFont = Onest({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-body-family',
})
