/**
 * Typed access to the environment. Everything the application reads from
 * `process.env` goes through this module so that missing configuration is
 * visible in one place.
 */

import { validMeasurementId } from '@/lib/consent'

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

/** Months a contact request is kept after its last change; 0 disables deletion. */
export const contactRetentionMonths = int(process.env.CONTACT_RETENTION_MONTHS, 24)
/** Audit log entries older than this are deleted (0 = kept forever). */
export const auditLogRetentionMonths = int(process.env.AUDIT_LOG_RETENTION_MONTHS, 12)

/**
 * Azure OpenAI, used by the visitor assistant. The assistant only appears when
 * the endpoint, the key and the deployment are all set.
 */
export const azureOpenAI = {
  enabled: bool(process.env.ASSISTANT_ENABLED, true),
  endpoint: process.env.AZURE_OPENAI_ENDPOINT ?? '',
  apiKey: process.env.AZURE_OPENAI_API_KEY ?? '',
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? '',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2024-10-21',
  maxTokens: int(process.env.AZURE_OPENAI_MAX_TOKENS, 500),
  timeoutMs: int(process.env.AZURE_OPENAI_TIMEOUT_SECONDS, 30) * 1000,
}

/** Questions allowed per visitor and per window (anti-abuse, shared cost). */
export const assistantRateLimit = {
  max: int(process.env.ASSISTANT_RATE_LIMIT, 20),
  windowMs: int(process.env.ASSISTANT_RATE_WINDOW_MINUTES, 15) * 60 * 1000,
}

export const analyticsConfig = {
  provider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER ?? '',
  scriptUrl: process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL ?? '',
  siteId: process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID ?? '',
}

/**
 * Google Analytics 4 measurement id ("G-…") when the provider is `google`,
 * otherwise ''. Google Analytics sets cookies: it is loaded only after consent.
 */
export const googleAnalyticsId =
  analyticsConfig.provider === 'google' ? validMeasurementId(analyticsConfig.siteId) : ''

export const analyticsEnabled =
  analyticsConfig.provider === 'google'
    ? googleAnalyticsId !== ''
    : analyticsConfig.provider !== '' &&
      analyticsConfig.scriptUrl !== '' &&
      analyticsConfig.siteId !== ''
