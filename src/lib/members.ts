/**
 * Member area: passwordless sign-in by e-mail link, signed session cookie and
 * access to purchased digital products.
 *
 * - A login link is single-use: it carries a nonce that is rotated when the
 *   link is issued again and when it is used.
 * - The session cookie is `<memberId>.<expiry>.<HMAC>` (httpOnly, SameSite=Lax).
 * - Every access to a product is checked against an entitlement.
 *
 * Free of `server-only` (used by the shop webhook as well); `next/headers` is
 * imported lazily where a request context exists.
 */
import { randomBytes } from 'crypto'

import type { Payload } from 'payload'

import { isLocale, type Locale } from '@/i18n/routing'
import { buttonHtml, createTransport, emailReady, escapeHtml, wrapHtml } from '@/lib/email-layout'
import { emailConfig, siteUrl } from '@/lib/env'
import { signToken, verifyToken } from '@/lib/newsletter-tokens'

export const SESSION_COOKIE = 'rk_member'
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60
const LOGIN_LINK_MS = 15 * 60 * 1000
export const ACCESS_LINK_MS = 72 * 60 * 60 * 1000
export const DOWNLOAD_LIMIT = 50

const secret = (): string => process.env.PAYLOAD_SECRET || 'development-members-secret'

export type MemberDoc = {
  id: string | number
  email: string
  name?: string | null
  locale?: string | null
  loginNonce?: string | null
}

export type EntitlementDoc = {
  id: string | number
  member: unknown
  product: unknown
  downloads?: number | null
}

const localeOf = (value: unknown): Locale =>
  typeof value === 'string' && isLocale(value) ? value : 'en'

const idOf = (value: unknown): string | null => {
  if (value && typeof value === 'object' && 'id' in value)
    return String((value as { id: unknown }).id)
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return null
}

/* -------------------------------------------------------------------------- */
/* Accounts and accesses                                                      */
/* -------------------------------------------------------------------------- */

