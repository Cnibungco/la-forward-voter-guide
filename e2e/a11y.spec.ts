import AxeBuilder from '@axe-core/playwright'
import {expect, test, type Page} from '@playwright/test'

/** Must match `MATCH_STORAGE_KEY` in `lib/matchStorage.ts`. District match only — never a street. */
const MATCH_STORAGE_KEY = 'la-forward-voter-guide:match'

/**
 * WCAG 2.2 AA tags only — skip axe "best-practice" so the suite stays a
 * regression gate, not a style-opinion linter.
 *
 * Google Translate and Geoapify own their own DOM. Exclude them rather
 * than try to make those widgets pass; see README "Testing".
 */
async function blockingViolations(page: Page) {
  const results = await new AxeBuilder({page})
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .exclude('#google_translate_element')
    .exclude('.goog-te-banner-frame')
    .exclude('.geoapify-autocomplete-items')
    .options({iframes: false})
    .analyze()

  return results.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
}

function formatViolations(violations: Awaited<ReturnType<typeof blockingViolations>>): string {
  if (violations.length === 0) return ''
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `    ${node.target.join(' ')}${node.failureSummary ? `\n      ${node.failureSummary}` : ''}`)
        .join('\n')
      return `${violation.id} (${violation.impact}): ${violation.help}\n${nodes}`
    })
    .join('\n\n')
}

async function expectNoBlocking(page: Page) {
  const blocking = await blockingViolations(page)
  expect(formatViolations(blocking), 'axe critical/serious violations').toBe('')
}

/** Google Translate's script often never fires `load`; don't wait for it. */
async function openPage(page: Page, path: string) {
  await page.goto(path, {waitUntil: 'domcontentloaded'})
  await expect(page.locator('h1').first()).toBeVisible()
}

/** Expand one accordion and the compact legend so collapsed copy is in the tree. */
async function revealGuideContent(page: Page) {
  const summary = page.locator('summary').first()
  if (await summary.count()) await summary.click()

  const legend = page.getByRole('button', {name: 'What do the ratings mean?'})
  if (await legend.count()) await legend.click()
}

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  test('landing', async ({page}) => {
    await openPage(page, '/')
    const about = page.locator('summary').first()
    if (await about.count()) await about.click()
    await expectNoBlocking(page)
  })

  test('cities', async ({page}) => {
    await openPage(page, '/cities')
    await expectNoBlocking(page)
  })

  test('guide jurisdiction', async ({page}) => {
    await openPage(page, '/')
    const href = await page.locator('a[href^="/guide/"]').first().getAttribute('href')
    test.skip(!href, 'landing has no jurisdiction links to scan')
    await openPage(page, href!)
    await revealGuideContent(page)
    await expectNoBlocking(page)
  })

  test('ballot (seeded district match, no street address)', async ({page}) => {
    await page.addInitScript((key: string) => {
      sessionStorage.setItem(
        key,
        JSON.stringify({
          precision: 'precise',
          citySlug: 'los-angeles',
          districtCodes: ['CD34', 'SD26', 'AD54', 'SUP1', 'CC14'],
        }),
      )
    }, MATCH_STORAGE_KEY)

    await openPage(page, '/ballot')
    await revealGuideContent(page)
    await expectNoBlocking(page)
  })

  test('outside coverage', async ({page}) => {
    await openPage(page, '/outside')
    await expectNoBlocking(page)
  })

  test('not-found', async ({page}) => {
    await openPage(page, '/this-page-does-not-exist')
    await expectNoBlocking(page)
  })
})
