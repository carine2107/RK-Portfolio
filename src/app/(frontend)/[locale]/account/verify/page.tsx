import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { VerifyLogin } from '@/components/members/MemberForms'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account.verify' })
  return pageMetadata({
    locale,
    path: '/account/verify',
    title: t('title'),
    description: t('title'),
    noindex: true,
  })
}

export default async function VerifyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('account.verify')
  return (
    <>
      <PageHeader title={t('title')} />
      <Section>
        <VerifyLogin />
      </Section>
    </>
  )
}
