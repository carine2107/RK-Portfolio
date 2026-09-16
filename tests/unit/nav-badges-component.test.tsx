import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NavBadges } from '@/payload/components/NavBadges'

let pathname = '/admin'

vi.mock('@payloadcms/ui', () => ({
  useConfig: () => ({ config: { routes: { admin: '/admin', api: '/api/cms' } } }),
  useTranslation: () => ({ i18n: { language: 'fr' } }),
}))
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

const SEEN = '2026-09-10T08:00:00.000Z'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function navLinks() {
  document.body.innerHTML = `
    <nav>
      <a id="nav-contact-submissions" class="nav__link"><span class="nav__link-label">Demandes de contact</span></a>
      <a id="nav-subscribers" class="nav__link"><span class="nav__link-label">Abonnés newsletter</span></a>
    </nav>`
}

describe('NavBadges', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let storedSeenAt: string | null

  beforeEach(() => {
    pathname = '/admin'
    storedSeenAt = SEEN
    navLinks()
    fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/payload-preferences/')) {
        if (init?.method === 'POST') {
          storedSeenAt = JSON.parse(String(init.body)).value.seenAt
          return json({})
        }
        return storedSeenAt ? json({ value: { seenAt: storedSeenAt } }) : json({}, 404)
      }
      if (url.includes('/contact-submissions?')) return json({ totalDocs: 2 })
      if (url.includes('/subscribers?')) return json({ totalDocs: 1 })
      return json({}, 404)
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('shows the counts of new requests and new subscribers on the navigation links', async () => {
    render(<NavBadges />)
    const contact = document.getElementById('nav-contact-submissions')!
    const subscribers = document.getElementById('nav-subscribers')!
    await waitFor(() => expect(contact.getAttribute('data-rk-badge')).toBe('2'))
    expect(contact.getAttribute('title')).toBe('2 nouvelles demandes')
    expect(subscribers.getAttribute('data-rk-badge')).toBe('1')
    const subscribersQuery = fetchMock.mock.calls
      .map(([url]) => String(url))
      .find((url) => url.includes('/subscribers?'))
    expect(subscribersQuery).toContain(encodeURIComponent(SEEN))
  })

  it('clears the subscribers badge once the list is opened', async () => {
    pathname = '/admin/collections/subscribers'
    render(<NavBadges />)
    const contact = document.getElementById('nav-contact-submissions')!
    await waitFor(() => expect(contact.getAttribute('data-rk-badge')).toBe('2'))
    expect(document.getElementById('nav-subscribers')!.hasAttribute('data-rk-badge')).toBe(false)
    expect(storedSeenAt).not.toBe(SEEN)
  })

  it('starts counting from the first visit instead of flagging every past subscriber', async () => {
    storedSeenAt = null
    render(<NavBadges />)
    await waitFor(() => {
      const subscribersQuery = fetchMock.mock.calls
        .map(([url]) => String(url))
        .find((url) => url.includes('/subscribers?'))
      expect(storedSeenAt).not.toBeNull()
      expect(subscribersQuery).toContain(encodeURIComponent(storedSeenAt!))
    })
  })

  it('re-applies the badge when the navigation re-renders a link', async () => {
    render(<NavBadges />)
    await waitFor(() =>
      expect(
        document.getElementById('nav-contact-submissions')!.getAttribute('data-rk-badge'),
      ).toBe('2'),
    )
    navLinks()
    await waitFor(() =>
      expect(
        document.getElementById('nav-contact-submissions')!.getAttribute('data-rk-badge'),
      ).toBe('2'),
    )
  })
})
