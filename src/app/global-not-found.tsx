import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { NotFoundContent } from '@/components/layout/NotFoundContent'
import { ThemeScript } from '@/components/theme/ThemeScript'
import { isLocale, defaultLocale, type Locale } from '@/i18n/routing'
import { getAppearance, getSiteSettings } from '@/lib/cms'
import { emailReady } from '@/lib/email-layout'
import { analyticsConfig, analyticsEnabled, siteUrl } from '@/lib/env'

import { fontVariables } from './(frontend)/fonts'
import './(frontend)/globals.css'

/**
 * 404 for any URL that matches no route (e.g. /fr/page-that-does-not-exist).
 *
 * The site's root layout lives in the dynamic `[locale]` segment, so a missing
 * page could only be rendered by the framework as an empty shell completed by
 * JavaScript. This page is rendered on the server instead, as a complete
 * document in the visitor's language (read from the locale negotiated by the
 * proxy), with the site header and footer.
 */
async function currentLocale(): Promise<Locale> {
  const locale = await getLocale()
  return isLocale(locale) ? locale : defaultLocale
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale()
  const t = await getTranslations({ locale, namespace: 'notFound' })
  const brand = await getTranslations({ locale, namespace: 'brand' })
  return {
    metadataBase: new URL(siteUrl),
    title: `${t('title')} · ${brand('name')}`,
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/apple-icon.png' }],
    },
  }
}

export default async function GlobalNotFound() {
  const locale = await currentLocale()
  const settings = await getSiteSettings(locale)
  const appearance = await getAppearance()
  const t = await getTranslations({ locale, namespace: 'common' })

  return (
    <html lang={locale} suppressHydrationWarning className={fontVariables}>
      <head>
        <ThemeScript />
        {appearance.css ? (
          <style id="rk-appearance" dangerouslySetInnerHTML={{ __html: appearance.css }} />
        ) : null}
      </head>
      <body className="flex min-h-dvh flex-col bg-surface text-primary antialiased">
        <NextIntlClientProvider>
          <a
            href="#main-content"
            className="sr-only rounded-full bg-surface-inverse px-5 py-3 text-sm text-inverse focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100"
          >
            {t('skipToContent')}
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            <NotFoundContent />
          </main>
          <Footer
            locale={locale}
            settings={settings}
            newsletterEnabled={emailReady()}
            consentSettings={analyticsConfig.provider === 'google' && analyticsEnabled}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
