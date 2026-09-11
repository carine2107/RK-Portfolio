import { z } from 'zod'

import { REQUEST_TYPES } from '@/payload/collections/ContactSubmissions'
import { isCountryCode } from '@/lib/countries'

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
const REPORTABLE_FIELDS = new Set([
  'name',
  'organisation',
  'email',
  'country',
  'requestType',
  'subject',
  'message',
  'consent',
])

/**
 * Flattens Zod issues into `{ field: translationKey }`.
 *
 * The key is always the field name: Zod emits its own English message for a
 * missing value, which must never reach the visitor.
 */
export function toFieldErrors(error: z.ZodError): ContactFieldErrors {
  const errors: ContactFieldErrors = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (typeof field !== 'string') continue
    if (!REPORTABLE_FIELDS.has(field) || field in errors) continue
    errors[field as keyof ContactInput] = field
  }
  return errors
}

export type ContactResponse =
  | { ok: true; emailSent: boolean }
  | { ok: false; errors?: ContactFieldErrors; reason?: 'rateLimit' | 'server' }
