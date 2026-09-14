import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Notice } from '@/components/ui/Notices'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'
import { allLessons, protectedProductBySlug, type ProtectedFile } from '@/lib/member-content'
import { currentMember, findEntitlement } from '@/lib/members'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

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

const size = (bytes: number) =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} Mo`
    : `${Math.max(1, Math.round(bytes / 1024))} Ko`

/** A purchased product: downloads, or the course programme with progress. */
export default async function OwnedProductPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const cms = await getCms()
  const member = cms ? await currentMember(cms) : null
  if (!cms || !member) redirect(`/${locale}/account/login`)

  const product = await protectedProductBySlug(cms, slug, locale)
  if (!product) notFound()
  const entitlement = await findEntitlement(cms, member.id, product.id)
  if (!entitlement) notFound()

  const t = await getTranslations('account.product')
  const types = await getTranslations('products.types')
  const entitlementDoc = (await cms.findByID({
    collection: 'entitlements',
    id: entitlement.id,
    depth: 0,
    overrideAccess: true,
  })) as unknown as { completedLessons?: unknown }
  const completed = new Set(
    Array.isArray(entitlementDoc.completedLessons)
      ? (entitlementDoc.completedLessons as string[])
      : [],
  )
  const lessons = allLessons(product)
  const done = lessons.filter((lesson) => completed.has(lesson.id)).length
  const firstOpen = lessons.find((lesson) => !completed.has(lesson.id)) ?? lessons[0]

  const download = (file: ProtectedFile | null, key: string, label: string) =>
    file ? (
      <a
        href={`/api/members/download?product=${product.id}&file=${key}`}
        className={buttonClasses('primary')}
      >
        <Icon name="download" className="size-4" />
        {label}
        <span className="text-xs opacity-80">({size(file.filesize)})</span>
      </a>
    ) : null

  return (
    <>
      <PageHeader
        eyebrow={types(product.type)}
        title={product.title}
        lead={product.summary}
        crumbs={[{ label: t('back'), href: '/account' }, { label: product.title }]}
      />
      <Section>
        {product.type !== 'course' ? (
          <div className="space-y-6">
            <h2 className="rk-rule text-2xl">{t('downloads')}</h2>
            <div className="flex flex-wrap gap-3">
              {download(product.pdf, 'pdf', t('pdf'))}
              {download(product.epub, 'epub', t('epub'))}
              {download(product.resource, 'resource', t('resource'))}
            </div>
            {!product.pdf && !product.epub && !product.resource ? (
              <Notice tone="warning">{t('fileMissing')}</Notice>
            ) : null}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-secondary">{t('progress', { done, total: lessons.length })}</p>
              {firstOpen ? (
                <Link
                  href={`/account/courses/${product.slug}/${firstOpen.id}`}
                  className={buttonClasses('primary')}
                >
                  {done === 0 ? t('start') : t('continue')}
                  <Icon name="arrow" className="size-4" />
                </Link>
              ) : null}
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={lessons.length}
              aria-valuenow={done}
              aria-label={t('progress', { done, total: lessons.length })}
              className="h-2 overflow-hidden rounded-full bg-surface-sunken"
            >
              <div
                className="h-full bg-accent"
                style={{ width: `${lessons.length ? (done / lessons.length) * 100 : 0}%` }}
              />
            </div>
            <h2 className="rk-rule text-2xl">{t('modules')}</h2>
            <ol className="space-y-6">
              {product.modules.map((module, index) => (
                <li
                  key={`${module.title}-${index}`}
                  className="rounded-card border border-line p-5"
                >
                  <h3 className="font-medium text-primary">
                    {index + 1}. {module.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {module.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/account/courses/${product.slug}/${lesson.id}`}
                          className="flex items-center justify-between gap-4 rounded px-2 py-2 text-sm text-primary hover:bg-surface-subtle"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={
                                completed.has(lesson.id) ? 'text-success-text' : 'text-secondary'
                              }
                            >
                              {completed.has(lesson.id) ? '✓' : '○'}
                            </span>
                            {lesson.title}
                            {completed.has(lesson.id) ? (
                              <span className="sr-only">({t('completed')})</span>
                            ) : null}
                          </span>
                          {lesson.durationMinutes ? (
                            <span className="text-secondary">{lesson.durationMinutes} min</span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Section>
    </>
  )
}
