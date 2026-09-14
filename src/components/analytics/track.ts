/**
 * Analytics facade.
 *
 * No provider is bundled: events are forwarded to whatever privacy-friendly
 * script the owner configured (Umami or Plausible, both cookieless). When no
 * provider is configured the call is a no-op — nothing is collected, and no
 * cookie banner is required.
 */

export type AnalyticsEvent =
  | 'expert_profile_download'
  | 'cv_download'
  | 'book_preview_click'
  | 'video_play'
  | 'booking_click'
  | 'newsletter_subscribe'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'media_link_click'
  | 'work_with_me_click'
  | 'contact_form_success'
  | 'article_view'
  | 'book_purchase_click'
  | 'language_change'
  | 'theme_change'
  | 'business_click'

type AnalyticsPayload = Record<string, string | number | boolean>

type UmamiWindow = Window & {
  umami?: { track: (event: string, data?: AnalyticsPayload) => void }
  plausible?: (event: string, options?: { props: AnalyticsPayload }) => void
}

export function trackEvent(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return
  const w = window as UmamiWindow
  try {
    if (typeof w.umami?.track === 'function') {
      w.umami.track(event, payload)
      return
    }
    if (typeof w.plausible === 'function') {
      w.plausible(event, { props: payload })
    }
  } catch {
    /* analytics must never break the page */
  }
}
