import { renderToStaticMarkup } from 'react-dom/server'
import type { ServerProps } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { AdminDashboard } from '@/payload/components/AdminDashboard'

function fakePayload() {
  const count = vi.fn(async ({ collection, where }: { collection: string; where: unknown }) => {
    const query = JSON.stringify(where)
    if (collection === 'subscribers') {
      if (query.includes('confirmedAt')) return { totalDocs: 3 }
      if (query.includes('pending')) return { totalDocs: 2 }
      return { totalDocs: 41 }
    }
    if (query.includes('"requestType":{"equals":"consulting"}')) return { totalDocs: 4 }
    if (query.includes('requestType')) return { totalDocs: 0 }
    if (query.includes('"status":{"equals":"new"}')) return { totalDocs: 7 }
    return { totalDocs: 2 }
  })
  const find = vi.fn(async () => ({
    totalDocs: 1,
    docs: [
      {
        id: 12,
        name: 'Awa Diallo',
        organisation: 'Sahel Invest',
        subject: 'Due diligence',
        status: 'new',
        createdAt: '2026-09-15T08:00:00.000Z',
      },
    ],
  }))
  return {
    count,
    find,
    config: { routes: { admin: '/admin' } },
    logger: { error: vi.fn() },
  }
}

async function render(props: Partial<ServerProps>) {
  const element = await AdminDashboard(props as ServerProps)
  return element ? renderToStaticMarkup(element) : ''
}

describe('AdminDashboard', () => {
  it('shows the key figures, charts and high-priority requests', async () => {
    const payload = fakePayload()
    const html = await render({
      payload: payload as unknown as ServerProps['payload'],
      user: { id: 1 } as ServerProps['user'],
      i18n: { language: 'fr' } as ServerProps['i18n'],
    })
    expect(html).toContain('Vue d’ensemble')
    expect(html).toContain('Nouvelles demandes')
    expect(html).toContain('>7<')
    expect(html).toContain('>41<')
    expect(html).toContain('3 nouveau(x) ce mois-ci · 2 en attente de confirmation')
    expect(html).toContain('Mission de conseil')
    expect(html).toContain('href="/admin/collections/contact-submissions/12"')
    expect(html).toContain('Awa Diallo · Sahel Invest')
    // Every query runs with the signed-in user's permissions.
    for (const [args] of [...payload.count.mock.calls, ...payload.find.mock.calls] as unknown as [
      { overrideAccess: boolean },
    ][]) {
      expect(args.overrideAccess).toBe(false)
    }
  })

  it('renders nothing without a signed-in user or when the figures fail', async () => {
    expect(await render({ payload: fakePayload() as unknown as ServerProps['payload'] })).toBe('')
    const broken = fakePayload()
    broken.count.mockRejectedValue(new Error('db down'))
    expect(
      await render({
        payload: broken as unknown as ServerProps['payload'],
        user: { id: 1 } as ServerProps['user'],
      }),
    ).toBe('')
    expect(broken.logger.error).toHaveBeenCalled()
  })
})
