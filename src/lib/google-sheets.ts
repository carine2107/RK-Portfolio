/**
 * Google Sheets sync: contact requests and newsletter subscribers are copied
 * to a spreadsheet the owner opens with a (free) Google account.
 *
 * - Authentication with a Google Cloud service account (signed JWT, RS256),
 *   no extra dependency. The spreadsheet is shared with that account only.
 * - Tabs "Demandes de contact" and "Abonnés newsletter"; column A holds the
 *   CMS id, the other columns are those of the CSV export (French labels).
 * - Values are written RAW: text typed by a visitor is never run as a formula.
 * - Rows are found by id, so the owner may sort or filter the sheet freely.
 * - Newsletter sign-ups appear once confirmed; pending sign-ups never do.
 * - Operations run one after the other in this process (no row-index race).
 *
 * Inactive while the three environment variables are missing. Free of
 * `server-only`: used by collection hooks, API routes and unit tests.
 */
import { createSign } from 'crypto'

import type { Payload } from 'payload'

import { EXPORT_COLLECTIONS, exportRows, type ExportCollection } from '@/lib/exports'

export type SheetsConfig = {
  spreadsheetId: string
  clientEmail: string
  privateKey: string
  tokenUrl: string
  apiBase: string
}

type Doc = Record<string, unknown>

const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'
const DEFAULT_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const DEFAULT_API_BASE = 'https://sheets.googleapis.com'

export const SHEET_TABS: Record<ExportCollection, string> = {
  'contact-submissions': 'Demandes de contact',
  subscribers: 'Abonnés newsletter',
}

const env = (name: string): string => (process.env[name] ?? '').trim()

