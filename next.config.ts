import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/**
 * Content-Security-Policy.
 * `unsafe-inline` on styles is required by Next.js' inlined critical CSS.
 * The Payload admin UI (route group `(payload)`) needs `unsafe-eval` in development only.
 */
const isDev = process.env.NODE_ENV === 'development'

/**
 * When a self-hosted analytics script is configured, its origin is added to
 * `script-src` and `connect-src` — and to nothing else.
 */
function analyticsOrigin(): string {
  const url = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL
  if (!url) return ''
  try {
    return ` ${new URL(url).origin}`
  } catch {
    return ''
  }
}

const analytics = analyticsOrigin()

/**
 * Google Analytics 4 (`NEXT_PUBLIC_ANALYTICS_PROVIDER=google`): its script and
 * collection endpoints are allowed only when it is configured. The script
 * itself is injected only after the visitor's consent.
 */
const googleAnalytics = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER === 'google'
const gaScript = googleAnalytics ? ' https://www.googletagmanager.com' : ''
const gaConnect = googleAnalytics
  ? ' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com'
  : ''
const gaImages = googleAnalytics
  ? ' https://*.google-analytics.com https://www.googletagmanager.com'
  : ''

/**
 * `upgrade-insecure-requests` is only meaningful once the site is served over
 * HTTPS. Sending it on a plain-HTTP origin (local development, staging without
 * TLS) makes WebKit upgrade every asset request and fail with an SSL error.
 */
const servesHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://')

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}${analytics}${gaScript}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${gaImages}`,
  "font-src 'self' data:",
  // Video players, loaded only after the visitor clicks "Play" (src/lib/video.ts).
  'frame-src https://www.youtube-nocookie.com https://player.vimeo.com',
  "connect-src 'self'" + analytics + gaConnect + (isDev ? ' ws: http://localhost:*' : ''),
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(servesHttps ? ['upgrade-insecure-requests'] : []),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // The admin panel and preview routes must never be indexed.
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      // Draft previews must never be indexed either.
      {
        source: '/api/preview/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
  async redirects() {
    return [
      // Documented redirects: legacy/non-localised paths -> default locale.
      { source: '/home', destination: '/', permanent: true },
    ]
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
