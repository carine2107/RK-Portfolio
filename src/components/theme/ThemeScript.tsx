import { THEME_STORAGE_KEY } from './theme-constants'

/**
 * Applied before the first paint to avoid a flash of the wrong theme.
 * Resolves the stored preference (`light` | `dark` | `system`) into the
 * `data-theme` attribute that the stylesheet reads.
 */
const script = `(function(){try{var k='${THEME_STORAGE_KEY}';var p=localStorage.getItem(k)||'system';var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=p==='system'?(m?'dark':'light'):p;var r=document.documentElement;r.dataset.theme=t;r.dataset.themePreference=p;r.style.colorScheme=t;}catch(e){}})()`

export function ThemeScript() {
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: script }} />
}
