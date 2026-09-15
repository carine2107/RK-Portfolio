import { describe, expect, it } from 'vitest'

import { adminLanguage, IMAGE_MIME_TYPES, unsupportedImageMessage } from '@/payload/upload-messages'

describe('image library upload messages', () => {
  it('accepts every image format of the library', () => {
    for (const type of IMAGE_MIME_TYPES) {
      expect(unsupportedImageMessage(type, 'fr')).toBeNull()
    }
    // No file (an edit of the alternative text only) is not an upload problem.
    expect(unsupportedImageMessage(undefined, 'fr')).toBeNull()
  })

  it('sends a video to YouTube or Vimeo, in the admin language', () => {
    expect(unsupportedImageMessage('video/mp4', 'fr')).toContain('YouTube ou Vimeo')
    expect(unsupportedImageMessage('video/quicktime', 'de')).toContain('YouTube oder Vimeo')
    expect(unsupportedImageMessage('video/webm', 'en')).toContain('YouTube or Vimeo')
  })

  it('lists the accepted formats for any other file', () => {
    expect(unsupportedImageMessage('application/pdf', 'fr')).toBe(
      'Format non accepté : seules les images JPG, PNG, WebP, AVIF ou SVG peuvent être ajoutées.',
    )
    expect(unsupportedImageMessage('image/gif', 'en')).toContain('only JPG, PNG, WebP, AVIF or SVG')
  })

  it('falls back to French for an unknown admin language', () => {
    expect(adminLanguage('de')).toBe('de')
    expect(adminLanguage('en')).toBe('en')
    expect(adminLanguage('it')).toBe('fr')
    expect(adminLanguage(undefined)).toBe('fr')
  })
})
