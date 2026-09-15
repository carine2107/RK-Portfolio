import 'server-only'

import config from '@payload-config'
import { cache } from 'react'
import { getPayload, type CollectionSlug, type Payload, type Where } from 'payload'

import {
  starterAbout,
  starterBooks,
  starterBusinesses,
  starterCategories,
  starterCredentials,
  starterExperiences,
  starterExpertise,
  starterHome,
  starterInsights,
  starterLegalPages,
  type Localized,
} from '@/content/starter'
import type { Locale } from '@/i18n/routing'
import { resolveCampaignLink } from '@/lib/campaign-link'
import { countryName, isCountryCode } from '@/lib/countries'
import { cmsEnabled, siteUrl } from '@/lib/env'
import { paymentsReady } from '@/lib/shop-config'
import { safeHttpsUrl } from '@/lib/url'
import { parseVideoUrl } from '@/lib/video'
import {
  appearanceCss,
  HEADING_FONTS,
  HERO_STYLES,
  PALETTE_KEYS,
  themeColors,
  type AppearanceColors,
  type HeadingFont,
} from '@/lib/theme'
import type {
  AboutContentView,
  AppearanceView,
  BookView,
  BusinessView,
  CampaignBlock,
  CampaignLink,
  CampaignView,
  CategoryView,
  ContentSource,
  CredentialView,
  EngagementView,
  ExperienceView,
  ExpertiseView,
  HomeContentView,
  ImageView,
  InsightView,
  LegalPageView,
  ProductView,
  RichContent,
  SeoView,
  SiteSettingsView,
} from '@/lib/types'

/* -------------------------------------------------------------------------- */
/* Client                                                                     */
/* -------------------------------------------------------------------------- */

let warned = false

/**
 * Returns a Payload instance, or `null` when the CMS is disabled or the
 * database cannot be reached. Callers fall back to the starter content so the
 * public site keeps working — the fallback is always logged, never silent.
 */
export const getCms = cache(async (): Promise<Payload | null> => {
  if (!cmsEnabled) return null
  try {
    return await getPayload({ config })
  } catch (error) {
    if (!warned) {
      warned = true
      console.warn(
        '[cms] Content management system unavailable — serving built-in starter content.',
        error instanceof Error ? error.message : error,
      )
    }
    return null
  }
})

async function withCms<T>(run: (cms: Payload) => Promise<T>, fallback: () => T): Promise<T> {
  const cms = await getCms()
  if (!cms) return fallback()
  try {
    return await run(cms)
  } catch (error) {
    console.warn(
      '[cms] Query failed — serving built-in starter content.',
      error instanceof Error ? error.message : error,
    )
    return fallback()
  }
}

export async function getContentSource(): Promise<ContentSource> {
  return (await getCms()) ? 'cms' : 'starter'
}

/* -------------------------------------------------------------------------- */
/* Mapping helpers                                                            */
/* -------------------------------------------------------------------------- */

type Doc = Record<string, unknown>

/** Payload returns generated types; the mappers below read them structurally. */
const asDoc = (value: unknown): Doc => value as Doc

const str = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value.length > 0 ? value : fallback

const num = (value: unknown): number | null => (typeof value === 'number' ? value : null)

const boolean = (value: unknown): boolean => value === true

const arrayOf = (value: unknown): Doc[] => (Array.isArray(value) ? (value as Doc[]) : [])

const itemList = (value: unknown, key = 'item'): string[] =>
  arrayOf(value)
    .map((entry) => str(entry[key]))
    .filter(Boolean)

const richText = (value: unknown): RichContent =>
  value && typeof value === 'object' ? { kind: 'lexical', data: value } : null

const paragraphs = (value: string | string[]): RichContent => {
  const list = Array.isArray(value) ? value : [value]
  const cleaned = list.filter(Boolean)
  return cleaned.length > 0 ? { kind: 'paragraphs', paragraphs: cleaned } : null
}

/**
 * Payload builds absolute URLs from `serverURL`. Files served by this same
 * site are turned back into relative paths: `next/image` only optimises
 * local images (an absolute URL is treated as a remote host and refused), and
 * a relative path keeps working behind any domain or proxy.
 */
const toRelativeUrl = (url: string): string =>
  url.startsWith(`${siteUrl}/`) ? url.slice(siteUrl.length) : url

const image = (value: unknown, size?: string): ImageView => {
  if (!value || typeof value !== 'object') return null
  const doc = value as Doc
  const sizes = doc.sizes as Record<string, Doc> | undefined
  const chosen = size && sizes?.[size]?.url ? (sizes[size] as Doc) : doc
  const url = toRelativeUrl(str(chosen.url))
  if (!url) return null
  return {
    url,
    alt: str(doc.alt, ''),
    width: num(chosen.width) ?? undefined,
    height: num(chosen.height) ?? undefined,
  }
}

const seo = (value: unknown): SeoView => {
  if (!value || typeof value !== 'object') return {}
  const group = value as Doc
  const img = image(group.image, 'og')
  return {
    title: str(group.title) || undefined,
    description: str(group.description) || undefined,
    image: img?.url,
    noindex: boolean(group.noindex),
  }
}

const relationSlugs = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map((entry) => (entry && typeof entry === 'object' ? str((entry as Doc).slug) : ''))
        .filter(Boolean)
    : []

const pick = <T>(value: Localized<T>, locale: Locale): T => value[locale]

