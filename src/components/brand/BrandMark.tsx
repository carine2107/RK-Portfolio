import { MARK_FONT_FAMILY, MARK_LETTERS, MARK_RING } from '@/lib/brand-mark'

/**
 * Romial Kenmogne logo, drawn inline so it follows the site's colour tokens:
 * the R and the left half of the ring take the current text colour, the K and
 * the right half the accent (both change with the Appearance palette and the
 * dark theme). Decorative by default — the surrounding link carries the name.
 */
export function BrandMark({
  className = 'size-10',
  accentClassName = 'text-accent',
  title,
}: {
  className?: string
  /** Tailwind colour class of the gold half and the K. */
  accentClassName?: string
  title?: string
}) {
  const letterStyle = {
    fontFamily: `var(--font-playfair), ${MARK_FONT_FAMILY}`,
    fontSize: MARK_LETTERS.fontSize,
    fontWeight: MARK_LETTERS.fontWeight,
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
      focusable="false"
    >
      <path d={MARK_RING.left} fill="none" stroke="currentColor" strokeWidth={MARK_RING.width} />
      <path
        d={MARK_RING.right}
        fill="none"
        stroke="currentColor"
        strokeWidth={MARK_RING.width}
        className={accentClassName}
      />
      <text
        x={MARK_LETTERS.r}
        y={MARK_LETTERS.baseline}
        textAnchor="middle"
        fill="currentColor"
        style={letterStyle}
      >
        R
      </text>
      <text
        x={MARK_LETTERS.k}
        y={MARK_LETTERS.baseline}
        textAnchor="middle"
        fill="currentColor"
        className={accentClassName}
        style={letterStyle}
      >
        K
      </text>
    </svg>
  )
}
