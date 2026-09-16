import { act, fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PortraitSlideshow, SLIDE_INTERVAL_MS } from '@/components/ui/PortraitSlideshow'
import messages from '@/messages/fr.json'

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

const photos = [
  { url: '/media/one.jpg', alt: 'Photo 1' },
  { url: '/media/two.jpg', alt: 'Photo 2' },
  { url: '/media/three.jpg', alt: 'Photo 3' },
]

function renderSlideshow(images = photos) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NextIntlClientProvider locale="fr" messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
  return render(
    <PortraitSlideshow images={images} alt="Portrait" placeholderLabel="Photo à fournir" />,
    { wrapper },
  )
}

function mockReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as typeof window.matchMedia
}

const current = () =>
  screen
    .getAllByRole('button', { name: /Afficher la photo/ })
    .findIndex((button) => button.getAttribute('aria-current') === 'true')

describe('hero photo slideshow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockReducedMotion(false)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a plain photo without controls when there is a single one', () => {
    renderSlideshow(photos.slice(0, 1))
    expect(screen.getByRole('img', { name: 'Photo 1' })).toBeTruthy()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('moves with the previous, next and dot buttons', () => {
    renderSlideshow()
    expect(current()).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Photo suivante' }))
    expect(current()).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Photo précédente' }))
    fireEvent.click(screen.getByRole('button', { name: 'Photo précédente' }))
    expect(current()).toBe(2)
    fireEvent.click(screen.getByRole('button', { name: 'Afficher la photo 2 sur 3' }))
    expect(current()).toBe(1)
  })

  it('plays on its own and stops with the pause button', () => {
    renderSlideshow()
    act(() => vi.advanceTimersByTime(SLIDE_INTERVAL_MS))
    expect(current()).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Mettre le diaporama en pause' }))
    act(() => vi.advanceTimersByTime(SLIDE_INTERVAL_MS * 3))
    expect(current()).toBe(1)
    expect(screen.getByRole('button', { name: 'Reprendre le diaporama' })).toBeTruthy()
  })

  it('never plays on its own when the visitor asks for reduced motion', () => {
    mockReducedMotion(true)
    renderSlideshow()
    act(() => vi.advanceTimersByTime(SLIDE_INTERVAL_MS * 3))
    expect(current()).toBe(0)
    expect(screen.queryByRole('button', { name: /pause/i })).toBeNull()
  })
})
