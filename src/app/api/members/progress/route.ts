import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getCms } from '@/lib/cms'
import { findEntitlement, memberFromSession, SESSION_COOKIE } from '@/lib/members'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Marks a lesson of an owned course as completed (or not). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const cms = await getCms()
  if (!cms) return NextResponse.json({ ok: false }, { status: 503 })

  const member = await memberFromSession(cms, request.cookies.get(SESSION_COOKIE)?.value)
  if (!member) return NextResponse.json({ ok: false }, { status: 401 })

  let body: { product?: unknown; lesson?: unknown; done?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const productId = typeof body.product === 'string' ? body.product : ''
  const lessonId = typeof body.lesson === 'string' ? body.lesson : ''
  if (!/^\w{1,64}$/.test(productId) || !/^[\w-]{1,64}$/.test(lessonId)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const entitlement = await findEntitlement(cms, member.id, productId)
  if (!entitlement) return NextResponse.json({ ok: false }, { status: 403 })

  const doc = (await cms.findByID({
    collection: 'entitlements',
    id: entitlement.id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as { completedLessons?: unknown }
  const completed = new Set(
    Array.isArray(doc.completedLessons)
      ? doc.completedLessons.filter((value): value is string => typeof value === 'string')
      : [],
  )
  if (body.done === false) completed.delete(lessonId)
  else completed.add(lessonId)

  await cms.update({
    collection: 'entitlements',
    id: entitlement.id,
    data: { completedLessons: [...completed].slice(0, 1000) } as never,
    overrideAccess: true,
  })
  return NextResponse.json({ ok: true, completed: [...completed] })
}
