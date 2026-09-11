import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Source_Serif_4 } from 'next/font/google'
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
import { getAppearance, getContentSource, getSiteSettings } from '@/lib/cms'
import { isProduction, siteUrl } from '@/lib/env'

import '../globals.css'

const display = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600'],
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

/** Alternative heading font (Appearance global). Not preloaded: only downloaded when used. */
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600'],
  preload: false,
})

export function generateStaticParams() {
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
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${playfair.variable}`}
    >
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
          <Footer locale={locale as Locale} settings={settings} />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
