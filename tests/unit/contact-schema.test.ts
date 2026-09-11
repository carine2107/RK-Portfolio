import { describe, expect, it } from 'vitest'

import { contactSchema, toFieldErrors } from '@/lib/contact-schema'
import { countryOptions, isCountryCode } from '@/lib/countries'

const valid = {
  name: 'Jane Doe',
  organisation: 'Example Ltd',
  email: 'jane@example.com',
  country: 'DE',
  requestType: 'dueDiligence' as const,
  subject: 'Acquisition review',
  message: 'We are considering an acquisition and need a financial due diligence.',
  consent: true as const,
  locale: 'en',
}

describe('contact schema', () => {
  it('accepts a complete request', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })

  it('requires the privacy consent', () => {
    const result = contactSchema.safeParse({ ...valid, consent: false })
    expect(result.success).toBe(false)
    if (!result.success) expect(toFieldErrors(result.error).consent).toBe('consent')
  })

  it('rejects an invalid e-mail, a short message and an unknown country', () => {
    const result = contactSchema.safeParse({
      ...valid,
      email: 'not-an-email',
      message: 'too short',
      country: 'ZZ',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = toFieldErrors(result.error)
      expect(errors.email).toBe('email')
      expect(errors.message).toBe('message')
      expect(errors.country).toBe('country')
    }
  })

  it('rejects an unknown request type', () => {
    const result = contactSchema.safeParse({ ...valid, requestType: 'spam' })
    expect(result.success).toBe(false)
    if (!result.success) expect(toFieldErrors(result.error).requestType).toBe('requestType')
  })

  it('maps every issue to a message key, never to raw English text', () => {
    const result = contactSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      for (const value of Object.values(toFieldErrors(result.error))) {
        expect(value).toMatch(/^[a-zA-Z]+$/)
      }
    }
  })
})

describe('countries', () => {
  it('recognises ISO codes', () => {
    expect(isCountryCode('CM')).toBe(true)
    expect(isCountryCode('XX')).toBe(false)
  })

  it('localises and sorts the list', () => {
    const french = countryOptions('fr')
    const german = countryOptions('de')
    expect(french.length).toBeGreaterThan(150)
    expect(french.find((entry) => entry.code === 'DE')?.label).toBe('Allemagne')
    expect(german.find((entry) => entry.code === 'FR')?.label).toBe('Frankreich')

    const labels = french.map((entry) => entry.label)
    expect([...labels].sort((a, b) => a.localeCompare(b, 'fr'))).toEqual(labels)
  })
})
