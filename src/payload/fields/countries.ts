import { COUNTRY_CODES } from '../../lib/countries'
import { tr } from '../i18n'

const names = (language: string) => new Intl.DisplayNames([language], { type: 'region' })
const [NAMES_FR, NAMES_DE, NAMES_EN] = [names('fr'), names('de'), names('en')]

/**
 * ISO 3166-1 alpha-2 country options, labelled in the admin language. The
 * public site renders the name in the visitor's language from the code.
 */
export const COUNTRY_OPTIONS = COUNTRY_CODES.map((code) => ({
  value: code,
  label: tr(NAMES_FR.of(code) ?? code, NAMES_DE.of(code) ?? code, NAMES_EN.of(code) ?? code),
}))
