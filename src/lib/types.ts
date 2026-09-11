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
  countries: string[]
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
  price: number | null
  currency: string
  availability: 'available' | 'preorder' | 'comingSoon' | 'outOfStock'
  saleType: 'external' | 'direct' | 'none'
  purchaseLinks: { label: string; url: string }[]
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
