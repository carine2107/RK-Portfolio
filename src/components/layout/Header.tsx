'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { BrandMark } from '@/components/brand/BrandMark'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Link, usePathname } from '@/i18n/navigation'

import { CONTACT_HREF, NAV_ITEMS } from './nav-items'

export function Header() {
  const t = useTranslations('nav')
  const brand = useTranslations('brand')
  const pathname = usePathname()
  // The menu is bound to the path it was opened on: navigating anywhere closes
  // it without an effect that would trigger a cascading render.
  const [openedFor, setOpenedFor] = useState<string | null>(null)
  const open = openedFor === pathname
  const [scrolled, setScrolled] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpenedFor(null), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape closes the panel, focus stays inside it while it is open.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenedFor(null)
        toggleRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const firstLink = panelRef.current?.querySelector<HTMLElement>('a[href]')
    firstLink?.focus()

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b bg-surface/95 backdrop-blur-sm transition-[border-color,box-shadow] duration-200',
        scrolled ? 'border-line shadow-card' : 'border-transparent',
      ].join(' ')}
    >
      <div className="rk-container flex h-[var(--header-height)] items-center justify-between gap-3 2xl:max-w-[90rem] 2xl:gap-4">
        <Link href="/" className="group flex items-center gap-2.5 rounded sm:gap-3">
          <BrandMark className="size-10 shrink-0 text-primary sm:size-11" />
          {/* The geographic scope is carried by the hero and the footer: the
              header keeps only the name, so the row stays comfortable. */}
          <span className="font-serif text-[0.78rem] tracking-[0.04em] whitespace-nowrap text-primary uppercase max-[359px]:sr-only sm:text-sm lg:text-base">
            {brand('name')}
          </span>
          <span className="sr-only"> — {t('home')}</span>
        </Link>

        <nav aria-label={t('mainLabel')} className="hidden xl:block">
          <ul className="flex items-center">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={[
                    'relative rounded px-[0.45rem] py-2 text-[0.82rem] whitespace-nowrap transition-colors 2xl:px-3 2xl:text-sm',
                    isActive(item.href)
                      ? 'text-primary after:absolute after:inset-x-[0.45rem] after:-bottom-0.5 after:h-px after:bg-accent after:content-[""] 2xl:after:inset-x-3'
                      : 'text-secondary hover:text-primary',
                  ].join(' ')}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Wrappers carry the responsive visibility: putting `hidden` directly on
            a component whose own classes set a display value is a coin toss. */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* From 768 px; on phones the search link sits in the menu (header width). */}
          <div className="hidden md:flex">
            <Link
              href="/search"
              aria-current={isActive('/search') ? 'page' : undefined}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-primary transition-colors hover:border-line-accent hover:text-accent-text"
            >
              <Icon name="search" className="size-4" />
              <span className="sr-only">{t('search')}</span>
            </Link>
          </div>
          <div className="hidden md:flex">
            <LanguageSwitcher variant="dropdown" />
          </div>
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
          {/* Full label only from 1536 px, where the header row widens (2xl:max-w):
              with seven sections the 1216 px content width is too tight for it. */}
          <div className="hidden 2xl:block">
            <Link
              href={CONTACT_HREF}
              onClick={() => trackEvent('work_with_me_click', { location: 'header' })}
              className={buttonClasses(
                'primary',
                'md',
                'px-4 text-[0.86rem] whitespace-nowrap 2xl:px-5 2xl:text-sm',
              )}
            >
              {t('workWithMe')}
            </Link>
          </div>
          <Link
            href={CONTACT_HREF}
            onClick={() => trackEvent('work_with_me_click', { location: 'header_compact' })}
            className={buttonClasses('primary', 'md', 'px-3.5 2xl:hidden')}
          >
            {t('contact')}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpenedFor((value) => (value === pathname ? null : pathname))}
            aria-expanded={open}
            aria-controls="rk-mobile-menu"
            className="inline-flex size-11 items-center justify-center rounded-full border border-line text-primary xl:hidden"
          >
            <span className="sr-only">{open ? t('closeMenu') : t('openMenu')}</span>
            <Icon name={open ? 'close' : 'menu'} className="size-5" />
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="rk-mobile-menu"
          ref={panelRef}
          className="rk-fade-up border-t border-line bg-surface xl:hidden"
        >
          <div className="rk-container flex max-h-[calc(100dvh-var(--header-height))] flex-col gap-6 overflow-y-auto py-6">
            <nav aria-label={t('mainLabel')}>
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <li key={item.key} className="border-b border-line last:border-0">
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={[
                        'flex min-h-12 items-center justify-between py-3 text-base',
                        isActive(item.href) ? 'text-accent-text' : 'text-primary',
                      ].join(' ')}
                    >
                      {t(item.key)}
                      <Icon name="arrow" className="size-4 text-secondary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link
              href="/search"
              onClick={close}
              aria-current={isActive('/search') ? 'page' : undefined}
              className={buttonClasses('secondary', 'lg', 'w-full')}
            >
              <Icon name="search" className="size-4" />
              {t('search')}
            </Link>

            <Link
              href={CONTACT_HREF}
              onClick={() => {
                trackEvent('work_with_me_click', { location: 'mobile_menu' })
                close()
              }}
              className={buttonClasses('primary', 'lg', 'w-full')}
            >
              {t('workWithMe')}
            </Link>

            <div className="flex items-center justify-between gap-4 border-t border-line pt-5">
              <LanguageSwitcher variant="dropdown" placement="above" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
