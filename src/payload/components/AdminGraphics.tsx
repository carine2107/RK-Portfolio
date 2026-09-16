/**
 * Romial Kenmogne logo in the CMS: login screen and navigation icon.
 *
 * The admin does not load the site's fonts, so it shows the generated image
 * (logo on the navy brand colour, readable on both admin themes). Regenerate it
 * with `npm run brand:assets`.
 */

/** Logo of the login screen: logo + name, in the admin's text colour. */
export function AdminLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand file in the admin */}
      <img
        src="/brand/rk-logo-navy.png"
        alt=""
        width={56}
        height={56}
        style={{ borderRadius: 12, display: 'block' }}
      />
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

/** Icon of the admin navigation. */
export function AdminIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand file in the admin
    <img
      src="/brand/rk-logo-navy.png"
      alt=""
      width={26}
      height={26}
      style={{ borderRadius: 6, display: 'block' }}
    />
  )
}
