import type { RequestType } from '@/payload/collections/ContactSubmissions'

/**
 * Lead qualification of the contact form: optional answers, a transparent
 * score out of 100 and a priority. The grid is deliberately simple so the
 * owner can read why a request is ranked high or low.
 *
 * | Criterion              | Points                                                    |
 * | ---------------------- | --------------------------------------------------------- |
 * | Budget                 | > 50 k: 30 · 20–50 k: 25 · 5–20 k: 15 · < 5 k / undefined: 5 |
 * | Start                  | < 1 month: 25 · 1–3 months: 20 · > 3 months: 10 · exploring: 5 |
 * | Role in the decision   | decides: 20 · prepares: 10 · gathers information: 5       |
 * | Type of request        | core services: 15 · training / speaking / partnership: 10 · other: 5 |
 * | Completeness           | organisation given: 5 · detailed message (300+ chars): 5  |
 *
 * The type of organisation is recorded for context but never scored. A
 * question left unanswered gives 0 point. Priority: 60+ high, 35–59 medium.
 *
 * Free of `server-only`: shared by the form, the API route, the CMS and tests.
 */

type Labels = { fr: string; de: string; en: string }

export const ORGANISATION_TYPES = [
  'company',
  'sme',
  'startup',
  'publicInstitution',
  'ngo',
  'investor',
  'individual',
] as const
export const BUDGETS = ['under5k', 'from5to20k', 'from20to50k', 'over50k', 'notDefined'] as const
export const TIMELINES = ['urgent', 'quarter', 'later', 'exploring'] as const
export const DECISION_ROLES = ['decisionMaker', 'influencer', 'researching'] as const
export const PRIORITIES = ['high', 'medium', 'low'] as const

export type Priority = (typeof PRIORITIES)[number]

export const QUALIFICATION_FIELDS = [
  'organisationType',
  'budget',
  'timeline',
  'decisionRole',
] as const
export type QualificationField = (typeof QUALIFICATION_FIELDS)[number]

export const QUALIFICATION_LABELS: Record<QualificationField, Labels> = {
  organisationType: {
    fr: 'Type d’organisation',
    de: 'Art der Organisation',
    en: 'Type of organisation',
  },
  budget: { fr: 'Budget estimé', de: 'Geschätztes Budget', en: 'Estimated budget' },
  timeline: {
    fr: 'Démarrage souhaité',
    de: 'Gewünschter Beginn',
    en: 'When should the work start?',
  },
  decisionRole: {
    fr: 'Votre rôle dans la décision',
    de: 'Ihre Rolle bei der Entscheidung',
    en: 'Your role in the decision',
  },
}

