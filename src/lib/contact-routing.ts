/**
 * Routing of a contact request to the company it concerns (pure, unit-tested).
 * The company's contact e-mail receives the notification; the general address
 * gets a copy so the owner keeps an overview of every request.
 */

export type RoutingBusiness = { name: string; contactEmail?: string | null } | null | undefined

export type Recipients = { to: string; cc: string[] }

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? ''

export function contactRecipients(business: RoutingBusiness, general: string): Recipients {
  const companyAddress = business?.contactEmail?.trim() ?? ''
  if (!companyAddress) return { to: general, cc: [] }
  if (!general || normalize(companyAddress) === normalize(general)) {
    return { to: companyAddress, cc: [] }
  }
  return { to: companyAddress, cc: [general] }
}

/** Slug sent by the form: letters, digits and dashes only, or nothing. */
export function businessSlug(value: unknown): string {
  if (typeof value !== 'string') return ''
  const slug = value.trim().toLowerCase()
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 100 ? slug : ''
}
