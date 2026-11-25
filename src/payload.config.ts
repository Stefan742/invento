import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Builds } from './collections/Builds'
import { FAQs } from './collections/FAQs'
import { Kits } from './collections/Kits'
import { MAX_UPLOAD_BYTES, Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { HomePage } from './globals/HomePage'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || '',
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · INVENTO admin' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  // Collection order defines the order inside each admin nav group.
  collections: [Kits, Orders, Pages, FAQs, Testimonials, Builds, Media, Users],
  globals: [HomePage, SiteSettings],
  localization: {
    locales: [
      { code: 'mk', label: 'Македонски' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'mk',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
    // Dev uses schema push; production must run `pnpm migrate`.
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  upload: {
    limits: { fileSize: MAX_UPLOAD_BYTES },
  },
  graphQL: { disable: true },
  cors: [process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
  sharp,
  plugins: [],
})
