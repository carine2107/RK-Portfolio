import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Leaves draft preview and returns to the published version of the page. */
export async function GET(request: Request): Promise<void> {
  const url = new URL(request.url)
  const path = url.searchParams.get('path')
  const draft = await draftMode()
  draft.disable()
  redirect(path && path.startsWith('/') && !path.startsWith('//') ? path : '/')
}
