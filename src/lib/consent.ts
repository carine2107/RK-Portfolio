/**
 * Visitor consent for audience measurement with cookies (Google Analytics).
 *
 * The choice is stored in `localStorage` (strictly necessary, no cookie). A
 * new CONSENT_VERSION asks everyone again (e.g. after adding a new tool).
 * Nothing from Google is loaded until the stored value is "granted".
 */

export const CONSENT_KEY = 'rk-consent'
export const CONSENT_VERSION = 1
/** Window event asking the banner to open again ("Cookie settings" button). */
export const CONSENT_OPEN_EVENT = 'rk:open-consent'

export type ConsentChoice = 'granted' | 'denied'

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export function readConsent(storage: StorageLike | null | undefined): ConsentChoice | null {
  try {
    const raw = storage?.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { v?: unknown; analytics?: unknown }
    if (parsed.v !== CONSENT_VERSION) return null
    return parsed.analytics === true ? 'granted' : parsed.analytics === false ? 'denied' : null
  } catch {
    return null
  }
}

export function writeConsent(
  storage: StorageLike | null | undefined,
  choice: ConsentChoice,
  now: Date = new Date(),
): void {
  try {
    storage?.setItem(
      CONSENT_KEY,
      JSON.stringify({
        v: CONSENT_VERSION,
        analytics: choice === 'granted',
        at: now.toISOString(),
      }),
    )
  } catch {
    /* storage unavailable (private mode): the banner will simply ask again */
  }
}

/** Google Analytics 4 identifier, "G-XXXXXXX", or '' when invalid. */
export function validMeasurementId(value: string | undefined): string {
  const id = (value ?? '').trim().toUpperCase()
  return /^G-[A-Z0-9]{4,20}$/.test(id) ? id : ''
}

/**
 * Deletes the Google Analytics cookies (`_ga`, `_ga_<id>`, `_gid`, `_gat*`)
 * on the current host and its parent domains, where GA may have set them.
 */
export function clearAnalyticsCookies(doc: Pick<Document, 'cookie'>, hostname: string): string[] {
  const names = doc.cookie
    .split(';')
    .map((entry) => entry.split('=')[0]?.trim() ?? '')
    .filter((name) => /^(_ga(_.+)?|_gid|_gat.*)$/.test(name))

  const parts = hostname.split('.')
  const domains = ['', ...parts.slice(0, -1).map((_, index) => `.${parts.slice(index).join('.')}`)]

  const cleared: string[] = []
  for (const name of names) {
    for (const domain of domains) {
      const cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`
      doc.cookie = cookie
      cleared.push(cookie)
    }
  }
  return cleared
}
