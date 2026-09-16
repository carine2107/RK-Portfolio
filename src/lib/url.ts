/**
 * Accepts only absolute https:// URLs (booking tools, external links entered
 * in the CMS). Anything else — relative paths, other protocols such as
 * `javascript:` — is dropped so it can never end up in an href.
 */
export function safeHttpsUrl(value: string | null | undefined): string {
  if (!value) return ''
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && url.hostname.includes('.') ? url.toString() : ''
  } catch {
    return ''
  }
}

/** Host name shown to the visitor before leaving the site ("cal.com"). */
export function displayHost(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/**
 * Website of a business entered in the CMS. People often type the address as
 * shown in a browser ("www.example.com"): without a scheme the browser would
 * treat it as a page of this site. The scheme is added (https), http and https
 * are accepted, and anything that is not a public web address is dropped.
 */
export function websiteUrl(value: string | null | undefined): string {
  const input = value?.trim() ?? ''
  if (!input || /\s/.test(input)) return ''
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(input)
    ? input
    : `https://${input.replace(/^\/+/, '')}`
  try {
    const url = new URL(withScheme)
    const web = url.protocol === 'https:' || url.protocol === 'http:'
    return web && url.hostname.includes('.') && !url.username && !url.password ? url.toString() : ''
  } catch {
    return ''
  }
}
