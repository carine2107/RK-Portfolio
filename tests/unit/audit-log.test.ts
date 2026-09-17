import { describe, expect, it } from 'vitest'

import { adminPath, changedFields, documentTitle, saveAction, userLabel } from '@/lib/audit-log'
import { retentionCutoff } from '@/lib/retention'

describe('admin audit log', () => {
  it('lists changed field names only, ignoring bookkeeping fields', () => {
    expect(
      changedFields(
        { id: 1, title: 'A', summary: 'x', updatedAt: '1', _status: 'draft', tags: ['a'] },
        { id: 1, title: 'B', summary: 'x', updatedAt: '2', _status: 'published', tags: ['a', 'b'] },
      ),
    ).toEqual(['tags', 'title'])
    expect(changedFields({ title: 'A' }, { title: 'A' })).toEqual([])
    expect(changedFields(undefined, { title: 'A', hash: 'secret' })).toEqual(['title'])
  })

  it('names what a save did', () => {
    expect(saveAction('create', undefined, { _status: 'published' })).toBe('create')
    expect(saveAction('create', undefined, { title: 'no drafts' })).toBe('create')
    expect(saveAction('create', undefined, { _status: 'draft' })).toBe('draft')
    expect(saveAction('update', { _status: 'draft' }, { _status: 'published' })).toBe('publish')
    expect(saveAction('update', { _status: 'published' }, { _status: 'draft' })).toBe('unpublish')
    expect(saveAction('update', { _status: 'draft' }, { _status: 'draft' })).toBe('draft')
    expect(saveAction('update', { _status: 'published' }, { _status: 'published' })).toBe('update')
    expect(saveAction('update', {}, {})).toBe('update')
  })

  it('finds a readable title and user label', () => {
    expect(documentTitle({ id: 3, name: 'KAILI Event' }, 'name')).toBe('KAILI Event')
    expect(documentTitle({ id: 4, subject: 'Due diligence' })).toBe('Due diligence')
    expect(documentTitle({ id: 5, number: 2026001 }, 'number')).toBe('2026001')
    expect(documentTitle({ id: 6 })).toBe('#6')
    expect(userLabel({ name: 'Romial', email: 'r@example.com' })).toBe('Romial (r@example.com)')
    expect(userLabel({ email: 'r@example.com' })).toBe('r@example.com')
  })

  it('links to the admin screen and keeps entries 12 months by default', () => {
    expect(adminPath('/admin', 'collection', 'books', '7')).toBe('/admin/collections/books/7')
    expect(adminPath('/admin', 'global', 'site-settings')).toBe('/admin/globals/site-settings')
    expect(retentionCutoff(12, new Date('2026-09-17T00:00:00Z'))?.toISOString()).toBe(
      '2025-09-17T00:00:00.000Z',
    )
  })
})
