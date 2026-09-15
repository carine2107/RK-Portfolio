import { createRequire } from 'module'

import { expect, test } from '@playwright/test'

/**
 * Findings of the in-depth accessibility audit (15/09/2026):
 * - clickable cards showed no keyboard focus (WCAG 2.4.7);
 * - card titles skipped a heading level on the expertise and ventures lists;
 * - the 404 page repeated the name of the main navigation landmark.
 * The full axe rule set (WCAG 2.2 AA + best practices) guards against regressions.
 */
const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js')

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
const PAGES = [
  '/fr',
  '/fr/expertise',
  '/fr/businesses',
  '/fr/insights',
  '/fr/contact',
  '/fr/cette-page-nexiste-pas',
]

test.describe('accessibility audit', () => {
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Audited once, in Chromium')
  })

  for (const path of PAGES) {
    test(`${path}: no axe violation (WCAG 2.2 AA and best practices)`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'load' })
      // Audit the page once its main heading is rendered (an unknown detail entry
      // is still completed by JavaScript, see RAPPORT_TESTS, known limits).
      await page.locator('html[lang] main h1').first().waitFor()
      await page.addScriptTag({ path: axePath })

      const violations = await page.evaluate(async (tags) => {
        type Result = { violations: { id: string; nodes: { target: string[] }[] }[] }
        const { axe } = window as unknown as {
          axe: { run: (context: Document, options: object) => Promise<Result> }
        }
        const result = await axe.run(document, { runOnly: tags, resultTypes: ['violations'] })
        return result.violations.flatMap((violation) =>
          violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')}`),
        )
      }, TAGS)

      expect(violations, path).toEqual([])
    })
  }

  test('a card link shows a visible focus ring around its card', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/fr/insights', { waitUntil: 'load' })

    const link = page.locator('[data-card-link]').first()
    // Reach the card link with the keyboard: focus the element before it, then Tab.
    await link.evaluate((element) => {
      const focusable = [
        ...document.querySelectorAll<HTMLElement>(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ]
      focusable[focusable.indexOf(element as HTMLElement) - 1]?.focus()
    })
    await page.keyboard.press('Tab')
    await expect(link).toBeFocused()

    const ring = await link.evaluate((element) => {
      const card = element.closest('article') as HTMLElement
      const style = getComputedStyle(card)
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) }
    })
    expect(ring.style).not.toBe('none')
    expect(ring.width).toBeGreaterThanOrEqual(2)
  })

  test('a mouse click on a card draws no focus ring', async ({ page }) => {
    await page.goto('/fr/insights', { waitUntil: 'load' })
    const link = page.locator('[data-card-link]').first()
    await link.hover()
    await page.mouse.down()
    const style = await link.evaluate(
      (element) => getComputedStyle(element.closest('article') as HTMLElement).outlineStyle,
    )
    await page.mouse.up()
    expect(style).toBe('none')
  })
})
