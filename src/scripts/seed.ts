/**
 * Seeds the CMS with the starter content.
 *
 * Idempotent: entries are matched on their English slug, so running the script
 * twice updates instead of duplicating. Every content entry is flagged
 * `isPlaceholder` so the owner can see at a glance what still has to be
 * replaced with validated information.
 *
 *   npm run seed
 */
import 'dotenv/config'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

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
} from '../content/starter'
import { slugify } from '../payload/fields/shared'
import { upsertBook } from './books'
import { lexicalFromParagraphs, lexicalFromText } from './lexical'
import { withRowIds, writeAboutProfileRows } from './rows'

type Locale = 'en' | 'fr' | 'de'
const LOCALES: Locale[] = ['en', 'fr', 'de']
const OTHER_LOCALES: Locale[] = ['fr', 'de']

const pick = <T>(value: Localized<T>, locale: Locale): T => value[locale]

async function findBySlug(
  payload: Payload,
  collection:
    | 'expertise-areas'
    | 'experiences'
    | 'insights'
    | 'books'
    | 'businesses'
    | 'categories',
  slug: string,
): Promise<string | number | null> {
  const result = await payload.find({
    collection,
    locale: 'en',
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: true,
    draft: true,
  })
  return result.docs[0]?.id ?? null
}

async function upsert(
  payload: Payload,
  collection: Parameters<typeof findBySlug>[1],
  slug: string,
  data: Record<string, unknown>,
  translations: Partial<Record<Locale, Record<string, unknown>>>,
): Promise<string | number> {
  const existing = await findBySlug(payload, collection, slug)

  const id = existing
    ? (
        await payload.update({
          collection,
          id: existing,
          locale: 'en',
          overrideAccess: true,
          data,
        })
      ).id
    : (
        await payload.create({
          collection,
          locale: 'en',
          overrideAccess: true,
          data: data as never,
        })
      ).id

  for (const locale of OTHER_LOCALES) {
    const translation = translations[locale]
    if (!translation) continue
    await payload.update({
      collection,
      id,
      locale,
      overrideAccess: true,
      data: translation as never,
    })
  }

  return id
}

async function seedAdmin(payload: Payload): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    console.log('· Skipping administrator creation (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD unset).')
    return
  }

  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    where: { email: { equals: email } },
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    console.log(`· Administrator ${email} already exists.`)
    return
  }

  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: { email, password, name: 'Administrator', role: 'admin' },
  })
  console.log(`· Administrator created: ${email}`)
}

async function seedCategories(payload: Payload): Promise<Map<string, string | number>> {
  const ids = new Map<string, string | number>()

  for (const category of starterCategories) {
    const id = await upsert(
      payload,
      'categories',
      category.key,
      { title: pick(category.title, 'en'), slug: category.key },
      Object.fromEntries(
        OTHER_LOCALES.map((locale) => [
          locale,
          { title: pick(category.title, locale), slug: slugify(pick(category.title, locale)) },
        ]),
      ),
    )
    ids.set(category.key, id)
  }

  console.log(`· ${starterCategories.length} categories`)
  return ids
}

async function seedExpertise(payload: Payload): Promise<Map<string, string | number>> {
  const ids = new Map<string, string | number>()

  for (const area of starterExpertise) {
    const id = await upsert(
      payload,
      'expertise-areas',
      area.key,
      {
        title: pick(area.title, 'en'),
        slug: area.key,
        summary: pick(area.summary, 'en'),
        icon: area.icon,
        order: area.order,
        featuredOnHome: true,
        isPlaceholder: false,
        _status: 'published' as const,
        intro: lexicalFromText(pick(area.intro, 'en')),
        challenges: pick(area.challenges, 'en').map((item) => ({ item })),
        services: pick(area.services, 'en'),
        audiences: pick(area.audiences, 'en').map((item) => ({ item })),
        approach: lexicalFromText(pick(area.approach, 'en')),
      },
      Object.fromEntries(
        OTHER_LOCALES.map((locale) => [
          locale,
          {
            title: pick(area.title, locale),
            slug: slugify(pick(area.title, locale)),
            summary: pick(area.summary, locale),
            intro: lexicalFromText(pick(area.intro, locale)),
            challenges: pick(area.challenges, locale).map((item) => ({ item })),
            services: pick(area.services, locale),
            audiences: pick(area.audiences, locale).map((item) => ({ item })),
            approach: lexicalFromText(pick(area.approach, locale)),
            _status: 'published' as const,
          },
        ]),
      ),
    )
    ids.set(area.key, id)
  }

  console.log(`· ${starterExpertise.length} expertise areas`)
  return ids
}

