import { z } from 'zod'

/**
 * No `new Function`: Zod would otherwise try to compile its parsers with eval,
 * which the site's Content-Security-Policy rightly blocks (and reports).
 */
z.config({ jitless: true })

/**
 * Newsletter sign-up, shared by the form and the API route. Issue messages are
 * translation keys under `newsletter.errors.*`.
 */
export const newsletterSchema = z.object({
  email: z.string().trim().min(5, 'email').max(200, 'email').email('email'),
  consent: z.literal(true, 'consent'),
  /** Honeypot: accepted by the schema, silently discarded by the API route. */
  company: z.string().max(200).optional(),
  locale: z.string().optional(),
  source: z.string().max(40).optional(),
})

export type NewsletterInput = z.infer<typeof newsletterSchema>

export type NewsletterResponse =
  | { ok: true }
  | {
      ok: false
      errors?: Partial<Record<'email' | 'consent', string>>
      reason?: 'rateLimit' | 'server' | 'unavailable'
    }
