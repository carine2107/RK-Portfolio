import type { ReactNode } from 'react'

import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs'

/** Consistent top block of every inner page: breadcrumb, H1, lead, actions. */
export function PageHeader({
  title,
  lead,
  eyebrow,
  crumbs,
  children,
  titleLang,
}: {
  title: string
  lead?: string
  eyebrow?: string
  crumbs?: Crumb[]
  children?: ReactNode
  /** Set when the title is in another language than the page (a book title). */
  titleLang?: string
}) {
  return (
    <div className="border-b border-line bg-surface-subtle">
      <div className="rk-container py-12 md:py-16">
        {crumbs && crumbs.length > 0 ? <Breadcrumbs items={crumbs} /> : null}
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-accent-text uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1
          lang={titleLang}
          className="max-w-3xl font-serif text-[clamp(2rem,4.5vw,3rem)] leading-[1.12] text-primary"
        >
          {title}
        </h1>
        {lead ? (
          <p lang={titleLang} className="mt-5 max-w-2xl text-lg text-secondary">
            {lead}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-surface-subtle px-6 py-14 text-center">
      <p className="text-secondary">{message}</p>
    </div>
  )
}
