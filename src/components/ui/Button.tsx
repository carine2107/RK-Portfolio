import type { ComponentProps, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'onContrast'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-[background-color,color,border-color,opacity] duration-200 disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55'

const variants: Record<Variant, string> = {
  primary:
    'bg-surface-inverse text-inverse hover:bg-surface-inverse-subtle active:bg-surface-inverse',
  secondary:
    'border border-line-strong bg-surface text-primary hover:border-line-accent hover:text-accent-text',
  ghost: 'text-primary underline-offset-4 hover:text-accent-text hover:underline',
  accent: 'bg-accent text-on-accent hover:bg-accent-strong',
  // For use on the dark contrast band only.
  onContrast:
    'border border-line-contrast bg-transparent text-on-contrast hover:border-accent hover:text-accent',
}

const sizes: Record<Size, string> = {
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-12 px-7 py-3 text-base',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', extra = ''): string {
  return [base, variants[variant], variant === 'ghost' ? 'px-0 py-1 min-h-11' : sizes[size], extra]
    .filter(Boolean)
    .join(' ')
}

type ButtonLinkProps = {
  href: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  external?: boolean
} & Omit<ComponentProps<'a'>, 'href' | 'className' | 'children'>

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  external = false,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonClasses(variant, size, className)

  if (external) {
    return (
      <a href={href} className={classes} rel="noopener noreferrer" target="_blank" {...rest}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  )
}

type ButtonProps = {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
} & ComponentProps<'button'>

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  )
}
