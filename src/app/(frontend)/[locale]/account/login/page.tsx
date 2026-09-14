import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LoginForm } from '@/components/members/MemberForms'
import { PageHeader } from '@/components/ui/PageHeader'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account.login' })
  return pageMetadata({
    locale,
    path: '/account/login',
    title: t('title'),
    description: t('lead'),
    noindex: true,
  })
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('account.login')
  return (
    <>
      <PageHeader title={t('title')} lead={t('lead')} />
      <Section>
        <LoginForm />
      </Section>
    </>
  )
}
