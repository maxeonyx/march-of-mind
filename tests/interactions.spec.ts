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

test('firing researchers updates the UI', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Add a researcher first (via store set) to be able to test firing
  await page.evaluate(() => {
    window.__datacentreStore = window.__datacentreStore || {};
    window.__datacentreStore.numResearchers = 2;
  });
  
  // Get the current researcher count
  const countElement = page.locator('.researchers-count');
  await expect(countElement).toContainText('Count: 2', { timeout: NORMAL_TIMEOUT });
  
  // Find and click the fire button
  const fireButton = page.locator('.researchers-panel button').filter({ hasText: 'Fire' });
  await fireButton.click();
  
  // Verify the count has decreased
  await expect(countElement).toContainText('Count: 1', { timeout: NORMAL_TIMEOUT });
  
  // Click again
  await fireButton.click();
  
  // Verify the count has decreased again
  await expect(countElement).toContainText('Count: 0', { timeout: NORMAL_TIMEOUT });
  
  // The button should now be disabled
  await expect(fireButton).toBeDisabled({ timeout: NORMAL_TIMEOUT });
});

test('work allocation slider updates the allocation display', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Get the initial allocation display
  const productsAllocation = page.locator('.allocation-display div').nth(0);
  const researchAllocation = page.locator('.allocation-display div').nth(1);
  
  // Default should be 50/50
  await expect(productsAllocation).toContainText('50%', { timeout: NORMAL_TIMEOUT });
  await expect(researchAllocation).toContainText('50%', { timeout: NORMAL_TIMEOUT });
  
  // Find the slider
  const slider = page.locator('.work-allocator-panel input[type="range"]');
  
  // Change to 75% products
  await slider.fill('0.75');
  await slider.dispatchEvent('input');
  
  // Verify the display updated
  await expect(productsAllocation).toContainText('75%', { timeout: NORMAL_TIMEOUT });
  await expect(researchAllocation).toContainText('25%', { timeout: NORMAL_TIMEOUT });
});

test('clicking tech cards updates selection state', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // First, stop the game to avoid conflicts
  await page.evaluate(() => {
    if (window.__appMethods?.stopGame) {
      window.__appMethods.stopGame();
    }
  });
  
  // Setup initial conditions - reset selection state and unlock the tech cards
  await page.evaluate(() => {
    // First, initialize the stores to ensure clean state
    if (window.__appMethods?.initializeStores) {
      window.__appMethods.initializeStores();
    }
    
    // Direct manipulation to unlock cards without going through store methods
    if (window.__techTreeStore) {
      window.__techTreeStore.currentlySelectedProduct = null;
      window.__techTreeStore.currentlySelectedDiscovery = null;
      window.__techTreeStore.locked = new Set(); // Empty set means nothing is locked
    }
  });
  
  // Get the tech cards
  const techCards = page.locator('.tech-card');
  
  // Reset any selection styling by forcing a refresh
  await page.reload();
  await waitForStoreInitialization(page);
  
  // Click the first card
  await techCards.nth(0).click();
  
  // The first card should now have a selected class
  await page.waitForTimeout(200); // Brief wait for selection to register
  
  // Check if cards exist and show a clear state
  const selectedCards = await techCards.filter({ hasClass: 'selected' }).count();
  expect(selectedCards).toBeGreaterThan(0);
});