import { createRequire } from 'module'

import { expect, test } from '@playwright/test'

/**
 * Real-page colour contrast audit (axe-core, WCAG 2.2 AA) in both themes.
 * Complements the token-level unit tests: it catches a text colour used on a
 * surface it was not designed for, whatever palette is set in the CMS.
 */
const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js')

const PAGES = ['/fr', '/fr/about', '/fr/businesses', '/fr/books', '/fr/insights', '/fr/contact']

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`colour contrast — ${colorScheme} theme`, () => {
    test.use({ colorScheme })

    for (const path of PAGES) {
      test(`${path} has no contrast violation`, async ({ page, browserName }) => {
        // One engine is enough: contrast does not depend on the browser.
        test.skip(browserName !== 'chromium', 'Audited once, in Chromium')
        await page.goto(path, { waitUntil: 'networkidle' })
        await page.addScriptTag({ path: axePath })

        const violations = await page.evaluate(async () => {
          type Node = { target: string[]; any: { message: string }[] }
          type Axe = {
            run: (
              context: Document,
              options: { runOnly: string[] },
            ) => Promise<{ violations: { nodes: Node[] }[] }>
          }
          const { axe } = window as unknown as { axe: Axe }
          const result = await axe.run(document, { runOnly: ['color-contrast'] })
          return result.violations
            .flatMap((violation) => violation.nodes)
            .map((node) => `${node.target.join(' ')} — ${node.any[0]?.message ?? ''}`)
        })

        expect(violations, `${colorScheme} ${path}`).toEqual([])
      })
    }
  })
}