/* -------------------------------------------------------------------------- */
/* Site settings                                                              */
/* -------------------------------------------------------------------------- */

const starterSiteSettings = (locale: Locale): SiteSettingsView => ({
  name: 'Romial Kenmogne',
  headline: {
    en: 'Business & Financial Consultant | Project Manager',
    fr: 'Consultant en business et finance | Chef de projet',
    de: 'Business- & Finanzberater | Projektmanager',
  }[locale],
  signature: 'Understand Money. Build Businesses. Invest. Create Wealth.',
  email: '',
  phone: '',
  address: '',
  spokenLanguages: {
    en: 'French, English, German',
    fr: 'Français, anglais, allemand',
    de: 'Französisch, Englisch, Deutsch',
  }[locale],
  bookingUrl: '',
  bookingLabel: '',
  social: [],
  expertProfileUrl: null,
  expertProfileTitle: '',
  cvUrl: null,
  creditName: 'Nana-Consulting',
  creditUrl: '',
  logo: null,
  defaultSeoTitle: '',
  defaultSeoDescription: '',
  defaultOgImage: null,
})

export const getSiteSettings = cache(
  async (locale: Locale): Promise<SiteSettingsView> =>
    withCms(
      async (cms) => {
        const doc = asDoc(await cms.findGlobal({ slug: 'site-settings', locale, depth: 1 }))
        const profile = doc.expertProfile as Doc | undefined
        const cv = doc.cvDocument as Doc | undefined
        const fallback = starterSiteSettings(locale)
        return {
          name: str(doc.name, fallback.name),
          headline: str(doc.headline, fallback.headline),
          signature: str(doc.signature, fallback.signature),
          email: str(doc.email),
          phone: str(doc.phone),
          address: str(doc.address),
          spokenLanguages: str(doc.spokenLanguages, fallback.spokenLanguages),
          bookingUrl: safeHttpsUrl(str(doc.bookingUrl)),
          bookingLabel: str(doc.bookingLabel),
          social: arrayOf(doc.social)
            .map((entry) => ({ platform: str(entry.platform), url: str(entry.url) }))
            .filter((entry) => entry.platform && entry.url),
          expertProfileUrl: profile ? toRelativeUrl(str(profile.url)) || null : null,
          expertProfileTitle: profile ? str(profile.title) : '',
          cvUrl: cv ? toRelativeUrl(str(cv.url)) || null : null,
          // An empty value in the CMS removes the credit; a missing value keeps
          // the default.
          creditName: doc.creditName === '' ? '' : str(doc.creditName, fallback.creditName),
          creditUrl: str(doc.creditUrl),
          logo: image(doc.logo),
          defaultSeoTitle: str(doc.defaultSeoTitle),
          defaultSeoDescription: str(doc.defaultSeoDescription),
          defaultOgImage: image(doc.defaultOgImage, 'og')?.url ?? null,
        }
      },
      () => starterSiteSettings(locale),
    ),
)

/* -------------------------------------------------------------------------- */
/* Appearance                                                                 */
/* -------------------------------------------------------------------------- */

const defaultAppearance = (): AppearanceView => ({
  css: '',
  themeColors: themeColors(null),
  hero: { style: 'halo', image: null, intensity: 'subtle' },
})

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback

/** Colours, heading font and home background chosen in the CMS (Appearance global). */
export const getAppearance = cache(
  async (): Promise<AppearanceView> =>
    withCms(async (cms) => {
      const doc = asDoc(await cms.findGlobal({ slug: 'appearance', depth: 1 }))
      const colors: AppearanceColors = {
        palette: oneOf(doc.palette, [...PALETTE_KEYS, 'custom'] as const, 'signature'),
        light: (doc.light as AppearanceColors['light']) ?? null,
        dark: (doc.dark as AppearanceColors['dark']) ?? null,
      }
      const headingFont: HeadingFont = oneOf(doc.headingFont, HEADING_FONTS, 'source-serif')
      const hero = (doc.hero as Doc | undefined) ?? {}
      const heroImage = image(hero.image)
      const style = oneOf(hero.style, HERO_STYLES, 'halo')

      return {
        css: appearanceCss({ ...colors, headingFont }),
        themeColors: themeColors(colors),
        hero: {
          // An "image" style without an image falls back to the default look.
          style: style === 'image' && !heroImage ? 'halo' : style,
          image: heroImage,
          intensity: hero.intensity === 'visible' ? 'visible' : 'subtle',
        },
      }
    }, defaultAppearance),
)

/* -------------------------------------------------------------------------- */
/* Speaking & media                                                           */
/* -------------------------------------------------------------------------- */

