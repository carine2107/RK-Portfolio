import createMiddleware from 'next-intl/middleware'

import { routing } from '@/i18n/routing'

/**
 * Locale negotiation: redirects `/` to the visitor's language and keeps the
 * chosen locale in a cookie. (`proxy` is the Next.js 16 name of what used to be
 * called `middleware`.)
 */
export default createMiddleware(routing)

export const config = {
  /**
   * Runs on every public page, but never on the CMS admin, the API routes,
   * Next internals, or paths with a file extension (media, sitemap, icons…).
   */
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
