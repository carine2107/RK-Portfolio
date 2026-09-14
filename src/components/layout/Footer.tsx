import { getTranslations } from 'next-intl/server'

import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Link } from '@/i18n/navigation'
import { legalSlug } from '@/lib/cms'
import type { Locale } from '@/i18n/routing'
import type { SiteSettingsView } from '@/lib/types'

import { CONTACT_HREF, NAV_ITEMS } from './nav-items'

const SOCIAL_ICONS: Record<string, IconName> = {
  linkedin: 'linkedin',
  facebook: 'facebook',
  x: 'x',
  youtube: 'youtube',
  instagram: 'instagram',
}

export async function Footer({
  locale,
  settings,
  newsletterEnabled = false,
}: {
  locale: Locale
  settings: SiteSettingsView
  /** Shown only when e-mail delivery is really configured. */
  newsletterEnabled?: boolean
}) {
  const t = await getTranslations('footer')
  const nav = await getTranslations('nav')
  const brand = await getTranslations('brand')
  const legal = await getTranslations('legal')
  const newsletter = await getTranslations('newsletter')

  const legalLinks = (
    [
      ['imprint', legal('imprint')],
      ['privacy', legal('privacy')],
      ['cookies', legal('cookies')],
      ['terms', legal('terms')],
    ] as const
  ).map(([type, label]) => ({ href: `/legal/${legalSlug(type, locale)}`, label }))

  return (
    <footer data-inverse className="bg-contrast text-on-contrast">
      {newsletterEnabled ? (
        <div className="border-b border-line-contrast">
          <div className="rk-container grid gap-6 py-10 md:grid-cols-12 md:items-center md:gap-10">
            <div className="md:col-span-5">
              <p className="font-serif text-xl text-on-contrast">{newsletter('footerTitle')}</p>
              <p className="mt-2 text-sm text-on-contrast-secondary">{newsletter('footerBody')}</p>
            </div>
            <div className="md:col-span-7">
              <NewsletterForm
                tone="contrast"
                source="footer"
                privacyHref={`/legal/${legalSlug('privacy', locale)}`}
              />
            </div>
          </div>
        </div>
      ) : null}
      <div className="rk-container grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <p className="font-serif text-xl tracking-[0.05em] uppercase">{brand('name')}</p>
          <p className="mt-2 text-sm text-on-contrast-secondary">{settings.headline}</p>
          <p
            lang="en"
            className="mt-6 max-w-sm border-l-2 border-accent pl-4 font-serif text-lg leading-snug text-on-contrast"
          >
            {settings.signature}
          </p>

          {settings.social.length > 0 ? (
            <div className="mt-8">
              <p className="text-xs tracking-[0.16em] text-on-contrast-secondary uppercase">
                {t('social')}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {settings.social.map((profile) => (
                  <li key={profile.platform}>
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="inline-flex size-11 items-center justify-center rounded-full border border-line-contrast text-on-contrast transition-colors hover:border-accent hover:text-accent"
                    >
                      <span className="sr-only">{profile.platform}</span>
                      <Icon
                        name={SOCIAL_ICONS[profile.platform] ?? 'external'}
                        className="size-4"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <nav aria-label={nav('footerLabel')} className="md:col-span-3">
          <p className="text-xs tracking-[0.16em] text-on-contrast-secondary uppercase">
            {nav('mainLabel')}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-on-contrast-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  {nav(item.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={CONTACT_HREF}
                className="text-on-contrast-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                {nav('contact')}
              </Link>
            </li>
            <li>
              <Link
                href="/media"
                className="text-on-contrast-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                {nav('media')}
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="text-on-contrast-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                {nav('products')}
              </Link>
            </li>
            <li>
              <Link
                href="/account"
                className="text-on-contrast-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                {nav('account')}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <p className="text-xs tracking-[0.16em] text-on-contrast-secondary uppercase">
            {t('professionalInfo')}
          </p>
          <address className="mt-4 space-y-2 text-sm not-italic text-on-contrast-secondary">
            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 underline-offset-4 hover:text-accent hover:underline"
              >
                <Icon name="mail" className="size-4" />
                {settings.email}
              </a>
            ) : null}
            {settings.phone ? (
              <a
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 underline-offset-4 hover:text-accent hover:underline"
              >
                <Icon name="phone" className="size-4" />
                {settings.phone}
              </a>
            ) : null}
            <p className="whitespace-pre-line">{settings.address || t('addressPending')}</p>
          </address>

          <p className="mt-6 text-xs tracking-[0.16em] text-on-contrast-secondary uppercase">
            {t('legalLinks')}
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-on-contrast-secondary underline-offset-4 transition-colors hover:text-accent hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line-contrast">
        <div className="rk-container flex flex-col items-center justify-between gap-4 py-6 text-xs text-on-contrast-secondary sm:flex-row">
          {settings.creditName ? (
            <p>
              {t.rich('creditLine', {
                name: settings.creditName,
                credit: (chunks) =>
                  settings.creditUrl ? (
                    <a
                      href={settings.creditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 transition-colors hover:text-accent hover:underline"
                    >
                      {chunks}
                    </a>
                  ) : (
                    chunks
                  ),
              })}
            </p>
          ) : (
            <p>{t('copyright', { year: new Date().getFullYear() })}</p>
          )}
          <LanguageSwitcher tone="contrast" />
        </div>
      </div>
    </footer>
  )
}
