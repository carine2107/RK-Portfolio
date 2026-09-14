import Script from 'next/script'

import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import type { Locale } from '@/i18n/routing'
import { legalSlug } from '@/lib/cms'
import { analyticsConfig, analyticsEnabled, googleAnalyticsId } from '@/lib/env'

/**
 * Loads the configured analytics, or nothing at all.
 * - Umami and Plausible are cookieless and store no personal data: no banner.
 * - Google Analytics sets cookies: it waits for the visitor's consent, given
 *   in a banner (see GoogleAnalytics.tsx).
 */
export function Analytics({ locale }: { locale: Locale }) {
  if (!analyticsEnabled) return null

  if (analyticsConfig.provider === 'google') {
    return (
      <GoogleAnalytics
        measurementId={googleAnalyticsId}
        cookiesHref={`/legal/${legalSlug('cookies', locale)}`}
      />
    )
  }

  if (analyticsConfig.provider === 'umami') {
    return (
      <Script
        src={analyticsConfig.scriptUrl}
        data-website-id={analyticsConfig.siteId}
        strategy="afterInteractive"
        defer
      />
    )
  }

  if (analyticsConfig.provider === 'plausible') {
    return (
      <Script
        src={analyticsConfig.scriptUrl}
        data-domain={analyticsConfig.siteId}
        strategy="afterInteractive"
        defer
      />
    )
  }

  return null
}
