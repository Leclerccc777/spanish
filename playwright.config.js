const { defineConfig, devices } = require('@playwright/test');
const fs = require('node:fs');
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4173', launchOptions: { executablePath }, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ],
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 15000 }
});
