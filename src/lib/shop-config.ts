/**
 * Payment provider configuration. Keys are read from the environment only
 * (never from the CMS, never sent to the browser). A provider counts as ready
 * only when all its keys are present: otherwise the shop stays closed and the
 * site keeps announcing direct sales as "coming soon".
 */

const read = (name: string): string => (process.env[name] ?? '').trim()

export const stripeConfig = {
  get secretKey() {
    return read('STRIPE_SECRET_KEY')
  },
  get webhookSecret() {
    return read('STRIPE_WEBHOOK_SECRET')
  },
}

export const paypalConfig = {
  get clientId() {
    return read('PAYPAL_CLIENT_ID')
  },
  get clientSecret() {
    return read('PAYPAL_CLIENT_SECRET')
  },
  get mode(): 'live' | 'sandbox' {
    return read('PAYPAL_MODE') === 'live' ? 'live' : 'sandbox'
  },
}

export function stripeReady(): boolean {
  return (
    /^(sk|rk)_(test|live)_/.test(stripeConfig.secretKey) &&
    stripeConfig.webhookSecret.startsWith('whsec_')
  )
}

export function paypalReady(): boolean {
  return paypalConfig.clientId.length > 0 && paypalConfig.clientSecret.length > 0
}

export function paymentsReady(): boolean {
  return stripeReady() || paypalReady()
}

export function paypalApiBase(): string {
  return paypalConfig.mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}
