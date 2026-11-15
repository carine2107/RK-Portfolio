import 'server-only'

/**
 * Azure OpenAI client for the visitor assistant. Only the server talks to
 * Azure: the key never reaches the browser. Without a complete configuration
 * the assistant stays switched off — nothing is ever simulated.
 */
import { azureOpenAI } from '@/lib/env'

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export function assistantReady(): boolean {
  return Boolean(
    azureOpenAI.enabled && azureOpenAI.endpoint && azureOpenAI.apiKey && azureOpenAI.deployment,
  )
}

/** Chat completion endpoint of the deployment, built from the configuration. */
export function completionsUrl(): string {
  const endpoint = azureOpenAI.endpoint.replace(/\/+$/, '')
  return `${endpoint}/openai/deployments/${encodeURIComponent(azureOpenAI.deployment)}/chat/completions?api-version=${encodeURIComponent(azureOpenAI.apiVersion)}`
}

/**
 * Answer of the model, or null when Azure cannot be reached or answers with an
 * error — the visitor is then told the assistant is unavailable.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  attempt = 1,
  maxTokens = azureOpenAI.maxTokens,
): Promise<string | null> {
  if (!assistantReady()) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), azureOpenAI.timeoutMs)
  try {
    const response = await fetch(completionsUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': azureOpenAI.apiKey },
      body: JSON.stringify({
        messages,
        max_completion_tokens: maxTokens,
        temperature: 0.2,
        top_p: 0.9,
        user: 'website-visitor',
      }),
      signal: controller.signal,
    })
    if (!response.ok) {
      // The body can carry the deployment name and quota details: log the
      // status only, never the request or the visitor's question.
      console.error(`[assistant] Azure OpenAI answered ${response.status}.`)
      // 429 (deployment busy) and 5xx are worth one retry: Azure asks for a
      // wait through Retry-After, capped so the visitor is not left hanging.
      const retriable = response.status === 429 || response.status >= 500
      if (retriable && attempt === 1) {
        const after = Number.parseInt(response.headers.get('retry-after') ?? '', 10)
        const waitMs = Math.min(Number.isFinite(after) ? after * 1000 : 1500, 5000)
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        return chatCompletion(messages, attempt + 1, maxTokens)
      }
      return null
    }
    const body = (await response.json()) as {
      choices?: { message?: { content?: string }; finish_reason?: string }[]
      usage?: { completion_tokens?: number; total_tokens?: number }
    }
    const choice = body.choices?.[0]
    const answer = choice?.message?.content
    if (typeof answer === 'string' && answer.trim()) return answer

    // An empty answer used to fail silently. It happens when the budget is
    // spent before the first word (reasoning models, long context) or when
    // Azure filters the answer: both need to be visible in the logs.
    const reason = choice?.finish_reason ?? 'none'
    console.error(
      `[assistant] Azure OpenAI returned an empty answer (finish_reason=${reason}, completion_tokens=${body.usage?.completion_tokens ?? '?'}, max=${maxTokens}).`,
    )
    if (reason === 'length' && attempt === 1) {
      // Give the model room once, rather than leaving the visitor with nothing.
      return chatCompletion(messages, attempt + 1, Math.min(maxTokens * 3, 2000))
    }
    return null
  } catch (error) {
    console.error(
      '[assistant] Azure OpenAI unreachable:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return null
  } finally {
    clearTimeout(timeout)
  }
}
