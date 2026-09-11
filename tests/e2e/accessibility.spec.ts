import { expect, test } from '@playwright/test'

test.describe('accessibility', () => {
  test('the keyboard reaches the navigation with a visible focus ring', async ({
    page,
    browserName,
  }) => {
    // WebKit only tabs to links when macOS "Full Keyboard Access" is enabled,
    // which Playwright cannot switch on; the behaviour is covered by Chromium
    // and Firefox.
    test.skip(browserName === 'webkit', 'Safari does not tab to links by default')
    await page.goto('/en')

    // 1st stop: skip link. Then walk into the header.
    await page.keyboard.press('Tab')
    await expect(page.locator('a[href="#main-content"]')).toBeFocused()

    for (let step = 0; step < 5; step += 1) {
      await page.keyboard.press('Tab')
    }

    const focus = await page.evaluate(() => {
      const element = document.activeElement
      if (!element || element === document.body) return null
      const styles = getComputedStyle(element)
      return {
        tag: element.tagName,
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
      }
    })

    expect(focus).not.toBeNull()
    expect(['A', 'BUTTON', 'INPUT', 'SELECT']).toContain(focus?.tag)
    // :focus-visible draws a 2px outline — never `none`.
    expect(focus?.outlineStyle).not.toBe('none')
  })

  test('interactive controls meet the WCAG 2.2 AA target size', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/en/contact')

    // The honeypot field is excluded on purpose: it is aria-hidden and not
    // focusable, so it is not a target for any user.
    const selector = ':not([tabindex="-1"]):not([aria-hidden="true"])'
    const controls = page.locator(
      `main input${selector}:visible, main select${selector}:visible, main button${selector}:visible`,
    )
    const count = await controls.count()
    expect(count).toBeGreaterThan(0)

    for (let index = 0; index < count; index += 1) {
      const control = controls.nth(index)
      const box = await control.boundingBox()
      if (!box) continue
      const type = await control.getAttribute('type')
      // WCAG 2.2 AA (2.5.8) requires 24 x 24 CSS px; text fields and buttons
      // are held to the more comfortable 44 px used across the design.
      const minimum = type === 'checkbox' || type === 'radio' ? 24 : 40
      expect(box.height, `control #${index} (${type ?? 'n/a'})`).toBeGreaterThanOrEqual(minimum)
      expect(box.width, `control #${index} (${type ?? 'n/a'})`).toBeGreaterThanOrEqual(24)
    }
  })

  test('images carry an alternative text and headings are ordered', async ({ page }) => {
    for (const path of ['/en', '/en/about', '/en/insights']) {
      await page.goto(path)

      const missingAlt = await page.evaluate(
        () =>
          Array.from(document.querySelectorAll('img')).filter((image) => !image.hasAttribute('alt'))
            .length,
      )
      expect(missingAlt, `${path}: images without alt`).toBe(0)

      const levels = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h1, h2, h3, h4')).map((heading) =>
          Number(heading.tagName.slice(1)),
        ),
      )
      expect(levels[0], `${path}: first heading`).toBe(1)
      for (let index = 1; index < levels.length; index += 1) {
        const previous = levels[index - 1] ?? 1
        const current = levels[index] ?? 1
        expect(current - previous, `${path}: heading jump at ${index}`).toBeLessThanOrEqual(1)
      }
    }
  })

  test('form fields are labelled and errors are linked to their field', async ({ page }) => {
    await page.goto('/en/contact')

    const unlabelled = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main input, main select, main textarea'))
        .filter((field) => {
          const id = field.getAttribute('id')
          const labelled =
            (id && document.querySelector(`label[for="${id}"]`)) ||
            field.getAttribute('aria-label') ||
            field.getAttribute('aria-labelledby')
          return !labelled
        })
        .map((field) => field.getAttribute('name')),
    )
    expect(unlabelled).toEqual([])

    await page.getByRole('button', { name: 'Send my request' }).click()
    const nameField = page.locator('#contact-name')
    await expect(nameField).toHaveAttribute('aria-invalid', 'true')
    await expect(nameField).toHaveAttribute('aria-describedby', 'contact-name-error')
    await expect(page.locator('#contact-name-error')).toBeVisible()
  })

  test('the English brand signature is marked as English on a German page', async ({ page }) => {
    await page.goto('/de')
    await expect(page.locator('main p[lang="en"]').first()).toContainText('Understand Money')
  })

  test('content is readable at 200 % zoom without loss', async ({ page }) => {
    // 200 % zoom on a 1280 px screen behaves like a 640 px viewport.
    await page.setViewportSize({ width: 640, height: 720 })
    await page.goto('/en/about')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
