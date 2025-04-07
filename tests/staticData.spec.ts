import { test, expect } from '@playwright/test';

// We need to ensure we initialize the store properly 
test.beforeEach(async ({ page }) => {
  // Initialize the global store on each test page
  await page.addInitScript(() => {
    if (typeof window !== 'undefined') {
      // Flag to ensure we initialize just once
      window.__APP_STORE_INITIALIZED = false;
    }
  });
});

// Use the same timeout constant as the main app spec
const NORMAL_TIMEOUT = 100; // ms - for normal UI operations

// Wait for the store to be initialized before test begins
async function waitForStoreInitialization(page) {
  await page.waitForFunction(() => {
    return window.__appStore && window.__appMethods;
  }, { timeout: 2000 });
}

test('staticData is accessible in the app', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Check that the hardware panel shows correct data from staticData
  const hardwarePanel = page.locator('.hardware-panel');
  await expect(hardwarePanel).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(hardwarePanel).toContainText('Basic Computers');
  await expect(hardwarePanel).toContainText('FLOPS: 100');
  
  // Check that available tech cards are displayed
  const techCards = page.locator('.tech-card');
  await expect(techCards).toHaveCount(2, { timeout: NORMAL_TIMEOUT }); // discovery1 and discoveryA
});