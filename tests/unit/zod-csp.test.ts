import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('validation library under the Content-Security-Policy', () => {
  it('never compiles parsers with eval once a form schema is loaded', async () => {
    await import('@/lib/newsletter-schema')
    expect(z.config().jitless).toBe(true)

    const { contactSchema } = await import('@/lib/contact-schema')
    expect(z.config().jitless).toBe(true)
    // Validation still works in eval-free mode.
    expect(contactSchema.safeParse({}).success).toBe(false)
  })
})