const mapEngagement = (doc: Doc, locale: Locale): EngagementView => ({
  id: String(doc.id),
  slug: str(doc.slug),
  type: (str(doc.type, 'conference') as EngagementView['type']) ?? 'conference',
  title: str(doc.title),
  summary: str(doc.summary),
  description: richText(doc.description),
  date: str(doc.date),
  endDate: str(doc.endDate) || null,
  eventName: str(doc.eventName),
  organiser: str(doc.organiser),
  city: str(doc.city),
  countryCode: isCountryCode(str(doc.country)) ? str(doc.country) : '',
  country: countryName(str(doc.country), locale),
  languages: Array.isArray(doc.languages)
    ? (doc.languages as unknown[]).filter((value): value is string => typeof value === 'string')
    : [],
  videoUrl: str(doc.videoUrl),
  hasVideo: parseVideoUrl(str(doc.videoUrl)) !== null,
  topics: arrayOf(doc.topics)
    .filter((topic) => topic && typeof topic === 'object' && str(topic.slug))
    .filter((topic) => (topic._status ?? 'published') === 'published')
    .map((topic) => ({ slug: str(topic.slug), title: str(topic.title) })),
  durationMinutes: num(doc.durationMinutes),
  externalUrl: str(doc.externalUrl),
  externalLabel: str(doc.externalLabel),
  cover: image(doc.cover, 'wide'),
  featured: boolean(doc.featured),
  isPlaceholder: boolean(doc.isPlaceholder),
  seo: seo(doc.seo),
})

/**
 * Published engagements, most recent first. No starter content: nothing is
 * shown until real engagements are entered in the CMS.
 */
export const getEngagements = cache(
  async (locale: Locale): Promise<EngagementView[]> =>
    withCms(
      async (cms) => {
        const result = await cms.find({
          collection: 'engagements',
          locale,
          depth: 1,
          limit: 300,
          sort: '-date',
          where: { _status: { equals: 'published' } },
        })
        return result.docs.map((doc) => mapEngagement(asDoc(doc), locale))
      },
      () => [],
    ),
)

export async function getEngagementBySlug(
  locale: Locale,
  slug: string,
): Promise<EngagementView | null> {
  const all = await getEngagements(locale)
  return all.find((entry) => entry.slug === slug) ?? null
}

/* -------------------------------------------------------------------------- */
/* Shop                                                                       */
/* -------------------------------------------------------------------------- */

/** Whether direct sales can really be paid now: shop opened AND provider keys configured. */
export const getShopStatus = cache(
  async (): Promise<{ active: boolean }> =>
    withCms(
      async (cms) => {
        const doc = asDoc(await cms.findGlobal({ slug: 'shop-settings', depth: 0 }))
        return { active: doc.enabled === true && paymentsReady() }
      },
      () => ({ active: false }),
    ),
)

const mapProduct = (doc: Doc): ProductView => ({
  id: String(doc.id),
  slug: str(doc.slug),
  type: str(doc.type, 'ebook') as ProductView['type'],
  title: str(doc.title),
  summary: str(doc.summary),
  description: richText(doc.description),
  price: num(doc.price) ?? 0,
  available: doc.available !== false,
  languages: Array.isArray(doc.languages)
    ? (doc.languages as unknown[]).filter((value): value is string => typeof value === 'string')
    : [],
  // Lesson contents, videos and files are not readable here (staff-only fields).
  modules: arrayOf(doc.modules).map((module) => ({
    title: str(module.title),
    lessons: arrayOf(module.lessons).map((lesson) => ({
      id: String(lesson.id),
      title: str(lesson.title),
      durationMinutes: num(lesson.durationMinutes),
    })),
  })),
  cover: image(doc.cover, 'wide'),
  featured: boolean(doc.featured),
  isPlaceholder: boolean(doc.isPlaceholder),
  seo: seo(doc.seo),
})

/** Published digital products. No starter content. */
export const getProducts = cache(
  async (locale: Locale): Promise<ProductView[]> =>
    withCms(
      async (cms) => {
        const result = await cms.find({
          collection: 'products',
          locale,
          depth: 1,
          limit: 200,
          sort: 'order',
          where: { _status: { equals: 'published' } },
          // Public access rules: protected fields are stripped.
          overrideAccess: false,
        })
        return result.docs.map((doc) => mapProduct(asDoc(doc)))
      },
      () => [],
    ),
)

export async function getProductBySlug(locale: Locale, slug: string): Promise<ProductView | null> {
  const all = await getProducts(locale)
  return all.find((entry) => entry.slug === slug) ?? null
}

/* -------------------------------------------------------------------------- */
/* Campaign pages                                                             */
/* -------------------------------------------------------------------------- */

const campaignLink = (value: unknown): CampaignLink => {
  if (!value || typeof value !== 'object') return null
  const group = value as Doc
  const label = str(group.label).trim()
  const target = resolveCampaignLink(str(group.href))
  return label && target ? { label, ...target } : null
}

const relationIds = (value: unknown): string[] =>
  arrayOf(value)
    .map((entry) =>
      entry && typeof entry === 'object' ? String((entry as Doc).id ?? '') : String(entry ?? ''),
    )
    .filter(Boolean)

