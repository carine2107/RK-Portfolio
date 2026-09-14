import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LogoutButton } from '@/components/members/MemberForms'
import { buttonClasses } from '@/components/ui/Button'
import { EmptyState, PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { getCms } from '@/lib/cms'
import { protectedProductById } from '@/lib/member-content'
import { currentMember, listMemberProductIds } from '@/lib/members'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: Locale }> }

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

/** Member area: the digital products the signed-in member owns. */
export default async function AccountPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const cms = await getCms()
  const member = cms ? await currentMember(cms) : null
  if (!cms || !member) redirect(`/${locale}/account/login`)

  const t = await getTranslations('account')
  const types = await getTranslations('products.types')
  const ids = await listMemberProductIds(cms, member.id)
  const products = (
    await Promise.all(ids.map((id) => protectedProductById(cms, id, locale)))
  ).filter((product) => product !== null)

  return (
    <>
      <PageHeader title={t('title')} lead={t('lead')}>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm text-secondary">{t('signedInAs', { email: member.email })}</p>
          <LogoutButton />
        </div>
      </PageHeader>
      <Section>
        {products.length === 0 ? (
          <EmptyState message={t('empty')} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {products.map((product) => (
              <li key={product.id} className="flex">
                <article className="flex w-full flex-col rounded-card border border-line bg-surface-raised p-6">
                  <p className="text-xs font-semibold tracking-[0.18em] text-accent-text uppercase">
                    {types(product.type)}
                  </p>
                  <h2 className="mt-3 text-xl text-primary">{product.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-secondary">{product.summary}</p>
                  <Link
                    href={`/account/products/${product.slug}`}
                    className={buttonClasses('primary', 'md', 'mt-5 w-fit')}
                  >
                    {t('open')}
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}