async function seedExperiences(
  payload: Payload,
  expertiseIds: Map<string, string | number>,
): Promise<void> {
  const defaultExpertise = [expertiseIds.get('corporate-finance')].filter(Boolean)

  for (const entry of starterExperiences) {
    const id = await upsert(
      payload,
      'experiences',
      entry.key,
      {
        title: pick(entry.title, 'en'),
        slug: entry.key,
        type: entry.type,
        organisation: entry.organisation,
        role: pick(entry.role, 'en'),
        sector: pick(entry.sector, 'en'),
        region: entry.region,
        countries: pick(entry.countries, 'en').map((name) => ({ name })),
        startDate: entry.startDate,
        ...(entry.endDate ? { endDate: entry.endDate } : {}),
        summary: pick(entry.summary, 'en'),
        featured: entry.featured,
        order: entry.order,
        isPlaceholder: true,
        resultsValidated: false,
        responsibilities: pick(entry.responsibilities, 'en').map((item) => ({ item })),
        expertiseAreas: defaultExpertise,
        _status: 'published' as const,
      },
      // Translations are written below, together with the countries.
      {},
    )

    // Countries are shared rows with a required translated name: each language
    // is written on the English rows, in the same update as its other fields
    // (a translation saved without them would fail validation on a new database).
    const english = await payload.findByID({
      collection: 'experiences',
      id,
      locale: 'en',
      overrideAccess: true,
      draft: true,
    })
    for (const locale of OTHER_LOCALES) {
      await payload.update({
        collection: 'experiences',
        id,
        locale,
        overrideAccess: true,
        data: {
          title: pick(entry.title, locale),
          slug: `${entry.key}-${locale}`,
          role: pick(entry.role, locale),
          sector: pick(entry.sector, locale),
          summary: pick(entry.summary, locale),
          responsibilities: pick(entry.responsibilities, locale).map((item) => ({ item })),
          countries: withRowIds(
            pick(entry.countries, locale).map((name) => ({ name })),
            english.countries,
          ),
          _status: 'published' as const,
        } as never,
      })
    }
  }

  console.log(`· ${starterExperiences.length} experience entries`)
}

async function seedInsights(
  payload: Payload,
  categoryIds: Map<string, string | number>,
  expertiseIds: Map<string, string | number>,
): Promise<void> {
  for (const article of starterInsights) {
    const category = categoryIds.get(article.categoryKey)
    const relatedExpertise = [expertiseIds.get('financial-planning-education')].filter(Boolean)

    await upsert(
      payload,
      'insights',
      article.key,
      {
        title: pick(article.title, 'en'),
        slug: article.key,
        excerpt: pick(article.excerpt, 'en'),
        content: lexicalFromParagraphs(pick(article.paragraphs, 'en')),
        ...(category ? { category } : {}),
        author: 'Romial Kenmogne',
        publishedAt: article.publishedAt,
        featured: article.featured,
        isPlaceholder: true,
        relatedExpertise,
        _status: 'published' as const,
      },
      Object.fromEntries(
        OTHER_LOCALES.map((locale) => [
          locale,
          {
            title: pick(article.title, locale),
            slug: slugify(pick(article.title, locale)),
            excerpt: pick(article.excerpt, locale),
            content: lexicalFromParagraphs(pick(article.paragraphs, locale)),
            _status: 'published' as const,
          },
        ]),
      ),
    )
  }

  console.log(`· ${starterInsights.length} RK Insights articles`)
}

async function seedBooks(payload: Payload): Promise<void> {
  for (const book of starterBooks) {
    // "understand-money" was the sample book shipped before the real one.
    await upsertBook(payload, book, { legacySlugs: ['understand-money'] })
  }

  console.log(`· ${starterBooks.length} books`)
}

async function seedBusinesses(payload: Payload): Promise<void> {
  for (const business of starterBusinesses) {
    await upsert(
      payload,
      'businesses',
      business.key,
      {
        name: business.name,
        slug: business.key,
        tagline: pick(business.tagline, 'en'),
        description: pick(business.description, 'en'),
        valueProposition: pick(business.valueProposition, 'en'),
        field: pick(business.field, 'en'),
        audience: pick(business.audience, 'en'),
        ...(business.website ? { website: business.website } : {}),
        active: true,
        order: business.order,
        isPlaceholder: true,
        _status: 'published' as const,
      },
      Object.fromEntries(
        OTHER_LOCALES.map((locale) => [
          locale,
          {
            tagline: pick(business.tagline, locale),
            description: pick(business.description, locale),
            valueProposition: pick(business.valueProposition, locale),
            field: pick(business.field, locale),
            audience: pick(business.audience, locale),
            _status: 'published' as const,
          },
        ]),
      ),
    )
  }

  console.log(`· ${starterBusinesses.length} ventures`)
}

async function seedCredentials(payload: Payload): Promise<void> {
  for (const credential of starterCredentials) {
    const existing = await payload.find({
      collection: 'credentials',
      locale: 'en',
      limit: 1,
      where: { title: { equals: pick(credential.title, 'en') } },
      overrideAccess: true,
      draft: true,
    })

    const data = {
      title: pick(credential.title, 'en'),
      institution: credential.institution,
      kind: credential.kind,
      year: credential.year,
      order: credential.order,
      isPlaceholder: true,
      _status: 'published' as const,
    }

    const id =
      existing.docs[0]?.id ??
      (
        await payload.create({
          collection: 'credentials',
          locale: 'en',
          overrideAccess: true,
          data,
        })
      ).id

    if (existing.docs[0]?.id) {
      await payload.update({
        collection: 'credentials',
        id,
        locale: 'en',
        overrideAccess: true,
        data,
      })
    }

    for (const locale of OTHER_LOCALES) {
      await payload.update({
        collection: 'credentials',
        id,
        locale,
        overrideAccess: true,
        data: { title: pick(credential.title, locale), _status: 'published' },
      })
    }
  }

  console.log(`· ${starterCredentials.length} credentials`)
}

