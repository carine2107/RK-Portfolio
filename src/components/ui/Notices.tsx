import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

type NoticeTone = 'warning' | 'info' | 'success' | 'error'

const tones: Record<NoticeTone, string> = {
  warning: 'border-warning-line bg-warning-surface text-warning-text',
  info: 'border-line bg-surface-subtle text-secondary',
  success: 'border-success-line bg-success-surface text-success-text',
  error: 'border-error-line bg-error-surface text-error-text',
}

export function Notice({
  tone = 'info',
  title,
  children,
  className = '',
  role,
}: {
  tone?: NoticeTone
  title?: string
  children?: ReactNode
  className?: string
  role?: 'status' | 'alert'
}) {
  return (
    <div
      role={role}
      className={`rounded-card border px-4 py-3 text-sm leading-relaxed ${tones[tone]} ${className}`}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={title ? 'mt-1' : ''}>{children}</div> : null}
    </div>
  )
}

/** Small inline badge marking an entry as starter/demo content. */
export async function PlaceholderBadge() {
  const t = await getTranslations('common')
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning-line bg-warning-surface px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide text-warning-text uppercase">
      <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden="true">
        <path d="M12 2 1 21h22L12 2Zm0 6 6.5 11h-13L12 8Zm-1 3v4h2v-4h-2Zm0 5v2h2v-2h-2Z" />
      </svg>
      {t('placeholderBadge')}
    </span>
  )
}

/** Full notice shown on the detail page of a starter entry. */
export async function PlaceholderNotice({ className = '' }: { className?: string }) {
  const t = await getTranslations('common')
  return (
    <Notice tone="warning" title={t('placeholderBadge')} className={className}>
      {t('placeholderNotice')}
    </Notice>
  )
}
