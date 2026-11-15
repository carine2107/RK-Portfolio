import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

import { defaultLocale, isLocale, type Locale } from '@/i18n/routing'
import {
  assistantSchema,
  cleanAnswer,
  contextBlock,
  lastUserMessage,
  sourcesFromResults,
  systemPrompt,
  trimHistory,
  type AssistantResponse,
} from '@/lib/assistant'
import { assistantReady, chatCompletion } from '@/lib/azure-openai'
import { getSiteSettings } from '@/lib/cms'
import { assistantRateLimit } from '@/lib/env'
import { checkRateLimit, clientKey } from '@/lib/rate-limit'
import { searchSite } from '@/lib/search-cms'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Visitor assistant.
 *
 * The question is answered by Azure OpenAI with the published pages that match
 * it as context (same search as the site). Nothing is stored: the conversation
 * only lives in the visitor's browser, and the server keeps neither the
 * question nor the answer.
 */
export async function POST(request: Request): Promise<NextResponse<AssistantResponse>> {
  if (!assistantReady()) {
    return NextResponse.json({ ok: false, reason: 'disabled' }, { status: 503 })
  }

  const key = createHash('sha256')
    .update(`assistant:${clientKey(request.headers)}`)
    .digest('hex')
    .slice(0, 32)
  const limit = checkRateLimit(key, assistantRateLimit.max, assistantRateLimit.windowMs)
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, reason: 'rateLimit' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 })
  }

  const parsed = assistantSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 422 })
  }

  const locale: Locale =
    parsed.data.locale && isLocale(parsed.data.locale) ? parsed.data.locale : defaultLocale
  const history = trimHistory(parsed.data.messages)
  const question = lastUserMessage(history)
  if (!question) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 422 })
  }

  try {
    const [results, settings] = await Promise.all([
      searchSite(question, locale),
      getSiteSettings(locale),
    ])
    const sources = sourcesFromResults(results)
    const answer = await chatCompletion([
      {
        role: 'system',
        content: systemPrompt(locale, {
          email: settings.email,
          phone: settings.phone,
          contactPath: `/${locale}/contact`,
          bookingUrl: settings.bookingUrl,
        }),
      },
      ...history,
      { role: 'user', content: contextBlock(results, sources) },
    ])

    if (!answer) {
      return NextResponse.json({ ok: false, reason: 'server' }, { status: 502 })
    }
    console.info(`[assistant] Question answered (locale=${locale}, sources=${sources.length}).`)
    return NextResponse.json({ ok: true, answer: cleanAnswer(answer), sources })
  } catch (error) {
    // Never log the question or the answer: they may contain personal details.
    console.error(
      '[assistant] Answer failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 })
  }
}
