import type { CollectionConfig, GlobalConfig } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath: (...args: unknown[]) => revalidatePath(...args) }))

import {
  affectsPublicSite,
  refreshAfterChange,
  withGlobalSiteRefresh,
  withSiteRefresh,
} from '@/payload/hooks/revalidate'

type ChangeArgs = Parameters<typeof refreshAfterChange>[0]

describe('public site refresh after CMS changes', () => {
  afterEach(() => revalidatePath.mockReset())

  it('refreshes for publications, unpublications and content without drafts only', () => {
    expect(affectsPublicSite({ _status: 'published' }, { _status: 'draft' })).toBe(true)
    expect(affectsPublicSite({ _status: 'draft' }, { _status: 'published' })).toBe(true)
    expect(affectsPublicSite({}, {})).toBe(true)
    expect(affectsPublicSite({ _status: 'draft' }, { _status: 'draft' })).toBe(false)
    expect(affectsPublicSite({ _status: 'draft' }, undefined)).toBe(false)
  })

  it('marks every public page stale when published content changes', async () => {
    const doc = { id: 1, _status: 'published' }
    const result = await refreshAfterChange({ doc, previousDoc: {} } as unknown as ChangeArgs)
    expect(result).toBe(doc)
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('does not refresh for a draft that was never published', async () => {
    await refreshAfterChange({
      doc: { _status: 'draft' },
      previousDoc: { _status: 'draft' },
    } as unknown as ChangeArgs)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('never fails a save when called outside a Next.js request', async () => {
    revalidatePath.mockImplementation(() => {
      throw new Error('static generation store missing')
    })
    await expect(
      refreshAfterChange({ doc: {}, previousDoc: {} } as unknown as ChangeArgs),
    ).resolves.toEqual({})
  })

  it('keeps the existing hooks of collections and globals', () => {
    const existing = vi.fn()
    const collection = withSiteRefresh({
      slug: 'books',
      fields: [],
      hooks: { afterChange: [existing] },
    } as CollectionConfig)
    expect(collection.hooks?.afterChange).toHaveLength(2)
    expect(collection.hooks?.afterChange?.[0]).toBe(existing)
    expect(collection.hooks?.afterDelete).toHaveLength(1)
    const global = withGlobalSiteRefresh({ slug: 'home-page', fields: [] } as GlobalConfig)
    expect(global.hooks?.afterChange).toHaveLength(1)
  })
})
