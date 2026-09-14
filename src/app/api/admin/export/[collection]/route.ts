import type { NextRequest } from 'next/server'

import { getCms } from '@/lib/cms'
import { toCsv } from '@/lib/csv'
import {
  exportFileName,
  exportLanguage,
  exportRows,
  isExportCollection,
  SUBSCRIBER_STATUSES,
} from '@/lib/exports'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 500
const MAX_ROWS = 50_000

const deny = (status: number) =>
  new Response(null, { status, headers: { 'Cache-Control': 'no-store' } })

/**
 * CSV export of newsletter subscribers or contact requests, for a signed-in
 * administrator or editor. The documents are read with that user's access
 * rules (no `overrideAccess`), so an export never shows more than the list.
 * `?lang=fr|de|en` sets the headers; `?status=` filters subscribers.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
): Promise<Response> {
  const cms = await getCms()
  if (!cms) return deny(503)

  const { user } = await cms.auth({ headers: request.headers })
  const role = (user as { role?: string } | null)?.role
  if (!user || (role !== 'admin' && role !== 'editor')) return deny(401)

  const { collection } = await params
  if (!isExportCollection(collection)) return deny(404)

  const search = request.nextUrl.searchParams
  const lang = exportLanguage(search.get('lang'))
  const status = search.get('status')
  const where =
    collection === 'subscribers' &&
    status &&
    (SUBSCRIBER_STATUSES as readonly string[]).includes(status)
      ? { status: { equals: status } }
      : undefined

  const docs: Record<string, unknown>[] = []
  for (let page = 1; docs.length < MAX_ROWS; page += 1) {
    const result = await cms.find({
      collection,
      where,
      sort: '-createdAt',
      depth: 0,
      limit: PAGE_SIZE,
      page,
      user,
      overrideAccess: false,
    })
    docs.push(...(result.docs as unknown as Record<string, unknown>[]))
    if (!result.hasNextPage) break
  }

  // Record who exported personal data, never the data itself.
  console.info(
    `[export] ${collection}${where ? ` (${status})` : ''}: ${docs.length} rows by user ${String(user.id)}`,
  )

  return new Response(toCsv(exportRows(collection, docs, lang)), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${exportFileName(collection, lang)}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
