import type { ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

type CardProps = {
  children: ReactNode
  className?: string
  tone?: 'raised' | 'outline'
  as?: 'article' | 'div' | 'li'
}

/**
 * Sober card used across the site. A `CardLink` inside makes the whole card
 * clickable through a stretched link — the visible link text stays the
 * accessible name, so nothing is conveyed by the card surface alone.
 */
export function Card({
  children,
  className = '',
  tone = 'raised',
  as: Element = 'article',
}: CardProps) {
  const classes = [
    'group relative flex h-full flex-col rounded-card border p-6 transition-[border-color,box-shadow,transform] duration-200',
    tone === 'raised'
      ? 'border-line bg-surface-raised shadow-card hover:border-line-accent hover:shadow-raised'
      : 'border-line bg-transparent hover:border-line-accent',
    // The stretched link covers the card, so its focus ring is drawn around the
    // card (WCAG 2.4.7). Keyboard focus only: a mouse click draws no ring.
    'has-[[data-card-link]:focus-visible]:outline-2 has-[[data-card-link]:focus-visible]:outline-offset-2 has-[[data-card-link]:focus-visible]:outline-(--focus-ring) has-[[data-card-link]:focus-visible]:outline-solid',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <Element className={classes}>{children}</Element>
}

export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      data-card-link=""
      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
    >
      {children}
    </Link>
  )
}

export function CardTitle({
  children,
  as: Element = 'h3',
}: {
  children: ReactNode
  as?: 'h2' | 'h3' | 'h4'
}) {
  return (
    <Element className="text-xl leading-snug text-primary hyphens-auto break-words">
      {children}
    </Element>
  )
}

export function CardBody({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[0.95rem] leading-relaxed text-secondary">{children}</p>
}

export function CardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 pt-0 text-sm text-secondary">
      {children}
    </div>
  )
}

export function CardMeta({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-wide text-secondary uppercase">
      {children}
    </div>
  )
}
