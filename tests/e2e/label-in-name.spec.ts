import { createRequire } from 'module'

import { expect, test } from '@playwright/test'

/**
 * axe-core checks found by the Lighthouse audit:
 * - WCAG 2.5.3 Label in Name: a link's accessible name contains its visible
 *   text (voice-control users say what they see, e.g. "DE");
 * - heading order: no level is skipped under the page title.
 */
const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js')

const PAGES = ['/fr', '/de', '/fr/books', '/en/contact']

for (const path of PAGES) {
  test(`${path}: accessible names match visible labels and headings are ordered`, async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Audited once, in Chromium')
    await page.goto(path, { waitUntil: 'networkidle' })
    await page.addScriptTag({ path: axePath })

    const violations = await page.evaluate(async () => {
      type Node = { target: string[] }
      type Axe = {
        run: (
          context: Document,
          options: { runOnly: string[] },
        ) => Promise<{ violations: { id: string; nodes: Node[] }[] }>
      }
      const { axe } = window as unknown as { axe: Axe }
      const result = await axe.run(document, {
        runOnly: ['label-content-name-mismatch', 'heading-order'],
      })
      return result.violations.flatMap((violation) =>
        violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')}`),
      )
    })

    expect(violations, path).toEqual([])
  })
}

test('the header home link keeps its name on a very narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/fr')
  await expect(page.getByRole('link', { name: /^Romial Kenmogne — Accueil$/ })).toBeVisible()
})
