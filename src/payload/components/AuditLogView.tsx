import type { ListViewServerProps } from 'payload'

import { AUDIT_ACTIONS } from '../../lib/audit-log'
import {
  AUDIT_PAGE_SIZE,
  AUDIT_PERIODS,
  AUDIT_TIME_ZONE,
  auditQuery,
  auditWhere,
  groupByDay,
  initial,
  parseFilters,
} from '../../lib/audit-log-view'
import { ACTION_LABELS } from '../collections/AuditLogs'

type Lang = 'fr' | 'de' | 'en'

type Entry = {
  id: number
  createdAt: string
  userLabel?: string | null
  action?: string | null
  entity?: string | null
  documentTitle?: string | null
  documentId?: string | null
  changedFields?: string | null
  locale?: string | null
  link?: string | null
}

const TEXT = {
  title: { fr: 'Journal d’audit', de: 'Audit-Protokoll', en: 'Audit log' },
  lead: {
    fr: 'Historique des actions effectuées dans l’administration',
    de: 'Verlauf der Aktionen in der Verwaltung',
    en: 'History of the actions taken in the admin',
  },
  periods: {
    day: { fr: 'Jour', de: 'Tag', en: 'Day' },
    week: { fr: 'Semaine', de: 'Woche', en: 'Week' },
    month: { fr: 'Mois', de: 'Monat', en: 'Month' },
    year: { fr: 'Année', de: 'Jahr', en: 'Year' },
    all: { fr: 'Tout', de: 'Alle', en: 'All' },
  },
  search: { fr: 'Rechercher', de: 'Suchen', en: 'Search' },
  searchHint: {
    fr: 'Utilisateur, élément ou champ',
    de: 'Benutzer, Element oder Feld',
    en: 'User, item or field',
  },
  action: { fr: 'Action', de: 'Aktion', en: 'Action' },
  entity: { fr: 'Section', de: 'Bereich', en: 'Section' },
  all: { fr: 'Toutes', de: 'Alle', en: 'All' },
  apply: { fr: 'Filtrer', de: 'Filtern', en: 'Filter' },
  reset: { fr: 'Réinitialiser', de: 'Zurücksetzen', en: 'Reset' },
  columns: {
    date: { fr: 'Date/heure', de: 'Datum/Uhrzeit', en: 'Date/time' },
    user: { fr: 'Utilisateur', de: 'Benutzer', en: 'User' },
    action: { fr: 'Action', de: 'Aktion', en: 'Action' },
    entity: { fr: 'Élément', de: 'Element', en: 'Item' },
  },
  activities: {
    fr: (n: number) => `${n} activité${n > 1 ? 's' : ''}`,
    de: (n: number) => `${n} ${n > 1 ? 'Aktivitäten' : 'Aktivität'}`,
    en: (n: number) => `${n} ${n > 1 ? 'activities' : 'activity'}`,
  },
  fields: { fr: 'Champs', de: 'Felder', en: 'Fields' },
  empty: {
    fr: 'Aucune activité pour ces critères.',
    de: 'Keine Aktivität für diese Kriterien.',
    en: 'No activity for these criteria.',
  },
  more: { fr: 'Afficher plus', de: 'Mehr anzeigen', en: 'Show more' },
  shown: {
    fr: (shown: number, total: number) => `${shown} sur ${total} activités affichées`,
    de: (shown: number, total: number) => `${shown} von ${total} Aktivitäten angezeigt`,
    en: (shown: number, total: number) => `${shown} of ${total} activities shown`,
  },
  forbidden: {
    fr: 'Le journal d’audit est réservé aux administrateurs.',
    de: 'Das Audit-Protokoll ist Administratoren vorbehalten.',
    en: 'The audit log is for administrators only.',
  },
  deleted: { fr: 'supprimé', de: 'gelöscht', en: 'deleted' },
} as const

const LOCALES: Record<Lang, string> = { fr: 'fr-FR', de: 'de-DE', en: 'en-GB' }

