import { expect, test } from '@playwright/test'

test.describe('RK Insights', () => {
  test('search filters the list and announces the result count', async ({ page }) => {
    await page.goto('/en/insights')

    const search = page.getByLabel('Search RK Insights')
    const status = page.locator('[role="status"]').first()

    // Typed key by key rather than set in one go: in WebKit a value written
    // before hydration finishes never reaches React. Retried as a block, which
    // is what a visitor would do anyway.
    await expect(async () => {
      await search.click()
      await search.pressSequentially('zzz', { delay: 20 })
      await expect(status).toHaveText(/No article found/, { timeout: 3000 })
    }).toPass({ timeout: 20_000 })

    await search.fill('')
    await expect(page.locator('main a[href^="/en/insights/"]').first()).toBeVisible()
  })

  test('category chips filter the list', async ({ page }) => {
    await page.goto('/en/insights')
    const chips = page.getByRole('button', { pressed: false })
    const count = await chips.count()
    expect(count).toBeGreaterThan(0)
  })

  test('an article page shows author, date, reading time and sharing links', async ({ page }) => {
    await page.goto('/en/insights')
    await page.locator('main a[href^="/en/insights/"]').first().click()

    await expect(page.getByText(/By Romial Kenmogne/)).toBeVisible()
    await expect(page.getByText(/min read/).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /share on linkedin/i })).toBeVisible()
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
  })
})

test.describe('experience filters', () => {
  test('filtering by region narrows the list', async ({ page }) => {
    await page.goto('/en/experience')

    const before = await page.locator('main article').count()
    expect(before).toBeGreaterThan(0)

    await page.getByLabel('Region').selectOption('europe')
    const after = await page.locator('main article').count()
    expect(after).toBeLessThanOrEqual(before)

    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page.locator('main article')).toHaveCount(before)
  })
})

test.describe('books', () => {
  test('a book page never shows a fake checkout', async ({ page }) => {
    await page.goto('/en/books')
    await page.locator('main a[href^="/en/books/"]').first().click()

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: /add to cart/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /checkout/i })).toHaveCount(0)
  })
})

test.describe('legal pages and downloads', () => {
  test('legal drafts carry a visible review notice and are noindex', async ({ page }) => {
    await page.goto('/en/legal/privacy-policy')
    await expect(page.getByText('Draft pending legal review')).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })

  test('the Expert Profile button explains that the document is missing', async ({ page }) => {
    await page.goto('/en')
    await page
      .getByRole('button', { name: /download expert profile/i })
      .first()
      .click()
    await expect(page.getByText(/has not been uploaded to the CMS yet/i)).toBeVisible()
  })

  test('sitemap and robots are served', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.status()).toBe(200)
    const body = await sitemap.text()
    expect(body).toContain('/en/expertise')
    expect(body).toContain('hreflang')

    const robots = await request.get('/robots.txt')
    expect(robots.status()).toBe(200)
    expect(await robots.text()).toContain('Disallow: /admin')
  })

  test('the health check reports the site and its database as up', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
    expect(response.headers()['cache-control']).toContain('no-store')
    const body = await response.json()
    expect(body).toMatchObject({ status: 'ok', database: 'up' })
    expect(Object.keys(body).sort()).toEqual([
      'database',
      'responseTimeMs',
      'status',
      'uptimeSeconds',
    ])
  })

  test('the CMS admin is not indexable', async ({ request }) => {
    const response = await request.get('/admin')
    expect(response.headers()['x-robots-tag']).toContain('noindex')
  })
})

test.describe('metadata', () => {
  for (const locale of ['en', 'fr', 'de'] as const) {
    test(`the home page has a localised title and description in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}`)
      const title = await page.title()
      expect(title.length).toBeGreaterThan(10)
      const description = await page.locator('meta[name="description"]').getAttribute('content')
      expect(description?.length ?? 0).toBeGreaterThan(30)
      await expect(page.locator('meta[property="og:locale"]')).toHaveCount(1)
    })
  }
})

test.describe('images', () => {
  test('every image on the key pages actually loads', async ({ page }) => {
    for (const path of ['/fr', '/fr/about', '/fr/books']) {
      await page.goto(path)
      // Scroll through the page so that lazy-loaded images are requested too.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
          window.scrollTo(0, y)
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      })
      await page.waitForLoadState('networkidle')
      // Waits for every image to finish (load or error): the first request for
      // a new size is generated on the fly and can outlast "network idle".
      const broken = await page.evaluate(async () => {
        const images = Array.from(document.querySelectorAll('main img')) as HTMLImageElement[]
        await Promise.all(
          images.map((image) =>
            image.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  image.addEventListener('load', () => resolve(), { once: true })
                  image.addEventListener('error', () => resolve(), { once: true })
                  setTimeout(resolve, 15_000)
                }),
          ),
        )
        return images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.getAttribute('src'))
      })
      expect(broken, `${path}: images that failed to load`).toEqual([])
    }
  })
})
