import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { breadcrumbSchema, JsonLd, personSchema } from '@/components/seo/JsonLd'
import { buttonClasses } from '@/components/ui/Button'
import { CtaLink } from '@/components/ui/CtaLink'
import { ExpertProfileButton } from '@/components/ui/ExpertProfileButton'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { PlaceholderBadge } from '@/components/ui/Notices'
import { Portrait } from '@/components/ui/Portrait'
import { RichText, richTextToPlainText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { TrackedDownload } from '@/components/ui/TrackedDownload'
import type { Locale } from '@/i18n/routing'
import { getAboutContent, getCredentials, getSiteSettings } from '@/lib/cms'
import { metaDescription, pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  const content = await getAboutContent(locale)
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: '/about',
    title: content.seo.title ?? t('meta.title'),
    description:
      content.seo.description ??
      metaDescription(richTextToPlainText(content.biography) || t('meta.description')),
    image: content.seo.image ?? settings.defaultOgImage,
    type: 'profile',
  })
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('about')
  const nav = await getTranslations('nav')
  const hero = await getTranslations('home.hero')
  const common = await getTranslations('common')
  const [content, credentials, settings] = await Promise.all([
    getAboutContent(locale),
    getCredentials(locale),
    getSiteSettings(locale),
  ])

  const education = credentials.filter((entry) => entry.kind === 'education')
  const professional = credentials.filter((entry) => entry.kind === 'credential')

  return (
    <>
      <JsonLd
        data={[
          personSchema(settings, locale),
          breadcrumbSchema(
            [
              { label: nav('home'), path: '' },
              { label: nav('about'), path: '/about' },
            ],
            locale,
          ),
        ]}
      />

      <PageHeader
        title={t('title')}
        lead={content.lead}
        crumbs={[{ label: nav('home'), href: '/' }, { label: nav('about') }]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <article aria-labelledby="about-biography">
              <h2 id="about-biography" className="rk-rule text-2xl md:text-3xl">
                {t('biography')}
              </h2>
              <RichText content={content.biography} className="mt-5" />
            </article>

            <article aria-labelledby="about-career" className="mt-14">
              <h2 id="about-career" className="rk-rule text-2xl md:text-3xl">
                {t('career')}
              </h2>
              <RichText content={content.career} className="mt-5" />
            </article>

            <article aria-labelledby="about-vision" className="mt-14">
              <h2 id="about-vision" className="rk-rule text-2xl md:text-3xl">
                {t('vision')}
              </h2>
              <RichText content={content.vision} className="mt-5" />
            </article>

            {content.values.length > 0 ? (
              <article aria-labelledby="about-values" className="mt-14">
                <h2 id="about-values" className="rk-rule text-2xl md:text-3xl">
                  {t('approach')}
                </h2>
                <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                  {content.values.map((value) => (
                    <li
                      key={value.title}
                      className="rounded-card border border-line bg-surface-raised p-5"
                    >
                      <h3 className="text-base font-semibold text-primary">{value.title}</h3>
                      {value.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-secondary">
                          {value.description}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}
          </div>

          <aside className="lg:col-span-5">
            <Portrait
              image={content.portrait}
              alt={hero('portraitAlt')}
              placeholderLabel={hero('portraitPlaceholder')}
              className="mb-10 max-w-sm"
              sizes="(min-width: 1024px) 24rem, 90vw"
            />

            <div className="rounded-card border border-line bg-surface-subtle p-6">
              <h2 className="text-base font-semibold text-primary">{t('profileCta.title')}</h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{t('profileCta.body')}</p>
              <div className="mt-5 flex flex-col gap-3">
                <ExpertProfileButton
                  url={settings.expertProfileUrl}
                  variant="primary"
                  location="about"
                />
                {/* Shown only once the CV has been uploaded to the CMS. */}
                {settings.cvUrl ? (
                  <TrackedDownload
                    href={settings.cvUrl}
                    event="cv_download"
                    payload={{ location: 'about' }}
                    className={buttonClasses('secondary')}
                  >
                    <Icon name="download" className="size-4" />
                    {common('downloadCv')}
                  </TrackedDownload>
                ) : null}
                <CtaLink
                  href="/contact"
                  event="work_with_me_click"
                  location="about"
                  variant="secondary"
                >
                  {nav('workWithMe')}
                  <Icon name="arrow" className="size-4" />
                </CtaLink>
              </div>
            </div>

            {education.length > 0 ? (
              <section aria-labelledby="about-education" className="mt-10">
                <h2
                  id="about-education"
                  className="text-sm tracking-[0.14em] text-secondary uppercase"
                >
                  {t('education')}
                </h2>
                <ul className="mt-4 space-y-4">
                  {education.map((entry) => (
                    <li key={entry.id} className="border-l-2 border-line-accent pl-4">
                      <p className="text-base text-primary">{entry.title}</p>
                      <p className="text-sm text-secondary">
                        {entry.institution}
                        {entry.year ? ` · ${entry.year}` : ''}
                      </p>
                      {entry.isPlaceholder ? (
                        <span className="mt-2 inline-block">
                          <PlaceholderBadge />
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {professional.length > 0 ? (
              <section aria-labelledby="about-credentials" className="mt-10">
                <h2
                  id="about-credentials"
                  className="text-sm tracking-[0.14em] text-secondary uppercase"
                >
                  {t('credentials')}
                </h2>
                <ul className="mt-4 space-y-4">
                  {professional.map((entry) => (
                    <li key={entry.id} className="border-l-2 border-line-accent pl-4">
                      <p className="text-base text-primary">{entry.title}</p>
                      <p className="text-sm text-secondary">
                        {entry.institution}
                        {entry.year ? ` · ${entry.year}` : ''}
                      </p>
                      {entry.isPlaceholder ? (
                        <span className="mt-2 inline-block">
                          <PlaceholderBadge />
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {content.languages.length > 0 ? (
              <section aria-labelledby="about-languages" className="mt-10">
                <h2
                  id="about-languages"
                  className="text-sm tracking-[0.14em] text-secondary uppercase"
                >
                  {t('languages')}
                </h2>
                <dl className="mt-4 space-y-2 text-sm">
                  {content.languages.map((entry) => (
                    <div key={entry.language} className="flex justify-between gap-4">
                      <dt className="text-primary">{entry.language}</dt>
                      <dd className="text-secondary">{entry.level}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {content.regions.length > 0 ? (
              <section aria-labelledby="about-regions" className="mt-10">
                <h2
                  id="about-regions"
                  className="text-sm tracking-[0.14em] text-secondary uppercase"
                >
                  {t('regions')}
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {content.regions.map((region) => (
                    <li
                      key={region}
                      className="rounded-full border border-line px-3 py-1 text-sm text-primary"
                    >
                      {region}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        </div>
      </Section>
    </>
  )
}
