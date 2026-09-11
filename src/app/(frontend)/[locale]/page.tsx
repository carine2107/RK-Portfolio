import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import {
  BookCard,
  BusinessCard,
  ExperienceCard,
  ExpertiseCard,
  InsightCard,
} from '@/components/cards/ContentCards'
import { Hero } from '@/components/home/Hero'
import { JsonLd, personSchema, websiteSchema } from '@/components/seo/JsonLd'
import { buttonClasses } from '@/components/ui/Button'
import { CtaLink } from '@/components/ui/CtaLink'
import { Icon } from '@/components/ui/Icon'
import { Section, SectionHeading } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import {
  getBooks,
  getBusinesses,
  getExperiences,
  getExpertiseAreas,
  getHomeContent,
  getInsights,
  getSiteSettings,
} from '@/lib/cms'
import { pageMetadata } from '@/lib/seo'

/**
 * Incremental static regeneration: pages are served from cache and refreshed
 * in the background every 5 minutes, so CMS changes go live without a rebuild.
 */
export const revalidate = 300

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home.meta' })
  const content = await getHomeContent(locale)
  const settings = await getSiteSettings(locale)

  return pageMetadata({
    locale,
    path: '/',
    title: content.seo.title ?? t('title'),
    description: content.seo.description ?? t('description'),
    image: content.seo.image ?? settings.defaultOgImage,
    type: 'profile',
  })
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const common = await getTranslations('common')
  const nav = await getTranslations('nav')

  const [settings, content, expertise, experiences, insights, books, businesses] =
    await Promise.all([
      getSiteSettings(locale),
      getHomeContent(locale),
      getExpertiseAreas(locale),
      getExperiences(locale),
      getInsights(locale),
      getBooks(locale),
      getBusinesses(locale),
    ])

  const homeExpertise = expertise.filter((area) => area.featuredOnHome).slice(0, 8)
  const featuredAssignments = experiences
    .filter((entry) => entry.type === 'assignment' && entry.featured)
    .slice(0, 3)
  const featuredProjects = experiences
    .filter((entry) => entry.type === 'project' && entry.featured)
    .slice(0, 3)
  const latestInsights = insights.slice(0, 3)
  const featuredBooks = books.filter((book) => book.featured).slice(0, 3)

  return (
    <>
      <JsonLd data={[personSchema(settings, locale), websiteSchema(settings, locale)]} />

      <Hero content={content} settings={settings} />

      {homeExpertise.length > 0 ? (
        <Section id="expertise" labelledBy="home-expertise-title">
          <SectionHeading
            id="home-expertise-title"
            eyebrow={t('expertise.eyebrow')}
            title={t('expertise.title')}
            intro={content.expertiseIntro || t('expertise.intro')}
            actions={
              <Link href="/expertise" className={buttonClasses('secondary')}>
                {common('viewAll')}
                <Icon name="arrow" className="size-4" />
              </Link>
            }
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {homeExpertise.map((area) => (
              <li key={area.id} className="flex">
                <ExpertiseCard area={area} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {featuredAssignments.length > 0 ? (
        <Section tone="subtle" labelledBy="home-experience-title">
          <SectionHeading
            id="home-experience-title"
            eyebrow={t('experience.eyebrow')}
            title={t('experience.title')}
            intro={content.experienceIntro || t('experience.intro')}
            actions={
              <Link href="/experience" className={buttonClasses('secondary')}>
                {t('experience.cta')}
                <Icon name="arrow" className="size-4" />
              </Link>
            }
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {featuredAssignments.map((experience) => (
              <li key={experience.id} className="flex">
                <ExperienceCard experience={experience} locale={locale} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {featuredProjects.length > 0 ? (
        <Section labelledBy="home-projects-title">
          <SectionHeading
            id="home-projects-title"
            eyebrow={t('projects.eyebrow')}
            title={t('projects.title')}
            actions={
              <Link href="/experience" className={buttonClasses('secondary')}>
                {t('projects.cta')}
                <Icon name="arrow" className="size-4" />
              </Link>
            }
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <li key={project.id} className="flex">
                <ExperienceCard experience={project} locale={locale} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {latestInsights.length > 0 ? (
        <Section tone="subtle" labelledBy="home-insights-title">
          <SectionHeading
            id="home-insights-title"
            eyebrow={t('insights.eyebrow')}
            title={t('insights.title')}
            intro={t('insights.intro')}
            actions={
              <Link href="/insights" className={buttonClasses('secondary')}>
                {t('insights.cta')}
                <Icon name="arrow" className="size-4" />
              </Link>
            }
          />
          <ul className="grid gap-5 md:grid-cols-3">
            {latestInsights.map((article) => (
              <li key={article.id} className="flex">
                <InsightCard article={article} locale={locale} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {featuredBooks.length > 0 ? (
        <Section labelledBy="home-books-title">
          <SectionHeading
            id="home-books-title"
            eyebrow={t('books.eyebrow')}
            title={t('books.title')}
            actions={
              <Link href="/books" className={buttonClasses('secondary')}>
                {t('books.cta')}
                <Icon name="arrow" className="size-4" />
              </Link>
            }
          />
          <ul
            className={
              featuredBooks.length === 1 ? 'grid max-w-3xl gap-5' : 'grid gap-5 lg:grid-cols-2'
            }
          >
            {featuredBooks.map((book) => (
              <li key={book.id} className="flex">
                <BookCard book={book} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {businesses.length > 0 ? (
        <Section tone="subtle" labelledBy="home-ecosystem-title">
          <SectionHeading
            id="home-ecosystem-title"
            eyebrow={t('ecosystem.eyebrow')}
            title={t('ecosystem.title')}
            intro={content.ecosystemIntro || t('ecosystem.intro')}
            actions={
              <Link href="/businesses" className={buttonClasses('secondary')}>
                {t('ecosystem.cta')}
                <Icon name="arrow" className="size-4" />
              </Link>
            }
          />
          <ul className="grid gap-5 md:grid-cols-2 md:[&>li:last-child:nth-child(odd)]:col-span-2">
            {businesses.map((business) => (
              <li key={business.id} className="flex">
                <BusinessCard business={business} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section tone="contrast" size="lg" labelledBy="home-cta-title">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="home-cta-title"
            className="font-serif text-3xl leading-tight text-on-contrast md:text-4xl"
          >
            {content.finalCtaTitle || t('finalCta.title')}
          </h2>
          <p className="mt-5 text-base text-on-contrast-secondary md:text-lg">
            {content.finalCtaBody || t('finalCta.body')}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink
              href="/contact"
              event="work_with_me_click"
              location="home_final_cta"
              variant="accent"
              size="lg"
            >
              {nav('workWithMe')}
              <Icon name="arrow" className="size-4" />
            </CtaLink>
            <Link href="/about" className={buttonClasses('onContrast', 'lg')}>
              {nav('about')}
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}
