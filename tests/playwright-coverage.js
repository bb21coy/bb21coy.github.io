import { test } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

// Global array to store JavaScript coverage data across tests
let jsCoverage = [];

// Directory where coverage files will be saved
const coverageDir = path.join(process.cwd(), 'coverage/temp');

test.beforeEach(async ({ page, browserName }) => {
  // Only enable JS coverage for Chromium browsers since coverage is browser-specific
  if (browserName === 'chromium') {
    // Start collecting JavaScript coverage for the page
    await page.coverage.startJSCoverage();
  }
});

test.afterEach(async ({ page, browserName }, testInfo) => {
  if (browserName !== 'chromium') return;

  const coverage = await page.coverage.stopJSCoverage();
  await fs.mkdir(coverageDir, { recursive: true });

  const safeTitle = testInfo.title.replace(/\W+/g, '_');

  const filePath = path.join(
    coverageDir,
    `v8-${safeTitle}-w${testInfo.workerIndex}.json`
  );

  await fs.writeFile(
    filePath,
    JSON.stringify(coverage, null, 2),
    'utf-8'
  );
});

