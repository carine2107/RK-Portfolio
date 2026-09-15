import {
  BLASON_INNER_TRANSFORM,
  BLASON_PATH,
  MARK_ACCENT_PATH,
  MARK_BODY_PATHS,
  MARK_STROKE_WIDTH,
} from '@/lib/brand-mark'

/**
 * Romial Kenmogne monogram, drawn inline so it follows the site's colour
 * tokens: the letters take the current text colour, the rising arm the
 * accent (both change with the Appearance palette and the dark theme).
 * Decorative by default — the surrounding link or text carries the name.
 */
export function BrandMark({
  className = 'size-10',
  accentClassName = 'text-accent',
  variant = 'mark',
  title,
}: {
  className?: string
  /** Tailwind colour class of the accent stroke. */
  accentClassName?: string
  /** `mark`: monogram; `blason`: monogram reversed out of the square. */
  variant?: 'mark' | 'blason'
  title?: string
}) {
  const strokes = (inverse: boolean) => (
    <g
      fill="none"
      strokeWidth={MARK_STROKE_WIDTH}
      strokeLinejoin="miter"
      transform={variant === 'blason' ? BLASON_INNER_TRANSFORM : undefined}
    >
      <g stroke="currentColor" className={inverse ? 'text-inverse' : undefined}>
        {MARK_BODY_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d={MARK_ACCENT_PATH} stroke="currentColor" className={accentClassName} />
    </g>
  )

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
      focusable="false"
    >
      {variant === 'blason' ? (
        <>
          <path d={BLASON_PATH} fill="currentColor" />
          {strokes(true)}
        </>
      ) : (
        strokes(false)
      )}
    </svg>
  )
}
