import type { ReactNode } from 'react'

import { Illustration, type IllustrationName } from '../illustrations/Illustration'
import { Section, type World } from '../sections/Section'

/** Inner-page header: one colour world, a giant title and a short intro. */
export function PageHeader({
  title,
  intro,
  world = 'orange',
  art = 'gear',
  children,
}: {
  title: string
  intro?: ReactNode
  world?: World
  art?: IllustrationName
  children?: ReactNode
}) {
  return (
    <Section world={world} anchor="page-header" gears={false}>
      <div className="container-x relative py-14 sm:py-20">
        <h1 className="display display-xl max-w-[12ch] break-words">{title}</h1>
        {intro ? <div className="mt-5 max-w-2xl text-lg font-medium sm:text-xl">{intro}</div> : null}
        {children}
        <Illustration name={art} className="absolute top-6 right-4 w-20 rotate-12 opacity-90 sm:right-10 sm:w-32" />
      </div>
    </Section>
  )
}
