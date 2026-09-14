'use client'

import { useTranslation } from '@payloadcms/ui'

const TEXT = {
  all: { fr: 'Exporter en CSV', de: 'Als CSV exportieren', en: 'Export as CSV' },
  confirmed: {
    fr: 'Exporter les abonnés confirmés',
    de: 'Bestätigte Abonnenten exportieren',
    en: 'Export confirmed subscribers',
  },
  note: {
    fr: 'Fichier pour Excel ou un outil d’e-mailing (séparateur « ; »). Il contient des données personnelles : à conserver en lieu sûr et à supprimer après usage.',
    de: 'Datei für Excel oder ein E-Mail-Tool (Trennzeichen „;“). Sie enthält personenbezogene Daten: sicher aufbewahren und nach Gebrauch löschen.',
    en: 'File for Excel or an e-mailing tool (";" separator). It contains personal data: keep it safe and delete it after use.',
  },
} as const

/**
 * CSV export buttons above the list of newsletter subscribers or contact
 * requests. The download is served by /api/admin/export/{collection}, which
 * checks the signed-in user.
 */
export function ExportCsvButton({
  collection,
}: {
  collection: 'subscribers' | 'contact-submissions'
}) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'de' || i18n.language === 'en' ? i18n.language : 'fr'
  const base = `/api/admin/export/${collection}?lang=${lang}`

  return (
    <div className="rk-export">
      <div className="rk-export__actions">
        <a
          className="btn btn--style-secondary btn--size-small btn--icon-style-without-border"
          href={base}
          download
        >
          {TEXT.all[lang]}
        </a>
        {collection === 'subscribers' ? (
          <a
            className="btn btn--style-secondary btn--size-small btn--icon-style-without-border"
            href={`${base}&status=confirmed`}
            download
          >
            {TEXT.confirmed[lang]}
          </a>
        ) : null}
      </div>
      <p className="rk-export__note">{TEXT.note[lang]}</p>
    </div>
  )
}
