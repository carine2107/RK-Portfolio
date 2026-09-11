import Image from 'next/image'

import type { ImageView } from '@/lib/types'

/**
 * Professional portrait. When no photograph has been supplied yet, an elegant
 * monogram placeholder is rendered instead — the site never generates or
 * simulates a face.
 */
export function Portrait({
  image,
  alt,
  placeholderLabel,
  priority = false,
  className = '',
  sizes = '(min-width: 1024px) 30rem, 100vw',
}: {
  image: ImageView
  alt: string
  placeholderLabel: string
  priority?: boolean
  className?: string
  sizes?: string
}) {
  return (
    <div
      className={`relative aspect-4/5 overflow-hidden rounded-card border border-line bg-surface-subtle ${className}`}
    >
      {image ? (
        <Image
          src={image.url}
          alt={image.alt || alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
          <span
            aria-hidden="true"
            className="font-serif text-5xl tracking-[0.12em] text-accent-text"
          >
            RK
          </span>
          <span className="max-w-[16rem] text-xs leading-relaxed tracking-wide text-secondary uppercase">
            {placeholderLabel}
          </span>
        </div>
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-accent/60"
      />
    </div>
  )
}
