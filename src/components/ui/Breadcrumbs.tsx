import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

export type Crumb = { label: string; href?: string }

/**
 * Breadcrumb trail for inner pages. The matching BreadcrumbList structured data
 * is emitted by the page through `<JsonLd />` so both stay consistent.
 */
export async function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = await getTranslations('nav')
  if (items.length === 0) return null

  return (
    <nav aria-label={t('breadcrumbLabel')} className="mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-secondary">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="underline-offset-4 hover:text-accent-text hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={last ? 'text-primary' : ''}
                >
                  {item.label}
                </span>
              )}
              {!last ? (
                <span aria-hidden="true" className="text-line-strong">
                  /
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
