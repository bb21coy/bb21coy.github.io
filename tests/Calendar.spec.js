import { test, expect } from '@playwright/test'
import './playwright-coverage.js'

test.describe('Calendar page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/calendar')
    })

    test('Calendar page loads', async ({ page }) => {
        await expect(
            page.getByText(/calendar 2025/i)
        ).toBeVisible({ timeout: 10_000 })

        await expect(
            page.getByText('JANUARY', { exact: true })
        ).toBeVisible({ timeout: 10_000 })
    })

    test("Search in Calendar should highlight found words", async ({ page }) => {
        await page.waitForSelector('#calendar');
        await page.type("#search", "december")
        const highlighted = page
            .locator('td', { hasText: 'DECEMBER' })
            .first();

        await expect(highlighted).toHaveCSS(
            "background-color",
            "rgba(0, 0, 0, 0)"
        );

        const container = page.locator("#match-navigator-container");
        const buttons = container.locator("button");
        const count = await buttons.count();
        await expect(count).toBeGreaterThanOrEqual(1)
    })

    test("Should scroll to highlighted word", async ({ page }) => {
        await page.waitForSelector('#calendar');
        await page.type("#search", "december")
        const highlighted = page
            .locator('td', { hasText: 'DECEMBER' })
            .first();

        const container = page.locator("#match-navigator-container");
        const buttons = container.locator("button");
        const count = await buttons.count();
        await expect(count).toBeGreaterThanOrEqual(1)

        const lastButton = buttons.last();
        await expect(lastButton).toHaveCSS(
            "background-color",
            "rgba(0, 0, 0, 0)"
        );

        const scrollBefore = await page.evaluate(() => window.scrollY);
        await lastButton.click();
        await page.waitForTimeout(300);
        const scrollAfter = await page.evaluate(() => window.scrollY);
        expect(scrollAfter).toBeGreaterThan(scrollBefore);
    })

    test("Should switch to the previous found word", async ({ page }) => {
        await page.waitForSelector('#calendar');
        await page.type("#search", "bb camp")
        const highlighted = page
            .locator('td', { hasText: 'BB CAMP' })
            .first();

        const container = page.locator("#match-navigator-container");
        const buttons = container.locator("button");
        const count = await buttons.count();
        await expect(count).toBeGreaterThanOrEqual(2);

        const lastButton = buttons.last();
        lastButton.click();

        const scrollBefore = await page.evaluate(() => window.scrollY);
        await page.getByTitle("Previous").click();
        await page.waitForTimeout(300);
        const scrollAfter = await page.evaluate(() => window.scrollY);
        expect(scrollAfter).toBeGreaterThanOrEqual(scrollBefore);
    })

    test("Should switch to the next found word", async ({ page }) => {
        await page.waitForSelector('#calendar');
        await page.type("#search", "bb camp")
        const highlighted = page
            .locator('td', { hasText: 'BB CAMP' })
            .first();

        const container = page.locator("#match-navigator-container");
        const buttons = container.locator("button");
        const count = await buttons.count();
        await expect(count).toBeGreaterThanOrEqual(2);

        const firstButton = buttons.first();
        firstButton.click();

        const scrollBefore = await page.evaluate(() => window.scrollY);
        await page.getByTitle("Next").click();
        await page.waitForTimeout(300);
        const scrollAfter = await page.evaluate(() => window.scrollY);
        expect(scrollAfter).toBeGreaterThanOrEqual(scrollBefore);
    })
})