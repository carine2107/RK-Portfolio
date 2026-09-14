import { NextResponse } from 'next/server'

import { getCms } from '@/lib/cms'
import { cmsEnabled } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Health check for uptime monitoring and the container healthcheck.
 *
 * 200 when the site can serve its content, 503 when the database cannot be
 * reached. Exposes no configuration, version or error detail.
 */
export async function GET(): Promise<NextResponse> {
  const started = Date.now()
  let database: 'up' | 'down' | 'disabled' = 'disabled'

  if (cmsEnabled) {
    try {
      const cms = await getCms()
      if (!cms) throw new Error('CMS unavailable')
      await cms.count({ collection: 'categories', overrideAccess: true })
      database = 'up'
    } catch {
      database = 'down'
    }
  }

  const healthy = database !== 'down'
  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'error',
      database,
      uptimeSeconds: Math.round(process.uptime()),
      responseTimeMs: Date.now() - started,
    },
    { status: healthy ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
