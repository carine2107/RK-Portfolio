import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Books } from './payload/collections/Books'
import { Businesses } from './payload/collections/Businesses'
import { Engagements } from './payload/collections/Engagements'
import { Campaigns } from './payload/collections/Campaigns'
import { ContactSubmissions } from './payload/collections/ContactSubmissions'
import { Subscribers } from './payload/collections/Subscribers'
import { Orders } from './payload/collections/Orders'
import { Products } from './payload/collections/Products'
import { ProtectedFiles } from './payload/collections/ProtectedFiles'
import { Members } from './payload/collections/Members'
import { Entitlements } from './payload/collections/Entitlements'
import { Credentials } from './payload/collections/Credentials'
import { Documents } from './payload/collections/Documents'
import { ExpertiseAreas } from './payload/collections/ExpertiseAreas'
import { Experiences } from './payload/collections/Experiences'
import { Categories, Insights } from './payload/collections/Insights'
import { LegalPages } from './payload/collections/LegalPages'
import { Media } from './payload/collections/Media'
import { Users } from './payload/collections/Users'
import { AboutPage } from './payload/globals/AboutPage'
import { HomePage } from './payload/globals/HomePage'
import { Appearance } from './payload/globals/Appearance'
import { ShopSettings } from './payload/globals/ShopSettings'
import { SiteSettings } from './payload/globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const secret = process.env.PAYLOAD_SECRET ?? ''

// Checked when the server starts, not during `next build`: an image can be
// built without secrets (Docker) and receives them at run time.
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  if (!secret || secret === 'change-me-in-every-environment' || secret.length < 32) {
    throw new Error(
      'PAYLOAD_SECRET is missing, too short or still the default value. Set a unique 32+ character secret before starting the production server.',
    )
  }
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  routes: {
    // The CMS REST API lives under /api/cms so that the public API routes
    // (/api/contact) stay independent of Payload.
    api: '/api/cms',
  },
  /**
   * Language of the **administration interface** — distinct from the content
   * locales below. French by default; each user can switch it in their account.
   */
  i18n: {
    supportedLanguages: { fr, de, en },
    fallbackLanguage: 'fr',
  },
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    // Built-in avatar: Gravatar would send a hash of the user's e-mail to a
    // third party and is blocked by the Content-Security-Policy anyway.
    avatar: 'default',
    // Romial Kenmogne monogram on the login screen and in the navigation.
    components: {
      graphics: {
        Logo: '/payload/components/AdminGraphics#AdminLogo',
        Icon: '/payload/components/AdminGraphics#AdminIcon',
      },
    },
    meta: {
      titleSuffix: ' · RK CMS',
      robots: 'noindex, nofollow',
    },
  },
  collections: [
    ExpertiseAreas,
    Experiences,
    Insights,
    Categories,
    Books,
    Businesses,
    Engagements,
    Campaigns,
    Credentials,
    LegalPages,
    Media,
    Documents,
    ContactSubmissions,
    Subscribers,
    Orders,
    Products,
    ProtectedFiles,
    Members,
    Entitlements,
    Users,
  ],
  globals: [SiteSettings, Appearance, ShopSettings, HomePage, AboutPage],
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Français', code: 'fr' },
      { label: 'Deutsch', code: 'de' },
    ],
    defaultLocale: 'en',
    // A missing translation falls back to English instead of rendering nothing.
    fallback: true,
  },
  editor: lexicalEditor({}),
  secret,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI ?? '' },
    // Development: the schema follows the code automatically. Production: no
    // push; the versioned migrations (src/migrations) are applied with
    // `npm run migrate` before start-up (done by the production container).
    // Not `prodMigrations`: on a database created in dev mode Payload would ask
    // an interactive question at start-up and exit.
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  graphQL: { disable: true },
  upload: { limits: { fileSize: 10_000_000 } },
  cors: process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : [],
  csrf: process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : [],
})
