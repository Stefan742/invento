import { renderToStaticMarkup } from 'react-dom/server'
import sharp from 'sharp'

import { ILLUSTRATIONS, type IllustrationName } from '../components/illustrations/Illustration'

const BG: Record<string, string> = {
  yellow: '#FFD166',
  teal: '#00B4DB',
  orange: '#FF7A00',
  paper: '#F2F2F2',
}

/**
 * Render a clearly-labelled placeholder photo (PNG) from one of our SVG illustrations.
 * These are stand-ins until the owner uploads real product / build photos.
 */
export async function placeholderPhoto(
  name: IllustrationName,
  bg: keyof typeof BG,
  label: string,
  size = 1200,
): Promise<Buffer> {
  const Cmp = ILLUSTRATIONS[name] as (p: React.SVGProps<SVGSVGElement>) => React.ReactElement
  const inner = renderToStaticMarkup(<Cmp width={size * 0.62} height={size * 0.62} />)
    .replace(/var\(--ink, #0D1B2A\)/g, '#0D1B2A')
  const art = Buffer.from(inner).toString('base64')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="100%" height="100%" fill="${BG[bg]}"/>
    <circle cx="${size * 0.18}" cy="${size * 0.2}" r="${size * 0.28}" fill="#0D1B2A" opacity="0.06"/>
    <circle cx="${size * 0.85}" cy="${size * 0.82}" r="${size * 0.32}" fill="#0D1B2A" opacity="0.06"/>
    <image href="data:image/svg+xml;base64,${art}" x="${size * 0.19}" y="${size * 0.14}" width="${size * 0.62}" height="${size * 0.62}"/>
    <g transform="translate(${size / 2} ${size * 0.88}) rotate(-3)">
      <rect x="${-size * 0.3}" y="${-size * 0.045}" width="${size * 0.6}" height="${size * 0.09}" rx="12" fill="#0D1B2A"/>
      <text x="0" y="${size * 0.018}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${size * 0.045}" fill="#F2F2F2">${label}</text>
    </g>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}
