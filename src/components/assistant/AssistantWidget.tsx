'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { Icon } from '@/components/ui/Icon'
import { Link } from '@/i18n/navigation'
import {
  MAX_MESSAGE_LENGTH,
  type AssistantMessage,
  type AssistantResponse,
  type AssistantSource,
} from '@/lib/assistant'

type Turn = AssistantMessage & { sources?: AssistantSource[] }

const SUGGESTION_KEYS = ['services', 'book', 'speaking'] as const

/**
 * Chat bubble of the public site. The conversation lives in this component
 * only: nothing is stored on the server or in the browser, so closing the page
 * clears it. Answers come from `/api/assistant` (Azure OpenAI); the button is
 * rendered only when the server says the assistant is configured.
 */
export function AssistantWidget() {
  const t = useTranslations('assistant')
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [question, setQuestion] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<'rateLimit' | 'server' | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, pending])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  async function ask(text: string) {
    const content = text.trim().slice(0, MAX_MESSAGE_LENGTH)
    if (!content || pending) return
    const history: Turn[] = [...turns, { role: 'user', content }]
    setTurns(history)
    setQuestion('')
    setError(null)
    setPending(true)
    trackEvent('assistant_question', { locale })

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          messages: history.map(({ role, content: message }) => ({ role, content: message })),
        }),
      })
      const body = (await response.json()) as AssistantResponse
      if (body.ok) {
        setTurns([...history, { role: 'assistant', content: body.answer, sources: body.sources }])
      } else {
        setError(body.reason === 'rateLimit' ? 'rateLimit' : 'server')
      }
    } catch {
      setError('server')
    } finally {
      setPending(false)
      inputRef.current?.focus()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="rk-assistant-panel"
        className="fixed right-4 bottom-4 z-90 inline-flex size-14 items-center justify-center rounded-full bg-contrast text-on-contrast shadow-float transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) sm:right-6 sm:bottom-6"
      >
        <Icon name={open ? 'close' : 'chat'} className="size-6" />
        <span className="sr-only">{open ? t('close') : t('open')}</span>
      </button>

      {open ? (
        <div
          id="rk-assistant-panel"
          ref={panelRef}
          role="dialog"
          aria-label={t('title')}
          className="fixed right-4 bottom-20 z-90 flex max-h-[min(32rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-card border border-line bg-surface-raised shadow-float sm:right-6 sm:bottom-24"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="font-serif text-base text-primary">{t('title')}</p>
            <p className="mt-0.5 text-xs text-secondary">{t('lead')}</p>
          </div>

          <div ref={threadRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm">
            <p className="rounded-card bg-surface-subtle px-3 py-2 text-secondary">
              {t('greeting')}
            </p>

            {turns.length === 0 ? (
              <ul className="space-y-2">
                {SUGGESTION_KEYS.map((key) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => ask(t(`suggestions.${key}`))}
                      className="w-full rounded-card border border-line px-3 py-2 text-left text-secondary transition-colors hover:border-line-accent hover:text-primary"
                    >
                      {t(`suggestions.${key}`)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <div aria-live="polite" className="space-y-4">
              {turns.map((turn, index) => (
                <div
                  key={index}
                  className={
                    turn.role === 'user'
                      ? 'ml-6 rounded-card bg-surface-accent px-3 py-2 text-primary'
                      : 'mr-2 whitespace-pre-line text-primary'
                  }
                >
                  <span className="sr-only">
                    {turn.role === 'user' ? t('you') : t('assistant')} :{' '}
                  </span>
                  {turn.content}
                  {turn.sources && turn.sources.length > 0 ? (
                    <span className="mt-2 block text-xs text-secondary">
                      {t('sources')}{' '}
                      {turn.sources.map((source, position) => (
                        <span key={source.href}>
                          {position > 0 ? ', ' : ''}
                          <Link
                            href={source.href}
                            onClick={() => setOpen(false)}
                            className="text-accent-text underline-offset-4 hover:underline"
                          >
                            {source.title}
                          </Link>
                        </span>
                      ))}
                    </span>
                  ) : null}
                </div>
              ))}
              {pending ? <p className="text-secondary">{t('thinking')}</p> : null}
              {error ? (
                <p role="alert" className="text-error-text">
                  {t(`errors.${error}`)}
                </p>
              ) : null}
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              void ask(question)
            }}
            className="border-t border-line px-4 py-3"
          >
            <label htmlFor="rk-assistant-input" className="sr-only">
              {t('inputLabel')}
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="rk-assistant-input"
                ref={inputRef}
                rows={2}
                value={question}
                maxLength={MAX_MESSAGE_LENGTH}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void ask(question)
                  }
                }}
                placeholder={t('placeholder')}
                className="min-h-11 flex-1 resize-none rounded-card border border-line-strong bg-surface px-3 py-2 text-sm text-primary placeholder:text-secondary"
              />
              <button
                type="submit"
                disabled={pending || question.trim() === ''}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-contrast text-on-contrast disabled:opacity-40"
              >
                <Icon name="arrow" className="size-4" />
                <span className="sr-only">{t('send')}</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-secondary">
              {t('disclaimer')}{' '}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="text-accent-text underline-offset-4 hover:underline"
              >
                {t('contactLink')}
              </Link>
            </p>
          </form>
        </div>
      ) : null}
    </>
  )
}
