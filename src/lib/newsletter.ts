/**
 * RK Insights newsletter: double opt-in sign-up, confirmation, one-click
 * unsubscription, delivery of a published article and data minimisation.
 *
 * Runs in API routes, in the Insights `afterChange` hook and in the background
 * job (src/lib/retention-schedule.ts). Free of `server-only` for the same
 * reason as retention.ts; never imported by browser code.
 */
import type { Payload, Where } from 'payload'

import { isLocale, type Locale } from '@/i18n/routing'
import { buttonHtml, createTransport, emailReady, escapeHtml, wrapHtml } from '@/lib/email-layout'
import { emailConfig, siteUrl } from '@/lib/env'
import { signToken, verifyToken } from '@/lib/newsletter-tokens'

const CONFIRM_VALIDITY_MS = 48 * 60 * 60 * 1000
const RESEND_COOLDOWN_MS = 2 * 60 * 1000
const PENDING_RETENTION_MS = 7 * 24 * 60 * 60 * 1000
const UNSUBSCRIBED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

function secret(): string {
  // The production start-up refuses a missing or weak PAYLOAD_SECRET.
  return process.env.PAYLOAD_SECRET || 'development-newsletter-secret'
}

/* -------------------------------------------------------------------------- */
/* E-mail texts (FR / DE / EN)                                                */
/* -------------------------------------------------------------------------- */

const TEXT: Record<
  Locale,
  {
    confirmSubject: string
    confirmIntro: string
    confirmButton: string
    confirmExpiry: string
    confirmIgnore: string
    articleSubject: (title: string) => string
    articleIntro: string
    articleButton: string
    reason: string
    unsubscribe: string
    footer: string
  }
> = {
  fr: {
    confirmSubject: 'Confirmez votre inscription — RK Insights',
    confirmIntro:
      'Merci de votre intérêt pour RK Insights. Pour confirmer votre inscription à la newsletter, cliquez sur le bouton ci-dessous.',
    confirmButton: 'Confirmer mon inscription',
    confirmExpiry: 'Ce lien est valable 48 heures.',
    confirmIgnore:
      'Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet e-mail : aucune inscription ne sera enregistrée.',
    articleSubject: (title) => `RK Insights — ${title}`,
    articleIntro: 'Un nouvel article vient d’être publié sur RK Insights :',
    articleButton: 'Lire l’article',
    reason: 'Vous recevez cet e-mail car vous êtes inscrit(e) à la newsletter RK Insights.',
    unsubscribe: 'Se désinscrire',
    footer: 'Romial Kenmogne — RK Insights',
  },
  de: {
    confirmSubject: 'Bitte bestätigen Sie Ihre Anmeldung — RK Insights',
    confirmIntro:
      'Vielen Dank für Ihr Interesse an RK Insights. Bitte bestätigen Sie Ihre Newsletter-Anmeldung über die Schaltfläche unten.',
    confirmButton: 'Anmeldung bestätigen',
    confirmExpiry: 'Dieser Link ist 48 Stunden gültig.',
    confirmIgnore:
      'Falls Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail einfach: Es wird keine Anmeldung gespeichert.',
    articleSubject: (title) => `RK Insights — ${title}`,
    articleIntro: 'Auf RK Insights wurde ein neuer Artikel veröffentlicht:',
    articleButton: 'Artikel lesen',
    reason: 'Sie erhalten diese E-Mail, weil Sie den RK Insights Newsletter abonniert haben.',
    unsubscribe: 'Abmelden',
    footer: 'Romial Kenmogne — RK Insights',
  },
  en: {
    confirmSubject: 'Please confirm your subscription — RK Insights',
    confirmIntro:
      'Thank you for your interest in RK Insights. Please confirm your newsletter subscription with the button below.',
    confirmButton: 'Confirm my subscription',
    confirmExpiry: 'This link is valid for 48 hours.',
    confirmIgnore:
      'If you did not request this, simply ignore this e-mail: no subscription will be recorded.',
    articleSubject: (title) => `RK Insights — ${title}`,
    articleIntro: 'A new article has just been published on RK Insights:',
    articleButton: 'Read the article',
    reason: 'You receive this e-mail because you subscribed to the RK Insights newsletter.',
    unsubscribe: 'Unsubscribe',
    footer: 'Romial Kenmogne — RK Insights',
  },
}

type SubscriberDoc = {
  id: string | number
  email: string
  locale?: string | null
  status?: 'pending' | 'confirmed' | 'unsubscribed' | null
  updatedAt?: string
}

const localeOf = (value: unknown): Locale =>
  typeof value === 'string' && isLocale(value) ? value : 'en'

/* -------------------------------------------------------------------------- */
/* Sign-up, confirmation, unsubscription                                      */
/* -------------------------------------------------------------------------- */

export type SubscribeResult = 'sent' | 'alreadyConfirmed' | 'unavailable' | 'failed'

