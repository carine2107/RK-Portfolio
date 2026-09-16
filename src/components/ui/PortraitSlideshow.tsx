'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

import { Icon } from '@/components/ui/Icon'
import { Portrait } from '@/components/ui/Portrait'
import type { ImageView } from '@/lib/types'

/** Delay between two photos when the slideshow plays on its own. */
export const SLIDE_INTERVAL_MS = 6000

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(listener: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
const readReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches

function focusVisible(element: EventTarget): boolean {
  try {
    return element instanceof Element && element.matches(':focus-visible')
  } catch {
    return true
  }
}

/**
 * Hero photograph of the home page. With several photographs they cross-fade one
 * after the other; the slideshow pauses on hover, while it holds the keyboard
 * focus, when the visitor asks for reduced motion, and with its pause button.
 * With a single photograph (or none) it is the plain Portrait.
 */
export function PortraitSlideshow({
  images,
  alt,
  placeholderLabel,
  className = '',
  sizes,
  priority = false,
}: {
  images: NonNullable<ImageView>[]
  alt: string
  placeholderLabel: string
  className?: string
  sizes?: string
  /** Loads the first photograph eagerly (above the fold). */
  priority?: boolean
}) {
  const t = useTranslations('home.hero.slideshow')
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => true)
  const count = images.length

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count])

  const playing = count > 1 && !paused && !hovered && !focused && !reducedMotion
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      SLIDE_INTERVAL_MS,
    )
    return () => window.clearInterval(timer)
  }, [playing, count])

  if (count <= 1) {
    return (
      <Portrait
        image={images[0] ?? null}
        alt={alt}
        placeholderLabel={placeholderLabel}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    )
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('label')}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(event) => {
        // Keyboard focus only: a mouse click on a control must not stop the slideshow.
        if (focusVisible(event.target)) setFocused(true)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <div className="relative aspect-4/5 overflow-hidden rounded-card border border-line bg-surface-subtle">
        {images.map((image, position) => (
          <div
            key={image.url}
            role="group"
            aria-roledescription="slide"
            aria-label={t('position', { index: position + 1, count })}
            aria-hidden={position !== index}
            className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
              position === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image.url}
              alt={image.alt || alt}
              fill
              priority={priority && position === 0}
              sizes={sizes}
              className="object-cover"
            />
          </div>
        ))}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-accent/60"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={t('previous')}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line text-primary hover:border-line-accent hover:text-accent-text"
          >
            <Icon name="arrow" className="size-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={t('next')}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line text-primary hover:border-line-accent hover:text-accent-text"
          >
            <Icon name="arrow" className="size-4" />
          </button>
          {reducedMotion ? null : (
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? t('play') : t('pause')}
              aria-pressed={paused}
              className="inline-flex size-11 items-center justify-center rounded-full text-secondary hover:text-primary"
            >
              <Icon name={paused ? 'play' : 'pause'} className="size-4" />
            </button>
          )}
        </div>

        <ul className="flex flex-wrap items-center justify-end gap-1">
          {images.map((image, position) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => go(position)}
                aria-label={t('goTo', { index: position + 1, count })}
                aria-current={position === index}
                className="group inline-flex size-6 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={`block size-2 rounded-full transition-colors ${
                    position === index ? 'bg-accent' : 'bg-line-strong group-hover:bg-secondary'
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p aria-live="polite" className="sr-only">
        {playing ? '' : t('position', { index: index + 1, count })}
      </p>
    </section>
  )
}
