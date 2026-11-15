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
export async function chatCompletion(messages: ChatMessage[]): Promise<string | null> {
  if (!assistantReady()) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), azureOpenAI.timeoutMs)
  try {
    const response = await fetch(completionsUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': azureOpenAI.apiKey },
      body: JSON.stringify({
        messages,
        max_completion_tokens: azureOpenAI.maxTokens,
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
      return null
    }
    const body = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const answer = body.choices?.[0]?.message?.content
    return typeof answer === 'string' && answer.trim() ? answer : null
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
