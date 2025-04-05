import { test, expect } from '@playwright/test';

// We need to ensure we initialize the store properly 
// The page context in Playwright doesn't get the initialization from main.ts
test.beforeEach(async ({ page }) => {
  // Initialize the global store on each test page
  await page.addInitScript(() => {
    if (typeof window !== 'undefined') {
      // Flag to ensure we initialize just once
      window.__APP_STORE_INITIALIZED = false;
      
      // Clear any localStorage data to ensure tests start fresh
      localStorage.removeItem('marchOfMindSave');
    }
  });
});

// IMPORTANT: App should respond very quickly, so all waitForSelector calls should have a 
// short timeout. Longer timeouts hide performance issues.
// DO NOT CHANGE THESE TIMEOUT VALUES - they are intentionally short to catch reactivity issues.
// The app should respond within these timeframes - if tests fail due to timeouts, fix the app, not the timeouts.
const NORMAL_TIMEOUT = 100; // ms - for normal UI operations.

// Wait for the store to be initialized before test begins
async function waitForStoreInitialization(page) {
  await page.waitForFunction(() => {
    return window.__appStore && window.__appMethods;
  }, { timeout: 2000 });
}

// Basic test to verify the page loads correctly
test('homepage has title and basic components', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Assert that the page title contains the project name
  await expect(page).toHaveTitle(/March of Mind/);
  
  // Assert that the main title is visible
  const mainTitle = page.locator('h1');
  await expect(mainTitle).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(mainTitle).toContainText('March of Mind');
  
  // Verify that footer exists and contains version
  const footer = page.locator('footer');
  await expect(footer).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(footer).toContainText('Version');
  
  // Test the money counter is visible
  const moneyDisplay = page.locator('.resource-display h3');
  await expect(moneyDisplay).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(moneyDisplay).toContainText('Money: $0');
});

// Test the initial job phase mechanics
test('job phase: earn money and progress toward founding company', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Verify we're in the job phase
  const pageTitle = page.locator('h2');
  await expect(pageTitle).toContainText('Working for the Man', { timeout: NORMAL_TIMEOUT });
  
  // Check that both buttons are visible
  const workButton = page.locator('.work-button');
  const foundButton = page.locator('.found-button');
  await expect(workButton).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(foundButton).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Found button should be disabled initially
  await expect(foundButton).toBeDisabled({ timeout: NORMAL_TIMEOUT });
  
  // Check that progress bar exists
  const progressContainer = page.locator('.progress-container');
  await expect(progressContainer).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Progress bar should start near 0%
  const progressInfo = page.locator('.progress-info');
  await expect(progressInfo).toContainText('0 / 100', { timeout: NORMAL_TIMEOUT });
  
  // Click the work button and check money increases
  await workButton.click();
  await expect(page.locator('.resource-display h3')).toContainText('Money: $1', { timeout: NORMAL_TIMEOUT });
  
  // Check that progress info has changed after earning money
  await expect(progressInfo).toContainText('1 / 100', { timeout: NORMAL_TIMEOUT });
});

// Test the company founding functionality
test('found a company when threshold is reached', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Inject script to set money to threshold minus 1
  await page.evaluate(() => {
    // We know the threshold is 100 from the app store
    window.__appStore.count = 99;
  });
  
  // Check that the found button is still disabled
  const foundButton = page.locator('.found-button');
  await expect(foundButton).toBeDisabled({ timeout: NORMAL_TIMEOUT });
  
  // Click once more to reach the threshold
  const workButton = page.locator('.work-button');
  await workButton.click();
  
  // Now the found button should be enabled
  await expect(foundButton).toBeEnabled({ timeout: NORMAL_TIMEOUT });
  
  // Click the found button
  await foundButton.click();
  
  // We should now be in the company phase
  const companyPhase = page.locator('.company-phase');
  await expect(companyPhase).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Money should be reduced by company founding cost
  await expect(page.locator('.resource-display h3')).toContainText('Money: $0', { timeout: NORMAL_TIMEOUT });
  
  // Page title should change
  await expect(page.locator('h2')).toContainText('Company Dashboard', { timeout: NORMAL_TIMEOUT });
});

// Test the company founding functionality fully
test('company founding complete flow with multiple clicks', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Set up state close to founding threshold
  await page.evaluate(() => {
    window.__appStore.count = 95;
  });
  
  // Click 5 times to reach threshold
  const workButton = page.locator('.work-button');
  for (let i = 0; i < 5; i++) {
    await workButton.click();
  }
  
  // Wait for found button to be enabled
  const foundButton = page.locator('.found-button');
  await expect(foundButton).toBeEnabled({ timeout: NORMAL_TIMEOUT });
  
  // Found the company
  await foundButton.click();
  
  // We should now be in the company phase
  await expect(page.locator('h2')).toContainText('Company Dashboard', { timeout: NORMAL_TIMEOUT });
  
  // Company info should be visible
  await expect(page.locator('.company-info')).toContainText('Your Company is Founded', { timeout: NORMAL_TIMEOUT });
});

