import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

type SyncedCollection = 'subscribers' | 'contact-submissions'

/**
 * Collection hooks copying changes to Google Sheets. The sync module is
 * imported lazily (it depends on the collections through the export columns)
 * and runs in the background: saving never waits for Google, never fails
 * because of it.
 */
function run(
  action: 'upsert' | 'delete',
  collection: SyncedCollection,
  doc: unknown,
  log: (message: string) => void,
) {
  import('../../lib/google-sheets')
    .then(({ queueSheetsSync }) =>
      queueSheetsSync(action, collection, doc as Record<string, unknown>),
    )
    .catch((error: unknown) =>
      log(`[sheets] ${error instanceof Error ? error.message : 'unknown error'}`),
    )
}

export const syncToSheets =
  (collection: SyncedCollection): CollectionAfterChangeHook =>
  ({ doc, req }) => {
    run('upsert', collection, doc, (message) => req.payload.logger.error(message))
    return doc
  }

export const removeFromSheets =
  (collection: SyncedCollection): CollectionAfterDeleteHook =>
  ({ doc, req }) => {
    run('delete', collection, doc, (message) => req.payload.logger.error(message))
    return doc
  }
