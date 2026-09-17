/**
 * Example reply templates for contact requests, added on request by
 * `npm run seed:reply-templates`. Neutral wording, no commitment on prices,
 * dates or availability: the owner adapts them in the admin.
 * Variables: {name}, {organisation}, {subject}.
 */

type Localized = { fr: string; de: string; en: string }

export type ReplyTemplateSeed = {
  title: string
  subject: Localized
  body: Localized
  requestTypes?: string[]
}

const SIGNATURE: Localized = {
  fr: 'Bien cordialement,\n\nRomial Kenmogne\nBusiness & Financial Consultant | Project Manager',
  de: 'Mit freundlichen Grüßen\n\nRomial Kenmogne\nBusiness & Financial Consultant | Project Manager',
  en: 'Kind regards,\n\nRomial Kenmogne\nBusiness & Financial Consultant | Project Manager',
}

const sign = (text: Localized): Localized => ({
  fr: `${text.fr}\n\n${SIGNATURE.fr}`,
  de: `${text.de}\n\n${SIGNATURE.de}`,
  en: `${text.en}\n\n${SIGNATURE.en}`,
})

export const replyTemplateSeeds: ReplyTemplateSeed[] = [
  {
    title: 'Accusé de réception',
    subject: {
      fr: 'Votre demande : {subject}',
      de: 'Ihre Anfrage: {subject}',
      en: 'Your request: {subject}',
    },
    body: sign({
      fr: 'Bonjour {name},\n\nMerci pour votre message et pour l’intérêt que vous portez à mon travail. J’ai bien reçu votre demande concernant « {subject} ».\n\nJe l’étudie avec attention et reviens vers vous très prochainement pour en discuter.',
      de: 'Guten Tag {name},\n\nvielen Dank für Ihre Nachricht und Ihr Interesse an meiner Arbeit. Ihre Anfrage zu „{subject}“ ist bei mir eingegangen.\n\nIch prüfe sie sorgfältig und melde mich in Kürze bei Ihnen, um sie mit Ihnen zu besprechen.',
      en: 'Dear {name},\n\nThank you for your message and for your interest in my work. I have received your request regarding “{subject}”.\n\nI am looking into it carefully and will get back to you shortly to discuss it.',
    }),
  },
  {
    title: 'Demande de précisions',
    subject: {
      fr: 'Quelques précisions sur votre demande : {subject}',
      de: 'Einige Rückfragen zu Ihrer Anfrage: {subject}',
      en: 'A few questions about your request: {subject}',
    },
    body: sign({
      fr: 'Bonjour {name},\n\nMerci pour votre demande concernant « {subject} ». Afin de vous répondre de manière précise, pourriez-vous me donner quelques informations complémentaires :\n\n- le contexte et les objectifs du projet ;\n- le calendrier envisagé ;\n- les documents déjà disponibles (présentation, chiffres clés, plan d’affaires) ;\n- le budget prévu, s’il est déjà défini.\n\nJe reviendrai vers vous dès réception de ces éléments.',
      de: 'Guten Tag {name},\n\nvielen Dank für Ihre Anfrage zu „{subject}“. Damit ich Ihnen genau antworten kann, bitte ich Sie um einige ergänzende Angaben:\n\n- Hintergrund und Ziele des Vorhabens;\n- der geplante Zeitrahmen;\n- bereits vorhandene Unterlagen (Präsentation, Kennzahlen, Businessplan);\n- das vorgesehene Budget, sofern bereits festgelegt.\n\nSobald mir diese Informationen vorliegen, melde ich mich bei Ihnen.',
      en: 'Dear {name},\n\nThank you for your request regarding “{subject}”. So that I can give you a precise answer, could you share a few additional details:\n\n- the background and objectives of the project;\n- the intended timeline;\n- any documents already available (presentation, key figures, business plan);\n- the planned budget, if already defined.\n\nI will get back to you as soon as I receive this information.',
    }),
    requestTypes: ['consulting', 'dueDiligence', 'advisory', 'projectManagement', 'smeProgramme'],
  },
  {
    title: 'Proposition d’un premier échange',
    subject: {
      fr: 'Proposition d’échange : {subject}',
      de: 'Vorschlag für ein Gespräch: {subject}',
      en: 'Proposal for a call: {subject}',
    },
    body: sign({
      fr: 'Bonjour {name},\n\nMerci pour votre demande concernant « {subject} ». Je vous propose d’en parler lors d’un premier échange d’environ 30 minutes, par téléphone ou en visioconférence.\n\nPourriez-vous m’indiquer deux ou trois créneaux qui vous conviendraient dans les prochains jours ? Je vous enverrai ensuite une invitation.',
      de: 'Guten Tag {name},\n\nvielen Dank für Ihre Anfrage zu „{subject}“. Gerne schlage ich Ihnen ein erstes Gespräch von etwa 30 Minuten vor, telefonisch oder per Videokonferenz.\n\nKönnten Sie mir zwei oder drei passende Termine in den nächsten Tagen nennen? Ich sende Ihnen dann eine Einladung.',
      en: 'Dear {name},\n\nThank you for your request regarding “{subject}”. I suggest we discuss it in an initial call of about 30 minutes, by phone or video conference.\n\nCould you let me know two or three time slots that would suit you in the coming days? I will then send you an invitation.',
    }),
  },
  {
    title: 'Demande d’intervention (conférence, médias)',
    subject: {
      fr: 'Votre invitation : {subject}',
      de: 'Ihre Einladung: {subject}',
      en: 'Your invitation: {subject}',
    },
    body: sign({
      fr: 'Bonjour {name},\n\nMerci pour votre invitation concernant « {subject} ». Pour étudier ma participation, pourriez-vous me préciser :\n\n- la date, le lieu ou le format (présentiel, en ligne, enregistrement) ;\n- le public attendu et le nombre de participants ;\n- le thème et la durée de l’intervention ;\n- les conditions d’organisation (déplacement, prise en charge).\n\nJe vous répondrai dès que j’aurai ces informations.',
      de: 'Guten Tag {name},\n\nvielen Dank für Ihre Einladung zu „{subject}“. Um meine Teilnahme zu prüfen, bitte ich Sie um folgende Angaben:\n\n- Datum, Ort bzw. Format (vor Ort, online, Aufzeichnung);\n- erwartetes Publikum und Teilnehmerzahl;\n- Thema und Dauer des Beitrags;\n- organisatorische Rahmenbedingungen (Anreise, Kostenübernahme).\n\nSobald mir diese Informationen vorliegen, melde ich mich bei Ihnen.',
      en: 'Dear {name},\n\nThank you for your invitation regarding “{subject}”. To consider my participation, could you let me know:\n\n- the date, venue or format (in person, online, recording);\n- the expected audience and number of participants;\n- the topic and length of the talk;\n- the practical arrangements (travel, expenses).\n\nI will get back to you once I have this information.',
    }),
    requestTypes: ['speaking', 'training', 'partnership'],
  },
  {
    title: 'Relance sans réponse',
    subject: {
      fr: 'Suite à votre demande : {subject}',
      de: 'Nachfrage zu Ihrer Anfrage: {subject}',
      en: 'Following up on your request: {subject}',
    },
    body: sign({
      fr: 'Bonjour {name},\n\nJe me permets de revenir vers vous au sujet de votre demande concernant « {subject} ». Votre projet est-il toujours d’actualité ?\n\nJe reste à votre disposition pour en discuter au moment qui vous conviendra.',
      de: 'Guten Tag {name},\n\nich komme noch einmal auf Ihre Anfrage zu „{subject}“ zurück. Ist Ihr Vorhaben weiterhin aktuell?\n\nGerne stehe ich Ihnen zu einem für Sie passenden Zeitpunkt für ein Gespräch zur Verfügung.',
      en: 'Dear {name},\n\nI am following up on your request regarding “{subject}”. Is your project still current?\n\nI remain available to discuss it whenever suits you.',
    }),
  },
  {
    title: 'Demande hors de mon champ d’intervention',
    subject: {
      fr: 'Votre demande : {subject}',
      de: 'Ihre Anfrage: {subject}',
      en: 'Your request: {subject}',
    },
    body: sign({
      fr: 'Bonjour {name},\n\nMerci pour votre message et pour votre confiance. Après examen, votre demande concernant « {subject} » ne correspond malheureusement pas à mon champ d’intervention, et je ne suis donc pas en mesure d’y donner suite.\n\nJe vous souhaite plein succès dans votre projet.',
      de: 'Guten Tag {name},\n\nvielen Dank für Ihre Nachricht und Ihr Vertrauen. Nach Prüfung liegt Ihre Anfrage zu „{subject}“ leider außerhalb meines Tätigkeitsbereichs, sodass ich sie nicht weiterverfolgen kann.\n\nIch wünsche Ihnen viel Erfolg bei Ihrem Vorhaben.',
      en: 'Dear {name},\n\nThank you for your message and for your trust. Having looked into it, your request regarding “{subject}” unfortunately falls outside my field of work, so I am unable to take it further.\n\nI wish you every success with your project.',
    }),
  },
]
