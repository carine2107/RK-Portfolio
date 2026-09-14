/**
 * Privacy-friendly video embeds.
 *
 * Only YouTube and Vimeo links are accepted. They are turned into their
 * no-cookie players (youtube-nocookie.com, Vimeo with `dnt=1`), which the page
 * loads only after the visitor clicks "Play": nothing is requested from those
 * platforms before that.
 */

export type VideoEmbed = { provider: 'youtube' | 'vimeo'; id: string; embedUrl: string }

const YOUTUBE_ID = /^[\w-]{11}$/
const VIMEO_ID = /^\d{6,12}$/

export function parseVideoUrl(value: string | null | undefined): VideoEmbed | null {
  if (!value) return null
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const host = url.hostname.replace(/^www\.|^m\./, '')

  if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'youtu.be') {
    const segments = url.pathname.split('/').filter(Boolean)
    const id =
      host === 'youtu.be'
        ? segments[0]
        : (url.searchParams.get('v') ??
          (['embed', 'shorts', 'live'].includes(segments[0] ?? '') ? segments[1] : undefined))
    if (!id || !YOUTUBE_ID.test(id)) return null
    return {
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    }
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = url.pathname
      .split('/')
      .filter(Boolean)
      .find((segment) => VIMEO_ID.test(segment))
    if (!id) return null
    return {
      provider: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`,
    }
  }

  return null
}
