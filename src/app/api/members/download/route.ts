import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import path from 'path'
import { Readable } from 'stream'

import type { NextRequest } from 'next/server'

import { defaultLocale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'
import { allLessons, protectedProductById } from '@/lib/member-content'
import { DOWNLOAD_LIMIT, findEntitlement, memberFromSession, SESSION_COOKIE } from '@/lib/members'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PRIVATE_DIR = path.resolve(process.cwd(), 'private/files')

const deny = (status: number) =>
  new Response(null, { status, headers: { 'Cache-Control': 'no-store' } })

/**
 * Downloads a file of a digital product for a signed-in member who owns it.
 * `?product=<id>&file=pdf|epub|resource` or `&file=lesson&lesson=<id>`.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const cms = await getCms()
  if (!cms) return deny(503)

  const member = await memberFromSession(cms, request.cookies.get(SESSION_COOKIE)?.value)
  if (!member) return deny(401)

  const params = request.nextUrl.searchParams
  const productId = params.get('product') ?? ''
  if (!/^\w{1,64}$/.test(productId)) return deny(400)

  const entitlement = await findEntitlement(cms, member.id, productId)
  if (!entitlement) return deny(403)
  if ((entitlement.downloads ?? 0) >= DOWNLOAD_LIMIT) return deny(429)

  const product = await protectedProductById(cms, productId, defaultLocale)
  if (!product) return deny(404)

  const kind = params.get('file')
  const target =
    kind === 'pdf'
      ? product.pdf
      : kind === 'epub'
        ? product.epub
        : kind === 'resource'
          ? product.resource
          : kind === 'lesson'
            ? (allLessons(product).find((lesson) => lesson.id === params.get('lesson'))
                ?.attachment ?? null)
            : null
  if (!target) return deny(404)

  // Never trust a stored name as a path: only the base name inside the private folder.
  const filePath = path.join(PRIVATE_DIR, path.basename(target.filename))
  if (!filePath.startsWith(PRIVATE_DIR + path.sep)) return deny(400)

  let size: number
  try {
    size = (await stat(filePath)).size
  } catch {
    return deny(404)
  }

  await cms.update({
    collection: 'entitlements',
    id: entitlement.id,
    data: { downloads: (entitlement.downloads ?? 0) + 1 } as never,
    overrideAccess: true,
  })

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream
  return new Response(stream, {
    headers: {
      'Content-Type': target.mimeType,
      'Content-Length': String(size),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(target.filename))}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
