'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { trackEvent } from '@/components/analytics/track'
import { Icon } from '@/components/ui/Icon'
import type { ImageView } from '@/lib/types'
import type { VideoEmbed as VideoEmbedData } from '@/lib/video'

const PROVIDER_NAMES = { youtube: 'YouTube', vimeo: 'Vimeo' } as const

/**
 * Click-to-play video. Until the visitor presses "Play", nothing is requested
 * from YouTube or Vimeo (no cookie, no IP address sent); the notice under the
 * player says so before the choice is made.
 */
export function VideoEmbed({
  video,
  title,
  poster,
}: {
  video: VideoEmbedData
  title: string
  poster: ImageView
}) {
  const t = useTranslations('speaking.video')
  const [playing, setPlaying] = useState(false)
  const provider = PROVIDER_NAMES[video.provider]

  return (
    <figure className="m-0">
      <div className="relative aspect-video overflow-hidden rounded-card bg-contrast">
        {playing ? (
          <iframe
            src={video.embedUrl}
            title={title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <>
            {poster ? (
              <Image
                src={poster.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 48rem, 100vw"
                className="object-cover"
              />
            ) : null}
            <button
              type="button"
              onClick={() => {
                setPlaying(true)
                trackEvent('video_play', { provider: video.provider })
              }}
              className="group absolute inset-0 flex items-center justify-center bg-[rgb(0_0_0/0.35)] transition-colors hover:bg-[rgb(0_0_0/0.25)]"
            >
              <span className="flex size-18 items-center justify-center rounded-full bg-accent text-on-accent shadow-float transition-transform group-hover:scale-105">
                <Icon name="play" className="ml-1 size-7" />
              </span>
              <span className="sr-only">{t('play', { title })}</span>
            </button>
          </>
        )}
      </div>
      {!playing ? (
        <figcaption className="mt-3 text-sm text-secondary">{t('notice', { provider })}</figcaption>
      ) : null}
    </figure>
  )
}
