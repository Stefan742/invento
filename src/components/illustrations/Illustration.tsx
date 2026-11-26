import type { CSSProperties, ReactElement, SVGProps } from 'react'

import { ART_OVERRIDES } from './overrides'
import { Bolt, Box, Bulb, Catapult, Gear, LogoMark, Marble, Nut, Peg, Rocket, Spring, Wrench } from './shapes'

export const ILLUSTRATIONS = {
  logo: LogoMark,
  box: Box,
  'box-closed': (p: SVGProps<SVGSVGElement>) => <Box open={false} {...p} />,
  gear: Gear,
  'gear-orange': (p: SVGProps<SVGSVGElement>) => <Gear fill="#FF7A00" {...p} />,
  'gear-teal': (p: SVGProps<SVGSVGElement>) => <Gear fill="#00B4DB" teeth={8} {...p} />,
  rocket: Rocket,
  bulb: Bulb,
  wrench: Wrench,
  bolt: Bolt,
  nut: Nut,
  spring: Spring,
  peg: Peg,
  catapult: Catapult,
  marble: Marble,
} as const

export type IllustrationName = keyof typeof ILLUSTRATIONS

type Props = {
  name: IllustrationName
  className?: string
  style?: CSSProperties
  /** Decorative by default. Pass a label only when the image carries meaning. */
  label?: string
}

/**
 * Single entry point for all brand illustrations.
 * If `/public/art/<name>.svg` is registered in ART_OVERRIDES, that file is used instead
 * of the built-in placeholder, so the owner's real art can replace it without code changes.
 */
export function Illustration({ name, className, style, label }: Props) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const }
  const override = ART_OVERRIDES[name]
  if (override) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={override} alt={label ?? ''} className={className} style={style} {...(label ? {} : { 'aria-hidden': true })} />
  }
  const Cmp = ILLUSTRATIONS[name] as (p: SVGProps<SVGSVGElement>) => ReactElement
  return <Cmp className={className} style={style} focusable="false" {...a11y} />
}
