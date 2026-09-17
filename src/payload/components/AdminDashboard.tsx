import type { Payload, ServerProps, Where } from 'payload'

import { OPTION_LABELS } from '../../lib/lead-score'
import { REQUEST_TYPE_LABELS, REQUEST_TYPES } from '../collections/ContactSubmissions'
import {
  adminLanguage,
  barPercents,
  lastMonths,
  listUrl,
  monthChange,
  monthLabel,
  shortDate,
  type Language,
} from './dashboard-stats'

const MONTHS = 6
const TYPE_WINDOW_DAYS = 90
const URGENT_LIMIT = 5

const TEXT = {
  title: { fr: 'Vue d’ensemble', de: 'Überblick', en: 'Overview' },
  newRequests: { fr: 'Nouvelles demandes', de: 'Neue Anfragen', en: 'New requests' },
  newRequestsHint: {
    fr: 'au statut « Nouvelle »',
    de: 'mit Status „Neu“',
    en: 'still marked “New”',
  },
  urgent: { fr: 'Prioritaires en attente', de: 'Dringend offen', en: 'High priority, open' },
  urgentHint: {
    fr: 'priorité haute, nouvelles ou en cours',
    de: 'hohe Priorität, neu oder in Bearbeitung',
    en: 'high priority, new or in progress',
  },
  thisMonth: { fr: 'Demandes ce mois-ci', de: 'Anfragen diesen Monat', en: 'Requests this month' },
  subscribers: {
    fr: 'Abonnés confirmés',
    de: 'Bestätigte Abonnenten',
    en: 'Confirmed subscribers',
  },
  subscribersHint: {
    fr: (added: number, pending: number) =>
      `${added} nouveau(x) ce mois-ci · ${pending} en attente de confirmation`,
    de: (added: number, pending: number) => `${added} neu diesen Monat · ${pending} unbestätigt`,
    en: (added: number, pending: number) =>
      `${added} new this month · ${pending} awaiting confirmation`,
  },
  perMonth: {
    fr: 'Demandes de contact par mois',
    de: 'Kontaktanfragen pro Monat',
    en: 'Contact requests per month',
  },
  byType: {
    fr: `Types de demande (${TYPE_WINDOW_DAYS} derniers jours)`,
    de: `Art der Anfragen (letzte ${TYPE_WINDOW_DAYS} Tage)`,
    en: `Request types (last ${TYPE_WINDOW_DAYS} days)`,
  },
  noRequests: {
    fr: 'Aucune demande sur cette période.',
    de: 'Keine Anfragen in diesem Zeitraum.',
    en: 'No requests in this period.',
  },
  urgentList: {
    fr: 'Demandes prioritaires à traiter',
    de: 'Dringende Anfragen',
    en: 'High-priority requests to handle',
  },
  noUrgent: {
    fr: 'Aucune demande prioritaire en attente.',
    de: 'Keine dringenden Anfragen offen.',
    en: 'No high-priority request waiting.',
  },
  seeAll: { fr: 'Tout voir', de: 'Alle anzeigen', en: 'See all' },
  inProgress: { fr: 'En cours', de: 'In Bearbeitung', en: 'In progress' },
  new: { fr: 'Nouvelle', de: 'Neu', en: 'New' },
} as const

type UrgentRequest = {
  id: number | string
  name?: string | null
  organisation?: string | null
  subject?: string | null
  status?: string | null
  createdAt: string
}

