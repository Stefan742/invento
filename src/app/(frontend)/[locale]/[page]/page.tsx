import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { PageHeader } from '@/components/layout/PageHeader'
import { PAGE_SLUGS, type PageSlug } from '@/collections/Pages'
import type { Locale } from '@/i18n/routing'
import { getPage } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale; page: string }> }

const isPageSlug = (s: string): s is PageSlug => (PAGE_SLUGS as readonly string[]).includes(s)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page } = await params
  if (!isPageSlug(page)) return {}
  const doc = await getPage(page, locale)
  if (!doc) return {}
  return buildMetadata({
    locale,
    path: `/${page}`,
    title: doc.seo?.title || doc.title,
    description: doc.seo?.description,
  })
}

/** About + policy pages (shipping, returns, privacy, terms), all edited in the CMS. */
export default async function CmsPage({ params }: Props) {
  const { locale, page } = await params
  setRequestLocale(locale)
  if (!isPageSlug(page)) notFound()
  const doc = await getPage(page, locale)
  if (!doc) notFound()

  return (
    <main id="main">
      <PageHeader title={doc.title} world={page === 'about' ? 'orange' : 'teal'} art={page === 'about' ? 'box' : 'wrench'} />
      <section className="bg-paper text-navy">
        <div className="container-x py-16 sm:py-20">
          <article className="prose-invento text-lg">{doc.content ? <RichText data={doc.content} /> : null}</article>
        </div>
      </section>
    </main>
  )
}
