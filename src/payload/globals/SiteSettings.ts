import type { GlobalConfig } from 'payload'

import { anyone, isAdmin, isAdminOrEditor } from '../access'
import { GROUPS, tr } from '../i18n'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: tr('Réglages du site', 'Website-Einstellungen', 'Site settings'),
  admin: {
    group: GROUPS.administration,
    description: tr(
      'Marque, coordonnées, réseaux sociaux et métadonnées SEO par défaut.',
      'Marke, Kontaktdaten, soziale Profile und Standard-SEO-Metadaten.',
      'Brand, contact details, social profiles and default SEO metadata.',
    ),
  },
  access: { read: anyone, update: isAdminOrEditor, readVersions: isAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: tr('Marque', 'Marke', 'Brand'),
          fields: [
            {
              name: 'name',
              type: 'text',
              label: tr('Nom', 'Name', 'Name'),
              required: true,
              defaultValue: 'Romial Kenmogne',
            },
            {
              name: 'headline',
              type: 'text',
              label: tr('Positionnement', 'Positionierung', 'Headline'),
              required: true,
              localized: true,
              admin: {
                description: tr(
                  'Phrase affichée sous le nom.',
                  'Zeile unter dem Namen.',
                  'Positioning shown under the name.',
                ),
              },
            },
            {
              name: 'signature',
              type: 'text',
              label: tr('Signature de marque', 'Markensignatur', 'Brand signature'),
              required: true,
              defaultValue: 'Understand Money. Build Businesses. Invest. Create Wealth.',
              admin: {
                description: tr(
                  'Reste en anglais dans les trois langues.',
                  'Bleibt in allen drei Sprachen englisch.',
                  'Kept in English in every language.',
                ),
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: tr('Logo', 'Logo', 'Logo'),
            },
            {
              name: 'expertProfile',
              type: 'relationship',
              relationTo: 'documents',
              label: tr(
                'International Expert Profile',
                'International Expert Profile',
                'International Expert Profile',
              ),
              admin: {
                description: tr(
                  'PDF proposé par les boutons « Télécharger l’Expert Profile ». Tant qu’il est vide, les boutons expliquent que le document n’est pas encore publié.',
                  'PDF für die Schaltflächen „Expert Profile herunterladen“. Solange leer, erklären die Schaltflächen, dass das Dokument noch nicht veröffentlicht ist.',
                  'PDF offered by the "Download Expert Profile" buttons. While empty, the buttons explain that the document is not published yet.',
                ),
              },
            },
            {
              name: 'cvDocument',
              type: 'relationship',
              relationTo: 'documents',
              label: tr('CV international', 'Internationaler Lebenslauf', 'International CV'),
              admin: { description: tr('Facultatif.', 'Optional.', 'Optional.') },
            },
            {
              name: 'creditName',
              type: 'text',
              label: tr('Crédit du pied de page', 'Fußzeilen-Credit', 'Footer credit'),
              defaultValue: 'Nana-Consulting',
              admin: {
                description: tr(
                  'Mention « © by [nom]. Tous droits réservés. » affichée tout en bas de chaque page. Vide : « © année Romial Kenmogne » à la place.',
                  'Hinweis „© by [Name]. Alle Rechte vorbehalten.“ ganz unten auf jeder Seite. Leer: stattdessen „© Jahr Romial Kenmogne“.',
                  'Notice shown at the very bottom of every page ("© by [name]. All rights reserved."). Empty: "© year Romial Kenmogne" instead.',
                ),
              },
            },
            {
              name: 'creditUrl',
              type: 'text',
              label: tr('Lien du crédit', 'Link des Credits', 'Credit link'),
              admin: {
                description: tr(
                  'Adresse complète, facultative : transforme le crédit en lien.',
                  'Vollständige Adresse, optional: macht den Credit zu einem Link.',
                  'Optional full URL: turns the credit into a link.',
                ),
              },
            },
          ],
        },
        {
          label: tr('Contact', 'Kontakt', 'Contact'),
          fields: [
            {
              name: 'email',
              type: 'email',
              label: tr('E-mail publié', 'Veröffentlichte E-Mail', 'Published e-mail'),
              admin: {
                description: tr(
                  'Adresse affichée sur le site. Laissez vide tant qu’elle n’est pas confirmée.',
                  'Auf der Website angezeigte Adresse. Leer lassen, solange sie nicht bestätigt ist.',
                  'Published professional e-mail. Leave empty until confirmed.',
                ),
              },
            },
            { name: 'phone', type: 'text', label: tr('Téléphone', 'Telefon', 'Phone') },
            {
              name: 'address',
              type: 'textarea',
              label: tr('Adresse professionnelle', 'Geschäftsadresse', 'Professional address'),
              localized: true,
              admin: {
                description: tr(
                  'Affichée dans le pied de page.',
                  'Wird in der Fußzeile angezeigt.',
                  'Shown in the footer.',
                ),
              },
            },
            {
              name: 'notificationEmail',
              type: 'email',
              label: tr(
                'Réception des demandes de contact',
                'Empfang der Kontaktanfragen',
                'Contact requests recipient',
              ),
              admin: {
                description: tr(
                  'Adresse qui reçoit les demandes du formulaire. À défaut, la variable d’environnement EMAIL_TO est utilisée.',
                  'Adresse für Formularanfragen. Andernfalls wird die Umgebungsvariable EMAIL_TO verwendet.',
                  'Where contact requests are delivered. Falls back to the EMAIL_TO environment variable.',
                ),
              },
            },
            {
              name: 'spokenLanguages',
              type: 'text',
              label: tr('Langues parlées', 'Gesprochene Sprachen', 'Spoken languages'),
              localized: true,
              admin: {
                description: tr(
                  'Par exemple « Français, anglais, allemand ».',
                  'Zum Beispiel „Französisch, Englisch, Deutsch“.',
                  'e.g. "French, English, German".',
                ),
              },
            },
            {
              name: 'bookingUrl',
              type: 'text',
              label: tr(
                'Lien de prise de rendez-vous',
                'Link zur Terminbuchung',
                'Appointment booking link',
              ),
              validate: (value: unknown) => {
                if (!value) return true
                try {
                  const url = new URL(String(value))
                  if (url.protocol === 'https:') return true
                } catch {
                  /* invalid */
                }
                return 'https://…'
              },
              admin: {
                description: tr(
                  'Page de réservation d’un outil externe (Cal.com, Calendly…), adresse complète en https://. Un bouton « Réserver un échange » apparaît alors sur les pages Contact et À propos ; l’outil s’ouvre dans un nouvel onglet, rien n’est chargé avant le clic. Vide : aucun bouton.',
                  'Buchungsseite eines externen Tools (Cal.com, Calendly …), vollständige https://-Adresse. Dann erscheint auf Kontakt und Über mich die Schaltfläche „Gespräch buchen“; das Tool öffnet sich in einem neuen Tab, vor dem Klick wird nichts geladen. Leer: keine Schaltfläche.',
                  'Booking page of an external tool (Cal.com, Calendly…), full https:// address. A "Book a call" button then appears on the Contact and About pages; the tool opens in a new tab and nothing is loaded before the click. Empty: no button.',
                ),
              },
            },
            {
              name: 'bookingLabel',
              type: 'text',
              label: tr(
                'Texte du bouton (facultatif)',
                'Schaltflächentext (optional)',
                'Button text (optional)',
              ),
              localized: true,
              admin: {
                description: tr(
                  'Par exemple « Réserver 30 minutes ». Vide : « Réserver un échange ».',
                  'Zum Beispiel „30 Minuten buchen“. Leer: „Gespräch buchen“.',
                  'e.g. "Book 30 minutes". Empty: "Book a call".',
                ),
              },
            },
          ],
        },
        {
          label: tr('Réseaux sociaux', 'Soziale Netzwerke', 'Social'),
          fields: [
            {
              name: 'social',
              type: 'array',
              labels: {
                singular: tr('Profil', 'Profil', 'Profile'),
                plural: tr('Profils sociaux', 'Soziale Profile', 'Social profiles'),
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  label: tr('Plateforme', 'Plattform', 'Platform'),
                  required: true,
                  options: [
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'X / Twitter', value: 'x' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'Instagram', value: 'instagram' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  label: tr('Adresse (URL)', 'Adresse (URL)', 'URL'),
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: tr('SEO par défaut', 'SEO-Standardwerte', 'SEO defaults'),
          fields: [
            {
              name: 'defaultSeoTitle',
              type: 'text',
              label: tr('Titre par défaut', 'Standardtitel', 'Default title'),
              localized: true,
              maxLength: 70,
              admin: {
                description: tr(
                  'Utilisé comme suffixe de titre sur les pages internes.',
                  'Wird als Titelzusatz auf Unterseiten verwendet.',
                  'Used as a title suffix on inner pages.',
                ),
              },
            },
            {
              name: 'defaultSeoDescription',
              type: 'textarea',
              label: tr('Description par défaut', 'Standardbeschreibung', 'Default description'),
              localized: true,
              maxLength: 180,
            },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              label: tr(
                'Image de partage par défaut',
                'Standard-Sharing-Bild',
                'Default sharing image',
              ),
              admin: {
                description: tr('1200 × 630 pixels.', '1200 × 630 Pixel.', '1200×630 pixels.'),
              },
            },
          ],
        },
      ],
    },
  ],
}
