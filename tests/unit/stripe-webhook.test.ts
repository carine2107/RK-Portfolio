import Stripe from 'stripe'
import { describe, expect, it } from 'vitest'

import { parseStripeEvent } from '@/lib/stripe-webhook'

const secret = 'whsec_unit_test_secret'
const stripe = new Stripe('sk_test_unit')
const payload = JSON.stringify({
  id: 'evt_test',
  object: 'event',
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test', metadata: { orderId: '12' } } },
})

describe('Stripe webhook signature', () => {
  it('accepts an event signed with the endpoint secret', () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret })
    expect(parseStripeEvent(payload, header, secret)?.type).toBe('checkout.session.completed')
  })

  it('refuses a missing, wrong or replayed signature', () => {
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret })
    expect(parseStripeEvent(payload, null, secret)).toBeNull()
    expect(parseStripeEvent(payload, header, 'whsec_other')).toBeNull()
    expect(parseStripeEvent(payload.replace('"12"', '"13"'), header, secret)).toBeNull()
    const old = stripe.webhooks.generateTestHeaderString({
      payload,
      secret,
      timestamp: Math.floor(Date.now() / 1000) - 3600,
    })
    expect(parseStripeEvent(payload, old, secret)).toBeNull()
  })
})
