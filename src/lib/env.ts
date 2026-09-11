/**
 * Typed access to the environment. Everything the application reads from
 * `process.env` goes through this module so that missing configuration is
 * visible in one place.
 */

const bool = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined || value === '') return fallback
  return value === 'true' || value === '1' || value === 'yes'
}

const int = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
)

export const isProduction = process.env.NODE_ENV === 'production'

export const cmsEnabled = bool(process.env.CMS_ENABLED, true)

export const emailConfig = {
  enabled: bool(process.env.EMAIL_ENABLED, false),
  host: process.env.SMTP_HOST ?? '',
  port: int(process.env.SMTP_PORT, 587),
  secure: bool(process.env.SMTP_SECURE, false),
  user: process.env.SMTP_USER ?? '',
  password: process.env.SMTP_PASSWORD ?? '',
  from: process.env.EMAIL_FROM ?? '',
  to: process.env.EMAIL_TO ?? '',
}

export const contactRateLimit = {
  max: int(process.env.CONTACT_RATE_LIMIT, 5),
  windowMs: int(process.env.CONTACT_RATE_WINDOW_MINUTES, 15) * 60 * 1000,
}

export const analyticsConfig = {
  provider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? '',
  scriptUrl: process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL ?? '',
  siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID ?? '',
}

export const analyticsEnabled =
  analyticsConfig.provider !== '' &&
  analyticsConfig.scriptUrl !== '' &&
  analyticsConfig.siteId !== ''
