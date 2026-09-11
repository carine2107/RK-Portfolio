'use client'

import { getTranslation } from '@payloadcms/translations'
import { FieldDescription, FieldError, FieldLabel, useField, useTranslation } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

import { normalizeHex } from '../../lib/theme'

const TEXT = {
  pick: { fr: 'Choisir la couleur', de: 'Farbe wählen', en: 'Pick the colour' },
  reset: { fr: 'Par défaut', de: 'Standard', en: 'Default' },
  resetLabel: {
    fr: 'Revenir à la couleur par défaut',
    de: 'Zur Standardfarbe zurückkehren',
    en: 'Back to the default colour',
  },
} as const

/**
 * Colour field of the Appearance global: native colour picker + hex input.
 * An empty value means "palette default", shown as the placeholder.
 */
export const ColorField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue, showError, errorMessage } = useField<string | null>({ path })
  const { i18n } = useTranslation()
  const lang = i18n.language === 'de' || i18n.language === 'en' ? i18n.language : 'fr'

  const fallback =
    typeof field.admin?.placeholder === 'string' ? field.admin.placeholder : '#000000'
  const current = normalizeHex(value) ?? fallback
  const id = `field-${path.replace(/\./g, '__')}`

  return (
    <div className={`field-type text rk-color-field${showError ? ' error' : ''}`}>
      <FieldLabel label={field.label} path={path} htmlFor={id} required={field.required} />
      <div className="rk-color-field__row">
        <input
          type="color"
          className="rk-color-field__swatch"
          aria-label={`${TEXT.pick[lang]} — ${field.label ? getTranslation(field.label, i18n) : ''}`}
          value={current}
          onChange={(event) => setValue(event.target.value)}
        />
        <input
          id={id}
          type="text"
          className="rk-color-field__hex"
          value={value ?? ''}
          placeholder={fallback}
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
          onChange={(event) => setValue(event.target.value || null)}
        />
        {value ? (
          <button
            type="button"
            className="rk-color-field__reset"
            aria-label={TEXT.resetLabel[lang]}
            onClick={() => setValue(null)}
          >
            {TEXT.reset[lang]}
          </button>
        ) : null}
      </div>
      <FieldError path={path} showError={showError} message={errorMessage} />
      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  )
}