/** Tone of the action badge (colour set in custom.scss). */
const ACTION_TONE: Record<string, string> = {
  create: 'create',
  publish: 'create',
  update: 'update',
  draft: 'update',
  unpublish: 'warning',
  delete: 'danger',
  login: 'session',
  logout: 'session',
}

const label = (value: unknown, lang: Lang, fallback: string) => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const labels = value as Record<string, string>
    return labels[lang] ?? labels.fr ?? fallback
  }
  return fallback
}

/**
 * Audit log list: period tabs (day, week, month, year, all), search, action
 * and section filters, entries grouped by day in the owner's time zone. Plain
 * links and a GET form: the state lives in the address, no client code.
 */
export async function AuditLogView({ payload, user, i18n, searchParams }: ListViewServerProps) {
  const lang: Lang = i18n.language === 'de' || i18n.language === 'en' ? i18n.language : 'fr'
  const adminRoute = payload.config.routes.admin
  const base = `${adminRoute}/collections/audit-logs`

  if ((user as { role?: string } | undefined)?.role !== 'admin') {
    return (
      <div className="rk-audit">
        <p>{TEXT.forbidden[lang]}</p>
      </div>
    )
  }

  const entities = [
    ...payload.config.collections
      .filter(
        (collection) => !collection.slug.startsWith('payload-') && collection.slug !== 'audit-logs',
      )
      .map((collection) => ({
        value: collection.slug,
        label: label(collection.labels?.singular, lang, collection.slug),
      })),
    ...payload.config.globals.map((global) => ({
      value: `global:${global.slug}`,
      label: label(global.label, lang, global.slug),
    })),
  ].sort((a, b) => a.label.localeCompare(b.label, LOCALES[lang]))
  const entityLabel = new Map(entities.map((entity) => [entity.value, entity.label]))

  const filters = parseFilters(
    searchParams as Record<string, unknown> | undefined,
    AUDIT_ACTIONS,
    entities.map((entity) => entity.value),
  )
  const result = await payload.find({
    collection: 'audit-logs',
    where: auditWhere(filters, new Date()) as never,
    sort: '-createdAt',
    limit: filters.limit,
    depth: 0,
    overrideAccess: false,
    user,
  })
  const groups = groupByDay(result.docs as unknown as Entry[])

  const time = new Intl.DateTimeFormat(LOCALES[lang], {
    timeZone: AUDIT_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const day = new Intl.DateTimeFormat(LOCALES[lang], {
    timeZone: AUDIT_TIME_ZONE,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="rk-audit">
      <header className="rk-audit__header">
        <h1 className="rk-audit__title">{TEXT.title[lang]}</h1>
        <p className="rk-audit__lead">{TEXT.lead[lang]}</p>
      </header>

      <nav className="rk-audit__periods" aria-label={TEXT.title[lang]}>
        {AUDIT_PERIODS.map((period) => (
          <a
            key={period}
            href={`${base}${auditQuery(filters, { period, limit: AUDIT_PAGE_SIZE })}`}
            className={`rk-audit__period${filters.period === period ? ' is-active' : ''}`}
            aria-current={filters.period === period ? 'true' : undefined}
          >
            {TEXT.periods[period][lang]}
          </a>
        ))}
      </nav>

      <form className="rk-audit__filters" method="get" action={base}>
        {filters.period !== 'week' ? (
          <input type="hidden" name="period" value={filters.period} />
        ) : null}
        <label className="rk-audit__search">
          <span className="rk-audit__sr">{TEXT.search[lang]}</span>
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            placeholder={`${TEXT.search[lang]} : ${TEXT.searchHint[lang]}`}
          />
        </label>
        <label className="rk-audit__select">
          <span className="rk-audit__sr">{TEXT.action[lang]}</span>
          <select name="action" defaultValue={filters.action}>
            <option value="">
              {TEXT.action[lang]} : {TEXT.all[lang]}
            </option>
            {AUDIT_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {ACTION_LABELS[action][lang]}
              </option>
            ))}
          </select>
        </label>
        <label className="rk-audit__select">
          <span className="rk-audit__sr">{TEXT.entity[lang]}</span>
          <select name="entity" defaultValue={filters.entity}>
            <option value="">
              {TEXT.entity[lang]} : {TEXT.all[lang]}
            </option>
            {entities.map((entity) => (
              <option key={entity.value} value={entity.value}>
                {entity.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn--style-primary btn--size-small">
          {TEXT.apply[lang]}
        </button>
        {filters.q || filters.action || filters.entity ? (
          <a
            className="rk-audit__reset"
            href={`${base}${auditQuery({ ...filters, q: '', action: '', entity: '' })}`}
          >
            {TEXT.reset[lang]}
          </a>
        ) : null}
      </form>

      <div className="rk-audit__table" role="table">
        <div className="rk-audit__row rk-audit__row--head" role="row">
          <span role="columnheader">{TEXT.columns.date[lang]}</span>
          <span role="columnheader">{TEXT.columns.user[lang]}</span>
          <span role="columnheader">{TEXT.columns.action[lang]}</span>
          <span role="columnheader">{TEXT.columns.entity[lang]}</span>
        </div>

        {groups.length === 0 ? <p className="rk-audit__empty">{TEXT.empty[lang]}</p> : null}

        {groups.map((group, index) => (
          <details key={group.day} className="rk-audit__day" open={index === 0}>
            <summary className="rk-audit__day-summary">
              <span className="rk-audit__day-label">
                {day.format(new Date(group.entries[0]!.createdAt))}
              </span>
              <span className="rk-audit__day-count">
                {TEXT.activities[lang](group.entries.length)}
              </span>
            </summary>
            {group.entries.map((entry) => {
              const who = entry.userLabel || '—'
              const action = entry.action ?? ''
              const title = entry.documentTitle || (entry.documentId ? `#${entry.documentId}` : '')
              const section = entityLabel.get(entry.entity ?? '') ?? entry.entity ?? ''
              const itemText = [section, title].filter(Boolean).join(' · ')
              return (
                <div key={entry.id} className="rk-audit__row" role="row">
                  <span role="cell" className="rk-audit__time">
                    {time.format(new Date(entry.createdAt))}
                  </span>
                  <span role="cell" className="rk-audit__user">
                    <span className="rk-audit__avatar" aria-hidden="true">
                      {initial(who)}
                    </span>
                    {who}
                  </span>
                  <span role="cell">
                    <span
                      className={`rk-audit__badge rk-audit__badge--${ACTION_TONE[action] ?? 'update'}`}
                    >
                      {ACTION_LABELS[action as keyof typeof ACTION_LABELS]?.[lang] ?? action}
                    </span>
                  </span>
                  <span role="cell" className="rk-audit__item">
                    {entry.link && action !== 'delete' ? (
                      <a href={entry.link}>{itemText}</a>
                    ) : (
                      <span>
                        {itemText}
                        {action === 'delete' ? ` (${TEXT.deleted[lang]})` : ''}
                      </span>
                    )}
                    {entry.changedFields ? (
                      <span className="rk-audit__fields">
                        {TEXT.fields[lang]} : {entry.changedFields}
                        {entry.locale ? ` · ${entry.locale.toUpperCase()}` : ''}
                      </span>
                    ) : null}
                  </span>
                </div>
              )
            })}
          </details>
        ))}
      </div>

      {result.totalDocs > 0 ? (
        <p className="rk-audit__footer">
          {TEXT.shown[lang](result.docs.length, result.totalDocs)}
          {result.totalDocs > result.docs.length ? (
            <>
              {' · '}
              <a href={`${base}${auditQuery(filters, { limit: filters.limit + AUDIT_PAGE_SIZE })}`}>
                {TEXT.more[lang]}
              </a>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}
