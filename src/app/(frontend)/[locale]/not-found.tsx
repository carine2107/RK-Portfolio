import { getTranslations } from 'next-intl/server'

import { CONTACT_HREF, NAV_ITEMS } from '@/components/layout/nav-items'
import { buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'

/** Localised 404. Rendered inside the locale layout, so header/footer stay. */
export default async function NotFound() {
  const t = await getTranslations('notFound')
  const nav = await getTranslations('nav')

  return (
    <Section size="lg">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-serif text-6xl text-accent-text">{t('code')}</p>
        <h1 className="mt-6 font-serif text-3xl text-primary md:text-4xl">{t('title')}</h1>
        <p className="mt-4 text-secondary">{t('body')}</p>

        <div className="mt-10 flex justify-center">
          <Link href="/" className={buttonClasses('primary', 'lg')}>
            {t('cta')}
            <Icon name="arrow" className="size-4" />
          </Link>
        </div>

        <nav aria-label={nav('mainLabel')} className="mt-12 border-t border-line pt-8">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-secondary underline-offset-4 hover:text-accent-text hover:underline"
                >
                  {nav(item.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={CONTACT_HREF}
                className="text-secondary underline-offset-4 hover:text-accent-text hover:underline"
              >
                {nav('contact')}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </Section>
  )
}
