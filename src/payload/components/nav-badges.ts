/**
 * Counters shown next to "Contact requests" and "Newsletter subscribers" in the
 * admin navigation. Pure helpers, unit-tested; the component is NavBadges.tsx.
 */

export const NAV_BADGE_ATTRIBUTE = 'data-rk-badge'

/** Ids Payload gives to the navigation links of these collections. */
export const NAV_LINK_IDS = {
  contact: 'nav-contact-submissions',
  subscribers: 'nav-subscribers',
} as const

/** Per-user preference holding when the subscribers list was last opened. */
export const SUBSCRIBERS_SEEN_KEY = 'rk-subscribers-seen'

export type NavCounts = { contact: number; subscribers: number }

export function badgeText(count: number): string | null {
  if (!Number.isFinite(count) || count <= 0) return null
  return count > 99 ? '99+' : String(Math.floor(count))
}

const TITLES: Record<'fr' | 'de' | 'en', Record<keyof NavCounts, (count: number) => string>> = {
  fr: {
    contact: (n) => (n > 1 ? `${n} nouvelles demandes` : '1 nouvelle demande'),
    subscribers: (n) => (n > 1 ? `${n} nouveaux abonnés` : '1 nouvel abonné'),
  },
  de: {
    contact: (n) => (n > 1 ? `${n} neue Anfragen` : '1 neue Anfrage'),
    subscribers: (n) => (n > 1 ? `${n} neue Abonnenten` : '1 neuer Abonnent'),
  },
  en: {
    contact: (n) => (n > 1 ? `${n} new requests` : '1 new request'),
    subscribers: (n) => (n > 1 ? `${n} new subscribers` : '1 new subscriber'),
  },
}

export function badgeTitle(kind: keyof NavCounts, count: number, language: string): string {
  const titles = TITLES[language === 'de' || language === 'en' ? language : 'fr']
  return titles[kind](count)
}

/** Shows the count on a navigation link, or removes the badge when there is none. */
export function applyBadge(element: Element | null, text: string | null, title: string): void {
  if (!element) return
  if (text === null) {
    if (element.hasAttribute(NAV_BADGE_ATTRIBUTE)) {
      element.removeAttribute(NAV_BADGE_ATTRIBUTE)
      element.removeAttribute('title')
    }
    return
  }
  if (element.getAttribute(NAV_BADGE_ATTRIBUTE) !== text) {
    element.setAttribute(NAV_BADGE_ATTRIBUTE, text)
  }
  if (element.getAttribute('title') !== title) element.setAttribute('title', title)
}

/** REST query counting contact requests still marked "New". */
export function contactCountUrl(apiRoute: string): string {
  return `${apiRoute}/contact-submissions?where[status][equals]=new&limit=1&depth=0`
}

/** REST query counting subscriptions created after the list was last opened. */
export function subscribersCountUrl(apiRoute: string, seenAt: string): string {
  const since = encodeURIComponent(seenAt)
  return `${apiRoute}/subscribers?where[createdAt][greater_than]=${since}&where[status][not_equals]=unsubscribed&limit=1&depth=0`
}
