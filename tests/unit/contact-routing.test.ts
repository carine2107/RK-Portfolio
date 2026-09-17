import { describe, expect, it } from 'vitest'

import { businessSlug, contactRecipients } from '@/lib/contact-routing'
import { contactSchema } from '@/lib/contact-schema'

describe('contact requests routed to a company', () => {
  const general = 'contact@romialkenmogne.com'

  it('sends to the company with a copy to the general address', () => {
    expect(
      contactRecipients(
        { name: 'RK Business Consulting', contactEmail: 'contact@rk-businessconsulting.com' },
        general,
      ),
    ).toEqual({ to: 'contact@rk-businessconsulting.com', cc: [general] })
  })

  it('keeps the general address alone for a general request or a company without e-mail', () => {
    expect(contactRecipients(null, general)).toEqual({ to: general, cc: [] })
    expect(contactRecipients({ name: 'KAILI Event', contactEmail: '  ' }, general)).toEqual({
      to: general,
      cc: [],
    })
  })

  it('never copies an address to itself and works without a general address', () => {
    expect(
      contactRecipients({ name: 'RK', contactEmail: 'Contact@RomialKenmogne.com' }, general),
    ).toEqual({ to: 'Contact@RomialKenmogne.com', cc: [] })
    expect(contactRecipients({ name: 'RK', contactEmail: 'a@example.com' }, '')).toEqual({
      to: 'a@example.com',
      cc: [],
    })
  })

  it('accepts only well-formed company slugs', () => {
    expect(businessSlug(' RK-Business-Consulting ')).toBe('rk-business-consulting')
    for (const value of ['', 'a b', '../admin', 'x--y', '-x', 42, null, 'a'.repeat(101)]) {
      expect(businessSlug(value), String(value)).toBe('')
    }
  })

  it('lets the form send an optional company', () => {
    const base = {
      name: 'Awa Diallo',
      email: 'awa@example.com',
      country: 'DE',
      requestType: 'consulting',
      subject: 'Accompagnement',
      message: 'Un message suffisamment long pour la validation du formulaire.',
      consent: true,
    }
    expect(contactSchema.safeParse(base).success).toBe(true)
    expect(contactSchema.safeParse({ ...base, business: 'rk-business-consulting' }).success).toBe(
      true,
    )
    expect(contactSchema.safeParse({ ...base, business: 'x'.repeat(101) }).success).toBe(false)
  })
})
