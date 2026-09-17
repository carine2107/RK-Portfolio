import type { CollectionConfig } from 'payload'

import { isAdminOrEditor } from '../access'
import { GROUPS, tr } from '../i18n'
import { REQUEST_TYPE_LABELS, REQUEST_TYPES } from './ContactSubmissions'

/**
 * Reply templates for contact requests, written by the owner in the three
 * languages. Used from a request ("Reply with a template"): the reply opens in
 * the user's own mail client, nothing is sent by the website. Staff only.
 */
export const ReplyTemplates: CollectionConfig = {
  slug: 'reply-templates',
  labels: {
    singular: tr('Modèle de réponse', 'Antwortvorlage', 'Reply template'),
    plural: tr('Modèles de réponse', 'Antwortvorlagen', 'Reply templates'),
  },
  admin: {
    group: GROUPS.administration,
    useAsTitle: 'title',
    defaultColumns: ['title', 'requestTypes', 'updatedAt'],
    description: tr(
      'Réponses types aux demandes de contact, en français, allemand et anglais. Dans une demande, « Répondre avec un modèle » ouvre votre messagerie avec la réponse dans la langue du visiteur. Variables : {name}, {organisation}, {subject}.',
      'Standardantworten auf Kontaktanfragen auf Französisch, Deutsch und Englisch. In einer Anfrage öffnet „Mit Vorlage antworten“ Ihr E-Mail-Programm mit der Antwort in der Sprache des Besuchers. Variablen: {name}, {organisation}, {subject}.',
      'Standard replies to contact requests in French, German and English. In a request, “Reply with a template” opens your mail client with the reply in the visitor’s language. Variables: {name}, {organisation}, {subject}.',
    ),
  },
  access: {
    read: isAdminOrEditor,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: tr('Nom du modèle', 'Name der Vorlage', 'Template name'),
      required: true,
      admin: {
        description: tr(
          'Pour vous repérer, par exemple « Accusé de réception » ou « Demande de précisions ».',
          'Zur Orientierung, z. B. „Eingangsbestätigung“ oder „Rückfrage“.',
          'For your own reference, e.g. “Acknowledgement” or “Request for details”.',
        ),
      },
    },
    {
      name: 'subject',
      type: 'text',
      label: tr('Objet de l’e-mail', 'Betreff der E-Mail', 'E-mail subject'),
      required: true,
      localized: true,
    },
    {
      name: 'body',
      type: 'textarea',
      label: tr('Texte de la réponse', 'Antworttext', 'Reply text'),
      required: true,
      localized: true,
      admin: {
        rows: 12,
        description: tr(
          'Exemple : « Bonjour {name}, merci pour votre demande concernant {subject}… ». Renseignez chaque langue avec le sélecteur de langue en haut de page.',
          'Beispiel: „Guten Tag {name}, vielen Dank für Ihre Anfrage zu {subject} …“. Jede Sprache über die Sprachauswahl oben ausfüllen.',
          'Example: “Dear {name}, thank you for your request about {subject}…”. Fill in each language with the language selector at the top.',
        ),
      },
    },
    {
      name: 'requestTypes',
      type: 'select',
      hasMany: true,
      label: tr('Proposé en premier pour', 'Zuerst vorgeschlagen für', 'Suggested first for'),
      options: REQUEST_TYPES.map((value) => ({ label: REQUEST_TYPE_LABELS[value], value })),
      admin: {
        position: 'sidebar',
        description: tr(
          'Facultatif : types de demande pour lesquels ce modèle est placé en tête de liste.',
          'Optional: Anfragearten, bei denen diese Vorlage oben steht.',
          'Optional: request types for which this template is listed first.',
        ),
      },
    },
  ],
}
