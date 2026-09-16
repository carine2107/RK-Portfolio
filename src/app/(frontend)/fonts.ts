import { Inter, Playfair_Display, Source_Serif_4 } from 'next/font/google'

/**
 * Fonts of the public site, shared by the locale layout and the global 404 page
 * (which does not go through that layout).
 */
export const display = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600'],
})

export const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

/** Font of the logo letters (and alternative heading font of the Appearance global). */
export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600'],
  preload: true,
})

export const fontVariables = `${display.variable} ${body.variable} ${playfair.variable}`
