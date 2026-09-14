import Stripe from 'stripe'

/**
 * Verifies a Stripe webhook signature (HMAC, no network call) and returns the
 * event, or null when the signature, timestamp or payload is not valid.
 */
let verifier: Stripe | null = null

export function parseStripeEvent(
  body: string,
  signature: string | null,
  secret: string,
): Stripe.Event | null {
  if (!signature || !secret) return null
  // The secret API key is not needed to check a signature.
  verifier ??= new Stripe('sk_test_signature_verification_only')
  try {
    return verifier.webhooks.constructEvent(body, signature, secret)
  } catch {
    return null
  }
}
