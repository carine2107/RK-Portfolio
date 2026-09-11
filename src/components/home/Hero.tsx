import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { CtaLink } from '@/components/ui/CtaLink'
import { buttonClasses } from '@/components/ui/Button'
import { ExpertProfileButton } from '@/components/ui/ExpertProfileButton'
import { Icon } from '@/components/ui/Icon'
import { Portrait } from '@/components/ui/Portrait'
import { Link } from '@/i18n/navigation'
import type { AppearanceView, HomeContentView, SiteSettingsView } from '@/lib/types'

export async function Hero({
  content,
  settings,
  background,
}: {
  content: HomeContentView
  settings: SiteSettingsView
  /** Background chosen in the CMS (Appearance → Home page). */
  background: AppearanceView['hero']
}) {
  const t = await getTranslations('home.hero')
  const common = await getTranslations('common')
  const nav = await getTranslations('nav')
  const brand = await getTranslations('brand')

  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      {background.style === 'image' && background.image ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {/* Decorative: the veil in the page colour keeps every text readable
              (at most 15 % of the photo shows through). */}
          <Image
            src={background.image.url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className={`absolute inset-0 bg-surface ${background.intensity === 'visible' ? 'opacity-85' : 'opacity-92'}`}
          />
        </div>
      ) : null}
      {background.style === 'halo' ? (
        /* Decorative gradient wash — never carries information. */
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_-10%,var(--surface-accent-soft),transparent_55%)]"
        />
      ) : null}
      <div className="rk-container relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="text-xs font-semibold tracking-[0.22em] text-accent-text uppercase">
            {content.heroEyebrow || t('eyebrow')}
          </p>

          <h1 className="mt-5 font-serif text-[clamp(2.25rem,6vw,3.75rem)] leading-[1.08] tracking-tight text-primary">
            {brand('name')}
          </h1>

          <p className="mt-4 text-lg text-secondary md:text-xl">{settings.headline}</p>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-primary md:text-lg">
            {content.heroValueProposition}
          </p>

          <p
            lang="en"
            className="mt-8 border-l-2 border-accent pl-4 font-serif text-lg leading-snug text-primary md:text-xl"
          >
            {settings.signature}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
            <Link href="/expertise" className={buttonClasses('primary', 'lg')}>
              {common('exploreExpertise')}
              <Icon name="arrow" className="size-4" />
            </Link>
            <ExpertProfileButton url={settings.expertProfileUrl} size="lg" location="hero" />
            <CtaLink
              href="/contact"
              event="work_with_me_click"
              location="hero"
              variant="ghost"
              size="lg"
              className="sm:ml-1"
            >
              {nav('workWithMe')}
              <Icon name="arrow" className="size-4" />
            </CtaLink>
          </div>

          {content.heroKeyPoints.length > 0 ? (
            <dl className="mt-12 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
              {content.heroKeyPoints.map((point) => (
                <div key={point.label}>
                  <dt className="text-xs tracking-[0.14em] text-secondary uppercase">
                    {point.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-primary">{point.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="lg:col-span-5">
          <Portrait
            image={content.heroPortrait}
            alt={t('portraitAlt')}
            placeholderLabel={t('portraitPlaceholder')}
            priority
            className="mx-auto max-w-sm lg:max-w-none"
            sizes="(min-width: 1024px) 26rem, (min-width: 640px) 24rem, 90vw"
          />
        </div>
      </div>
    </section>
  )
}
