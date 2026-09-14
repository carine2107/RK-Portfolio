import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getCms } from '@/lib/cms'
import { siteUrl } from '@/lib/env'
import { fullSheetsSync, readSheetsConfig, sheetsReady, spreadsheetUrl } from '@/lib/google-sheets'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

async function staffUser(request: NextRequest) {
  const cms = await getCms()
  if (!cms) return { cms: null, user: null }
  const { user } = await cms.auth({ headers: request.headers })
  const role = (user as { role?: string } | null)?.role
  return { cms, user: user && (role === 'admin' || role === 'editor') ? user : null }
}

/** Google Sheets status for the admin panel (signed-in staff only). */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { user } = await staffUser(request)
  if (!user) return NextResponse.json({ ok: false }, { status: 401, headers: noStore })

  const config = readSheetsConfig()
  const configured = sheetsReady(config)
  return NextResponse.json(
    {
      ok: true,
      configured,
      spreadsheetUrl: configured ? spreadsheetUrl(config) : null,
      serviceAccount: configured ? config.clientEmail : null,
    },
    { headers: noStore },
  )
}

/** Rewrites both tabs from the CMS ("Tout resynchroniser"). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Cookie-authenticated action: refuse calls coming from another site.
  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin && origin !== new URL(siteUrl).origin) {
    return NextResponse.json({ ok: false }, { status: 403, headers: noStore })
  }

  const { cms, user } = await staffUser(request)
  if (!cms || !user) return NextResponse.json({ ok: false }, { status: 401, headers: noStore })
  if (!sheetsReady()) {
    return NextResponse.json(
      { ok: false, reason: 'notConfigured' },
      { status: 503, headers: noStore },
    )
  }

  try {
    const rows = await fullSheetsSync(cms)
    console.info(`[sheets] Full sync by user ${String(user.id)}: ${JSON.stringify(rows)}`)
    return NextResponse.json({ ok: true, rows }, { headers: noStore })
  } catch (error) {
    console.error(
      '[sheets] Full sync failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return NextResponse.json({ ok: false, reason: 'google' }, { status: 502, headers: noStore })
  }
}
