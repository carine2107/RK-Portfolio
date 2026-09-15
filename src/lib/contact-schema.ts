import { z } from 'zod'

/**
 * No `new Function`: Zod would otherwise try to compile its parsers with eval,
 * which the site's Content-Security-Policy rightly blocks (and reports).
 */
z.config({ jitless: true })

import { REQUEST_TYPES } from '@/payload/collections/ContactSubmissions'
import { isCountryCode } from '@/lib/countries'
import {
  BUDGETS,
  DECISION_ROLES,
  ORGANISATION_TYPES,
  QUALIFICATION_FIELDS,
  TIMELINES,
} from '@/lib/lead-score'

/** Optional qualification answer: "" (left on "Choose…") becomes undefined. */
const optionalChoice = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.enum(values, 'qualification').optional(),
  )

/**
 * Single source of truth for the contact form, used by the browser and by the
 * API route. Every issue message is a *translation key* under
 * `contact.errors.*`, so validation messages are always shown in the visitor's
 * language and never hard-coded in a component.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'name').max(120, 'name'),
  organisation: z.string().trim().max(200, 'organisation').optional(),
  email: z.string().trim().min(5, 'email').max(200, 'email').email('email'),
  country: z.string().trim().refine(isCountryCode, 'country'),
  requestType: z.enum(REQUEST_TYPES, 'requestType'),
  subject: z.string().trim().min(3, 'subject').max(200, 'subject'),
  message: z.string().trim().min(20, 'message').max(5000, 'message'),
  /** Lead qualification — optional questions, see `src/lib/lead-score.ts`. */
  organisationType: optionalChoice(ORGANISATION_TYPES),
  budget: optionalChoice(BUDGETS),
  timeline: optionalChoice(TIMELINES),
  decisionRole: optionalChoice(DECISION_ROLES),
  consent: z.literal(true, 'consent'),
  /**
   * Honeypot: real visitors never fill this field. It is accepted by the schema
   * (so the response looks identical to a valid one) and handled in the API
   * route, which discards the submission without telling the sender.
   */
  company: z.string().max(200).optional(),
  locale: z.string().optional(),
})

export type ContactInput = z.infer<typeof contactSchema>

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>

/** Fields the visitor can actually correct — `company` is the honeypot. */
const REPORTABLE_FIELDS = new Set<string>([
  'name',
  'organisation',
  'email',
  'country',
  'requestType',
  'subject',
  'message',
  'consent',
  ...QUALIFICATION_FIELDS,
])

const QUALIFICATION = new Set<string>(QUALIFICATION_FIELDS)

/**
 * Flattens Zod issues into `{ field: translationKey }`.
 *
 * The key is the field name (all qualification questions share the
 * `qualification` key): Zod emits its own English message for a missing value,
 * which must never reach the visitor.
 */
export function toFieldErrors(error: z.ZodError): ContactFieldErrors {
  const errors: ContactFieldErrors = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field !== 'string') continue
    if (!REPORTABLE_FIELDS.has(field) || field in errors) continue
    errors[field as keyof ContactInput] = QUALIFICATION.has(field) ? 'qualification' : field
  }
  return errors
}

export type ContactResponse =
  | { ok: true; emailSent: boolean; suggestBooking?: boolean }
  | { ok: false; errors?: ContactFieldErrors; reason?: 'rateLimit' | 'server' }