export const OPTION_LABELS: {
  organisationType: Record<(typeof ORGANISATION_TYPES)[number], Labels>
  budget: Record<(typeof BUDGETS)[number], Labels>
  timeline: Record<(typeof TIMELINES)[number], Labels>
  decisionRole: Record<(typeof DECISION_ROLES)[number], Labels>
  priority: Record<Priority, Labels>
} = {
  organisationType: {
    company: { fr: 'Entreprise', de: 'Unternehmen', en: 'Company' },
    sme: { fr: 'PME', de: 'KMU', en: 'SME' },
    startup: { fr: 'Start-up', de: 'Start-up', en: 'Start-up' },
    publicInstitution: {
      fr: 'Institution publique',
      de: 'Öffentliche Einrichtung',
      en: 'Public institution',
    },
    ngo: { fr: 'ONG / association', de: 'NGO / Verein', en: 'NGO / non-profit' },
    investor: { fr: 'Investisseur', de: 'Investor', en: 'Investor' },
    individual: { fr: 'Particulier', de: 'Privatperson', en: 'Individual' },
  },
  budget: {
    under5k: { fr: 'Moins de 5 000 €', de: 'Unter 5.000 €', en: 'Under €5,000' },
    from5to20k: { fr: '5 000 à 20 000 €', de: '5.000 bis 20.000 €', en: '€5,000 to €20,000' },
    from20to50k: { fr: '20 000 à 50 000 €', de: '20.000 bis 50.000 €', en: '€20,000 to €50,000' },
    over50k: { fr: 'Plus de 50 000 €', de: 'Über 50.000 €', en: 'Over €50,000' },
    notDefined: { fr: 'Pas encore défini', de: 'Noch nicht festgelegt', en: 'Not defined yet' },
  },
  timeline: {
    urgent: { fr: 'Dans le mois', de: 'Innerhalb eines Monats', en: 'Within a month' },
    quarter: { fr: 'Dans 1 à 3 mois', de: 'In 1 bis 3 Monaten', en: 'In 1 to 3 months' },
    later: { fr: 'Dans plus de 3 mois', de: 'In mehr als 3 Monaten', en: 'In more than 3 months' },
    exploring: {
      fr: 'Simple prise d’information',
      de: 'Erst einmal informieren',
      en: 'Just exploring',
    },
  },
  decisionRole: {
    decisionMaker: { fr: 'Je prends la décision', de: 'Ich entscheide', en: 'I make the decision' },
    influencer: {
      fr: 'Je prépare la décision',
      de: 'Ich bereite die Entscheidung vor',
      en: 'I prepare the decision',
    },
    researching: {
      fr: 'Je me renseigne',
      de: 'Ich informiere mich',
      en: 'I am gathering information',
    },
  },
  priority: {
    high: { fr: 'Haute', de: 'Hoch', en: 'High' },
    medium: { fr: 'Moyenne', de: 'Mittel', en: 'Medium' },
    low: { fr: 'Basse', de: 'Niedrig', en: 'Low' },
  },
}

const BUDGET_POINTS: Record<(typeof BUDGETS)[number], number> = {
  over50k: 30,
  from20to50k: 25,
  from5to20k: 15,
  under5k: 5,
  notDefined: 5,
}
const TIMELINE_POINTS: Record<(typeof TIMELINES)[number], number> = {
  urgent: 25,
  quarter: 20,
  later: 10,
  exploring: 5,
}
const ROLE_POINTS: Record<(typeof DECISION_ROLES)[number], number> = {
  decisionMaker: 20,
  influencer: 10,
  researching: 5,
}
const CORE_SERVICES: readonly RequestType[] = [
  'consulting',
  'dueDiligence',
  'advisory',
  'projectManagement',
  'smeProgramme',
]
const SECONDARY_SERVICES: readonly RequestType[] = ['training', 'speaking', 'partnership']

export const HIGH_PRIORITY_SCORE = 60
export const MEDIUM_PRIORITY_SCORE = 35
export const DETAILED_MESSAGE_LENGTH = 300

export type LeadInput = {
  requestType: string
  organisation?: string
  message: string
  organisationType?: string
  budget?: string
  timeline?: string
  decisionRole?: string
}

const pointsOf = <K extends string>(table: Record<K, number>, value: string | undefined): number =>
  value && value in table ? table[value as K] : 0

export function scoreLead(input: LeadInput): { score: number; priority: Priority } {
  const service = CORE_SERVICES.includes(input.requestType as RequestType)
    ? 15
    : SECONDARY_SERVICES.includes(input.requestType as RequestType)
      ? 10
      : 5
  const score =
    pointsOf(BUDGET_POINTS, input.budget) +
    pointsOf(TIMELINE_POINTS, input.timeline) +
    pointsOf(ROLE_POINTS, input.decisionRole) +
    service +
    (input.organisation?.trim() ? 5 : 0) +
    (input.message.trim().length >= DETAILED_MESSAGE_LENGTH ? 5 : 0)

  const priority: Priority =
    score >= HIGH_PRIORITY_SCORE ? 'high' : score >= MEDIUM_PRIORITY_SCORE ? 'medium' : 'low'
  return { score, priority }
}
