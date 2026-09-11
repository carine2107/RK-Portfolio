import 'server-only'

import { locales, type Locale } from '@/i18n/routing'
import type { LocalePaths } from '@/lib/seo'

type Entry = { id: string; slug: string }

/**
 * Builds the per-language paths of a single CMS entry.
 *
 * Slugs are translated, so `/en/insights/reading-a-balance-sheet` and
 * `/fr/insights/lire-un-bilan` are the same document. The entry is matched by
 * its stable CMS id; languages where the entry does not exist are skipped so no
 * hreflang ever points at a missing page.
 */
export async function entryPaths<T extends Entry>(
  fetcher: (locale: Locale) => Promise<T[]>,
  id: string,
  prefix: string,
): Promise<LocalePaths> {
  const paths: LocalePaths = {}

  await Promise.all(
    locales.map(async (locale) => {
      const entries = await fetcher(locale)
      const match = entries.find((entry) => entry.id === id)
      if (match?.slug) paths[locale] = `${prefix}/${match.slug}`
    }),
  )

  return paths
}
