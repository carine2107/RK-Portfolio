'use client'

import { useConfig, useFormFields, useTranslation } from '@payloadcms/ui'
import { useEffect, useMemo, useState } from 'react'

import { fillTemplate, mailtoUrl, replyLocale } from '../../lib/follow-up'

type Template = {
  id: number | string
  title: string
  subject?: string | null
  body?: string | null
  requestTypes?: string[] | null
}

const TEXT = {
  title: {
    fr: 'Répondre avec un modèle',
    de: 'Mit Vorlage antworten',
    en: 'Reply with a template',
  },
  choose: { fr: 'Modèle', de: 'Vorlage', en: 'Template' },
  language: {
    fr: (code: string) =>
      `Réponse en ${{ fr: 'français', de: 'allemand', en: 'anglais' }[code]}, la langue du visiteur.`,
    de: (code: string) =>
      `Antwort auf ${{ fr: 'Französisch', de: 'Deutsch', en: 'Englisch' }[code]}, der Sprache des Besuchers.`,
    en: (code: string) =>
      `Reply in ${{ fr: 'French', de: 'German', en: 'English' }[code]}, the visitor’s language.`,
  },
  open: {
    fr: 'Ouvrir dans ma messagerie',
    de: 'In meinem E-Mail-Programm öffnen',
    en: 'Open in my mail client',
  },
  after: {
    fr: 'Relisez et envoyez depuis votre messagerie, puis passez le statut à « Répondue ».',
    de: 'In Ihrem E-Mail-Programm prüfen und senden, dann den Status auf „Beantwortet“ setzen.',
    en: 'Review and send from your mail client, then set the status to “Answered”.',
  },
  none: {
    fr: 'Aucun modèle de réponse pour l’instant.',
    de: 'Noch keine Antwortvorlagen.',
    en: 'No reply templates yet.',
  },
  create: { fr: 'Créer un modèle', de: 'Vorlage anlegen', en: 'Create a template' },
  loading: {
    fr: 'Chargement des modèles…',
    de: 'Vorlagen werden geladen…',
    en: 'Loading templates…',
  },
  failed: {
    fr: 'Les modèles n’ont pas pu être chargés. Rechargez la page.',
    de: 'Die Vorlagen konnten nicht geladen werden. Seite neu laden.',
    en: 'The templates could not be loaded. Reload the page.',
  },
  noEmail: {
    fr: 'Pas d’adresse e-mail sur cette demande.',
    de: 'Diese Anfrage hat keine E-Mail-Adresse.',
    en: 'This request has no e-mail address.',
  },
} as const

const value = (field: { value?: unknown } | undefined) =>
  typeof field?.value === 'string' ? field.value : ''

/**
 * Sidebar-free panel in a contact request: pick a reply template, check the
 * text filled in with the visitor's details, and open it in the user's own mail
 * client (mailto:). The website sends nothing itself.
 */
export function ReplyWithTemplate() {
  const {
    config: {
      routes: { admin: adminRoute, api: apiRoute },
    },
  } = useConfig()
  const { i18n } = useTranslation()
  const lang = replyLocale(i18n.language)
  const request = useFormFields(([fields]) => ({
    email: value(fields.email),
    name: value(fields.name),
    organisation: value(fields.organisation),
    subject: value(fields.subject),
    locale: value(fields.locale),
    requestType: value(fields.requestType),
  }))
  const locale = replyLocale(request.locale)

  const [templates, setTemplates] = useState<Template[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState('')

  useEffect(() => {
    let active = true
    fetch(`${apiRoute}/reply-templates?locale=${locale}&limit=100&depth=0&sort=title`, {
      credentials: 'include',
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((body: { docs?: Template[] }) => {
        if (active) setTemplates(body.docs ?? [])
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [apiRoute, locale])

  const ordered = useMemo(() => {
    const suggested = (template: Template) =>
      template.requestTypes?.includes(request.requestType) ? 0 : 1
    return [...(templates ?? [])].sort((a, b) => suggested(a) - suggested(b))
  }, [templates, request.requestType])

  const template = ordered.find((entry) => String(entry.id) === selected) ?? ordered[0]
  const subject = template ? fillTemplate(template.subject ?? '', request) : ''
  const body = template ? fillTemplate(template.body ?? '', request) : ''

  return (
    <div className="rk-reply">
      <h4 className="rk-reply__title">{TEXT.title[lang]}</h4>
      {!request.email ? (
        <p className="rk-reply__note">{TEXT.noEmail[lang]}</p>
      ) : failed ? (
        <p className="rk-reply__note">{TEXT.failed[lang]}</p>
      ) : templates === null ? (
        <p className="rk-reply__note">{TEXT.loading[lang]}</p>
      ) : ordered.length === 0 ? (
        <p className="rk-reply__note">
          {TEXT.none[lang]}{' '}
          <a href={`${adminRoute}/collections/reply-templates/create`}>{TEXT.create[lang]}</a>
        </p>
      ) : (
        <>
          <label className="rk-reply__label" htmlFor="rk-reply-template">
            {TEXT.choose[lang]}
          </label>
          <select
            id="rk-reply-template"
            className="rk-reply__select"
            value={template ? String(template.id) : ''}
            onChange={(event) => setSelected(event.target.value)}
          >
            {ordered.map((entry) => (
              <option key={entry.id} value={String(entry.id)}>
                {entry.title}
              </option>
            ))}
          </select>
          <p className="rk-reply__note">{TEXT.language[lang](locale)}</p>
          <div className="rk-reply__preview">
            <strong>{subject}</strong>
            <pre>{body}</pre>
          </div>
          <a
            className="btn btn--style-primary btn--size-small"
            href={mailtoUrl(request.email, subject, body)}
          >
            {TEXT.open[lang]}
          </a>
          <p className="rk-reply__note">{TEXT.after[lang]}</p>
        </>
      )}
    </div>
  )
}
