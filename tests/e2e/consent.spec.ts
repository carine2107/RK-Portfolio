import { expect, test } from '@playwright/test'

/**
 * The test build has no analytics configured: no banner, no Google request,
 * no cookie other than the site's own. The consent flow with Google Analytics
 * enabled is checked manually (docs/RAPPORT_TESTS.md).
 */
test.describe('audience measurement without configuration', () => {
  test('no consent banner, no Google request and no tracking cookie', async ({ page, context }) => {
    const google: string[] = []
    page.on('request', (request) => {
      if (/google-analytics|googletagmanager|doubleclick/.test(request.url())) {
        google.push(request.url())
      }
    })
    await page.goto('/fr')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Mesure d’audience' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Paramètres des cookies' })).toHaveCount(0)
    expect(google).toEqual([])
    const cookies = await context.cookies()
    expect(cookies.filter((cookie) => /^_ga|^_gid/.test(cookie.name))).toEqual([])
  })

  test('the security policy does not allow Google scripts', async ({ request }) => {
    const response = await request.get('/en')
    expect(response.headers()['content-security-policy']).not.toContain('googletagmanager')
  })
})
