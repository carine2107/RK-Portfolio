import { describe, expect, it } from 'vitest'

import { previewUrl } from '@/payload/preview'

const options = (locale: string) => ({ locale }) as never

describe('CMS preview button', () => {
  it('opens the public page of the entry through the preview route', () => {
    const url = previewUrl('/books')({ slug: 'mon-livre' }, options('fr'))
    expect(url).toMatch(/\/api\/preview\?locale=fr&path=%2Fbooks%2Fmon-livre$/)
  })

  it('is hidden while the entry has no slug', () => {
    expect(previewUrl('/expertise')({}, options('de'))).toBeNull()
    expect(previewUrl('/expertise')({ slug: '' }, options('de'))).toBeNull()
  })

  it('opens the list page for collections without detail pages', () => {
    const url = previewUrl('/businesses', false)({ slug: 'kaili-event' }, options('en'))
    expect(url).toMatch(/\/api\/preview\?locale=en&path=%2Fbusinesses$/)
  })

  it('encodes the slug', () => {
    const url = previewUrl('/legal')({ slug: 'a&b?c' }, options('fr'))
    expect(url).toMatch(/path=%2Flegal%2Fa%26b%3Fc$/)
  })
})
