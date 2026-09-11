'use client'

import {
  isThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from './theme-constants'

/**
 * The theme lives in the DOM (`data-theme-preference` on <html>), set by the
 * blocking script before the first paint. Components read it through
 * `useSyncExternalStore`, which is the React-supported way of subscribing to an
 * external system — no state synchronisation effect, no flash, no cascade.
 */
const listeners = new Set<() => void>()

function notify(): void {
  for (const listener of listeners) listener()
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) applyStoredPreference()
  }
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystemChange = () => {
    if (getThemePreference() === 'system') applyPreference('system')
  }

  window.addEventListener('storage', onStorage)
  media.addEventListener('change', onSystemChange)

  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
    media.removeEventListener('change', onSystemChange)
  }
}

export function getThemePreference(): ThemePreference {
  if (typeof document === 'undefined') return 'system'
  const value = document.documentElement.dataset.themePreference
  return isThemePreference(value) ? value : 'system'
}

/** Server snapshot: the theme is unknown until the browser reports it. */
export function getServerThemePreference(): ThemePreference {
  return 'system'
}

export function applyPreference(preference: ThemePreference): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved = resolveTheme(preference, prefersDark)
  const root = document.documentElement

  root.dataset.theme = resolved
  root.dataset.themePreference = preference
  root.style.colorScheme = resolved

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    /* private mode: the choice still applies to the current session */
  }

  notify()
}

function applyStoredPreference(): void {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (isThemePreference(stored)) applyPreference(stored)
  } catch {
    /* ignore */
  }
}
