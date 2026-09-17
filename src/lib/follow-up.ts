/**
 * Follow-up of contact requests in the CMS: history entries, due reminders and
 * reply templates. Pure functions, unit-tested; used by the ContactSubmissions
 * hooks, the reminder job and the reply component.
 */

export const OPEN_STATUSES = ['new', 'inProgress'] as const

export type HistoryAction = 'statusChanged' | 'followUpSet' | 'followUpCleared' | 'reminderSent'

export type HistoryEntry = {
  at: string
  author?: string
  action: HistoryAction
  fromStatus?: string
  toStatus?: string
  date?: string
}

export type NoteEntry = {
  id?: string
  text?: string | null
  author?: string | null
  at?: string | null
}

type RequestState = {
  status?: string | null
  followUpAt?: string | null
  notes?: NoteEntry[] | null
  history?: HistoryEntry[] | null
}

type Author = { name?: string | null; email?: string | null } | null | undefined

export function authorName(user: Author): string {
  return user?.name?.trim() || user?.email?.trim() || ''
}

const sameDay = (a?: string | null, b?: string | null) =>
  (a ? new Date(a).toISOString().slice(0, 10) : '') ===
  (b ? new Date(b).toISOString().slice(0, 10) : '')

/**
 * Entries to append to the history when a request is saved: status change,
 * follow-up date set, moved or removed. Nothing on creation.
 */
export function historyEntries(
  previous: RequestState | undefined,
  next: RequestState,
  author: string,
  now: Date,
): HistoryEntry[] {
  if (!previous) return []
  const at = now.toISOString()
  const who = author ? { author } : {}
  const entries: HistoryEntry[] = []

  if (next.status && previous.status && next.status !== previous.status) {
    entries.push({
      at,
      ...who,
      action: 'statusChanged',
      fromStatus: previous.status,
      toStatus: next.status,
    })
  }
  if (!sameDay(previous.followUpAt, next.followUpAt)) {
    entries.push(
      next.followUpAt
        ? { at, ...who, action: 'followUpSet', date: new Date(next.followUpAt).toISOString() }
        : { at, ...who, action: 'followUpCleared' },
    )
  }
  return entries
}

/** Stamps notes added in this save with their date and author; older notes keep theirs. */
export function stampNotes(
  notes: NoteEntry[] | null | undefined,
  author: string,
  now: Date,
): NoteEntry[] {
  return (notes ?? []).map((note) =>
    note.at ? note : { ...note, at: now.toISOString(), author: note.author || author || null },
  )
}

/** A reminder is due once the date has come, for an open request not reminded since the date was set. */
export function followUpDue(
  request: {
    status?: string | null
    followUpAt?: string | null
    followUpReminderSentAt?: string | null
  },
  now: Date,
): boolean {
  if (!request.followUpAt) return false
  if (!OPEN_STATUSES.includes(request.status as (typeof OPEN_STATUSES)[number])) return false
  if (new Date(request.followUpAt).getTime() > now.getTime()) return false
  return !request.followUpReminderSentAt
}

export type TemplateValues = {
  name?: string | null
  organisation?: string | null
  subject?: string | null
}

/** Replaces {name}, {organisation} and {subject}; unknown placeholders stay as typed. */
export function fillTemplate(text: string, values: TemplateValues): string {
  return text.replace(/\{(name|organisation|subject)\}/g, (_, key: keyof TemplateValues) =>
    (values[key] ?? '').trim(),
  )
}

/** mailto: link opening the user's own mail client with the reply ready. */
export function mailtoUrl(to: string, subject: string, body: string): string {
  const params = [`subject=${encodeURIComponent(subject)}`, `body=${encodeURIComponent(body)}`]
  return `mailto:${encodeURIComponent(to).replace(/%40/g, '@')}?${params.join('&')}`
}

/** Language of the reply: the visitor's language, French otherwise. */
export function replyLocale(locale: string | null | undefined): 'fr' | 'de' | 'en' {
  return locale === 'de' || locale === 'en' ? locale : 'fr'
}
