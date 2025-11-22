import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',

    projects: [
        {
            name: 'Desktop Safari',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'iPhone Safari',
            use: { ...devices['iPhone 14'] }, // ← simulates iOS Safari
        },
        {
            name: 'Pixel Chrome',
            use: { ...devices['Pixel 7'] }, // ← simulates Android Chrome
        },
        {
            name: 'Desktop Chrome',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'Desktop Firefox',
            use: { ...devices['Desktop Firefox'] },
        },
    ],
});
