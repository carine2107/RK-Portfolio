import { describe, expect, it } from 'vitest'

import {
  authorName,
  fillTemplate,
  followUpDue,
  historyEntries,
  mailtoUrl,
  replyLocale,
  stampNotes,
} from '@/lib/follow-up'
import { reminderEmail } from '@/lib/follow-up-reminders'

const NOW = new Date('2026-09-17T09:30:00.000Z')

describe('contact request follow-up', () => {
  it('records status changes and follow-up dates, nothing on creation', () => {
    expect(historyEntries(undefined, { status: 'new' }, 'Romial', NOW)).toEqual([])
    expect(
      historyEntries(
        { status: 'new', followUpAt: null },
        { status: 'answered', followUpAt: '2026-09-24T00:00:00.000Z' },
        'Romial',
        NOW,
      ),
    ).toEqual([
      {
        at: NOW.toISOString(),
        author: 'Romial',
        action: 'statusChanged',
        fromStatus: 'new',
        toStatus: 'answered',
      },
      {
        at: NOW.toISOString(),
        author: 'Romial',
        action: 'followUpSet',
        date: '2026-09-24T00:00:00.000Z',
      },
    ])
    expect(
      historyEntries({ followUpAt: '2026-09-24T00:00:00.000Z' }, { followUpAt: null }, '', NOW),
    ).toEqual([{ at: NOW.toISOString(), action: 'followUpCleared' }])
  })

  it('ignores a follow-up date saved again for the same day', () => {
    expect(
      historyEntries(
        { status: 'new', followUpAt: '2026-09-24T00:00:00.000Z' },
        { status: 'new', followUpAt: '2026-09-24T10:00:00.000Z' },
        'Romial',
        NOW,
      ),
    ).toEqual([])
  })

  it('stamps only new notes with their date and author', () => {
    const notes = stampNotes(
      [
        { id: 'a', text: 'Appel prévu', at: '2026-09-01T08:00:00.000Z', author: 'Carine' },
        { text: 'Devis envoyé' },
      ],
      'Romial',
      NOW,
    )
    expect(notes[0]).toEqual({
      id: 'a',
      text: 'Appel prévu',
      at: '2026-09-01T08:00:00.000Z',
      author: 'Carine',
    })
    expect(notes[1]).toEqual({ text: 'Devis envoyé', at: NOW.toISOString(), author: 'Romial' })
    expect(authorName({ name: ' ', email: 'owner@example.com' })).toBe('owner@example.com')
  })

  it('knows when a reminder is due', () => {
    const due = { status: 'inProgress', followUpAt: '2026-09-17T00:00:00.000Z' }
    expect(followUpDue(due, NOW)).toBe(true)
    expect(followUpDue({ ...due, followUpReminderSentAt: NOW.toISOString() }, NOW)).toBe(false)
    expect(followUpDue({ ...due, status: 'answered' }, NOW)).toBe(false)
    expect(followUpDue({ ...due, followUpAt: '2026-09-18T00:00:00.000Z' }, NOW)).toBe(false)
    expect(followUpDue({ status: 'new' }, NOW)).toBe(false)
  })

  it('fills reply templates and opens them in the mail client', () => {
    expect(
      fillTemplate('Bonjour {name}, merci ({organisation}) pour « {subject} ». {unknown}', {
        name: 'Awa',
        organisation: null,
        subject: 'Due diligence',
      }),
    ).toBe('Bonjour Awa, merci () pour « Due diligence ». {unknown}')
    expect(mailtoUrl('awa@example.com', 'Re: Offre & délais', 'Ligne 1\nLigne 2')).toBe(
      'mailto:awa@example.com?subject=Re%3A%20Offre%20%26%20d%C3%A9lais&body=Ligne%201%0ALigne%202',
    )
    expect(replyLocale('de')).toBe('de')
    expect(replyLocale('')).toBe('fr')
  })

  it('lists every due request with a link in the reminder e-mail', () => {
    const message = reminderEmail(
      [
        {
          id: 7,
          name: 'Awa <Diallo>',
          organisation: 'Sahel Invest',
          subject: 'Due diligence',
          followUpAt: '2026-09-17T00:00:00.000Z',
        },
        { id: 9, name: 'Jan', subject: 'Conférence', followUpAt: '2026-09-16T00:00:00.000Z' },
      ],
      'https://romialkenmogne.com/admin',
    )
    expect(message.subject).toBe('Relances prévues : 2 demandes de contact à reprendre')
    expect(message.text).toContain(
      'https://romialkenmogne.com/admin/collections/contact-submissions/7',
    )
    expect(message.html).toContain('Awa &lt;Diallo&gt;, Sahel Invest')
    expect(message.html).not.toContain('<Diallo>')
  })
})
