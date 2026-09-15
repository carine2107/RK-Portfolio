import type { Locale } from '@/i18n/routing'

/** Rich text can come from the CMS (Lexical) or from the starter content (plain paragraphs). */
export type RichContent =
  | { kind: 'lexical'; data: unknown }
  | { kind: 'paragraphs'; paragraphs: string[] }
  | null

export type ImageView = {
  url: string
  alt: string
  width?: number
  height?: number
} | null

export type SeoView = {
  title?: string
  description?: string
  image?: string
  noindex?: boolean
}

export type ExpertiseView = {
  id: string
  slug: string
  title: string
  summary: string
  icon: string
  intro: RichContent
  challenges: string[]
  services: { title: string; description?: string }[]
  audiences: string[]
  approach: RichContent
  isPlaceholder: boolean
  featuredOnHome: boolean
  seo: SeoView
}

export type ExperienceView = {
  id: string
  slug: string
  type: 'assignment' | 'project'
  title: string
  organisation: string
  role: string
  sector: string
  region: 'europe' | 'africa' | 'international'
  /** Display names, in the page language. */
  countries: string[]
  /** ISO 3166-1 alpha-2 codes of the countries placed on the map. */
  countryCodes: string[]
  startDate: string
  endDate: string | null
  summary: string
  context: RichContent
  responsibilities: string[]
  results: string[]
  resultsValidated: boolean
  expertiseSlugs: string[]
  featured: boolean
  isPlaceholder: boolean
  seo: SeoView
}

export type EngagementView = {
  id: string
  slug: string
  type: 'conference' | 'workshop' | 'panel' | 'interview' | 'podcast' | 'video' | 'press'
  title: string
  summary: string
  description: RichContent
  /** ISO date-time. */
  date: string
  endDate: string | null
  eventName: string
  organiser: string
  city: string
  /** ISO 3166-1 alpha-2, '' when not set. */
  countryCode: string
  /** Country name in the page language. */
  country: string
  languages: string[]
  videoUrl: string
  hasVideo: boolean
  /** Published areas of expertise covered, in the page language. */
  topics: { slug: string; title: string }[]
  durationMinutes: number | null
  externalUrl: string
  externalLabel: string
  cover: ImageView
  featured: boolean
  isPlaceholder: boolean
  seo: SeoView
}

export type ProductView = {
  id: string
  slug: string
  type: 'ebook' | 'course' | 'resource'
  title: string
  summary: string
  description: RichContent
  price: number
  available: boolean
  languages: string[]
  /** Public syllabus of a course: titles and durations only. */
  modules: {
    title: string
    lessons: { id: string; title: string; durationMinutes: number | null }[]
  }[]
  cover: ImageView
  featured: boolean
  isPlaceholder: boolean
  seo: SeoView
}

/** Button of a campaign block; null when not filled in or invalid. */
export type CampaignLink = { label: string; href: string; external: boolean } | null

export type CampaignBlock =
  | {
      id: string
      type: 'hero'
      eyebrow: string
      heading: string
      lead: string
      image: ImageView
      cta: CampaignLink
    }
  | {
      id: string
      type: 'text'
      heading: string
      content: RichContent
      image: ImageView
      imagePosition: 'left' | 'right'
    }
  | {
      id: string
      type: 'features'
      heading: string
      intro: string
      items: { title: string; description: string }[]
    }
  | { id: string; type: 'video'; heading: string; videoUrl: string; poster: ImageView }
  | { id: string; type: 'books'; heading: string; bookIds: string[] }
  | { id: string; type: 'products'; heading: string; productIds: string[] }
  | { id: string; type: 'faq'; heading: string; items: { question: string; answer: string }[] }
  | {
      id: string
      type: 'cta'
      heading: string
      body: string
      primary: CampaignLink
      secondary: CampaignLink
    }
  | { id: string; type: 'newsletter'; heading: string; body: string }

export type CampaignView = {
  id: string
  slug: string
  title: string
  summary: string
  blocks: CampaignBlock[]
  seo: SeoView
}

export type CategoryView = {
  id: string
  slug: string
  title: string
}

export type InsightView = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: RichContent
  cover: ImageView
  category: CategoryView | null
  author: string
  publishedAt: string | null
  readingTime: number
  featured: boolean
  isPlaceholder: boolean
  relatedInsightSlugs: string[]
  relatedExpertiseSlugs: string[]
  seo: SeoView
}

export type BookView = {
  id: string
  slug: string
  title: string
  subtitle: string
  author: string
  summary: string
  description: RichContent
  cover: ImageView
  audience: string[]
  languages: string[]
  formats: string[]
  isbn: string
  publisher: string
  /** ISO date, '' when unknown. */
  publicationDate: string
  pages: number | null
  price: number | null
  currency: string
  availability: 'available' | 'preorder' | 'comingSoon' | 'outOfStock'
  /** Direct sale stock, null when not tracked. */
  stock: number | null
  saleType: 'external' | 'direct' | 'none'
  purchaseLinks: { label: string; url: string }[]
  /** "Order here" add-to-cart dialog under the purchase links (direct purchase on the site). */
  directOrderForm: boolean
  previewUrl: string | null
  relatedBookSlugs: string[]
  featured: boolean
  isPlaceholder: boolean
  seo: SeoView
}

export type BusinessView = {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  valueProposition: string
  field: string
  audience: string
  website: string
  contactEmail: string
  logo: ImageView
  isPlaceholder: boolean
}

export type CredentialView = {
  id: string
  title: string
  institution: string
  kind: 'education' | 'credential'
  year: string
  location: string
  description: string
  isPlaceholder: boolean
}

export type SiteSettingsView = {
  name: string
  headline: string
  signature: string
  email: string
  phone: string
  address: string
  spokenLanguages: string
  /** External booking page (https only), '' when not configured. */
  bookingUrl: string
  bookingLabel: string
  social: { platform: string; url: string }[]
  expertProfileUrl: string | null
  expertProfileTitle: string
  cvUrl: string | null
  creditName: string
  creditUrl: string
  logo: ImageView
  defaultSeoTitle: string
  defaultSeoDescription: string
  defaultOgImage: string | null
}

export type AppearanceView = {
  /** Stylesheet overriding the default design tokens ('' = default look). */
  css: string
  themeColors: { light: string; dark: string }
  hero: {
    style: 'halo' | 'plain' | 'image'
    image: ImageView
    intensity: 'subtle' | 'visible'
  }
}

export type HomeContentView = {
  heroEyebrow: string
  heroValueProposition: string
  heroPortrait: ImageView
  heroKeyPoints: { label: string; value: string }[]
  expertiseIntro: string
  experienceIntro: string
  ecosystemIntro: string
  finalCtaTitle: string
  finalCtaBody: string
  seo: SeoView
}

export type AboutContentView = {
  lead: string
  portrait: ImageView
  biography: RichContent
  career: RichContent
  vision: RichContent
  values: { title: string; description?: string }[]
  languages: { language: string; level: string }[]
  regions: string[]
  seo: SeoView
}

export type LegalPageView = {
  slug: string
  type: 'imprint' | 'privacy' | 'cookies' | 'terms' | 'returns'
  title: string
  content: RichContent
  needsLegalReview: boolean
  lastUpdated: string | null
  seo: SeoView
}

export type ContentSource = 'cms' | 'starter'

export type ContentResult<T> = {
  data: T
  source: ContentSource
}

export type ListQuery = {
  locale: Locale
  page?: number
  limit?: number
  category?: string
  search?: string
}
