/**
 * Payload stores a non-localised array whose sub-fields are localised (the
 * About page languages and regions, experience countries, book purchase links)
 * as ONE set of rows shared by every language. Writing such an array without
 * the row ids creates new rows and silently drops the other translations.
 *
 * The pattern is therefore: write the default language first, read the row
 * ids back, then write the other languages on those same rows.
 */
import type { Payload } from 'payload'

import { starterAbout } from '../content/starter'

type Row = { id?: string | null }

/** Re-attaches the ids of `reference` rows to `rows`, by position. */
export function withRowIds<T extends object>(
  rows: T[],
  reference: unknown,
): (T & { id?: string })[] {
  const refs = Array.isArray(reference) ? (reference as Row[]) : []
  return rows.map((row, index) => {
    const id = refs[index]?.id
    return id ? { ...row, id } : row
  })
}

/** Writes the About page "Languages" and "Regions" lists in the three languages. */
export async function writeAboutProfileRows(payload: Payload): Promise<void> {
  const english = await payload.updateGlobal({
    slug: 'about-page',
    locale: 'en',
    overrideAccess: true,
    data: {
      languages: starterAbout.languages.map((entry) => ({
        language: entry.language.en,
        level: entry.level.en,
      })),
      regions: starterAbout.regions.map((region) => ({ name: region.en })),
    } as never,
  })

  const record = english as { languages?: unknown; regions?: unknown }

  for (const locale of ['fr', 'de'] as const) {
    await payload.updateGlobal({
      slug: 'about-page',
      locale,
      overrideAccess: true,
      data: {
        languages: withRowIds(
          starterAbout.languages.map((entry) => ({
            language: entry.language[locale],
            level: entry.level[locale],
          })),
          record.languages,
        ),
        regions: withRowIds(
          starterAbout.regions.map((region) => ({ name: region[locale] })),
          record.regions,
        ),
      } as never,
    })
  }
}
