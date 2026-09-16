'use client'

import { useConfig, useTranslation } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  applyBadge,
  badgeText,
  badgeTitle,
  contactCountUrl,
  NAV_LINK_IDS,
  SUBSCRIBERS_SEEN_KEY,
  subscribersCountUrl,
  type NavCounts,
} from './nav-badges'

const REFRESH_MS = 60_000

async function totalDocs(url: string): Promise<number> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) return 0
  const body = (await response.json()) as { totalDocs?: number }
  return typeof body.totalDocs === 'number' ? body.totalDocs : 0
}

/**
 * Orange counters in the admin navigation: contact requests still "New", and
 * newsletter subscriptions since the user last opened the subscribers list
 * (remembered per user in Payload preferences). Rendered once, after the
 * navigation links; it only decorates the existing links.
 */
export function NavBadges() {
  const {
    config: {
      routes: { admin: adminRoute, api: apiRoute },
    },
  } = useConfig()
  const { i18n } = useTranslation()
  const pathname = usePathname()
  const [counts, setCounts] = useState<NavCounts>({ contact: 0, subscribers: 0 })
  const seenAt = useRef<string | null>(null)

  const preferenceUrl = `${apiRoute}/payload-preferences/${SUBSCRIBERS_SEEN_KEY}`

  const saveSeenAt = useCallback(
    async (value: string) => {
      seenAt.current = value
      await fetch(preferenceUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: { seenAt: value } }),
      }).catch(() => undefined)
    },
    [preferenceUrl],
  )

  const refresh = useCallback(async () => {
    try {
      if (seenAt.current === null) {
        const response = await fetch(preferenceUrl, { credentials: 'include' })
        const stored = response.ok
          ? ((await response.json()) as { value?: { seenAt?: string } }).value?.seenAt
          : undefined
        // First visit: start counting from now rather than from every existing subscriber.
        if (stored) seenAt.current = stored
        else await saveSeenAt(new Date().toISOString())
      }
      const onSubscribersList = pathname.startsWith(`${adminRoute}/collections/subscribers`)
      if (onSubscribersList) await saveSeenAt(new Date().toISOString())

      const [contact, subscribers] = await Promise.all([
        totalDocs(contactCountUrl(apiRoute)),
        onSubscribersList
          ? Promise.resolve(0)
          : totalDocs(subscribersCountUrl(apiRoute, seenAt.current ?? new Date().toISOString())),
      ])
      setCounts({ contact, subscribers })
    } catch {
      /* network error: keep the previous counts */
    }
  }, [adminRoute, apiRoute, pathname, preferenceUrl, saveSeenAt])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => void refresh(), REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [refresh])

  // The navigation re-renders its links (for instance when one becomes active):
  // re-apply the badges whenever its DOM changes.
  useEffect(() => {
    const apply = () => {
      for (const kind of ['contact', 'subscribers'] as const) {
        applyBadge(
          document.getElementById(NAV_LINK_IDS[kind]),
          badgeText(counts[kind]),
          badgeTitle(kind, counts[kind], i18n.language),
        )
      }
    }
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [counts, i18n.language])

  return null
}
