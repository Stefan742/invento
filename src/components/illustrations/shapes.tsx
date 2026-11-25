/* Placeholder INVENTO illustrations (docs/04): flat palette fills, thick rounded outlines.
 * Outline colour comes from `--ink` (navy by default, paper on navy sections).
 * Replace with real art by dropping files into /public/art (see ASSETS_NEEDED.md). */
import type { SVGProps } from 'react'

export const INK = 'var(--ink, #0D1B2A)'
const C = {
  navy: '#0D1B2A',
  navy2: '#1E3550',
  orange: '#FF7A00',
  orangeDeep: '#E06400',
  yellow: '#FFD166',
  teal: '#00B4DB',
  paper: '#F2F2F2',
  wood: '#E9B872',
  woodDark: '#C98E45',
}

type P = SVGProps<SVGSVGElement>
const sw = 7 // ≈3.5px at the default render size

const base = (viewBox: string, props: P) => ({
  viewBox,
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
})

/** Gear path with n teeth, deterministic. */
export function gearPath(cx: number, cy: number, rOuter: number, rInner: number, teeth: number) {
  const pts: string[] = []
  const step = (Math.PI * 2) / teeth
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const corners = [
      [a - step * 0.25, rInner],
      [a - step * 0.15, rOuter],
      [a + step * 0.15, rOuter],
      [a + step * 0.25, rInner],
    ]
    for (const [ang, r] of corners) {
      pts.push(`${(cx + r * Math.cos(ang)).toFixed(2)},${(cy + r * Math.sin(ang)).toFixed(2)}`)
    }
  }
  return `M${pts.join(' L')} Z`
}

export function Gear({ fill = C.yellow, teeth = 10, ...props }: P & { fill?: string; teeth?: number }) {
  return (
    <svg {...base('0 0 200 200', props)}>
      <path d={gearPath(100, 100, 88, 70, teeth)} fill={fill} stroke={INK} strokeWidth={sw} />
      <circle cx="100" cy="100" r="26" fill={C.paper} stroke={INK} strokeWidth={sw} />
      <circle cx="100" cy="100" r="8" fill={INK} />
    </svg>
  )
}

export function Marble(props: P) {
  return (
    <svg {...base('0 0 100 100', props)}>
      <circle cx="50" cy="50" r="42" fill={C.orange} stroke={INK} strokeWidth={sw} />
      <ellipse cx="36" cy="34" rx="12" ry="8" fill={C.paper} opacity="0.85" transform="rotate(-30 36 34)" />
    </svg>
  )
}

export function Rocket(props: P) {
  return (
    <svg {...base('0 0 200 200', props)}>
      <g transform="rotate(35 100 100)">
        <path d="M100 168 C 86 186, 92 196, 100 200 C 108 196, 114 186, 100 168 Z" fill={C.orange} stroke={INK} strokeWidth={sw - 2} />
        <path d="M72 120 L48 156 L76 150 Z" fill={C.teal} stroke={INK} strokeWidth={sw} />
        <path d="M128 120 L152 156 L124 150 Z" fill={C.teal} stroke={INK} strokeWidth={sw} />
        <path d="M100 12 C 140 44, 138 120, 124 162 L 76 162 C 62 120, 60 44, 100 12 Z" fill={C.paper} stroke={INK} strokeWidth={sw} />
        <path d="M100 12 C 116 25, 124 40, 128 56 L 72 56 C 76 40, 84 25, 100 12 Z" fill={C.orange} stroke={INK} strokeWidth={sw} />
        <circle cx="100" cy="94" r="17" fill={C.teal} stroke={INK} strokeWidth={sw} />
      </g>
    </svg>
  )
}

export function Bulb(props: P) {
  return (
    <svg {...base('0 0 200 200', props)}>
      <g stroke={C.yellow} strokeWidth={sw}>
        <path d="M100 8 V24" />
        <path d="M34 36 L46 48" />
        <path d="M166 36 L154 48" />
        <path d="M12 96 H28" />
        <path d="M172 96 H188" />
      </g>
      <path d="M100 34 C 62 34, 46 62, 50 88 C 54 112, 76 120, 78 146 L 122 146 C 124 120, 146 112, 150 88 C 154 62, 138 34, 100 34 Z" fill={C.yellow} stroke={INK} strokeWidth={sw} />
      <path d="M86 146 L86 118 L100 104 L114 118 L114 146" stroke={INK} strokeWidth={sw - 2} />
      <rect x="76" y="146" width="48" height="16" rx="6" fill={C.teal} stroke={INK} strokeWidth={sw} />
      <rect x="80" y="162" width="40" height="14" rx="6" fill={C.teal} stroke={INK} strokeWidth={sw} />
      <path d="M90 176 H110 L104 188 H96 Z" fill={INK} stroke={INK} strokeWidth={sw - 3} />
    </svg>
  )
}

export function Wrench(props: P) {
  return (
    <svg {...base('0 0 200 200', props)}>
      <path
        d="M146 22 C 122 14, 98 32, 104 58 L 30 132 C 20 142, 20 158, 30 168 C 40 178, 56 178, 66 168 L 140 94 C 166 100, 184 76, 176 52 L 156 72 L 134 66 L 128 44 Z"
        fill={C.teal}
        stroke={INK}
        strokeWidth={sw}
      />
      <circle cx="48" cy="150" r="8" fill={C.paper} stroke={INK} strokeWidth={sw - 3} />
    </svg>
  )
}

