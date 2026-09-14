import { createVerify, generateKeyPairSync } from 'crypto'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  a1,
  belongsInSheet,
  createAssertion,
  findRowNumber,
  readSheetsConfig,
  SheetsClient,
  sheetHeader,
  sheetRow,
  sheetsReady,
  type SheetsConfig,
} from '@/lib/google-sheets'

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
const PEM = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()

const config: SheetsConfig = {
  spreadsheetId: '1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789',
  clientEmail: 'site-sync@rk-site.iam.gserviceaccount.com',
  privateKey: PEM,
  tokenUrl: 'https://token.test/token',
  apiBase: 'https://sheets.test',
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('Google Sheets configuration', () => {
  it('is inactive until the three values are valid', () => {
    expect(sheetsReady(config)).toBe(true)
    expect(sheetsReady({ ...config, spreadsheetId: '' })).toBe(false)
    expect(sheetsReady({ ...config, clientEmail: 'me@gmail.com' })).toBe(false)
    expect(sheetsReady({ ...config, privateKey: 'not a key' })).toBe(false)
  })

  it('restores line breaks of a key pasted on one line', () => {
    vi.stubEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', PEM.replace(/\n/g, '\\n'))
    expect(readSheetsConfig().privateKey).toBe(PEM)
  })

  it('never lets production talk to another endpoint than Google', () => {
    vi.stubEnv('GOOGLE_SHEETS_API_BASE', 'http://127.0.0.1:4399')
    vi.stubEnv('NODE_ENV', 'production')
    expect(readSheetsConfig().apiBase).toBe('https://sheets.googleapis.com')
  })
})

describe('service account assertion', () => {
  it('is a JWT signed with the private key, limited to spreadsheets', () => {
    const jwt = createAssertion(config, 1_800_000_000)
    const [header, claims, signature] = jwt.split('.') as [string, string, string]
    const verifier = createVerify('RSA-SHA256')
    verifier.update(`${header}.${claims}`)
    expect(verifier.verify(publicKey, signature, 'base64url')).toBe(true)
    expect(JSON.parse(Buffer.from(claims, 'base64url').toString())).toEqual({
      iss: config.clientEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: config.tokenUrl,
      iat: 1_800_000_000,
      exp: 1_800_003_600,
    })
  })
})

describe('rows', () => {
  it('quotes tab titles in ranges and finds rows by id', () => {
    expect(a1("Abonnés l'été", 'A2:A')).toBe("'Abonnés l''été'!A2:A")
    expect(findRowNumber([['12'], ['7'], ['3']], '7')).toBe(3)
    expect(findRowNumber(undefined, '7')).toBeNull()
  })

  it('uses the export columns with the id first, and keeps pending sign-ups out', () => {
    expect(sheetHeader('subscribers').slice(0, 3)).toEqual(['ID', 'E-mail', 'Langue'])
    expect(
      sheetRow('subscribers', { id: 4, email: 'a@b.c', status: 'confirmed' }).slice(0, 2),
    ).toEqual(['4', 'a@b.c'])
    expect(belongsInSheet('subscribers', { status: 'pending' })).toBe(false)
    expect(belongsInSheet('subscribers', { status: 'unsubscribed' })).toBe(true)
    expect(belongsInSheet('contact-submissions', {})).toBe(true)
  })
})

describe('Sheets client', () => {
  type Call = { method: string; url: string; body: unknown }

  function fakeGoogle(columnA: string[][], tabs = [{ sheetId: 7, title: 'Demandes de contact' }]) {
    const calls: Call[] = []
    const fetchMock = vi.fn(async (input: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET'
      const body =
        typeof init?.body === 'string' && init.body.startsWith('{')
          ? JSON.parse(init.body)
          : init?.body
      calls.push({ method, url: decodeURIComponent(input), body })
      const json = (value: unknown) => new Response(JSON.stringify(value), { status: 200 })
      if (input === config.tokenUrl) return json({ access_token: 'token-1', expires_in: 3600 })
      if (input.includes('?fields=sheets'))
        return json({ sheets: tabs.map((properties) => ({ properties })) })
      if (input.endsWith(':batchUpdate'))
        return json({ replies: [{ addSheet: { properties: { sheetId: 42 } } }] })
      if (method === 'GET' && input.includes('A2%3AA')) return json({ values: columnA })
      return json({})
    })
    vi.stubGlobal('fetch', fetchMock)
    return calls
  }

  const header = ['ID', 'Nom']

  it('appends a new row, then updates it in place, with one token', async () => {
    const calls = fakeGoogle([['1'], ['2']])
    const sheets = new SheetsClient(config)

    expect(await sheets.upsertRow('Demandes de contact', header, ['9', 'Jane'])).toBe('added')
    expect(await sheets.upsertRow('Demandes de contact', header, ['2', 'John'])).toBe('updated')

    expect(calls.filter((call) => call.url === config.tokenUrl)).toHaveLength(1)
    const append = calls.find((call) => call.url.includes(':append'))
    expect(append?.url).toContain("'Demandes de contact'!A1:append?valueInputOption=RAW")
    expect(append?.body).toEqual({ majorDimension: 'ROWS', values: [['9', 'Jane']] })
    const update = calls.find((call) => call.method === 'PUT' && call.url.includes('!A3'))
    expect(update?.body).toEqual({ majorDimension: 'ROWS', values: [['2', 'John']] })
    // Header written once, as raw text.
    expect(calls.filter((call) => call.method === 'PUT' && call.url.includes('!A1?'))).toHaveLength(
      1,
    )
    // Every Sheets call is authenticated.
    const auth = vi
      .mocked(fetch)
      .mock.calls.filter(([url]) => String(url).startsWith(config.apiBase))
      .map(([, init]) => (init?.headers as Record<string, string>).Authorization)
    expect(new Set(auth)).toEqual(new Set(['Bearer token-1']))
  })

  it('deletes the matching row by index and ignores unknown ids', async () => {
    const calls = fakeGoogle([['5'], ['6']])
    const sheets = new SheetsClient(config)

    expect(await sheets.deleteRow('Demandes de contact', '6')).toBe(true)
    expect(await sheets.deleteRow('Demandes de contact', '99')).toBe(false)

    const deletions = calls.filter((call) => call.url.endsWith(':batchUpdate'))
    expect(deletions).toHaveLength(1)
    expect(deletions[0]?.body).toEqual({
      requests: [
        {
          deleteDimension: { range: { sheetId: 7, dimension: 'ROWS', startIndex: 2, endIndex: 3 } },
        },
      ],
    })
  })

  it('never creates a tab just to delete a row that cannot exist', async () => {
    const calls = fakeGoogle([], [])
    expect(await new SheetsClient(config).deleteRow('Abonnés newsletter', '3')).toBe(false)
    expect(calls.some((call) => call.url.endsWith(':batchUpdate'))).toBe(false)
    expect(calls.some((call) => call.method === 'PUT')).toBe(false)
  })

  it('creates a missing tab before writing', async () => {
    const calls = fakeGoogle([], [])
    await new SheetsClient(config).upsertRow('Abonnés newsletter', header, ['1', 'a'])
    const create = calls.find((call) => call.url.endsWith(':batchUpdate'))
    expect(create?.body).toEqual({
      requests: [{ addSheet: { properties: { title: 'Abonnés newsletter' } } }],
    })
  })

  it('reports Google errors without the data sent', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) =>
        input === config.tokenUrl
          ? new Response(JSON.stringify({ access_token: 't' }), { status: 200 })
          : new Response(JSON.stringify({ error: { status: 'PERMISSION_DENIED' } }), {
              status: 403,
            }),
      ),
    )
    await expect(
      new SheetsClient(config).upsertRow('Demandes de contact', header, [
        '1',
        'secret@example.com',
      ]),
    ).rejects.toThrow(/^Google Sheets API 403 PERMISSION_DENIED$/)
  })
})
