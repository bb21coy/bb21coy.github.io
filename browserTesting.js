import { webkit, devices } from '@playwright/test';

const iPhone = devices['iPhone 14'];

test('iOS Safari UI behavior', async ({ page }) => {
  const browser = await webkit.launch();
  const context = await browser.newContext({ ...iPhone });
  const page = await context.newPage();
  await page.goto('https://your-site.com');
});
