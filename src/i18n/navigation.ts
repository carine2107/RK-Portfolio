import { createNavigation } from 'next-intl/navigation'

import { routing } from './routing'

/**
 * Locale-aware wrappers. Always import `Link`, `redirect`, `usePathname` and
 * `useRouter` from here (never from `next/link` / `next/navigation`) so that the
 * active locale is preserved while navigating.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
