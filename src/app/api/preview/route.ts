import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

import { isLocale, defaultLocale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Draft preview.
 *
 * Called from the CMS "Preview" button. Draft mode is only enabled for a signed
 * in administrator or editor: the Payload session cookie is verified server-side
 * before anything is exposed. Preview responses are never cached and never
 * indexed (see the `X-Robots-Tag` header set for this route).
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? ''
  const requested = url.searchParams.get('locale') ?? defaultLocale
  const locale = isLocale(requested) ? requested : defaultLocale

  // Only allow relative paths inside the site.
  if (!path.startsWith('/') || path.startsWith('//')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const cms = await getCms()
  if (!cms) {
    return NextResponse.json({ error: 'CMS unavailable' }, { status: 503 })
  }

  const { user } = await cms.auth({ headers: request.headers })
  const role = (user as { role?: string } | null)?.role
  if (!user || (role !== 'admin' && role !== 'editor')) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(`/${locale}${path}`)
}