async function loadStats(payload: Payload, user: ServerProps['user'], now: Date) {
  const scope = { overrideAccess: false, user } as const
  const countRequests = async (where: Where) =>
    (await payload.count({ collection: 'contact-submissions', where, ...scope })).totalDocs
  const countSubscribers = async (where: Where) =>
    (await payload.count({ collection: 'subscribers', where, ...scope })).totalDocs

  const months = lastMonths(now, MONTHS)
  const monthStart = months[months.length - 1]!.start
  const since = new Date(now.getTime() - TYPE_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const openUrgent: Where = {
    and: [{ priority: { equals: 'high' } }, { status: { in: ['new', 'inProgress'] } }],
  }

  const [newRequests, perMonth, perType, urgent, confirmed, addedThisMonth, pending] =
    await Promise.all([
      countRequests({ status: { equals: 'new' } }),
      Promise.all(
        months.map((range) =>
          countRequests({
            and: [
              { createdAt: { greater_than_equal: range.start.toISOString() } },
              { createdAt: { less_than: range.end.toISOString() } },
            ],
          }),
        ),
      ),
      Promise.all(
        REQUEST_TYPES.map((type) =>
          countRequests({
            and: [
              { requestType: { equals: type } },
              { createdAt: { greater_than_equal: since.toISOString() } },
            ],
          }),
        ),
      ),
      payload.find({
        collection: 'contact-submissions',
        where: openUrgent,
        sort: '-createdAt',
        limit: URGENT_LIMIT,
        depth: 0,
        ...scope,
      }),
      countSubscribers({ status: { equals: 'confirmed' } }),
      countSubscribers({
        and: [
          { status: { equals: 'confirmed' } },
          { confirmedAt: { greater_than_equal: monthStart.toISOString() } },
        ],
      }),
      countSubscribers({ status: { equals: 'pending' } }),
    ])

  return {
    months,
    newRequests,
    perMonth,
    types: REQUEST_TYPES.map((type, index) => ({ type, count: perType[index] ?? 0 }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count),
    urgent: urgent.docs as unknown as UrgentRequest[],
    urgentTotal: urgent.totalDocs,
    confirmed,
    addedThisMonth,
    pending,
  }
}

/**
 * Figures shown above the collection cards on the admin home page: open
 * contact requests, monthly trend, request types, subscribers. Read with the
 * signed-in user's own permissions.
 */
export async function AdminDashboard({ payload, user, i18n }: ServerProps) {
  if (!user || !payload) return null
  const lang: Language = adminLanguage(i18n?.language)
  const adminRoute = payload.config.routes.admin

  let stats: Awaited<ReturnType<typeof loadStats>>
  try {
    stats = await loadStats(payload, user, new Date())
  } catch (error) {
    payload.logger.error({ err: error }, '[dashboard] figures unavailable')
    return null
  }

  const current = stats.perMonth[stats.perMonth.length - 1] ?? 0
  const previous = stats.perMonth[stats.perMonth.length - 2] ?? 0
  const change = monthChange(current, previous, lang)
  const monthBars = barPercents(stats.perMonth)
  const typeBars = barPercents(stats.types.map((entry) => entry.count))
  const requests = (where?: Record<string, Record<string, string>>) =>
    listUrl(adminRoute, 'contact-submissions', where)

  return (
    <section className="rk-dash" aria-labelledby="rk-dash-title">
      <h2 id="rk-dash-title" className="rk-dash__title">
        {TEXT.title[lang]}
      </h2>

      <div className="rk-dash__tiles">
        <a className="rk-dash__tile" href={requests({ status: { equals: 'new' } })}>
          <span className="rk-dash__label">{TEXT.newRequests[lang]}</span>
          <span className="rk-dash__figure">{stats.newRequests}</span>
          <span className="rk-dash__hint">{TEXT.newRequestsHint[lang]}</span>
        </a>
        <a
          className={`rk-dash__tile${stats.urgentTotal > 0 ? ' rk-dash__tile--alert' : ''}`}
          href={requests({ priority: { equals: 'high' }, status: { in: 'new,inProgress' } })}
        >
          <span className="rk-dash__label">{TEXT.urgent[lang]}</span>
          <span className="rk-dash__figure">{stats.urgentTotal}</span>
          <span className="rk-dash__hint">{TEXT.urgentHint[lang]}</span>
        </a>
        <a className="rk-dash__tile" href={requests()}>
          <span className="rk-dash__label">{TEXT.thisMonth[lang]}</span>
          <span className="rk-dash__figure">{current}</span>
          <span className={`rk-dash__hint rk-dash__trend--${change.trend}`}>{change.text}</span>
        </a>
        <a
          className="rk-dash__tile"
          href={listUrl(adminRoute, 'subscribers', { status: { equals: 'confirmed' } })}
        >
          <span className="rk-dash__label">{TEXT.subscribers[lang]}</span>
          <span className="rk-dash__figure">{stats.confirmed}</span>
          <span className="rk-dash__hint">
            {TEXT.subscribersHint[lang](stats.addedThisMonth, stats.pending)}
          </span>
        </a>
      </div>

      <div className="rk-dash__panels">
        <div className="rk-dash__panel">
          <h3 className="rk-dash__subtitle">{TEXT.perMonth[lang]}</h3>
          <ul className="rk-dash__bars">
            {stats.months.map((range, index) => (
              <li key={range.key} className="rk-dash__bar-row">
                <span className="rk-dash__bar-label">{monthLabel(range, lang)}</span>
                <span className="rk-dash__bar-track" aria-hidden="true">
                  <span className="rk-dash__bar" style={{ width: `${monthBars[index]}%` }} />
                </span>
                <span className="rk-dash__bar-value">{stats.perMonth[index]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rk-dash__panel">
          <h3 className="rk-dash__subtitle">{TEXT.byType[lang]}</h3>
          {stats.types.length === 0 ? (
            <p className="rk-dash__empty">{TEXT.noRequests[lang]}</p>
          ) : (
            <ul className="rk-dash__bars">
              {stats.types.map((entry, index) => (
                <li key={entry.type} className="rk-dash__bar-row">
                  <span className="rk-dash__bar-label">
                    {REQUEST_TYPE_LABELS[entry.type][lang]}
                  </span>
                  <span className="rk-dash__bar-track" aria-hidden="true">
                    <span className="rk-dash__bar" style={{ width: `${typeBars[index]}%` }} />
                  </span>
                  <span className="rk-dash__bar-value">{entry.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rk-dash__panel">
        <div className="rk-dash__panel-head">
          <h3 className="rk-dash__subtitle">{TEXT.urgentList[lang]}</h3>
          {stats.urgentTotal > URGENT_LIMIT ? (
            <a href={requests({ priority: { equals: 'high' }, status: { in: 'new,inProgress' } })}>
              {TEXT.seeAll[lang]} ({stats.urgentTotal})
            </a>
          ) : null}
        </div>
        {stats.urgent.length === 0 ? (
          <p className="rk-dash__empty">{TEXT.noUrgent[lang]}</p>
        ) : (
          <ul className="rk-dash__list">
            {stats.urgent.map((request) => (
              <li key={request.id}>
                <a
                  className="rk-dash__item"
                  href={`${adminRoute}/collections/contact-submissions/${request.id}`}
                >
                  <span className="rk-dash__item-main">
                    <strong>{request.subject}</strong>
                    <span>{[request.name, request.organisation].filter(Boolean).join(' · ')}</span>
                  </span>
                  <span className="rk-dash__item-meta">
                    <span className="rk-dash__chip">{OPTION_LABELS.priority.high[lang]}</span>
                    <span>
                      {request.status === 'inProgress' ? TEXT.inProgress[lang] : TEXT.new[lang]}
                    </span>
                    <time dateTime={request.createdAt}>{shortDate(request.createdAt, lang)}</time>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