const mapCampaignBlock = (doc: Doc): CampaignBlock | null => {
  const id = str(doc.id, String(Math.random()))
  switch (doc.blockType) {
    case 'hero':
      return {
        id,
        type: 'hero',
        eyebrow: str(doc.eyebrow),
        heading: str(doc.heading),
        lead: str(doc.lead),
        image: image(doc.image, 'wide'),
        cta: campaignLink(doc.cta),
      }
    case 'text':
      return {
        id,
        type: 'text',
        heading: str(doc.heading),
        content: richText(doc.content),
        image: image(doc.image, 'card'),
        imagePosition: doc.imagePosition === 'left' ? 'left' : 'right',
      }
    case 'features':
      return {
        id,
        type: 'features',
        heading: str(doc.heading),
        intro: str(doc.intro),
        items: arrayOf(doc.items)
          .map((item) => ({ title: str(item.title), description: str(item.description) }))
          .filter((item) => item.title),
      }
    case 'video':
      return {
        id,
        type: 'video',
        heading: str(doc.heading),
        videoUrl: str(doc.videoUrl),
        poster: image(doc.poster, 'wide'),
      }
    case 'books':
      return { id, type: 'books', heading: str(doc.heading), bookIds: relationIds(doc.books) }
    case 'products':
      return {
        id,
        type: 'products',
        heading: str(doc.heading),
        productIds: relationIds(doc.products),
      }
    case 'faq':
      return {
        id,
        type: 'faq',
        heading: str(doc.heading),
        items: arrayOf(doc.items)
          .map((item) => ({ question: str(item.question), answer: str(item.answer) }))
          .filter((item) => item.question && item.answer),
      }
    case 'cta':
      return {
        id,
        type: 'cta',
        heading: str(doc.heading),
        body: str(doc.body),
        primary: campaignLink(doc.primary),
        secondary: campaignLink(doc.secondary),
      }
    case 'newsletter':
      return { id, type: 'newsletter', heading: str(doc.heading), body: str(doc.body) }
    default:
      return null
  }
}

const mapCampaign = (doc: Doc): CampaignView => ({
  id: String(doc.id),
  slug: str(doc.slug),
  title: str(doc.title),
  summary: str(doc.summary),
  blocks: arrayOf(doc.layout)
    .map(mapCampaignBlock)
    .filter((block): block is CampaignBlock => block !== null),
  seo: seo(doc.seo),
})

/** Published campaign pages. No starter content. */
export const getCampaigns = cache(
  async (locale: Locale): Promise<CampaignView[]> =>
    withCms(
      async (cms) => {
        const result = await cms.find({
          collection: 'campaigns',
          locale,
          depth: 1,
          limit: 200,
          sort: '-updatedAt',
          where: { _status: { equals: 'published' } },
        })
        return result.docs.map((doc) => mapCampaign(asDoc(doc)))
      },
      () => [],
    ),
)

export async function getCampaignBySlug(
  locale: Locale,
  slug: string,
): Promise<CampaignView | null> {
  const all = await getCampaigns(locale)
  return all.find((entry) => entry.slug === slug) ?? null
}

/* -------------------------------------------------------------------------- */
/* Home & about                                                               */
/* -------------------------------------------------------------------------- */

const starterHomeContent = (locale: Locale): HomeContentView => ({
  heroEyebrow: pick(starterHome.heroEyebrow, locale),
  heroValueProposition: pick(starterHome.heroValueProposition, locale),
  heroPortrait: null,
  heroKeyPoints: starterHome.heroKeyPoints.map((point) => ({
    label: pick(point.label, locale),
    value: pick(point.value, locale),
  })),
  expertiseIntro: '',
  experienceIntro: '',
  ecosystemIntro: '',
  finalCtaTitle: pick(starterHome.finalCtaTitle, locale),
  finalCtaBody: pick(starterHome.finalCtaBody, locale),
  seo: {},
})

export const getHomeContent = cache(
  async (locale: Locale): Promise<HomeContentView> =>
    withCms(
      async (cms) => {
        const doc = asDoc(await cms.findGlobal({ slug: 'home-page', locale, depth: 1 }))
        const fallback = starterHomeContent(locale)
        const keyPoints = arrayOf(doc.heroKeyPoints)
          .map((entry) => ({ label: str(entry.label), value: str(entry.value) }))
          .filter((entry) => entry.label && entry.value)
        return {
          heroEyebrow: str(doc.heroEyebrow, fallback.heroEyebrow),
          heroValueProposition: str(doc.heroValueProposition, fallback.heroValueProposition),
          heroPortrait: image(doc.heroPortrait, 'portrait'),
          heroKeyPoints: keyPoints.length > 0 ? keyPoints : fallback.heroKeyPoints,
          expertiseIntro: str(doc.expertiseIntro),
          experienceIntro: str(doc.experienceIntro),
          ecosystemIntro: str(doc.ecosystemIntro),
          finalCtaTitle: str(doc.finalCtaTitle, fallback.finalCtaTitle),
          finalCtaBody: str(doc.finalCtaBody, fallback.finalCtaBody),
          seo: seo(doc.seo),
        }
      },
      () => starterHomeContent(locale),
    ),
)

const starterAboutContent = (locale: Locale): AboutContentView => ({
  lead: pick(starterAbout.lead, locale),
  portrait: null,
  biography: paragraphs(pick(starterAbout.biography, locale)),
  career: paragraphs(pick(starterAbout.career, locale)),
  vision: paragraphs(pick(starterAbout.vision, locale)),
  values: pick(starterAbout.values, locale),
  languages: starterAbout.languages.map((entry) => ({
    language: pick(entry.language, locale),
    level: pick(entry.level, locale),
  })),
  regions: starterAbout.regions.map((region) => pick(region, locale)),
  seo: {},
})