async function seedLegalPages(payload: Payload): Promise<void> {
  for (const page of starterLegalPages) {
    const existing = await payload.find({
      collection: 'legal-pages',
      locale: 'en',
      limit: 1,
      where: { type: { equals: page.type } },
      overrideAccess: true,
      draft: true,
    })

    const contentFor = (locale: Locale) =>
      lexicalFromParagraphs(
        pick(page.sections, locale).flatMap((section) => [`## ${section.heading}`, section.body]),
      )

    const enSlug = {
      imprint: 'imprint',
      privacy: 'privacy-policy',
      cookies: 'cookie-policy',
      terms: 'terms-and-conditions',
      returns: 'delivery-and-returns',
    }[page.type]

    const data = {
      title: pick(page.title, 'en'),
      slug: enSlug,
      type: page.type,
      needsLegalReview: true,
      content: contentFor('en'),
      _status: 'published' as const,
    }

    const id =
      existing.docs[0]?.id ??
      (
        await payload.create({
          collection: 'legal-pages',
          locale: 'en',
          overrideAccess: true,
          data,
        })
      ).id

    if (existing.docs[0]?.id) {
      await payload.update({
        collection: 'legal-pages',
        id,
        locale: 'en',
        overrideAccess: true,
        data,
      })
    }

    const slugs: Record<string, Record<Locale, string>> = {
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

    for (const locale of OTHER_LOCALES) {
      await payload.update({
        collection: 'legal-pages',
        id,
        locale,
        overrideAccess: true,
        data: {
          title: pick(page.title, locale),
          slug: slugs[page.type]?.[locale],
          content: contentFor(locale),
          _status: 'published' as const,
        },
      })
    }
  }

  console.log(`· ${starterLegalPages.length} legal pages`)
}

async function seedGlobals(payload: Payload): Promise<void> {
  const headlines: Localized = {
    en: 'Business & Financial Consultant | Project Manager',
    fr: 'Consultant en business et finance | Chef de projet',
    de: 'Business- & Finanzberater | Projektmanager',
  }

  const spokenLanguages: Localized = {
    en: 'French, English, German',
    fr: 'Français, anglais, allemand',
    de: 'Französisch, Englisch, Deutsch',
  }

  for (const locale of LOCALES) {
    await payload.updateGlobal({
      slug: 'site-settings',
      locale,
      overrideAccess: true,
      data: {
        name: 'Romial Kenmogne',
        headline: pick(headlines, locale),
        signature: 'Understand Money. Build Businesses. Invest. Create Wealth.',
        creditName: 'Nana-Consulting',
        spokenLanguages: pick(spokenLanguages, locale),
      },
    })

    await payload.updateGlobal({
      slug: 'home-page',
      locale,
      overrideAccess: true,
      data: {
        heroEyebrow: pick(starterHome.heroEyebrow, locale),
        heroValueProposition: pick(starterHome.heroValueProposition, locale),
        heroKeyPoints: starterHome.heroKeyPoints.map((point) => ({
          label: pick(point.label, locale),
          value: pick(point.value, locale),
        })),
        finalCtaTitle: pick(starterHome.finalCtaTitle, locale),
        finalCtaBody: pick(starterHome.finalCtaBody, locale),
      },
    })

    await payload.updateGlobal({
      slug: 'about-page',
      locale,
      overrideAccess: true,
      data: {
        lead: pick(starterAbout.lead, locale),
        biography: lexicalFromParagraphs(pick(starterAbout.biography, locale)),
        career: lexicalFromText(pick(starterAbout.career, locale)),
        vision: lexicalFromText(pick(starterAbout.vision, locale)),
        values: pick(starterAbout.values, locale),
      },
    })
  }

  await writeAboutProfileRows(payload)

  console.log('· Globals (site settings, home page, about page)')
}

async function main(): Promise<void> {
  const payload = await getPayload({ config })

  console.log('Seeding the RK website CMS…')
  await seedAdmin(payload)
  const categoryIds = await seedCategories(payload)
  const expertiseIds = await seedExpertise(payload)
  await seedExperiences(payload, expertiseIds)
  await seedInsights(payload, categoryIds, expertiseIds)
  await seedBooks(payload)
  await seedBusinesses(payload)
  await seedCredentials(payload)
  await seedLegalPages(payload)
  await seedGlobals(payload)
  console.log('Done. Sample entries are flagged "Sample content" in the CMS.')

  process.exit(0)
}

main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
