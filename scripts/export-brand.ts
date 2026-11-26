/**
 * Writes the brand art as standalone SVG files (for print, social media, the owner's designer)
 * and the favicon, from the same components the site renders.
 *   pnpm export:brand
 */
import { writeFileSync } from 'node:fs'
import { createElement, type ComponentType, type SVGProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Box, LogoMark } from '../src/components/illustrations/shapes'

const NAVY = '#0D1B2A'
const PAPER = '#F2F2F2'

function svg(Cmp: ComponentType<SVGProps<SVGSVGElement> & { open?: boolean }>, ink: string, extra: Record<string, unknown> = {}) {
  const markup = renderToStaticMarkup(createElement(Cmp, extra))
    .replaceAll('var(--ink, #0D1B2A)', ink)
    // Groups hidden by the open / closed state are left out of the static file.
    .replace(/<g data-part="[^"]+"[^>]*style="opacity:0"[^>]*>[\s\S]*?<\/g>/g, '')
    .replace(/ data-[a-z-]+(="[^"]*")?/g, '')
    .replace(/ style="opacity:1"/g, '')
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}\n`
}

const files: Record<string, string> = {
  'docs/brand/invento-mark.svg': svg(LogoMark, NAVY),
  'docs/brand/invento-mark-on-navy.svg': svg(LogoMark, PAPER),
  'docs/brand/invento-box-open.svg': svg(Box, NAVY),
  'docs/brand/invento-box-open-on-navy.svg': svg(Box, PAPER),
  'docs/brand/invento-box-closed.svg': svg(Box, NAVY, { open: false }),
  'docs/brand/invento-box-closed-on-navy.svg': svg(Box, PAPER, { open: false }),
  'src/app/icon.svg': svg(LogoMark, NAVY),
}
for (const [path, content] of Object.entries(files)) {
  writeFileSync(path, content)
  console.log('wrote', path)
}
