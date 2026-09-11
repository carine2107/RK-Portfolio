import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { defaultLocale, routing, type Locale } from './routing'

/**
 * Message loader with an explicit fallback chain: a missing key in `fr`/`de`
 * falls back to the English message rather than rendering the raw key.
 */
async function loadMessages(locale: Locale) {
  const messages = (await import(`../messages/${locale}.json`)).default
  if (locale === defaultLocale) return messages
  const fallback = (await import(`../messages/${defaultLocale}.json`)).default
  return deepMerge(fallback, messages)
}

type MessageTree = { [key: string]: string | MessageTree }

function deepMerge(base: MessageTree, override: MessageTree): MessageTree {
  const result: MessageTree = { ...base }
  for (const [key, value] of Object.entries(override)) {
    const current = result[key]
    if (typeof value === 'object' && value !== null && typeof current === 'object') {
      result[key] = deepMerge(current, value)
    } else {
      result[key] = value
    }
  }
  return result
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: await loadMessages(locale),
    // Never surface a translation key to a visitor.
    onError() {},
    getMessageFallback({ key, namespace }) {
      if (process.env.NODE_ENV !== 'production') {
        return `⚠ missing:${namespace ? `${namespace}.` : ''}${key}`
      }
      return ''
    },
  }
})
