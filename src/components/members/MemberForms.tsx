'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useId, useState, useSyncExternalStore } from 'react'

import { Button, buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Link, useRouter } from '@/i18n/navigation'

const noSubscribe = () => () => {}
const readToken = () => new URLSearchParams(window.location.search).get('token') ?? ''

/** E-mail form asking for a sign-in link. */
export function LoginForm() {
  const t = useTranslations('account.login')
  const locale = useLocale()
  const id = useId()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') ?? '')
    setStatus('sending')
    try {
      const response = await fetch('/api/members/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })
      const body = (await response.json()) as { ok: boolean; reason?: string }
      if (body.ok) {
        setStatus('sent')
        return
      }
      const reason = ['email', 'rateLimit', 'unavailable'].includes(body.reason ?? '')
        ? body.reason
        : 'server'
      setError(t(`errors.${reason}`))
      setStatus('error')
    } catch {
      setError(t('errors.server'))
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p
        role="status"
        className="max-w-xl rounded-card border border-success-line bg-success-surface p-5 text-success-text"
      >
        {t('sent')}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-4">
      <div>
        <label htmlFor={`${id}-email`} className="mb-2 block text-sm font-medium text-primary">
          {t('email')}
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={status === 'error' ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-h-12 w-full rounded-card border border-line-strong bg-surface px-4 text-base text-primary"
        />
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-error-text">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={status === 'sending'}>
        {status === 'sending' ? t('submitting') : t('submit')}
      </Button>
    </form>
  )
}

/** Landing of the sign-in link: exchanges it for a session, then opens the member area. */
export function VerifyLogin() {
  const t = useTranslations('account.verify')
  const locale = useLocale()
  const token = useSyncExternalStore(noSubscribe, readToken, () => null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch('/api/members/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json() as Promise<{ ok: boolean }>)
      .then((body) => {
        if (body.ok) window.location.replace(`/${locale}/account`)
        else setFailed(true)
      })
      .catch(() => setFailed(true))
  }, [token, locale])

  if (failed || token === '') {
    return (
      <div role="status" className="max-w-xl space-y-6">
        <p className="text-lg text-primary">{t('invalid')}</p>
        <Link href="/account/login" className={buttonClasses('primary')}>
          {t('again')}
        </Link>
      </div>
    )
  }
  return (
    <p role="status" className="text-lg text-secondary">
      {t('pending')}
    </p>
  )
}

export function LogoutButton() {
  const t = useTranslations('account')
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() =>
        void fetch('/api/members/logout', { method: 'POST' }).finally(() => {
          router.replace('/account/login')
          router.refresh()
        })
      }
      className="inline-flex min-h-11 items-center gap-2 text-sm text-secondary underline-offset-4 hover:text-primary hover:underline"
    >
      {t('logout')}
    </button>
  )
}

/** "Mark as completed" toggle of a course lesson. */
export function LessonComplete({
  productId,
  lessonId,
  initiallyDone,
}: {
  productId: string
  lessonId: string
  initiallyDone: boolean
}) {
  const t = useTranslations('account.lesson')
  const [done, setDone] = useState(initiallyDone)
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    setBusy(true)
    try {
      const response = await fetch('/api/members/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productId, lesson: lessonId, done: !done }),
      })
      if (response.ok) setDone(!done)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      type="button"
      variant={done ? 'secondary' : 'primary'}
      loading={busy}
      aria-pressed={done}
      onClick={() => void toggle()}
    >
      <Icon name={done ? 'close' : 'arrow'} className="size-4" />
      {done ? t('undo') : t('complete')}
    </Button>
  )
}