export function readSheetsConfig(): SheetsConfig {
  // Endpoint overrides exist only to verify the sync against a local fake
  // server during development; production always talks to Google.
  const allowOverride = process.env.NODE_ENV !== 'production'
  return {
    spreadsheetId: env('GOOGLE_SHEETS_SPREADSHEET_ID'),
    clientEmail: env('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    // Keys pasted on one line keep literal "\n": turn them back into line breaks.
    privateKey: env('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY').replace(/\\n/g, '\n'),
    tokenUrl: (allowOverride && env('GOOGLE_OAUTH_TOKEN_URL')) || DEFAULT_TOKEN_URL,
    apiBase: (allowOverride && env('GOOGLE_SHEETS_API_BASE')) || DEFAULT_API_BASE,
  }
}

export function sheetsReady(config: SheetsConfig = readSheetsConfig()): boolean {
  return (
    /^[\w-]{20,}$/.test(config.spreadsheetId) &&
    /@[\w-]+\.iam\.gserviceaccount\.com$/.test(config.clientEmail) &&
    config.privateKey.includes('PRIVATE KEY-----')
  )
}

export function spreadsheetUrl(config: SheetsConfig = readSheetsConfig()): string {
  return `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`
}

const base64url = (input: string | Buffer) => Buffer.from(input).toString('base64url')

/** Signed JWT exchanged for an access token (OAuth 2.0 service account flow). */
export function createAssertion(config: SheetsConfig, nowSeconds: number): string {
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(
    JSON.stringify({
      iss: config.clientEmail,
      scope: SCOPE,
      aud: config.tokenUrl,
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    }),
  )
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  return `${header}.${claims}.${signer.sign(config.privateKey, 'base64url')}`
}

/** A1 range of a tab, with the title quoted as Sheets requires. */
export function a1(title: string, cells: string): string {
  return `'${title.replace(/'/g, "''")}'!${cells}`
}

/** Sheet row number (2 = first data row) whose column A equals the key, or null. */
export function findRowNumber(columnA: string[][] | undefined, key: string): number | null {
  const index = (columnA ?? []).findIndex((row) => row[0] === key)
  return index === -1 ? null : index + 2
}

export class SheetsClient {
  private token: { value: string; expiresAt: number } | null = null
  private readonly sheetIds = new Map<string, number>()
  private readonly headersWritten = new Set<string>()

  constructor(
    private readonly config: SheetsConfig,
    private readonly now: () => number = () => Date.now(),
  ) {}

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > this.now()) return this.token.value
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: createAssertion(this.config, Math.floor(this.now() / 1000)),
      }),
    })
    const body = (await response.json().catch(() => ({}))) as {
      access_token?: string
      expires_in?: number
    }
    if (!response.ok || !body.access_token) {
      throw new Error(`Google authentication failed (${response.status})`)
    }
    this.token = {
      value: body.access_token,
      expiresAt: this.now() + ((body.expires_in ?? 3600) - 60) * 1000,
    }
    return body.access_token
  }

  private async call<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const response = await fetch(
      `${this.config.apiBase}/v4/spreadsheets/${this.config.spreadsheetId}${path}`,
      {
        method: init.method ?? 'GET',
        headers: {
          Authorization: `Bearer ${await this.accessToken()}`,
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: init.body ? JSON.stringify(init.body) : undefined,
      },
    )
    const body = (await response.json().catch(() => ({}))) as T & {
      error?: { status?: string }
    }
    if (!response.ok) {
      // Google's status code only (e.g. PERMISSION_DENIED): never the sent data.
      throw new Error(
        `Google Sheets API ${response.status}${body.error?.status ? ` ${body.error.status}` : ''}`,
      )
    }
    return body
  }

  private values(range: string, suffix = '') {
    return `/values/${encodeURIComponent(range)}${suffix}`
  }

  /** Id of an existing tab, or undefined (reads the tab list once per process). */
  private async existingSheetId(title: string): Promise<number | undefined> {
    if (!this.sheetIds.has(title)) {
      const spreadsheet = await this.call<{
        sheets?: { properties: { sheetId: number; title: string } }[]
      }>('?fields=sheets.properties(sheetId,title)')
      for (const sheet of spreadsheet.sheets ?? []) {
        this.sheetIds.set(sheet.properties.title, sheet.properties.sheetId)
      }
    }
    return this.sheetIds.get(title)
  }

  /** Creates the tab when missing and writes its header row (once per process). */
  async ensureTab(title: string, header: string[]): Promise<number> {
    if ((await this.existingSheetId(title)) === undefined) {
      const added = await this.call<{
        replies?: { addSheet?: { properties: { sheetId: number } } }[]
      }>(':batchUpdate', {
        method: 'POST',
        body: { requests: [{ addSheet: { properties: { title } } }] },
      })
      const sheetId = added.replies?.[0]?.addSheet?.properties.sheetId
      if (sheetId === undefined) throw new Error('Google Sheets did not create the tab')
      this.sheetIds.set(title, sheetId)
    }
    if (!this.headersWritten.has(title)) {
      await this.call(this.values(a1(title, 'A1'), '?valueInputOption=RAW'), {
        method: 'PUT',
        body: { majorDimension: 'ROWS', values: [header] },
      })
      this.headersWritten.add(title)
    }
    return this.sheetIds.get(title) as number
  }

  private async rowNumber(title: string, key: string): Promise<number | null> {
    const column = await this.call<{ values?: string[][] }>(this.values(a1(title, 'A2:A')))
    return findRowNumber(column.values, key)
  }

  /** Updates the row whose column A is `row[0]`, or appends it. */
  async upsertRow(title: string, header: string[], row: string[]): Promise<'updated' | 'added'> {
    await this.ensureTab(title, header)
    const existing = await this.rowNumber(title, row[0] ?? '')
    if (existing) {
      await this.call(this.values(a1(title, `A${existing}`), '?valueInputOption=RAW'), {
        method: 'PUT',
        body: { majorDimension: 'ROWS', values: [row] },
      })
      return 'updated'
    }
    await this.call(
      this.values(a1(title, 'A1'), ':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS'),
      { method: 'POST', body: { majorDimension: 'ROWS', values: [row] } },
    )
    return 'added'
  }

  /** Removes the row whose column A equals the key; nothing when absent (no tab is created). */
  async deleteRow(title: string, key: string): Promise<boolean> {
    const sheetId = await this.existingSheetId(title)
    if (sheetId === undefined) return false
    const existing = await this.rowNumber(title, key)
    if (!existing) return false
    await this.call(':batchUpdate', {
      method: 'POST',
      body: {
        requests: [
          {
            deleteDimension: {
              range: { sheetId, dimension: 'ROWS', startIndex: existing - 1, endIndex: existing },
            },
          },
        ],
      },
    })
    return true
  }

  /** Rewrites a whole tab: header + rows. */
  async replaceAll(title: string, header: string[], rows: string[][]): Promise<void> {
    await this.ensureTab(title, header)
    await this.call(this.values(a1(title, 'A:Z'), ':clear'), { method: 'POST', body: {} })
    await this.call(this.values(a1(title, 'A1'), '?valueInputOption=RAW'), {
      method: 'PUT',
      body: { majorDimension: 'ROWS', values: [header, ...rows] },
    })
  }
}