export const getAboutContent = cache(
  async (locale: Locale): Promise<AboutContentView> =>
    withCms(
      async (cms) => {
        const doc = asDoc(await cms.findGlobal({ slug: 'about-page', locale, depth: 1 }))
        const fallback = starterAboutContent(locale)
        const values = arrayOf(doc.values)
          .map((entry) => ({ title: str(entry.title), description: str(entry.description) }))
          .filter((entry) => entry.title)
        const languages = arrayOf(doc.languages)
          .map((entry) => ({ language: str(entry.language), level: str(entry.level) }))
          .filter((entry) => entry.language)
        const regions = arrayOf(doc.regions)
          .map((entry) => str(entry.name))
          .filter(Boolean)
        return {
          lead: str(doc.lead, fallback.lead),
          portrait: image(doc.portrait, 'portrait'),
          biography: richText(doc.biography) ?? fallback.biography,
          career: richText(doc.career) ?? fallback.career,
          vision: richText(doc.vision) ?? fallback.vision,
          values: values.length > 0 ? values : fallback.values,
          languages: languages.length > 0 ? languages : fallback.languages,
          regions: regions.length > 0 ? regions : fallback.regions,
          seo: seo(doc.seo),
        }
      },
      () => starterAboutContent(locale),
    ),
)

/* -------------------------------------------------------------------------- */
/* Expertise                                                                  */
/* -------------------------------------------------------------------------- */

const starterExpertiseViews = (locale: Locale): ExpertiseView[] =>
  starterExpertise.map((entry) => ({
    id: entry.key,
    slug: entry.key,
    title: pick(entry.title, locale),
    summary: pick(entry.summary, locale),
    icon: entry.icon,
    intro: paragraphs(pick(entry.intro, locale)),
    challenges: pick(entry.challenges, locale),
    services: pick(entry.services, locale),
    audiences: pick(entry.audiences, locale),
    approach: paragraphs(pick(entry.approach, locale)),
    isPlaceholder: false,
    featuredOnHome: true,
    seo: {},
  }))

const mapExpertise = (doc: Doc): ExpertiseView => ({
  id: String(doc.id),
  slug: str(doc.slug),
  title: str(doc.title),
  summary: str(doc.summary),
  icon: str(doc.icon, 'chart'),
  intro: richText(doc.intro),
  challenges: itemList(doc.challenges),
  services: arrayOf(doc.services).map((entry) => ({
    title: str(entry.title),
    description: str(entry.description) || undefined,
  })),
  audiences: itemList(doc.audiences),
  approach: richText(doc.approach),
  isPlaceholder: boolean(doc.isPlaceholder),
  featuredOnHome: doc.featuredOnHome !== false,
  seo: seo(doc.seo),
})

export const getExpertiseAreas = cache(
  async (locale: Locale): Promise<ExpertiseView[]> =>
    withCms(
      async (cms) => {
        const result = await cms.find({
          collection: 'expertise-areas',
          locale,
          depth: 1,
          limit: 50,
          sort: 'order',
          where: { _status: { equals: 'published' } },
        })
        if (result.docs.length === 0) return starterExpertiseViews(locale)
        return result.docs.map((doc) => mapExpertise(asDoc(doc)))
      },
      () => starterExpertiseViews(locale),
    ),
)

export async function getExpertiseBySlug(
  locale: Locale,
  slug: string,
): Promise<ExpertiseView | null> {
  const areas = await getExpertiseAreas(locale)
  return areas.find((area) => area.slug === slug) ?? null
}

/* -------------------------------------------------------------------------- */
/* Experience                                                                 */
/* -------------------------------------------------------------------------- */

const starterExperienceViews = (locale: Locale): ExperienceView[] =>
  starterExperiences.map((entry) => ({
    id: entry.key,
    slug: entry.key,
    type: entry.type,
    title: pick(entry.title, locale),
    organisation: entry.organisation,
    role: pick(entry.role, locale),
    sector: pick(entry.sector, locale),
    region: entry.region,
    countries: pick(entry.countries, locale),
    countryCodes: [],
    startDate: entry.startDate,
    endDate: entry.endDate ?? null,
    summary: pick(entry.summary, locale),
    context: null,
    responsibilities: pick(entry.responsibilities, locale),
    results: [],
    resultsValidated: false,
    expertiseSlugs: [],
    featured: entry.featured,
    isPlaceholder: true,
    seo: {},
  }))

const mapExperience = (doc: Doc, locale: Locale): ExperienceView => ({
  id: String(doc.id),
  slug: str(doc.slug),
  type: (str(doc.type, 'assignment') as ExperienceView['type']) ?? 'assignment',
  title: str(doc.title),
  organisation: str(doc.organisation),
  role: str(doc.role),
  sector: str(doc.sector),
  region: (str(doc.region, 'international') as ExperienceView['region']) ?? 'international',
  // The displayed name overrides the official name of the chosen country.
  countries: arrayOf(doc.countries)
    .map((entry) => str(entry.name) || countryName(str(entry.code), locale))
    .filter(Boolean),
  countryCodes: arrayOf(doc.countries)
    .map((entry) => str(entry.code))
    .filter(isCountryCode),
  startDate: str(doc.startDate),
  endDate: str(doc.endDate) || null,
  summary: str(doc.summary),
  context: richText(doc.context),
  responsibilities: itemList(doc.responsibilities),
  results: boolean(doc.resultsValidated) ? itemList(doc.results) : [],
  resultsValidated: boolean(doc.resultsValidated),
  expertiseSlugs: relationSlugs(doc.expertiseAreas),
  featured: boolean(doc.featured),
  isPlaceholder: boolean(doc.isPlaceholder),
  seo: seo(doc.seo),
})

