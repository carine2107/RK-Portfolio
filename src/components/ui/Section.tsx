import type { ElementType, ReactNode } from 'react'

type SectionProps = {
  children: ReactNode
  id?: string
  tone?: 'base' | 'subtle' | 'contrast'
  size?: 'md' | 'lg'
  className?: string
  labelledBy?: string
}

const tones = {
  base: 'bg-surface text-primary',
  subtle: 'bg-surface-subtle text-primary',
  contrast: 'border-t border-line-contrast bg-contrast text-on-contrast',
}

export function Section({
  children,
  id,
  tone = 'base',
  size = 'md',
  className = '',
  labelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-inverse={tone === 'contrast' ? '' : undefined}
      className={[tones[tone], size === 'lg' ? 'py-20 md:py-28' : 'py-14 md:py-20', className].join(
        ' ',
      )}
    >
      <div className="rk-container">{children}</div>
    </section>
  )
}

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  intro?: string
  id?: string
  as?: ElementType
  align?: 'left' | 'center'
  tone?: 'default' | 'contrast'
  actions?: ReactNode
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  as: Heading = 'h2',
  align = 'left',
  tone = 'default',
  actions,
}: SectionHeadingProps) {
  const inverse = tone === 'contrast'
  return (
    <div
      className={[
        'mb-10 flex flex-col gap-4 md:mb-14',
        actions ? 'md:flex-row md:items-end md:justify-between' : '',
        align === 'center' ? 'items-center text-center' : '',
      ].join(' ')}
    >
      <div className={align === 'center' ? 'max-w-2xl' : 'max-w-2xl'}>
        {eyebrow ? (
          <p
            className={[
              'mb-3 text-xs font-semibold tracking-[0.18em] uppercase',
              inverse ? 'text-accent' : 'text-accent-text',
            ].join(' ')}
          >
            {eyebrow}
          </p>
        ) : null}
        <Heading
          id={id}
          className={['text-3xl md:text-4xl', inverse ? 'text-on-contrast' : 'text-primary'].join(
            ' ',
          )}
        >
          {title}
        </Heading>
        {intro ? (
          <p
            className={[
              'mt-4 text-base leading-relaxed md:text-lg',
              inverse ? 'text-on-contrast-secondary' : 'text-secondary',
            ].join(' ')}
          >
            {intro}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-3">{actions}</div> : null}
    </div>
  )
}