export async function subscribe(
  payload: Payload,
  input: { email: string; locale: Locale; source?: string },
): Promise<SubscribeResult> {
  if (!emailReady()) return 'unavailable'

  const email = input.email.trim().toLowerCase()
  const now = new Date()
  const existing = await payload.find({
    collection: 'subscribers',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  let subscriber = existing.docs[0] as SubscriberDoc | undefined

  if (subscriber?.status === 'confirmed') return 'alreadyConfirmed'

  // A pending address asking again within two minutes gets no second e-mail.
  if (
    subscriber?.status === 'pending' &&
    subscriber.updatedAt &&
    now.getTime() - new Date(subscriber.updatedAt).getTime() < RESEND_COOLDOWN_MS
  ) {
    return 'sent'
  }

  const data = {
    locale: input.locale,
    status: 'pending' as const,
    consentAt: now.toISOString(),
    source: input.source ?? '',
    unsubscribedAt: null,
  }
  subscriber = (
    subscriber
      ? await payload.update({
          collection: 'subscribers',
          id: subscriber.id,
          data,
          overrideAccess: true,
        })
      : await payload.create({
          collection: 'subscribers',
          data: { email, ...data },
          overrideAccess: true,
        })
  ) as SubscriberDoc

  const text = TEXT[input.locale]
  const token = signToken(
    secret(),
    'confirm',
    subscriber.id,
    new Date(now.getTime() + CONFIRM_VALIDITY_MS),
  )
  const link = `${siteUrl}/${input.locale}/newsletter/confirm?token=${encodeURIComponent(token)}`

  try {
    await createTransport().sendMail({
      from: emailConfig.from,
      to: email,
      subject: text.confirmSubject,
      text: [
        text.confirmIntro,
        '',
        link,
        '',
        text.confirmExpiry,
        text.confirmIgnore,
        '',
        text.footer,
      ].join('\n'),
      html: wrapHtml(
        text.confirmSubject,
        `<p style="margin:0 0 12px">${escapeHtml(text.confirmIntro)}</p>` +
          buttonHtml(link, text.confirmButton) +
          `<p style="margin:0 0 8px;color:#465568;font-size:13px">${escapeHtml(text.confirmExpiry)}</p>` +
          `<p style="margin:0;color:#465568;font-size:13px">${escapeHtml(text.confirmIgnore)}</p>`,
        text.footer,
      ),
    })
    return 'sent'
  } catch (error) {
    // Never log the address.
    console.error(
      '[newsletter] Confirmation e-mail failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
    return 'failed'
  }
}

async function findSubscriber(payload: Payload, id: string): Promise<SubscriberDoc | null> {
  try {
    return (await payload.findByID({
      collection: 'subscribers',
      id,
      depth: 0,
      overrideAccess: true,
    })) as SubscriberDoc
  } catch {
    return null
  }
}

export async function confirmSubscription(
  payload: Payload,
  token: string,
): Promise<{ status: 'confirmed' | 'invalid'; locale?: Locale }> {
  const id = verifyToken(secret(), 'confirm', token)
  if (!id) return { status: 'invalid' }
  const subscriber = await findSubscriber(payload, id)
  if (!subscriber) return { status: 'invalid' }

  if (subscriber.status !== 'confirmed') {
    await payload.update({
      collection: 'subscribers',
      id: subscriber.id,
      data: { status: 'confirmed', confirmedAt: new Date().toISOString(), unsubscribedAt: null },
      overrideAccess: true,
    })
  }
  return { status: 'confirmed', locale: localeOf(subscriber.locale) }
}

export async function unsubscribe(
  payload: Payload,
  token: string,
): Promise<'unsubscribed' | 'invalid'> {
  const id = verifyToken(secret(), 'unsubscribe', token)
  if (!id) return 'invalid'
  const subscriber = await findSubscriber(payload, id)
  // Already deleted: the address is no longer on the list either way.
  if (!subscriber) return 'unsubscribed'

  if (subscriber.status !== 'unsubscribed') {
    await payload.update({
      collection: 'subscribers',
      id: subscriber.id,
      data: { status: 'unsubscribed', unsubscribedAt: new Date().toISOString() },
      overrideAccess: true,
    })
  }
  return 'unsubscribed'
}

/* -------------------------------------------------------------------------- */
/* Article delivery                                                           */
/* -------------------------------------------------------------------------- */

type ArticleText = { title: string; excerpt: string; slug: string }

/**
 * Sends a published article once to every confirmed subscriber, in the
 * subscriber's language. The article is "claimed" first (newsletterSentAt set
 * only if still empty), so a double trigger never sends twice.
 */
export async function sendArticleNewsletter(
  payload: Payload,
  articleId: string | number,
): Promise<number> {
  if (!emailReady()) return 0
  const now = new Date()

  const claim: Where = {
    and: [
      { id: { equals: articleId } },
      { sendNewsletter: { equals: true } },
      { newsletterSentAt: { exists: false } },
      { _status: { equals: 'published' } },
      {
        or: [
          { publishedAt: { less_than_equal: now.toISOString() } },
          { publishedAt: { exists: false } },
        ],
      },
    ],
  }
  const claimed = await payload.update({
    collection: 'insights',
    where: claim,
    data: { newsletterSentAt: now.toISOString(), _status: 'published' } as never,
    overrideAccess: true,
    context: { newsletterClaim: true },
  })
  if (claimed.docs.length === 0) return 0

  const articles = new Map<Locale, ArticleText | null>()
  const articleIn = async (locale: Locale): Promise<ArticleText | null> => {
    if (!articles.has(locale)) {
      const doc = (await payload.findByID({
        collection: 'insights',
        id: articleId,
        locale,
        depth: 0,
        overrideAccess: true,
      })) as { title?: string; excerpt?: string; slug?: string }
      articles.set(
        locale,
        doc.title && doc.slug
          ? { title: doc.title, excerpt: doc.excerpt ?? '', slug: doc.slug }
          : null,
      )
    }
    return articles.get(locale) ?? null
  }

  const transport = createTransport({ pool: true })
  let sent = 0
  let failed = 0

  try {
    for (let page = 1; ; page += 1) {
      const batch = await payload.find({
        collection: 'subscribers',
        where: { status: { equals: 'confirmed' } },
        limit: 100,
        page,
        depth: 0,
        overrideAccess: true,
      })

      for (const subscriber of batch.docs as SubscriberDoc[]) {
        const locale = localeOf(subscriber.locale)
        const article = await articleIn(locale)
        if (!article) continue

        const text = TEXT[locale]
        const url = `${siteUrl}/${locale}/insights/${article.slug}`
        const token = signToken(secret(), 'unsubscribe', subscriber.id, null)
        const unsubscribePage = `${siteUrl}/${locale}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
        const oneClick = `${siteUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`

        try {
          await transport.sendMail({
            from: emailConfig.from,
            to: subscriber.email,
            subject: text.articleSubject(article.title),
            headers: {
              'List-Unsubscribe': `<${oneClick}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
            text: [
              text.articleIntro,
              '',
              article.title,
              article.excerpt,
              '',
              url,
              '',
              '—',
              text.reason,
              `${text.unsubscribe}: ${unsubscribePage}`,
            ].join('\n'),
            html: wrapHtml(
              article.title,
              `<p style="margin:0 0 12px;color:#465568">${escapeHtml(text.articleIntro)}</p>` +
                `<p style="margin:0 0 12px;font-size:16px">${escapeHtml(article.excerpt)}</p>` +
                buttonHtml(url, text.articleButton) +
                `<p style="margin:24px 0 0;color:#465568;font-size:12px">${escapeHtml(text.reason)} <a href="${escapeHtml(unsubscribePage)}" style="color:#6f571f">${escapeHtml(text.unsubscribe)}</a></p>`,
              text.footer,
            ),
          })
          sent += 1
        } catch {
          failed += 1
        }
      }

      if (!batch.hasNextPage) break
    }
  } finally {
    transport.close()
  }

  await payload.update({
    collection: 'insights',
    id: articleId,
    data: { newsletterRecipients: sent } as never,
    overrideAccess: true,
    context: { newsletterClaim: true },
  })
  console.info(
    `[newsletter] Article ${articleId} sent to ${sent} subscriber(s), ${failed} failure(s).`,
  )
  return sent
}

/** Articles ticked for the newsletter whose publication date has arrived. */
export async function processPendingNewsletters(payload: Payload): Promise<void> {
  if (!emailReady()) return
  const due = await payload.find({
    collection: 'insights',
    where: {
      and: [
        { sendNewsletter: { equals: true } },
        { newsletterSentAt: { exists: false } },
        { _status: { equals: 'published' } },
        {
          or: [
            { publishedAt: { less_than_equal: new Date().toISOString() } },
            { publishedAt: { exists: false } },
          ],
        },
      ],
    },
    limit: 20,
    depth: 0,
    overrideAccess: true,
  })
  for (const article of due.docs) {
    await sendArticleNewsletter(payload, article.id)
  }
}

/** Unconfirmed sign-ups after 7 days and unsubscribed addresses after 30 days are deleted. */
export async function purgeNewsletterSubscribers(
  payload: Payload,
  now: Date = new Date(),
): Promise<number> {
  const pending = await payload.delete({
    collection: 'subscribers',
    where: {
      and: [
        { status: { equals: 'pending' } },
        { updatedAt: { less_than: new Date(now.getTime() - PENDING_RETENTION_MS).toISOString() } },
      ],
    },
    overrideAccess: true,
  })
  const unsubscribed = await payload.delete({
    collection: 'subscribers',
    where: {
      and: [
        { status: { equals: 'unsubscribed' } },
        {
          unsubscribedAt: {
            less_than: new Date(now.getTime() - UNSUBSCRIBED_RETENTION_MS).toISOString(),
          },
        },
      ],
    },
    overrideAccess: true,
  })
  return pending.docs.length + unsubscribed.docs.length
}