export const getExperiences = cache(
  async (locale: Locale): Promise<ExperienceView[]> =>
    withCms(
      async (cms) => {
        const result = await cms.find({
          collection: 'experiences',
          locale,
          depth: 1,
          limit: 200,
          sort: '-startDate',
          where: { _status: { equals: 'published' } },
        })
        if (result.docs.length === 0) return starterExperienceViews(locale)
        return result.docs.map((doc) => mapExperience(asDoc(doc), locale))
      },
      () => starterExperienceViews(locale),
    ),
)

export async function getExperienceBySlug(
  locale: Locale,
  slug: string,
): Promise<ExperienceView | null> {
  const all = await getExperiences(locale)
  return all.find((entry) => entry.slug === slug) ?? null
}

/* -------------------------------------------------------------------------- */
/* RK Insights                                                                */
/* -------------------------------------------------------------------------- */

const starterCategoryViews = (locale: Locale): CategoryView[] =>
  starterCategories.map((entry) => ({
    id: entry.key,
    slug: entry.key,
    title: pick(entry.title, locale),
  }))

export const getCategories = cache(
  async (locale: Locale): Promise<CategoryView[]> =>
    withCms(
      async (cms) => {
        const result = await cms.find({
          collection: 'categories',
          locale,
          limit: 50,
          sort: 'title',
        })
        if (result.docs.length === 0) return starterCategoryViews(locale)
        return result.docs.map((doc) => ({
          id: String(asDoc(doc).id),
          slug: str(asDoc(doc).slug),
          title: str(asDoc(doc).title),
        }))
      },
      () => starterCategoryViews(locale),
    ),
)

const starterInsightViews = (locale: Locale): InsightView[] =>
  starterInsights.map((entry) => {
    const category = starterCategories.find((cat) => cat.key === entry.categoryKey)
    return {
      id: entry.key,
      slug: entry.key,
      title: pick(entry.title, locale),
      excerpt: pick(entry.excerpt, locale),
      content: paragraphs(pick(entry.paragraphs, locale)),
      cover: null,
      category: category
        ? { id: category.key, slug: category.key, title: pick(category.title, locale) }
        : null,
      author: 'Romial Kenmogne',
      publishedAt: entry.publishedAt,
      readingTime: entry.readingTime,
      featured: entry.featured,
      isPlaceholder: true,
      relatedInsightSlugs: [],
      relatedExpertiseSlugs: [],
      seo: {},
    }
  })

const mapInsight = (doc: Doc): InsightView => {
  const category = doc.category as Doc | undefined
  return {
    id: String(doc.id),
    slug: str(doc.slug),
    title: str(doc.title),
    excerpt: str(doc.excerpt),
    content: richText(doc.content),
    cover: image(doc.coverImage, 'wide'),
    category:
      category && typeof category === 'object'
        ? { id: String(category.id), slug: str(category.slug), title: str(category.title) }
        : null,
    author: str(doc.author, 'Romial Kenmogne'),
    publishedAt: str(doc.publishedAt) || null,
    readingTime: num(doc.readingTime) ?? 3,
    featured: boolean(doc.featured),
    isPlaceholder: boolean(doc.isPlaceholder),
    relatedInsightSlugs: relationSlugs(doc.relatedInsights),
    relatedExpertiseSlugs: relationSlugs(doc.relatedExpertise),
    seo: seo(doc.seo),
  }
}

export const getInsights = cache(
  async (locale: Locale): Promise<InsightView[]> =>
    withCms(
      async (cms) => {
        const where: Where = {
          and: [
            { _status: { equals: 'published' } },
            {
              or: [
                { publishedAt: { less_than_equal: new Date().toISOString() } },
                { publishedAt: { exists: false } },
              ],
            },
          ],
        }
        const result = await cms.find({
          collection: 'insights',
          locale,
          depth: 1,
          limit: 200,
          sort: '-publishedAt',
          where,
        })
        if (result.docs.length === 0) return starterInsightViews(locale)
        return result.docs.map((doc) => mapInsight(asDoc(doc)))
      },
      () => starterInsightViews(locale),
    ),
)

export async function getInsightBySlug(locale: Locale, slug: string): Promise<InsightView | null> {
  const all = await getInsights(locale)
  return all.find((entry) => entry.slug === slug) ?? null
}

/* -------------------------------------------------------------------------- */
/* Books                                                                      */
/* -------------------------------------------------------------------------- */

const starterBookViews = (locale: Locale): BookView[] =>
  starterBooks.map((entry) => ({
    id: entry.key,
    slug: pick(entry.slug, locale),
    title: pick(entry.title, locale),
    subtitle: pick(entry.subtitle, locale),
    author: 'Romial Kenmogne',
    summary: pick(entry.summary, locale),
    description: paragraphs(pick(entry.description, locale)),
    // The cover is a media upload: it only exists once imported into the CMS.
    cover: null,
    audience: pick(entry.audience, locale),
    languages: entry.bookLanguage,
    formats: entry.format,
    isbn: entry.isbn,
    publisher: '',
    publicationDate: '',
    pages: null,
    price: null,
    currency: 'EUR',
    availability: entry.availability,
    stock: null,
    saleType: entry.saleType,
    purchaseLinks: entry.purchaseLinks.map((link) => ({
      label: pick(link.label, locale),
      url: link.url,
    })),
    directOrderForm: entry.directOrderForm,
    previewUrl: null,
    relatedBookSlugs: [],
    featured: true,
    isPlaceholder: entry.isPlaceholder,
    seo: {
      title: pick(entry.seo.title, locale),
      description: pick(entry.seo.description, locale),
    },
  }))

