import {
  BLASON_INNER_TRANSFORM,
  BLASON_PATH,
  BRAND_COLORS,
  MARK_ACCENT_PATH,
  MARK_BODY_PATHS,
  MARK_STROKE_WIDTH,
} from '../../lib/brand-mark'

function Strokes({ inner, stroke }: { inner?: boolean; stroke: string }) {
  return (
    <g
      fill="none"
      strokeWidth={MARK_STROKE_WIDTH}
      strokeLinejoin="miter"
      transform={inner ? BLASON_INNER_TRANSFORM : undefined}
    >
      {MARK_BODY_PATHS.map((d) => (
        <path key={d} d={d} stroke={stroke} />
      ))}
      <path d={MARK_ACCENT_PATH} stroke={BRAND_COLORS.gold} />
    </g>
  )
}

/** Logo of the login screen: monogram + name, in the admin's text colour. */
export function AdminLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
      <svg viewBox="0 0 100 100" width={52} height={52} aria-hidden="true">
        <Strokes stroke="var(--theme-text)" />
      </svg>
      <span style={{ display: 'grid', gap: 4 }}>
        <span
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--theme-text)',
            whiteSpace: 'nowrap',
          }}
        >
          Romial Kenmogne
        </span>
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--theme-elevation-600)',
          }}
        >
          RK CMS
        </span>
      </span>
    </span>
  )
}

/** Icon of the admin navigation: the blason. */
export function AdminIcon() {
  return (
    <svg viewBox="0 0 100 100" width={26} height={26} aria-hidden="true">
      <path d={BLASON_PATH} fill={BRAND_COLORS.navy} />
      <Strokes inner stroke={BRAND_COLORS.ivory} />
    </svg>
  )
}
