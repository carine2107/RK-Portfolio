/**
 * Shared e-mail building blocks: SMTP transport, HTML frame and escaping.
 * Used by the contact form and the newsletter. Free of `server-only` so the
 * background jobs and scripts can import it; it is never bundled for the browser.
 */
import nodemailer from 'nodemailer'

import { emailConfig } from '@/lib/env'

export const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** True when real e-mail delivery is configured (never pretend otherwise). */
export function emailReady(): boolean {
  return emailConfig.enabled && Boolean(emailConfig.host) && Boolean(emailConfig.from)
}

export function createTransport(options: { pool?: boolean } = {}) {
  const auth = emailConfig.user
    ? { auth: { user: emailConfig.user, pass: emailConfig.password } }
    : {}
  if (options.pool) {
    return nodemailer.createTransport({
      pool: true,
      maxConnections: 3,
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      ...auth,
    })
  }
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    ...auth,
  })
}

export function wrapHtml(title: string, body: string, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f3f5f7;padding:24px;font-family:Helvetica,Arial,sans-serif;color:#10233f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dfe4ea;border-radius:8px">
<tr><td style="padding:28px 28px 12px;border-bottom:2px solid #b8924b">
<p style="margin:0;font-size:13px;letter-spacing:2px;color:#6f571f">ROMIAL KENMOGNE</p>
<h1 style="margin:8px 0 0;font-size:20px;font-weight:600">${escapeHtml(title)}</h1>
</td></tr>
<tr><td style="padding:24px 28px">${body}</td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid #dfe4ea;color:#465568;font-size:12px">${escapeHtml(footer)}</td></tr>
</table></body></html>`
}

/** Bulletproof-ish e-mail button (table-free, works in the main clients). */
export function buttonHtml(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="display:inline-block;background:#10233f;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">${escapeHtml(label)}</a></p>`
}
