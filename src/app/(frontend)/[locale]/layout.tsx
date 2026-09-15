import type { Metadata, Viewport } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { Analytics } from '@/components/analytics/Analytics'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ThemeScript } from '@/components/theme/ThemeScript'
import { Notice } from '@/components/ui/Notices'
import { locales, routing, type Locale } from '@/i18n/routing'
import { getAppearance, getCms, getContentSource, getSiteSettings } from '@/lib/cms'
import { emailReady } from '@/lib/email-layout'
import { analyticsConfig, analyticsEnabled } from '@/lib/env'
import { cmsEnabled, isProduction, siteUrl } from '@/lib/env'

import { fontVariables } from '../fonts'
import '../globals.css'

/**
 * Pages are pre-rendered at build time only when the CMS can be reached. A
 * build without the database (Docker image) pre-renders nothing: pages are
 * then rendered from the CMS on their first request and cached — never baked
 * with the built-in starter content.
 */
export async function generateStaticParams() {
  if (cmsEnabled && !(await getCms())) {
    console.warn('[build] CMS unreachable: pages will be rendered on their first request.')
    return []
  }
  return locales.map((locale) => ({ locale }))
}

export async function generateViewport(): Promise<Viewport> {
  const { themeColors } = await getAppearance()
  return {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: themeColors.light },
      { media: '(prefers-color-scheme: dark)', color: themeColors.dark },
    ],
    width: 'device-width',
    initialScale: 1,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'brand' })

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${t('name')} — ${t('headline')}`,
      template: `%s · ${t('name')}`,
    },
    applicationName: t('name'),
    authors: [{ name: t('name') }],
    creator: t('name'),
    robots: { index: true, follow: true },
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/apple-icon.png' }],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  const settings = await getSiteSettings(locale as Locale)
  const appearance = await getAppearance()
  const contentSource = await getContentSource()
  const t = await getTranslations({ locale, namespace: 'common' })
  const cms = await getTranslations({ locale, namespace: 'cms' })

  return (
    <html lang={locale} suppressHydrationWarning className={fontVariables}>
      <head>
        <ThemeScript />
        {/* Colours and fonts chosen in the CMS (Appearance). Generated from
            validated hex values only — see src/lib/theme.ts. */}
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
          {/* Visible warning when the site falls back to its built-in starter
              content — outside production, where a server warning is logged. */}
          {contentSource === 'starter' && !isProduction ? (
            <div className="rk-container pt-4">
              <Notice tone="warning" role="status">
                {cms('fallbackNotice')}
              </Notice>
            </div>
          ) : null}
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer
            locale={locale as Locale}
            settings={settings}
            newsletterEnabled={emailReady()}
            consentSettings={analyticsConfig.provider === 'google' && analyticsEnabled}
          />
          <Analytics locale={locale as Locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
