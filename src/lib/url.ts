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
