import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 8,
    reporter: 'html',
    use: {
        trace: 'on-first-retry',
        coverage: 'on',
        screenshot: "only-on-failure",
        // headless: false,
    },

    projects: [
        {
            name: 'chromium',
            use: devices['Desktop Chrome'],
            workers: 7
        },
        {
            name: 'firefox',
            use: devices['Desktop Firefox'],
            workers: 1
        },
        {
            name: 'webkit',
            use: devices['Desktop Safari'],
            workers: 7
        },
        {
            name: 'Mobile Chrome',
            use: devices['Pixel 5'],
            workers: 7
        },
        {
            name: 'Mobile Safari',
            use: devices['iPhone 12'],
            workers: 7
        }
    ],

    webServer: {
        command: 'npm start',
        port: 5173,
        reuseExistingServer: true,
        timeout: 120 * 1000,
    },
});

