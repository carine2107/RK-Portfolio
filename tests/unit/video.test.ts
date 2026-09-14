import { describe, expect, it } from 'vitest'

import { parseVideoUrl } from '@/lib/video'

describe('video links', () => {
  it('turns YouTube links into the no-cookie player', () => {
    const expected = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0'
    for (const url of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=42',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      'https://www.youtube.com/live/dQw4w9WgXcQ',
    ]) {
      expect(parseVideoUrl(url)?.embedUrl, url).toBe(expected)
    }
  })

  it('turns Vimeo links into the do-not-track player', () => {
    expect(parseVideoUrl('https://vimeo.com/76979871')?.embedUrl).toBe(
      'https://player.vimeo.com/video/76979871?autoplay=1&dnt=1',
    )
    expect(parseVideoUrl('https://player.vimeo.com/video/76979871')?.provider).toBe('vimeo')
  })

  it('rejects every other link', () => {
    for (const url of [
      '',
      'not a url',
      'javascript:alert(1)',
      'https://example.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=short',
      'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ',
      'https://vimeo.com/channels/staffpicks',
    ]) {
      expect(parseVideoUrl(url), url).toBeNull()
    }
  })
})
