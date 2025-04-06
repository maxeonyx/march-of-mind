import { test, expect, Page } from '@playwright/test';
import { GamePhase } from '@/types';

// IMPORTANT: The app should respond very quickly, and these tests should run quickly. Most "timeout" errors are just that the selector is genuinely missing!
// For this reason, you MUST use either of these timeouts, and prefer the shorter one.
// DO NOT do anything like NORMAL_TIMEOUT * 10. Use only NORMAL_TIMEOUT. Longer timeouts just hide performance issues.
// DO NOT change the below timeout values - they are intentionally short to catch issues.
// The app should respond within these timeframes - if tests fail due to timeouts, fix the app, not the timeouts.
const NORMAL_TIMEOUT = 16; // ms - one frame. This MUST stay as-is: 16ms.
const LONG_TIMEOUT = 1000; // ms - expensive UI operations. This MUST stay as-is: 1000ms.

test.beforeEach(async ({ page }) => {
  page.setDefaultTimeout(LONG_TIMEOUT);
  page.goto("/");
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', error => {
    console.error(`[Browser Error] ${error}`);
  });

  // Clear localStorage to start fresh
  await page.addInitScript(() => {
    localStorage.removeItem('marchOfMindSave');
  });

  // Wait for the Vue app to mount by checking for the global store variable.
  await page.waitForFunction(() => window.gameStore !== undefined, { timeout: 10000 });

});
// We need to ensure we initialize the store properly
// The page context in Playwright doesn't get the initialization from main.ts
test.afterEach(async ({ page }) => {
  // Clear localStorage to start fresh
  await page.addInitScript(() => {
    localStorage.removeItem('marchOfMindSave');
  });
});


// Basic test to verify the page loads correctly
test('homepage has title and basic components', async ({ page }) => {

  // Assert that the page title contains the project name
  await expect(page).toHaveTitle(/March of Mind/);

  // Verify that footer exists and contains version
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
  await expect(footer).toContainText('Version');

});

// Test the initial job phase mechanics
test('job phase: earn money and progress toward founding company', async ({ page }) => {

  // Instead of checking the pageTitle which seems not to be set correctly in tests,
  // just verify we're in the job phase by checking for the job phase-specific buttons

  // TODO: refactor the other tests (& components) to use test ids
  // Find the work and found buttons
  const workButton = page.getByTestId('btn-work');
  const foundButton = page.getByTestId('btn-found-company');

  await expect(workButton).toBeVisible();
  await expect(foundButton).toBeVisible();

  // Since the button uses custom styling for disabled state, check for the first-time class
  await expect(foundButton).toHaveClass(/first-time/);

  // Click the work button and check money increases
  await workButton.click();

  expect(await page.evaluate(() =>
    window.getStore().resources.money
  )).toBe(1)
});

// Test the company founding functionality
test('found a company when threshold is reached', async ({ page }) => {
  await page.evaluate(() => {
    window.getStore().resources.addMoney(99);
    window.getStore().resources.addMoney(1);
  });

  const foundButton = page.getByTestId('btn-found-company');

  // Click once more to reach the threshold
  await foundButton.click();

  await page.waitForTimeout(LONG_TIMEOUT);

  expect(await page.evaluate(() =>
    window.getStore().phase
  )).toBe(GamePhase.COMPANY);
});

// Test reset button functionality
test('dev reset button should reset game state', async ({ page }) => {
  // Directly set up company phase state without using localStorage
  await page.evaluate((phase) => {
    if (window.getStore()) {
      window.getStore().resources.addMoney(50);
      window.getStore().enterPhase(phase);
    } else {
      throw new Error('gameStore not initialized');
    }
  }, GamePhase.COMPANY);

  // Click the reset button
  const resetButton = page.getByTestId('btn-reset-game');
  await resetButton.click();

  // Verify we're back to job phase (Work for the Man button is visible)
  await expect(page.getByTestId('btn-work')).toBeVisible();

  // Money should be reset to 0
  await expect(page.getByTestId('money-value')).toContainText('$0');
});

// TODO To be replaced after pivot but here for reference
// Test talent management functionality
test.skip('talent management and income system', async ({ page }) => {
  // Set up company phase with enough money to hire talent
  await page.evaluate(() => {
    if (window.getStore()) {
      window.getStore().resources.addMoney(50);
      window.getStore().enterPhase(GamePhase.COMPANY);
    } else {
      throw new Error('gameStore not initialized');
    }
  });

  // Check that talent panel is visible
  const talentPanel = page.getByText('Talent Management');
  await expect(talentPanel).toBeVisible();

  // Initial talent should be 0
  await expect(page.getByTestId('talent-count')).toContainText('0');

  // Hire button should be visible
  const hireButton = page.getByTestId('btn-hire-talent');
  await expect(hireButton).toBeVisible();

  // Fire button should be visible but disabled
  const fireButton = page.getByTestId('btn-fire-talent');
  await expect(fireButton).toBeVisible();
  await expect(fireButton).toBeDisabled();

  // Hire talent
  await hireButton.click();

  // Talent should now be 1
  await expect(page.getByTestId('talent-count')).toContainText('1');

  // Fire button should now be enabled
  await expect(fireButton).toBeEnabled();

  // Fire talent
  await fireButton.click();

  // Talent should be back to 0
  await expect(page.getByTestId('talent-count')).toContainText('0');
});


// TODO To be replaced after pivot but here for reference
// Test product development and launching
test.skip('company phase: can launch a product with enough insights', async ({ page }) => {
  // Set up company phase with money to hire talent
  await page.evaluate(() => {
    if (window.getStore()) {
      window.getStore().enterPhase(GamePhase.COMPANY);
      window.getStore().resources.addInsights(1000);
    } else {
      throw new Error('gameStore not initialized');
    }
  });

  // Launch should be available since we have enough insight.
  await expect(page.getByTestId('btn-launch-product')).toBeEnabled();
  await page.getByTestId('btn-launch-product').click();

  // Verify that the product is launched by checking for the active products section
  await expect(page.getByTestId('active-products-panel')).toBeVisible();
});