const mapBook = (doc: Doc): BookView => {
  const preview = doc.previewPdf as Doc | undefined
  const selectList = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
  return {
    id: String(doc.id),
    slug: str(doc.slug),
    title: str(doc.title),
    subtitle: str(doc.subtitle),
    author: str(doc.author, 'Romial Kenmogne'),
    summary: str(doc.summary),
    description: richText(doc.description),
    cover: image(doc.cover, 'book'),
    audience: itemList(doc.audience),
    languages: selectList(doc.bookLanguage),
    formats: selectList(doc.format),
    isbn: str(doc.isbn),
    publisher: str(doc.publisher),
    publicationDate: str(doc.publicationDate),
    pages: num(doc.pages),
    price: num(doc.price),
    currency: str(doc.currency, 'EUR'),
    availability: (str(doc.availability, 'comingSoon') as BookView['availability']) ?? 'comingSoon',
    stock: num(doc.stock),
    saleType: (str(doc.saleType, 'external') as BookView['saleType']) ?? 'external',
    purchaseLinks: arrayOf(doc.purchaseLinks)
      .map((entry) => ({ label: str(entry.label), url: str(entry.url) }))
      .filter((entry) => entry.url),
    directOrderForm: boolean(doc.directOrderForm),
    previewUrl: preview ? toRelativeUrl(str(preview.url)) || null : null,
    relatedBookSlugs: relationSlugs(doc.relatedBooks),
    featured: boolean(doc.featured),
    isPlaceholder: boolean(doc.isPlaceholder),
    seo: seo(doc.seo),
  }
}

export const getBooks = cache(
  async (locale: Locale): Promise<BookView[]> =>
    withCms(
      async (cms) => {
        const result = await cms.find({
          collection: 'books',
          locale,
          depth: 1,
          limit: 100,
          sort: 'order',
          where: { _status: { equals: 'published' } },
        })
        if (result.docs.length === 0) return starterBookViews(locale)
        return result.docs.map((doc) => mapBook(asDoc(doc)))
      },
      () => starterBookViews(locale),
    ),
)

export async function getBookBySlug(locale: Locale, slug: string): Promise<BookView | null> {
  const all = await getBooks(locale)
  return all.find((entry) => entry.slug === slug) ?? null
}

/* -------------------------------------------------------------------------- */
/* Businesses & credentials                                                   */
/* -------------------------------------------------------------------------- */

const starterBusinessViews = (locale: Locale): BusinessView[] =>
  starterBusinesses.map((entry) => ({
    id: entry.key,
    slug: entry.key,
    name: entry.name,
    tagline: pick(entry.tagline, locale),
    description: pick(entry.description, locale),
    valueProposition: pick(entry.valueProposition, locale),
    field: pick(entry.field, locale),
    audience: pick(entry.audience, locale),
    website: entry.website,
    contactEmail: '',
    logo: null,
    isPlaceholder: true,
  }))

const mapBusiness = (record: Doc): BusinessView => ({
  id: String(record.id),
  slug: str(record.slug),
  name: str(record.name),
  tagline: str(record.tagline),
  description: str(record.description),
  valueProposition: str(record.valueProposition),
  field: str(record.field),
  audience: str(record.audience),
  website: str(record.website),
  contactEmail: str(record.contactEmail),
  logo: image(record.logo),
  isPlaceholder: boolean(record.isPlaceholder),
})

export const getBusinesses = cache(
  async (locale: Locale): Promise<BusinessView[]> =>
    withCms(
      async (cms) => {
        const result = await cms.find({
          collection: 'businesses',
          locale,
          depth: 1,
          limit: 20,
          sort: 'order',
          where: { and: [{ _status: { equals: 'published' } }, { active: { equals: true } }] },
        })
        if (result.docs.length === 0) return starterBusinessViews(locale)
        return result.docs.map((doc) => mapBusiness(asDoc(doc)))
      },
      () => starterBusinessViews(locale),
    ),
)

const starterCredentialViews = (locale: Locale): CredentialView[] =>
  starterCredentials.map((entry) => ({
    id: entry.key,
    title: pick(entry.title, locale),
    institution: entry.institution,
    kind: entry.kind,
    year: entry.year,
    location: '',
    description: '',
    isPlaceholder: true,
  }))

export const getCredentials = cache(
  async (locale: Locale): Promise<CredentialView[]> =>
    withCms(
      async (cms) => {
        const result = await cms.find({
          collection: 'credentials',
          locale,
          limit: 50,
          sort: 'order',
          where: { _status: { equals: 'published' } },
        })
        if (result.docs.length === 0) return starterCredentialViews(locale)
        return result.docs.map((doc) => {
          const record = asDoc(doc)
          return {
            id: String(record.id),
            title: str(record.title),
            institution: str(record.institution),
            kind: (str(record.kind, 'education') as CredentialView['kind']) ?? 'education',
            year: str(record.year),
            location: str(record.location),
            description: str(record.description),
            isPlaceholder: boolean(record.isPlaceholder),
          }
        })
      },
      () => starterCredentialViews(locale),
    ),
)

/* -------------------------------------------------------------------------- */
/* Legal pages                                                                */
/* -------------------------------------------------------------------------- */

