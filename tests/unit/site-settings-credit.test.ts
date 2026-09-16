import type { Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { SiteSettings } from '@/payload/globals/SiteSettings'

/** Every named field of the global, whatever tabs or rows contain it. */
function namedFields(fields: Field[]): Field[] {
  return fields.flatMap((field) => {
    if ('tabs' in field) return field.tabs.flatMap((tab) => namedFields(tab.fields))
    if ('fields' in field && !('name' in field)) return namedFields(field.fields)
    return [field]
  })
}

const field = (name: string) =>
  namedFields(SiteSettings.fields).find(
    (entry) => 'name' in entry && entry.name === name,
  ) as Field & {
    access?: { create?: (args: unknown) => boolean; update?: (args: unknown) => boolean }
    admin?: { readOnly?: boolean; hidden?: boolean }
    defaultValue?: unknown
  }

describe('footer credit of the site settings', () => {
  const admin = { req: { user: { role: 'admin' } } }

  it('shows the Nana-Consulting credit read-only and refuses any change, even to an admin', () => {
    const credit = field('creditName')
    expect(credit.defaultValue).toBe('Nana-Consulting')
    expect(credit.admin?.readOnly).toBe(true)
    expect(credit.access?.update?.(admin)).toBe(false)
    expect(credit.access?.create?.(admin)).toBe(false)
  })

  it('hides the credit link and refuses any change', () => {
    const link = field('creditUrl')
    expect(link.admin?.hidden).toBe(true)
    expect(link.access?.update?.(admin)).toBe(false)
    expect(link.access?.create?.(admin)).toBe(false)
  })
})
