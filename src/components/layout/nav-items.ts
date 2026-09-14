/**
 * Route segments are kept identical in every language (only the locale prefix
 * changes: `/fr/expertise`, `/de/expertise`, `/en/expertise`). Slugs of CMS
 * entries are translated; the section paths are not, so that shared links keep
 * working when a visitor switches language.
 */
export const NAV_ITEMS = [
  { key: 'about', href: '/about' },
  { key: 'expertise', href: '/expertise' },
  { key: 'experience', href: '/experience' },
  { key: 'insights', href: '/insights' },
  { key: 'books', href: '/books' },
  { key: 'businesses', href: '/businesses' },
  { key: 'speaking', href: '/speaking' },
] as const

export type NavItem = (typeof NAV_ITEMS)[number]

export const CONTACT_HREF = '/contact'
