'use client'

import { useTranslation } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Status = { configured: boolean; spreadsheetUrl: string | null; serviceAccount: string | null }

const TEXT = {
  title: { fr: 'Google Sheets', de: 'Google Sheets', en: 'Google Sheets' },
  body: {
    fr: 'Les nouvelles demandes et les abonnés confirmés sont copiés automatiquement dans le tableur.',
    de: 'Neue Anfragen und bestätigte Abonnenten werden automatisch in die Tabelle kopiert.',
    en: 'New requests and confirmed subscribers are copied to the spreadsheet automatically.',
  },
  open: { fr: 'Ouvrir le tableur', de: 'Tabelle öffnen', en: 'Open the spreadsheet' },
  sync: { fr: 'Tout resynchroniser', de: 'Alles neu synchronisieren', en: 'Resync everything' },
  syncing: { fr: 'Synchronisation…', de: 'Synchronisierung…', en: 'Syncing…' },
  done: {
    fr: (requests: number, subscribers: number) =>
      `Tableur à jour : ${requests} demande(s), ${subscribers} abonné(s).`,
    de: (requests: number, subscribers: number) =>
      `Tabelle aktualisiert: ${requests} Anfrage(n), ${subscribers} Abonnent(en).`,
    en: (requests: number, subscribers: number) =>
      `Spreadsheet up to date: ${requests} request(s), ${subscribers} subscriber(s).`,
  },
  failed: {
    fr: (account: string) =>
      `La synchronisation a échoué. Vérifiez que le tableur est partagé en « Éditeur » avec ${account}.`,
    de: (account: string) =>
      `Synchronisierung fehlgeschlagen. Prüfen Sie, ob die Tabelle mit ${account} als „Bearbeiter“ geteilt ist.`,
    en: (account: string) =>
      `Sync failed. Check that the spreadsheet is shared as "Editor" with ${account}.`,
  },
} as const

/**
 * Google Sheets panel above the subscribers and contact request lists. Shown
 * only when the sync is configured on the server.
 */
export function SheetsSync() {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'de' || i18n.language === 'en' ? i18n.language : 'fr'
  const [status, setStatus] = useState<Status | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/sheets', { credentials: 'same-origin' })
      .then((response) => (response.ok ? (response.json() as Promise<Status>) : null))
      .then(setStatus)
      .catch(() => setStatus(null))
  }, [])

  if (!status?.configured) return null

  const resync = async () => {
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/sheets', {
        method: 'POST',
        credentials: 'same-origin',
      })
      const body = (await response.json()) as {
        ok: boolean
        rows?: { 'contact-submissions': number; subscribers: number }
      }
      setMessage(
        body.ok && body.rows
          ? TEXT.done[lang](body.rows['contact-submissions'], body.rows.subscribers)
          : TEXT.failed[lang](status.serviceAccount ?? ''),
      )
    } catch {
      setMessage(TEXT.failed[lang](status.serviceAccount ?? ''))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rk-sheets">
      <p className="rk-sheets__text">
        <strong>{TEXT.title[lang]}</strong> — {TEXT.body[lang]}
      </p>
      <div className="rk-export__actions">
        {status.spreadsheetUrl ? (
          <a
            className="btn btn--style-secondary btn--size-small btn--icon-style-without-border"
            href={status.spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {TEXT.open[lang]}
          </a>
        ) : null}
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small btn--icon-style-without-border"
          onClick={() => void resync()}
          disabled={busy}
        >
          {busy ? TEXT.syncing[lang] : TEXT.sync[lang]}
        </button>
      </div>
      {message ? (
        <p role="status" className="rk-export__note">
          {message}
        </p>
      ) : null}
    </div>
  )
}
