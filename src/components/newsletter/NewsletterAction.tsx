'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, useSyncExternalStore } from 'react'

import { Button, buttonClasses } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'

type Status = 'idle' | 'working' | 'done' | 'invalid' | 'error'

const noSubscribe = () => () => {}
const readToken = () => new URLSearchParams(window.location.search).get('token') ?? ''

/**
 * Landing of the confirmation and unsubscription links.
 * - confirm: posts the token as soon as the page runs (mail scanners do not
 *   run the page, so they cannot confirm an address by opening the link);
 * - unsubscribe: waits for the visitor to press the button.
 */
export function NewsletterAction({ mode }: { mode: 'confirm' | 'unsubscribe' }) {
  const t = useTranslations(`newsletter.${mode}`)
  const common = useTranslations('newsletter')
  // null during the server render, the token (or '') in the browser.
  const token = useSyncExternalStore(noSubscribe, readToken, () => null)
  const [status, setStatus] = useState<Status>('idle')

  const send = (value: string) =>
    fetch(`/api/newsletter/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: value }),
    })
      .then((response) => response.json() as Promise<{ ok: boolean; status?: string }>)
      .then((body) => setStatus(body.ok ? 'done' : 'invalid'))
      .catch(() => setStatus('error'))

  useEffect(() => {
    if (mode !== 'confirm' || !token) return
    void send(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, token])

  const invalid = status === 'invalid' || token === ''

  if (status === 'done') {
    return (
      <Result title={t('done.title')} body={t('done.body')}>
        <Link href="/insights" className={buttonClasses('primary')}>
          {common('readInsights')}
        </Link>
      </Result>
    )
  }

  if (invalid) {
    return (
      <Result title={t('invalid.title')} body={t('invalid.body')}>
        <Link href="/newsletter" className={buttonClasses('secondary')}>
          {common('subscribeAgain')}
        </Link>
      </Result>
    )
  }

  if (status === 'error') {
    return <Result title={common('errors.server')} body="" />
  }

  if (mode === 'confirm') {
    return <Result title={t('pending')} body="" />
  }

  return (
    <Result title={t('title')} body={t('body')}>
      <Button
        type="button"
        loading={status === 'working'}
        onClick={() => {
          if (!token) return
          setStatus('working')
          void send(token)
        }}
      >
        {t('button')}
      </Button>
    </Result>
  )
}

function Result({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div role="status" aria-live="polite" className="max-w-xl">
      <h2 className="font-serif text-2xl text-primary">{title}</h2>
      {body ? <p className="mt-3 text-secondary">{body}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  )
}