export function Bolt(props: P) {
  return (
    <svg {...base('0 0 200 200', props)}>
      <path d="M62 30 L138 30 L156 60 L138 90 L62 90 L44 60 Z" fill={C.paper} stroke={INK} strokeWidth={sw} />
      <path d="M100 42 V78" stroke={INK} strokeWidth={sw - 2} />
      <rect x="80" y="90" width="40" height="92" rx="6" fill={C.paper} stroke={INK} strokeWidth={sw} />
      <path d="M80 108 L120 116 M80 126 L120 134 M80 144 L120 152 M80 162 L120 170" stroke={INK} strokeWidth={sw - 3} />
    </svg>
  )
}

export function Nut(props: P) {
  return (
    <svg {...base('0 0 200 200', props)}>
      <path d="M58 28 L142 28 L184 100 L142 172 L58 172 L16 100 Z" fill={C.paper} stroke={INK} strokeWidth={sw} />
      <circle cx="100" cy="100" r="34" fill={C.navy2} stroke={INK} strokeWidth={sw} />
    </svg>
  )
}

export function Spring(props: P) {
  return (
    <svg {...base('0 0 200 200', props)}>
      <path
        d="M40 30 H160 L40 60 L160 90 L40 120 L160 150 L40 170 H160"
        stroke={INK}
        strokeWidth={sw + 6}
      />
      <path d="M40 30 H160 L40 60 L160 90 L40 120 L160 150 L40 170 H160" stroke={C.teal} strokeWidth={sw - 2} />
    </svg>
  )
}

export function Peg(props: P) {
  return (
    <svg {...base('0 0 200 200', props)}>
      <rect x="70" y="16" width="60" height="168" rx="30" fill={C.wood} stroke={INK} strokeWidth={sw} />
      <path d="M70 60 H130 M70 140 H130" stroke={C.woodDark} strokeWidth={sw - 2} />
    </svg>
  )
}

export function Catapult(props: P) {
  return (
    <svg {...base('0 0 240 200', props)}>
      <rect x="20" y="150" width="200" height="26" rx="8" fill={C.wood} stroke={INK} strokeWidth={sw} />
      <circle cx="50" cy="182" r="14" fill={C.navy2} stroke={INK} strokeWidth={sw} />
      <circle cx="190" cy="182" r="14" fill={C.navy2} stroke={INK} strokeWidth={sw} />
      <path d="M100 150 L120 98 L140 150" fill={C.woodDark} stroke={INK} strokeWidth={sw} />
      <g transform="rotate(-18 120 100)">
        <rect x="30" y="92" width="180" height="16" rx="8" fill={C.wood} stroke={INK} strokeWidth={sw} />
        <path d="M176 92 C 176 66, 214 66, 214 92 Z" fill={C.orange} stroke={INK} strokeWidth={sw} />
        <circle cx="195" cy="70" r="14" fill={C.orange} stroke={INK} strokeWidth={sw} />
      </g>
      <circle cx="120" cy="100" r="6" fill={INK} />
    </svg>
  )
}

/**
 * The INVENTO box: navy outside, orange inside.
 * Groups carry data-part attributes so M4 motion can animate the lid on its hinge.
 */
export function Box({ open = true, ...props }: P & { open?: boolean }) {
  return (
    <svg {...base('0 0 400 380', props)}>
      {/* lid, open: stands up behind the opening, orange underside visible */}
      <g data-part="lid-open" style={{ transformOrigin: '200px 130px', opacity: open ? 1 : 0 }}>
        <path d="M96 130 L304 130 L328 34 L72 34 Z" fill={C.orange} stroke={INK} strokeWidth={sw} />
        <path d="M110 120 L290 120 L308 46 L92 46 Z" fill={C.orangeDeep} opacity="0.55" />
        <path d="M72 34 L328 34 L330 20 L70 20 Z" fill={C.navy2} stroke={INK} strokeWidth={sw} />
      </g>
      {/* inside of the box */}
      <g data-part="inside">
        <path d="M58 186 L342 186 L304 130 L96 130 Z" fill={C.orange} stroke={INK} strokeWidth={sw} />
        <path d="M96 130 L304 130 L292 150 L108 150 Z" fill={C.orangeDeep} opacity="0.6" />
      </g>
      {/* base: front face */}
      <g data-part="base">
        <rect x="58" y="186" width="284" height="170" rx="10" fill={C.navy2} stroke={INK} strokeWidth={sw} />
        <path d="M58 214 H342" stroke={C.orange} strokeWidth="4" opacity="0.9" />
        <path d={gearPath(200, 284, 40, 31, 9)} fill="none" stroke={C.orange} strokeWidth="5" />
        <circle cx="200" cy="284" r="11" fill="none" stroke={C.orange} strokeWidth="5" />
      </g>
      {/* lid, closed: sits on top of the opening */}
      <g data-part="lid-closed" style={{ opacity: open ? 0 : 1 }}>
        <path d="M50 192 L350 192 L310 124 L90 124 Z" fill={C.navy2} stroke={INK} strokeWidth={sw} />
        <path d="M50 192 L350 192 L350 206 L50 206 Z" fill={C.navy} stroke={INK} strokeWidth={sw} />
      </g>
    </svg>
  )
}

/** Soft background circle cluster used by section colour worlds. */
export function SoftCircles({ color = '#000', ...props }: P & { color?: string }) {
  return (
    <svg {...base('0 0 1000 1000', props)} aria-hidden="true">
      <circle cx="180" cy="220" r="260" fill={color} opacity="0.08" />
      <circle cx="860" cy="760" r="320" fill={color} opacity="0.07" />
      <circle cx="760" cy="140" r="120" fill={color} opacity="0.06" />
    </svg>
  )
}
