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

// Wait for the store to be initialized before test begins
async function waitForStoreInitialization(page) {
  await page.waitForFunction(() => {
    return window.__appStore && window.__appMethods;
  }, { timeout: 2000 });
}

const NORMAL_TIMEOUT = 100; // ms - for normal UI operations

test('basic UI components are visible with initial store values', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // HeaderPanel - should display date
  const headerPanel = page.locator('.header-panel');
  await expect(headerPanel).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(headerPanel).toContainText('March of Mind');
  await expect(headerPanel).toContainText('January 1950'); // Default initial date
  
  // ResourcePanel - should show initial values
  const resourcePanel = page.locator('.resource-panel');
  await expect(resourcePanel).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(resourcePanel).toContainText('Savings:');
  await expect(resourcePanel).toContainText('$0');
  await expect(resourcePanel).toContainText('Thoughts:');
  await expect(resourcePanel).toContainText('0');
  
  // Check DatacentrePanel and its children
  const datacentrePanel = page.locator('.datacentre-panel');
  await expect(datacentrePanel).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // ResearchersPanel
  const researchersPanel = page.locator('.researchers-panel');
  await expect(researchersPanel).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(researchersPanel).toContainText('Count: 0');
  
  // HardwarePanel - check initial hardware
  const hardwarePanel = page.locator('.hardware-panel');
  await expect(hardwarePanel).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(hardwarePanel).toContainText('Basic Computers');
  await expect(hardwarePanel).toContainText('FLOPS: 100');
  
  // TechnologyPanel - check tech cards
  const technologyPanel = page.locator('.technology-panel');
  await expect(technologyPanel).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Verify tech cards for initial discoveries
  const techCards = page.locator('.tech-card');
  await expect(techCards).toHaveCount(2, { timeout: NORMAL_TIMEOUT }); // discovery1 and discoveryA
  
  // Verify locked indicator is visible
  const lockedIndicators = page.locator('.locked-indicator');
  await expect(lockedIndicators).toHaveCount(2, { timeout: NORMAL_TIMEOUT });
});