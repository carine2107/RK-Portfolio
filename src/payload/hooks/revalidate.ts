import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  GlobalConfig,
} from 'payload'

/**
 * Public pages are regenerated at most every 5 minutes (`revalidate = 300`).
 * These hooks refresh them as soon as content is published, changed or
 * deleted in the CMS, so editors see their change on the site within seconds.
 */

type Doc = { _status?: unknown } | null | undefined

/**
 * A draft saved on a never-published entry changes nothing on the public site.
 * Anything else can: a publication, an unpublication (previous version was
 * published) or any change to content without drafts.
 */
export function affectsPublicSite(doc: Doc, previousDoc?: Doc): boolean {
  const status = doc?._status
  const previous = previousDoc?._status
  if (status === undefined && previous === undefined) return true
  return status === 'published' || previous === 'published'
}

/** Marks every public page as stale; the next visit renders it again. */
export async function refreshPublicSite(): Promise<void> {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    /* outside a Next.js request (seed or import scripts): nothing to refresh */
  }
}

export const refreshAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  if (affectsPublicSite(doc, previousDoc)) await refreshPublicSite()
  return doc
}

export const refreshAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await refreshPublicSite()
  return doc
}

export const refreshAfterGlobalChange: GlobalAfterChangeHook = async ({ doc, previousDoc }) => {
  if (affectsPublicSite(doc, previousDoc)) await refreshPublicSite()
  return doc
}

/** Adds the refresh hooks to a collection shown on the public site. */
export function withSiteRefresh(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange ?? []), refreshAfterChange],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), refreshAfterDelete],
    },
  }
}

/** Adds the refresh hook to a global shown on the public site. */
export function withGlobalSiteRefresh(global: GlobalConfig): GlobalConfig {
  return {
    ...global,
    hooks: {
      ...global.hooks,
      afterChange: [...(global.hooks?.afterChange ?? []), refreshAfterGlobalChange],
    },
  }
}