export async function findMemberByEmail(
  payload: Payload,
  email: string,
): Promise<MemberDoc | null> {
  const result = await payload.find({
    collection: 'members',
    where: { email: { equals: email.trim().toLowerCase() } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return (result.docs[0] as unknown as MemberDoc | undefined) ?? null
}

export async function findOrCreateMember(
  payload: Payload,
  input: { email: string; locale: Locale; name?: string },
): Promise<MemberDoc> {
  const existing = await findMemberByEmail(payload, input.email)
  if (existing) return existing
  return (await payload.create({
    collection: 'members',
    data: {
      email: input.email.trim().toLowerCase(),
      locale: input.locale,
      name: input.name ?? '',
    } as never,
    overrideAccess: true,
  })) as unknown as MemberDoc
}

export async function findEntitlement(
  payload: Payload,
  memberId: string | number,
  productId: string | number,
): Promise<EntitlementDoc | null> {
  const result = await payload.find({
    collection: 'entitlements',
    where: { and: [{ member: { equals: memberId } }, { product: { equals: productId } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return (result.docs[0] as unknown as EntitlementDoc | undefined) ?? null
}

export async function grantEntitlement(
  payload: Payload,
  memberId: string | number,
  productId: string | number,
  orderId?: string | number,
): Promise<void> {
  if (await findEntitlement(payload, memberId, productId)) return
  await payload.create({
    collection: 'entitlements',
    data: { member: memberId, product: productId, ...(orderId ? { order: orderId } : {}) } as never,
    overrideAccess: true,
  })
}

export async function listMemberProductIds(
  payload: Payload,
  memberId: string | number,
): Promise<string[]> {
  const result = await payload.find({
    collection: 'entitlements',
    where: { member: { equals: memberId } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs
    .map((doc) => idOf((doc as unknown as EntitlementDoc).product))
    .filter((id): id is string => Boolean(id))
}

/* -------------------------------------------------------------------------- */
/* Sign-in links and sessions                                                 */
/* -------------------------------------------------------------------------- */

async function rotateNonce(payload: Payload, memberId: string | number): Promise<string> {
  const nonce = randomBytes(8).toString('hex')
  await payload.update({
    collection: 'members',
    id: memberId,
    data: { loginNonce: nonce } as never,
    overrideAccess: true,
  })
  return nonce
}

export async function createLoginLink(
  payload: Payload,
  member: MemberDoc,
  validityMs: number = LOGIN_LINK_MS,
): Promise<string> {
  const nonce = await rotateNonce(payload, member.id)
  const token = signToken(
    secret(),
    'login',
    `${member.id}-${nonce}`,
    new Date(Date.now() + validityMs),
  )
  return `${siteUrl}/${localeOf(member.locale)}/account/verify?token=${encodeURIComponent(token)}`
}

/** Exchanges a login link for the member, once. */
export async function consumeLoginToken(
  payload: Payload,
  token: string,
): Promise<MemberDoc | null> {
  const subject = verifyToken(secret(), 'login', token)
  const match = subject?.match(/^(\w+)-([0-9a-f]{16})$/)
  if (!match) return null
  const [, id, nonce] = match as unknown as [string, string, string]

  let member: MemberDoc
  try {
    member = (await payload.findByID({
      collection: 'members',
      id,
      depth: 0,
      overrideAccess: true,
      showHiddenFields: true,
    })) as unknown as MemberDoc
  } catch {
    return null
  }
  if (!member.loginNonce || member.loginNonce !== nonce) return null

  await rotateNonce(payload, member.id)
  await payload.update({
    collection: 'members',
    id: member.id,
    data: { lastLoginAt: new Date().toISOString() } as never,
    overrideAccess: true,
  })
  return member
}

export function sessionToken(memberId: string | number): string {
  return signToken(
    secret(),
    'session',
    memberId,
    new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
  )
}

export function memberIdFromSession(token: string | null | undefined): string | null {
  return verifyToken(secret(), 'session', token)
}

export async function memberFromSession(
  payload: Payload,
  token: string | null | undefined,
): Promise<MemberDoc | null> {
  const id = memberIdFromSession(token)
  if (!id) return null
  try {
    return (await payload.findByID({
      collection: 'members',
      id,
      depth: 0,
      overrideAccess: true,
    })) as unknown as MemberDoc
  } catch {
    return null
  }
}

/** Member of the current request (server components), or null. */
export async function currentMember(payload: Payload): Promise<MemberDoc | null> {
  const { cookies } = await import('next/headers')
  const store = await cookies()
  return memberFromSession(payload, store.get(SESSION_COOKIE)?.value)
}

export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: siteUrl.startsWith('https://'),
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
})

/* -------------------------------------------------------------------------- */
/* E-mails (FR / DE / EN)                                                     */
/* -------------------------------------------------------------------------- */

const MAIL: Record<
  Locale,
  {
    loginSubject: string
    loginIntro: string
    loginButton: string
    loginExpiry: string
    loginIgnore: string
    accessSubject: string
    accessIntro: string
    accessButton: string
    accessExpiry: string
    footer: string
  }
> = {
  fr: {
    loginSubject: 'Votre lien de connexion — Romial Kenmogne',
    loginIntro: 'Voici votre lien pour accéder à votre espace et à vos achats.',
    loginButton: 'Me connecter',
    loginExpiry: 'Ce lien est valable 15 minutes et ne fonctionne qu’une fois.',
    loginIgnore: 'Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.',
    accessSubject: 'Accédez à vos achats — Romial Kenmogne',
    accessIntro:
      'Merci pour votre achat. Vos produits numériques sont disponibles dans votre espace :',
    accessButton: 'Accéder à mes achats',
    accessExpiry:
      'Ce lien de connexion est valable 72 heures et ne fonctionne qu’une fois. Ensuite, demandez un nouveau lien depuis la page « Mon espace » du site avec cette adresse e-mail.',
    footer: 'Romial Kenmogne — Espace membre',
  },
  de: {
    loginSubject: 'Ihr Anmeldelink — Romial Kenmogne',
    loginIntro: 'Hier ist Ihr Link zu Ihrem Bereich und Ihren Käufen.',
    loginButton: 'Anmelden',
    loginExpiry: 'Dieser Link ist 15 Minuten gültig und funktioniert nur einmal.',
    loginIgnore: 'Falls Sie das nicht angefordert haben, ignorieren Sie diese E-Mail.',
    accessSubject: 'Zugang zu Ihren Käufen — Romial Kenmogne',
    accessIntro:
      'Vielen Dank für Ihren Kauf. Ihre digitalen Produkte stehen in Ihrem Bereich bereit:',
    accessButton: 'Zu meinen Käufen',
    accessExpiry:
      'Dieser Anmeldelink ist 72 Stunden gültig und funktioniert nur einmal. Danach fordern Sie auf der Seite „Mein Bereich“ mit dieser E-Mail-Adresse einen neuen Link an.',
    footer: 'Romial Kenmogne — Mitgliederbereich',
  },
  en: {
    loginSubject: 'Your sign-in link — Romial Kenmogne',
    loginIntro: 'Here is your link to your area and your purchases.',
    loginButton: 'Sign in',
    loginExpiry: 'This link is valid for 15 minutes and works only once.',
    loginIgnore: 'If you did not request it, ignore this e-mail.',
    accessSubject: 'Access your purchases — Romial Kenmogne',
    accessIntro: 'Thank you for your purchase. Your digital products are available in your area:',
    accessButton: 'Access my purchases',
    accessExpiry:
      'This sign-in link is valid for 72 hours and works only once. After that, request a new link from the "My area" page of the site with this e-mail address.',
    footer: 'Romial Kenmogne — Member area',
  },
}

/**
 * Sends a sign-in link if the address belongs to a member. The caller always
 * answers the same way, so the form never reveals who has an account.
 */
export async function requestLogin(payload: Payload, email: string, locale: Locale): Promise<void> {
  if (!emailReady()) return
  const member = await findMemberByEmail(payload, email)
  if (!member) return
  const language = localeOf(member.locale ?? locale)
  const text = MAIL[language]
  const link = await createLoginLink(payload, member)
  try {
    await createTransport().sendMail({
      from: emailConfig.from,
      to: member.email,
      subject: text.loginSubject,
      text: [
        text.loginIntro,
        '',
        link,
        '',
        text.loginExpiry,
        text.loginIgnore,
        '',
        text.footer,
      ].join('\n'),
      html: wrapHtml(
        text.loginSubject,
        `<p style="margin:0 0 12px">${escapeHtml(text.loginIntro)}</p>${buttonHtml(link, text.loginButton)}` +
          `<p style="margin:0 0 8px;color:#465568;font-size:13px">${escapeHtml(text.loginExpiry)}</p>` +
          `<p style="margin:0;color:#465568;font-size:13px">${escapeHtml(text.loginIgnore)}</p>`,
        text.footer,
      ),
    })
  } catch (error) {
    console.error(
      '[members] Sign-in e-mail failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
  }
}

/** After a paid order with digital products: e-mail with a 72-hour sign-in link. */
export async function sendAccessEmail(
  payload: Payload,
  member: MemberDoc,
  productTitles: string[],
): Promise<void> {
  if (!emailReady()) return
  const language = localeOf(member.locale)
  const text = MAIL[language]
  const link = await createLoginLink(payload, member, ACCESS_LINK_MS)
  try {
    await createTransport().sendMail({
      from: emailConfig.from,
      to: member.email,
      subject: text.accessSubject,
      text: [
        text.accessIntro,
        ...productTitles.map((title) => `• ${title}`),
        '',
        link,
        '',
        text.accessExpiry,
        '',
        text.footer,
      ].join('\n'),
      html: wrapHtml(
        text.accessSubject,
        `<p style="margin:0 0 12px">${escapeHtml(text.accessIntro)}</p>` +
          `<ul style="margin:0 0 12px;padding-left:18px">${productTitles.map((title) => `<li>${escapeHtml(title)}</li>`).join('')}</ul>` +
          buttonHtml(link, text.accessButton) +
          `<p style="margin:0;color:#465568;font-size:13px">${escapeHtml(text.accessExpiry)}</p>`,
        text.footer,
      ),
    })
  } catch (error) {
    console.error(
      '[members] Access e-mail failed:',
      error instanceof Error ? error.message : 'unknown error',
    )
  }
}
