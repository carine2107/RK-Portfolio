import { locales } from '@/i18n/routing'

export type ResolvedLink = { href: string; external: boolean }

const LOCALE_PREFIX = new RegExp(`^/(${locales.join('|')})(?=/|$|\\?|#)`)

/**
 * Validates the target of a campaign button, entered by hand in the CMS.
 *
 * - `/contact?type=speaking`, `/books/…` → internal page (the language prefix is
 *   added by the site; a typed `/fr/…` prefix is removed so it is never doubled);
 * - `https://…` → external page, opened in a new tab;
 * - anything else (`http://`, `javascript:`, `//host`, spaces) → rejected.
 *
 * Free of `server-only`: also used by the CMS field validation and unit tests.
 */
export function resolveCampaignLink(input: string | null | undefined): ResolvedLink | null {
  const value = (input ?? '').trim()
  if (!value || value.length > 500) return null

  if (value.startsWith('/')) {
    if (value.startsWith('//') || /\s/.test(value)) return null
    const path = value.replace(LOCALE_PREFIX, '') || '/'
    return { href: path.startsWith('/') ? path : `/${path}`, external: false }
  }

  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !url.hostname) return null
    return { href: url.toString(), external: true }
  } catch {
    return null
  }
}