const LEGAL_SLUGS: Record<string, Record<Locale, string>> = {
  imprint: { en: 'imprint', fr: 'impressum', de: 'impressum' },
  privacy: { en: 'privacy-policy', fr: 'politique-de-confidentialite', de: 'datenschutz' },
  cookies: { en: 'cookie-policy', fr: 'politique-de-cookies', de: 'cookie-richtlinie' },
  terms: { en: 'terms-and-conditions', fr: 'conditions-generales', de: 'agb' },
  returns: {
    en: 'delivery-and-returns',
    fr: 'livraison-et-retours',
    de: 'lieferung-und-rueckgabe',
  },
}

export function legalSlug(type: string, locale: Locale): string {
  return LEGAL_SLUGS[type]?.[locale] ?? type
}

const starterLegalViews = (locale: Locale): LegalPageView[] =>
  starterLegalPages.map((entry) => ({
    slug: legalSlug(entry.type, locale),
    type: entry.type,
    title: pick(entry.title, locale),
    content: {
      kind: 'paragraphs',
      paragraphs: pick(entry.sections, locale).flatMap((section) => [
        `## ${section.heading}`,
        section.body,
      ]),
    },
    needsLegalReview: true,
    lastUpdated: null,
    seo: {},
  }))

const mapLegalPage = (record: Doc): LegalPageView => ({
  slug: str(record.slug),
  type: (str(record.type, 'imprint') as LegalPageView['type']) ?? 'imprint',
  title: str(record.title),
  content: richText(record.content),
  needsLegalReview: record.needsLegalReview !== false,
  lastUpdated: str(record.lastUpdated) || null,
  seo: seo(record.seo),
})

export const getLegalPages = cache(
  async (locale: Locale): Promise<LegalPageView[]> =>
    withCms(
      async (cms) => {
        const result = await cms.find({
          collection: 'legal-pages',
          locale,
          limit: 20,
          where: { _status: { equals: 'published' } },
        })
        if (result.docs.length === 0) return starterLegalViews(locale)
        return result.docs.map((doc) => mapLegalPage(asDoc(doc)))
      },
      () => starterLegalViews(locale),
    ),
)

export async function getLegalPageBySlug(
  locale: Locale,
  slug: string,
): Promise<LegalPageView | null> {
  const pages = await getLegalPages(locale)
  return pages.find((page) => page.slug === slug) ?? null
}

export async function getLegalPageByType(
  locale: Locale,
  type: LegalPageView['type'],
): Promise<LegalPageView | null> {
  const pages = await getLegalPages(locale)
  return pages.find((page) => page.type === type) ?? null
}

/* -------------------------------------------------------------------------- */
/* Draft preview                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Reads entries including their unpublished draft. Used only when Next.js draft
 * mode is enabled, which the `/api/preview` route grants exclusively to a
 * signed-in administrator or editor. The mappers are the public ones: fields
 * reserved to buyers (lesson contents, files) are never rendered.
 */
async function findDrafts(
  collection: CollectionSlug,
  locale: Locale,
  where: Where,
  options: { limit?: number; sort?: string } = {},
): Promise<Doc[]> {
  const cms = await getCms()
  if (!cms) return []

  try {
    const result = await cms.find({
      collection,
      locale,
      depth: 1,
      limit: options.limit ?? 1,
      sort: options.sort,
      draft: true,
      overrideAccess: true,
      where,
    })
    return result.docs.map(asDoc)
  } catch (error) {
    console.warn(
      '[cms] Draft preview failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return []
  }
}

async function draftBySlug<T>(
  collection: CollectionSlug,
  locale: Locale,
  slug: string,
  map: (doc: Doc) => T,
): Promise<T | null> {
  const [doc] = await findDrafts(collection, locale, { slug: { equals: slug } })
  return doc ? map(doc) : null
}

export const getDraftInsightBySlug = (locale: Locale, slug: string) =>
  draftBySlug('insights', locale, slug, mapInsight)

export const getDraftBookBySlug = (locale: Locale, slug: string) =>
  draftBySlug('books', locale, slug, mapBook)

export const getDraftExpertiseBySlug = (locale: Locale, slug: string) =>
  draftBySlug('expertise-areas', locale, slug, mapExpertise)

export const getDraftExperienceBySlug = (locale: Locale, slug: string) =>
  draftBySlug('experiences', locale, slug, (doc) => mapExperience(doc, locale))

export const getDraftEngagementBySlug = (locale: Locale, slug: string) =>
  draftBySlug('engagements', locale, slug, (doc) => mapEngagement(doc, locale))

export const getDraftProductBySlug = (locale: Locale, slug: string) =>
  draftBySlug('products', locale, slug, mapProduct)

export const getDraftCampaignBySlug = (locale: Locale, slug: string) =>
  draftBySlug('campaigns', locale, slug, mapCampaign)

export const getDraftLegalPageBySlug = (locale: Locale, slug: string) =>
  draftBySlug('legal-pages', locale, slug, mapLegalPage)

/** Visible ventures including unpublished changes (the page has no detail pages). */
export async function getDraftBusinesses(locale: Locale): Promise<BusinessView[]> {
  const docs = await findDrafts(
    'businesses',
    locale,
    { active: { equals: true } },
    { limit: 20, sort: 'order' },
  )
  return docs.length > 0 ? docs.map(mapBusiness) : getBusinesses(locale)
}
