import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BookingLink } from '@/components/contact/BookingLink'
import { ContactForm } from '@/components/contact/ContactForm'
import { breadcrumbSchema, JsonLd } from '@/components/seo/JsonLd'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { legalSlug, getSiteSettings } from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact.meta' })
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: '/contact',
    title: t('title'),
    description: t('description'),
    image: settings.defaultOgImage,
  })
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('contact')
  const nav = await getTranslations('nav')
  const settings = await getSiteSettings(locale)
  const privacyHref = `/legal/${legalSlug('privacy', locale)}`

  return (
    <>
      <JsonLd
        data={breadcrumbSchema(
          [
            { label: nav('home'), path: '' },
            { label: nav('contact'), path: '/contact' },
          ],
          locale,
        )}
      />

      <PageHeader
        title={t('title')}
        lead={t('lead')}
        crumbs={[{ label: nav('home'), href: '/' }, { label: nav('contact') }]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="rk-rule mb-8 text-2xl">{t('formTitle')}</h2>
            <ContactForm privacyHref={privacyHref} />
          </div>

          <aside className="lg:col-span-5">
            {settings.bookingUrl ? (
              <div className="mb-6 rounded-card border border-line-accent bg-surface-accent p-6">
                <h2 className="text-base font-semibold text-primary">{t('booking.title')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{t('booking.body')}</p>
                <BookingLink
                  url={settings.bookingUrl}
                  label={settings.bookingLabel}
                  location="contact"
                  className="mt-5"
                />
              </div>
            ) : null}

            <div className="rounded-card border border-line bg-surface-subtle p-6">
              <h2 className="text-base font-semibold text-primary">{t('info.title')}</h2>

              <ul className="mt-5 space-y-4 text-sm">
                <li>
                  {settings.email ? (
                    <a
                      href={`mailto:${settings.email}`}
                      className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:text-accent-text hover:underline"
                    >
                      <Icon name="mail" className="size-4 text-accent-text" />
                      {settings.email}
                    </a>
                  ) : (
                    <span className="flex items-start gap-2 text-secondary">
                      <Icon name="mail" className="mt-0.5 size-4 shrink-0" />
                      {t('info.emailPending')}
                    </span>
                  )}
                </li>
                <li>
                  {settings.phone ? (
                    <a
                      href={`tel:${settings.phone.replace(/\s/g, '')}`}
                      className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:text-accent-text hover:underline"
                    >
                      <Icon name="phone" className="size-4 text-accent-text" />
                      {settings.phone}
                    </a>
                  ) : (
                    <span className="flex items-start gap-2 text-secondary">
                      <Icon name="phone" className="mt-0.5 size-4 shrink-0" />
                      {t('info.phonePending')}
                    </span>
                  )}
                </li>
              </ul>

              <dl className="mt-6 space-y-4 border-t border-line pt-6 text-sm">
                <div>
                  <dt className="text-xs tracking-[0.12em] text-secondary uppercase">
                    {t('info.responseTime')}
                  </dt>
                  <dd className="mt-1 text-primary">{t('info.responseTimeValue')}</dd>
                </div>
                {settings.spokenLanguages ? (
                  <div>
                    <dt className="text-xs tracking-[0.12em] text-secondary uppercase">
                      {t('info.languages')}
                    </dt>
                    <dd className="mt-1 text-primary">{settings.spokenLanguages}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {settings.address ? (
              <address className="mt-6 rounded-card border border-line p-6 text-sm whitespace-pre-line text-secondary not-italic">
                {settings.address}
              </address>
            ) : null}
          </aside>
        </div>
      </Section>
    </>
  )
}
