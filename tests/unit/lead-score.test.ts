import { describe, expect, it } from 'vitest'

import { contactSchema, toFieldErrors } from '@/lib/contact-schema'
import { scoreLead } from '@/lib/lead-score'

const shortMessage = 'We would like to discuss a possible assignment.'

describe('lead qualification score', () => {
  it('gives the maximum of 100 to a complete, urgent, well-funded core request', () => {
    expect(
      scoreLead({
        requestType: 'dueDiligence',
        organisation: 'Example GmbH',
        message: 'x'.repeat(300),
        budget: 'over50k',
        timeline: 'urgent',
        decisionRole: 'decisionMaker',
      }),
    ).toEqual({ score: 100, priority: 'high' })
  })

  it('ranks an unqualified request low', () => {
    expect(scoreLead({ requestType: 'other', message: shortMessage })).toEqual({
      score: 5,
      priority: 'low',
    })
  })

  it('uses the medium band between 35 and 59', () => {
    // 15 (core) + 15 (budget 5–20 k) + 10 (> 3 months) = 40
    expect(
      scoreLead({
        requestType: 'advisory',
        message: shortMessage,
        budget: 'from5to20k',
        timeline: 'later',
      }),
    ).toEqual({ score: 40, priority: 'medium' })
    // 10 (speaking) + 25 (20–50 k) + 20 (1–3 months) + 5 (organisation) = 60
    expect(
      scoreLead({
        requestType: 'speaking',
        organisation: 'Conference',
        message: shortMessage,
        budget: 'from20to50k',
        timeline: 'quarter',
      }).priority,
    ).toBe('high')
  })

  it('never scores the type of organisation nor unknown values', () => {
    const base = { requestType: 'consulting', message: shortMessage }
    expect(scoreLead({ ...base, organisationType: 'individual' })).toEqual(scoreLead(base))
    expect(scoreLead({ ...base, budget: 'a-lot', timeline: 'yesterday' })).toEqual(scoreLead(base))
  })
})

describe('contact schema — qualification answers', () => {
  const valid = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    country: 'DE',
    requestType: 'consulting',
    subject: 'Assignment',
    message: shortMessage,
    consent: true,
    locale: 'en',
  }

  it('keeps the questions optional, including empty answers from the form', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
    const parsed = contactSchema.safeParse({
      ...valid,
      organisationType: '',
      budget: '',
      timeline: 'urgent',
      decisionRole: '',
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.timeline).toBe('urgent')
      expect(parsed.data.budget).toBeUndefined()
    }
  })

  it('refuses values that are not proposed options', () => {
    const parsed = contactSchema.safeParse({ ...valid, budget: 'one-million' })
    expect(parsed.success).toBe(false)
    if (!parsed.success) expect(toFieldErrors(parsed.error).budget).toBe('qualification')
  })
})
