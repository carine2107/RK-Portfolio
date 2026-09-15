/**
 * Customer details entered in the cart before payment: contact and, for printed
 * books, the delivery address. The same rules run in the browser (form errors)
 * and on the server (checkout route). Pure module (unit-tested).
 */
import { isCountryCode } from '@/lib/countries'

/** Countries Stripe does not ship to or that are under sanctions. */
export const NO_SHIPPING = new Set(['BY', 'CU', 'FM', 'IR', 'KP', 'MH', 'PW', 'RU', 'SD', 'SY'])

export type CustomerDetails = {
  email: string
  name: string
  /** Street and number. */
  line1: string
  line2: string
  postalCode: string
  city: string
  /** ISO 3166-1 alpha-2 code. */
  country: string
}

export type CustomerField = keyof CustomerDetails

export type CustomerErrors = Partial<Record<CustomerField, 'required' | 'invalid'>>

export const CUSTOMER_FIELDS: CustomerField[] = [
  'email',
  'name',
  'line1',
  'line2',
  'postalCode',
  'city',
  'country',
]

/** Fields of a delivery address, asked only when a printed book is ordered. */
export const ADDRESS_FIELDS: CustomerField[] = ['line1', 'line2', 'postalCode', 'city', 'country']

export const EMPTY_CUSTOMER: CustomerDetails = {
  email: '',
  name: '',
  line1: '',
  line2: '',
  postalCode: '',
  city: '',
  country: '',
}

const MAX_LENGTH: Record<CustomerField, number> = {
  email: 254,
  name: 120,
  line1: 120,
  line2: 120,
  postalCode: 16,
  city: 80,
  country: 2,
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const POSTAL_CODE = /^[A-Za-z0-9][A-Za-z0-9 -]{1,15}$/

/** Trimmed text with control characters and repeated spaces turned into single spaces. */
const clean = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  const printable = Array.from(value, (char) => {
    const code = char.charCodeAt(0)
    return code < 32 || code === 127 ? ' ' : char
  }).join('')
  return printable.replace(/\s+/g, ' ').trim()
}

export function parseCustomer(
  input: unknown,
  requiresShipping: boolean,
): { ok: true; customer: CustomerDetails } | { ok: false; errors: CustomerErrors } {
  const source = input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
  const customer = { ...EMPTY_CUSTOMER }
  for (const field of CUSTOMER_FIELDS) customer[field] = clean(source[field])
  customer.email = customer.email.toLowerCase()
  customer.country = customer.country.toUpperCase()
  if (!requiresShipping) for (const field of ADDRESS_FIELDS) customer[field] = ''

  const errors: CustomerErrors = {}
  for (const field of CUSTOMER_FIELDS) {
    if (customer[field].length > MAX_LENGTH[field]) errors[field] = 'invalid'
  }

  if (!customer.email) errors.email = 'required'
  else if (!EMAIL.test(customer.email)) errors.email ??= 'invalid'

  if (!customer.name) errors.name = 'required'
  else if (customer.name.length < 2) errors.name ??= 'invalid'

  if (requiresShipping) {
    if (!customer.line1) errors.line1 = 'required'
    else if (customer.line1.length < 3) errors.line1 ??= 'invalid'

    if (!customer.postalCode) errors.postalCode = 'required'
    else if (!POSTAL_CODE.test(customer.postalCode)) errors.postalCode ??= 'invalid'

    if (!customer.city) errors.city = 'required'

    if (!customer.country) errors.country = 'required'
    else if (!isCountryCode(customer.country) || NO_SHIPPING.has(customer.country)) {
      errors.country = 'invalid'
    }
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, customer }
}
