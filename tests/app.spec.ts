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
  const moneyDisplay = page.getByText(/Money: \$/);
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
  
  // Find the work and found buttons
  const workButton = page.locator('button', { hasText: 'Work for the Man' });
  const foundButton = page.locator('button', { hasText: 'Found a Company' });
  
  await expect(workButton).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(foundButton).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Found button should be disabled initially
  await expect(foundButton).toBeDisabled({ timeout: NORMAL_TIMEOUT });
  
  // Click the work button and check money increases
  await workButton.click();
  await expect(page.getByText(/Money: \$/)).toContainText('Money: $1', { timeout: NORMAL_TIMEOUT });
});

// Test the company founding functionality
test('found a company when threshold is reached', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Inject script to set money to threshold minus 1
  await page.evaluate(() => {
    // We know the threshold is 100 from the app store
    window.__appStore.addMoney(99);
  });
  
  // Find the buttons - now we need to find the actual button elements
  const foundButton = page.locator('button', { hasText: 'Found a Company' });
  const workButton = page.locator('button', { hasText: 'Work for the Man' });
  
  // Check that the found button is disabled
  await expect(foundButton).toBeDisabled({ timeout: NORMAL_TIMEOUT });
  
  // Click once more to reach the threshold
  await workButton.click();
  
  // Now the found button should be enabled
  await expect(foundButton).toBeEnabled({ timeout: NORMAL_TIMEOUT });
  
  // Click the found button
  await foundButton.click();
  
  // We should now be in the company phase
  const companyPhase = page.getByText('Your Company is Founded!');
  await expect(companyPhase).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Money should be reduced by company founding cost
  await expect(page.getByText(/Money: \$/)).toContainText('Money: $0', { timeout: NORMAL_TIMEOUT });
  
  // Page title should change
  await expect(page.locator('h2')).toContainText('Company Dashboard', { timeout: NORMAL_TIMEOUT });
  
  // Date display should be visible
  await expect(page.locator('.date-display')).toBeVisible({ timeout: NORMAL_TIMEOUT });
});

// Test talent management functionality
test('talent management and income system', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Set up company phase with enough money to hire talent
  await page.evaluate(() => {
    window.__appStore.addMoney(100);
    window.__appStore.setPhase('company');
  });
  
  // Check that talent panel is visible
  const talentPanel = page.getByText('Talent Management');
  await expect(talentPanel).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Initial talent should be 0
  await expect(page.locator('.talent-value')).toContainText('0', { timeout: NORMAL_TIMEOUT });
  
  // Hire button should be visible
  const hireButton = page.locator('button', { hasText: 'Hire Talent' });
  await expect(hireButton).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Fire button should be visible but disabled
  const fireButton = page.locator('button', { hasText: 'Fire Talent' });
  await expect(fireButton).toBeVisible({ timeout: NORMAL_TIMEOUT });
  await expect(fireButton).toBeDisabled({ timeout: NORMAL_TIMEOUT });
  
  // Hire talent
  await hireButton.click();
  
  // Talent should now be 1
  await expect(page.locator('.talent-value')).toContainText('1', { timeout: NORMAL_TIMEOUT });
  
  // Money should be reduced by hire cost (50)
  await expect(page.getByText(/Money: \$/)).toContainText('Money: $50', { timeout: NORMAL_TIMEOUT });
  
  // Fire button should now be enabled
  await expect(fireButton).toBeEnabled({ timeout: NORMAL_TIMEOUT });
  
  // Income stats should show correct values (with TALENT_INCOME=5, TALENT_SALARY=15)
  const incomeStats = page.locator('.income-stats');
  const incomeStatsText = await incomeStats.textContent();
  
  // Check that income stats contain expected values
  expect(incomeStatsText).toContain('Monthly Income:+$5');
  expect(incomeStatsText).toContain('Monthly Expenses:-$15');
  expect(incomeStatsText).toContain('Net Monthly:$-10');
  
  // Fire talent
  await fireButton.click();
  
  // Talent should be back to 0
  await expect(page.locator('.talent-value')).toContainText('0', { timeout: NORMAL_TIMEOUT });
  
  // Income stats should show zeroes
  const updatedIncomeStatsText = await incomeStats.textContent();
  
  // Check that income stats contain expected values after firing
  expect(updatedIncomeStatsText).toContain('Monthly Income:+$0');
  expect(updatedIncomeStatsText).toContain('Monthly Expenses:-$0');
  expect(updatedIncomeStatsText).toContain('Net Monthly:+$0');
});

// Test the company founding functionality fully
test('company founding complete flow with multiple clicks', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Set up state close to founding threshold
  await page.evaluate(() => {
    window.__appStore.addMoney(95);
  });
  
  // Click 5 times to reach threshold
  const workButton = page.locator('button', { hasText: 'Work for the Man' });
  for (let i = 0; i < 5; i++) {
    await workButton.click();
  }
  
  // Wait for found button to be enabled
  const foundButton = page.locator('button', { hasText: 'Found a Company' });
  await expect(foundButton).toBeEnabled({ timeout: NORMAL_TIMEOUT });
  
  // Found the company
  await foundButton.click();
  
  // We should now be in the company phase
  await expect(page.locator('h2')).toContainText('Company Dashboard', { timeout: NORMAL_TIMEOUT });
  
  // Company info should be visible
  await expect(page.getByText('Your Company is Founded')).toBeVisible({ timeout: NORMAL_TIMEOUT });
});

// Test reset button functionality
test('dev reset button should reset game state', async ({ page }) => {
  await page.goto('/');
  await waitForStoreInitialization(page);
  
  // Directly set up company phase state without using localStorage
  await page.evaluate(() => {
    window.__appStore.addMoney(50);
    window.__appStore.setPhase('company');
  });
  
  // Verify we can see the company phase UI
  const companyPhase = page.getByText('Your Company is Founded');
  await expect(companyPhase).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Click the reset button
  const resetButton = page.locator('.dev-button');
  await resetButton.click();
  
  // Verify we're back to job phase (Work for the Man button is visible)
  await expect(page.getByText('Work for the Man')).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Money should be reset to 0
  await expect(page.getByText(/Money: \$/)).toContainText('Money: $0', { timeout: NORMAL_TIMEOUT });
});