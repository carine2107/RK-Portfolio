import { describe, expect, it } from 'vitest'

import { toCsv } from '@/lib/csv'
import { exportFileName, exportLanguage, exportRows, isExportCollection } from '@/lib/exports'

describe('CSV writer', () => {
  it('starts with a byte-order mark and uses ";" and CRLF', () => {
    const csv = toCsv([
      ['a', 'b'],
      ['1', '2'],
    ])
    expect(csv).toBe('﻿a;b\r\n1;2\r\n')
  })

  it('quotes separators, quotes and line breaks', () => {
    expect(toCsv([['x;y', 'say "hi"', 'line\nbreak']])).toBe(
      '﻿"x;y";"say ""hi""";"line\nbreak"\r\n',
    )
  })

  it('neutralises spreadsheet formulas typed by a visitor', () => {
    expect(toCsv([['=HYPERLINK("http://evil")', '+1', '-2', '@SUM(A1)', 'ok']])).toBe(
      '﻿"\'=HYPERLINK(""http://evil"")";\'+1;\'-2;\'@SUM(A1);ok\r\n',
    )
  })
})

describe('admin exports', () => {
  it('only exposes the two exportable collections', () => {
    expect(isExportCollection('subscribers')).toBe(true)
    expect(isExportCollection('contact-submissions')).toBe(true)
    expect(isExportCollection('users')).toBe(false)
    expect(isExportCollection('members')).toBe(false)
  })

  it('maps subscribers with headers and labels in the admin language', () => {
    const rows = exportRows(
      'subscribers',
      [
        {
          email: 'jane@example.com',
          locale: 'de',
          status: 'confirmed',
          createdAt: '2026-09-14T17:35:12.000Z',
          confirmedAt: '2026-09-14T17:40:00.000Z',
          source: 'footer',
        },
      ],
      'fr',
    )
    expect(rows[0]).toEqual([
      'E-mail',
      'Langue',
      'Statut',
      'Inscription (UTC)',
      'Consentement (UTC)',
      'Confirmation (UTC)',
      'Désinscription (UTC)',
      'Origine',
    ])
    expect(rows[1]).toEqual([
      'jane@example.com',
      'de',
      'Confirmé',
      '2026-09-14 17:35',
      '',
      '2026-09-14 17:40',
      '',
      'footer',
    ])
  })

  it('maps contact requests with qualification labels and score', () => {
    const [header, row] = exportRows(
      'contact-submissions',
      [
        {
          createdAt: '2026-09-14T08:00:00.000Z',
          priority: 'high',
          leadScore: 95,
          status: 'new',
          name: 'Jane',
          email: 'jane@example.com',
          requestType: 'dueDiligence',
          budget: 'over50k',
          timeline: 'unknown-value',
          emailDelivered: true,
        },
      ],
      'de',
    ) as [string[], string[]]
    const get = (label: string) => row[header.indexOf(label)]
    expect(get('Priorität')).toBe('Hoch')
    expect(get('Score')).toBe('95')
    expect(get('Art der Anfrage')).toBe('Financial Due Diligence')
    expect(get('Geschätztes Budget')).toBe('Über 50.000 €')
    expect(get('Gewünschter Beginn')).toBe('unknown-value')
    expect(get('Art der Organisation')).toBe('')
    expect(get('Benachrichtigung gesendet')).toBe('ja')
  })

  it('names files by language and date, defaulting to French', () => {
    const now = new Date('2026-09-14T10:00:00Z')
    expect(exportFileName('contact-submissions', 'en', now)).toBe('contact-requests-2026-09-14.csv')
    expect(exportFileName('subscribers', exportLanguage('xx'), now)).toBe(
      'abonnes-newsletter-2026-09-14.csv',
    )
  })
})