/* -------------------------------------------------------------------------- */
/* Records                                                                    */
/* -------------------------------------------------------------------------- */

export function sheetHeader(collection: ExportCollection): string[] {
  return ['ID', ...(exportRows(collection, [], 'fr')[0] ?? [])]
}

export function sheetRow(collection: ExportCollection, doc: Doc): string[] {
  return [String(doc.id), ...(exportRows(collection, [doc], 'fr')[1] ?? [])]
}

/** Unconfirmed newsletter sign-ups stay out of the spreadsheet. */
export function belongsInSheet(collection: ExportCollection, doc: Doc): boolean {
  return collection !== 'subscribers' || doc.status === 'confirmed' || doc.status === 'unsubscribed'
}

let sharedClient: { key: string; client: SheetsClient } | null = null
let queue: Promise<unknown> = Promise.resolve()

function client(config: SheetsConfig): SheetsClient {
  const key = `${config.spreadsheetId}|${config.clientEmail}|${config.apiBase}`
  if (sharedClient?.key !== key) sharedClient = { key, client: new SheetsClient(config) }
  return sharedClient.client
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.catch(() => undefined)
  return run
}

/**
 * Copies one change to the spreadsheet (called by the collection hooks).
 * Never throws: a Google outage must not break the contact form.
 */
export function queueSheetsSync(
  action: 'upsert' | 'delete',
  collection: ExportCollection,
  doc: Doc,
): Promise<void> {
  const config = readSheetsConfig()
  if (!sheetsReady(config)) return Promise.resolve()
  const sheets = client(config)
  const title = SHEET_TABS[collection]
  const header = sheetHeader(collection)

  return enqueue(async () => {
    if (action === 'delete' || !belongsInSheet(collection, doc)) {
      await sheets.deleteRow(title, String(doc.id))
    } else {
      await sheets.upsertRow(title, header, sheetRow(collection, doc))
    }
  }).catch((error: unknown) => {
    console.error(
      `[sheets] ${collection} ${action} failed:`,
      error instanceof Error ? error.message : 'unknown error',
    )
  })
}

/** Rewrites both tabs from the CMS (button "Tout resynchroniser"). */
export async function fullSheetsSync(payload: Payload): Promise<Record<ExportCollection, number>> {
  const config = readSheetsConfig()
  if (!sheetsReady(config)) throw new Error('Google Sheets is not configured')
  const sheets = client(config)

  return enqueue(async () => {
    const counts = {} as Record<ExportCollection, number>
    for (const collection of EXPORT_COLLECTIONS) {
      const docs: Doc[] = []
      for (let page = 1; ; page += 1) {
        const result = await payload.find({
          collection,
          sort: '-createdAt',
          depth: 0,
          limit: 500,
          page,
          overrideAccess: true,
        })
        docs.push(...(result.docs as unknown as Doc[]))
        if (!result.hasNextPage) break
      }
      const rows = docs
        .filter((doc) => belongsInSheet(collection, doc))
        .map((doc) => sheetRow(collection, doc))
      await sheets.replaceAll(SHEET_TABS[collection], sheetHeader(collection), rows)
      counts[collection] = rows.length
    }
    return counts
  })
}
