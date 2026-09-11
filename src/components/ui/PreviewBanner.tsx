import { getTranslations } from 'next-intl/server'

/**
 * Shown while Next.js draft mode is active: the page displays the unpublished
 * version. Preview pages are served dynamically and are never indexed.
 */
export async function PreviewBanner() {
  const t = await getTranslations('preview')

  return (
    <div className="border-b border-warning-line bg-warning-surface">
      <div className="rk-container flex flex-wrap items-center justify-between gap-3 py-3 text-sm text-warning-text">
        <p className="font-medium">{t('notice')}</p>
        {/* A real navigation is required: the target is an API route that
            clears the draft cookie, not a page. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/preview/exit"
          className="min-h-9 rounded-full border border-warning-line px-4 py-1.5 font-medium underline-offset-4 hover:underline"
        >
          {t('exit')}
        </a>
      </div>
    </div>
  )
}
