import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { MediaLibrary } from '@/components/speaking/MediaLibrary'
import { Icon } from '@/components/ui/Icon'
import { EmptyState, PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getEngagements, getSiteSettings } from '@/lib/cms'
import { isMediaEntry } from '@/lib/media-library'
import { pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'media.meta' })
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: '/media',
    title: t('title'),
    description: t('description'),
    image: settings.defaultOgImage,
  })
}

/** Media library: videos, podcasts, interviews and press, drawn from Speaking & Media. */
export default async function MediaPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('media')
  const nav = await getTranslations('nav')
  const now = new Date().toISOString()
  const entries = (await getEngagements(locale))
    .filter((entry) => isMediaEntry(entry, now))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: nav('speaking'), path: '/speaking' },
            { label: t('title'), path: '/media' },
          ],
          locale,
        )}
      />

      <PageHeader
        title={t('title')}
        lead={t('lead')}
        crumbs={[
          { label: nav('home'), href: '/' },
          { label: nav('speaking'), href: '/speaking' },
          { label: t('title') },
        ]}
      />

      <Section>
        {entries.length === 0 ? (
          <EmptyState message={t('empty')} />
        ) : (
          <MediaLibrary entries={entries} locale={locale} />
        )}

        <p className="mt-12">
          <Link
            href="/speaking"
            className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:text-accent-text hover:underline"
          >
            <Icon name="arrow" className="size-4 rotate-180" />
            {t('back')}
          </Link>
        </p>
      </Section>
    </>
  )
}
