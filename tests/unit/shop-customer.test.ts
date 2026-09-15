import { describe, expect, it } from 'vitest'

import { parseCustomer } from '@/lib/shop-customer'

const address = {
  email: ' Lecteur@Example.org ',
  name: 'Awa Nguema',
  line1: 'Hauptstraße 12',
  line2: '',
  postalCode: '10115',
  city: 'Berlin',
  country: 'de',
}

describe('customer details before payment', () => {
  it('accepts a complete delivery address and normalises it', () => {
    const result = parseCustomer(address, true)
    expect(result).toEqual({
      ok: true,
      customer: { ...address, email: 'lecteur@example.org', country: 'DE' },
    })
  })

  it('requires the address fields for a printed book', () => {
    const result = parseCustomer({ email: 'a@b.de', name: 'Awa' }, true)
    expect(result).toEqual({
      ok: false,
      errors: { line1: 'required', postalCode: 'required', city: 'required', country: 'required' },
    })
  })

  it('asks only contact details for digital products and drops any address', () => {
    const result = parseCustomer({ ...address, country: 'XX' }, false)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.customer.line1).toBe('')
      expect(result.customer.country).toBe('')
    }
  })

  it('rejects invalid values', () => {
    const result = parseCustomer(
      {
        ...address,
        email: 'not-an-email',
        name: 'A',
        postalCode: '<script>',
        country: 'RU',
        city: 'x'.repeat(81),
      },
      true,
    )
    expect(result).toEqual({
      ok: false,
      errors: {
        email: 'invalid',
        name: 'invalid',
        postalCode: 'invalid',
        country: 'invalid',
        city: 'invalid',
      },
    })
  })

  it('cleans control characters and extra spaces, and ignores junk input', () => {
    const result = parseCustomer({ ...address, name: 'Awa\n\t  Nguema ', line2: 42 }, true)
    expect(result.ok && result.customer.name).toBe('Awa Nguema')
    expect(result.ok && result.customer.line2).toBe('')
    expect(parseCustomer(null, false)).toEqual({
      ok: false,
      errors: { email: 'required', name: 'required' },
    })
  })
})
