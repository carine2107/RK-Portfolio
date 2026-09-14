import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LessonComplete } from '@/components/members/MemberForms'
import { VideoEmbed } from '@/components/speaking/VideoEmbed'
import { buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'
import { allLessons, protectedProductBySlug } from '@/lib/member-content'
import { currentMember, findEntitlement } from '@/lib/members'
import { pageMetadata } from '@/lib/seo'
import { parseVideoUrl } from '@/lib/video'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; slug: string; lesson: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account' })
  return pageMetadata({
    locale,
    path: '/account',
    title: t('title'),
    description: t('lead'),
    noindex: true,
  })
}

/** A lesson of a purchased course. */
export default async function LessonPage({ params }: Props) {
  const { locale, slug, lesson: lessonId } = await params
  setRequestLocale(locale)

  const cms = await getCms()
  const member = cms ? await currentMember(cms) : null
  if (!cms || !member) redirect(`/${locale}/account/login`)

  const product = await protectedProductBySlug(cms, slug, locale)
  if (!product || product.type !== 'course') notFound()
  const entitlement = await findEntitlement(cms, member.id, product.id)
  if (!entitlement) notFound()

  const lessons = allLessons(product)
  const index = lessons.findIndex((entry) => entry.id === lessonId)
  const lesson = lessons[index]
  if (!lesson) notFound()

  const t = await getTranslations('account.lesson')
  const entitlementDoc = (await cms.findByID({
    collection: 'entitlements',
    id: entitlement.id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as { completedLessons?: unknown }
  const done =
    Array.isArray(entitlementDoc.completedLessons) &&
    entitlementDoc.completedLessons.includes(lesson.id)
  const video = parseVideoUrl(lesson.videoUrl)
  const previous = lessons[index - 1]
  const next = lessons[index + 1]

  return (
    <>
      <PageHeader
        eyebrow={product.title}
        title={lesson.title}
        crumbs={[
          { label: t('backToCourse'), href: `/account/products/${product.slug}` },
          { label: lesson.title },
        ]}
      />
      <Section>
        <div className="mx-auto max-w-3xl space-y-10">
          {video ? <VideoEmbed video={video} title={lesson.title} poster={null} /> : null}
          {lesson.content ? <RichText content={{ kind: 'lexical', data: lesson.content }} /> : null}
          {lesson.attachment ? (
            <a
              href={`/api/members/download?product=${product.id}&file=lesson&lesson=${lesson.id}`}
              className={buttonClasses('secondary')}
            >
              <Icon name="download" className="size-4" />
              {t('attachment')}
            </a>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
            <LessonComplete productId={product.id} lessonId={lesson.id} initiallyDone={done} />
            <nav aria-label={t('navigation')} className="flex flex-wrap gap-3">
              {previous ? (
                <Link
                  href={`/account/courses/${product.slug}/${previous.id}`}
                  className={buttonClasses('secondary')}
                >
                  <Icon name="arrow" className="size-4 rotate-180" />
                  {t('previous')}
                </Link>
              ) : null}
              {next ? (
                <Link
                  href={`/account/courses/${product.slug}/${next.id}`}
                  className={buttonClasses('primary')}
                >
                  {t('next')}
                  <Icon name="arrow" className="size-4" />
                </Link>
              ) : null}
            </nav>
          </div>
        </div>
      </Section>
    </>
  )
}
