import Script from 'next/script'

import { analyticsConfig, analyticsEnabled } from '@/lib/env'

/**
 * Loads the configured privacy-friendly analytics script, or nothing at all.
 * Both supported providers are cookieless and do not store personal data,
 * which is why no consent banner is displayed by default.
 */
export function Analytics() {
  if (!analyticsEnabled) return null

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
