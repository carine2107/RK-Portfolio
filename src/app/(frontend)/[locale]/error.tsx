'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

import { Button, buttonClasses } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'

/** Localised error boundary for the public site. */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')

  useEffect(() => {
    // Only the digest is logged — never the visitor's data.
    console.error('[page] Unhandled error', error.digest ?? error.message)
  }, [error])

  return (
    <Section size="lg">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-serif text-3xl text-primary md:text-4xl">{t('title')}</h1>
        <p className="mt-4 text-secondary">{t('body')}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} size="lg">
            {t('retry')}
          </Button>
          <Link href="/" className={buttonClasses('secondary', 'lg')}>
            {t('home')}
          </Link>
        </div>
      </div>
    </Section>
  )
}
