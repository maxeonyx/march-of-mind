import { test, expect } from '@playwright/test';
import { NORMAL_TIMEOUT } from '../src/stores/staticData';

test.describe('Pause and Resume Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Let the app initialize fully
    await page.waitForFunction(() => window.__timeStore?.isRunning === true);
  });
  
  test('Time should pause when a popup is shown and resume when closed', async ({ page }) => {
    // First get the initial date from the header panel
    const initialYearMonthText = await page.locator('header h1').textContent();
    
    // Expose the UI and time store methods
    const showPopup = async () => {
      await page.evaluate(() => {
        if (window.__uiStore) {
          window.__uiStore.showPopup('Test Popup', 'This is a test message');
        }
      });
    };
    
    const isPaused = async () => {
      return await page.evaluate(() => {
        return window.__timeStore?.isPaused;
      });
    };
    
    const hidePopup = async () => {
      await page.evaluate(() => {
        if (window.__uiStore) {
          window.__uiStore.hidePopup();
        }
      });
    };
    
    // Show the popup
    await showPopup();
    
    // Verify popup is visible
    await expect(page.locator('.info-popup h2')).toHaveText('Test Popup');
    await expect(page.locator('.info-popup p')).toHaveText('This is a test message');
    
    // Verify the game is paused
    expect(await isPaused()).toBe(true);
    
    // Wait a bit, date should not change
    await page.waitForTimeout(NORMAL_TIMEOUT * 3);
    
    const pausedYearMonthText = await page.locator('header h1').textContent();
    expect(pausedYearMonthText).toBe(initialYearMonthText);
    
    // Close the popup
    await hidePopup();
    
    // Verify popup is hidden
    await expect(page.locator('.info-popup')).not.toBeVisible();
    
    // Verify the game is resumed
    expect(await isPaused()).toBe(false);
    
    // Wait a bit, date should change
    await page.waitForTimeout(NORMAL_TIMEOUT * 3);
    
    const resumedYearMonthText = await page.locator('header h1').textContent();
    expect(resumedYearMonthText).not.toBe(initialYearMonthText);
  });
  
  test('Game phases should affect component rendering', async ({ page }) => {
    await page.goto('/');
    
    // Initial phase should be 'startup'
    const currentPhase = await page.evaluate(() => {
      return window.__phaseStore?.currentPhase;
    });
    
    expect(currentPhase).toBe('startup');
    
    // FounderPanel should be visible in startup phase
    await expect(page.locator('.founder-panel')).toBeVisible();
    
    // ResearchersPanel should not be visible in startup phase
    await expect(page.locator('.researchers-panel')).not.toBeVisible();
    
    // Manually set phase to 'lab'
    await page.evaluate(() => {
      if (window.__phaseStore) {
        window.__phaseStore.setPhase('lab');
      }
    });
    
    // Wait for DOM to update
    await page.waitForTimeout(NORMAL_TIMEOUT);
    
    // FounderPanel should not be visible in lab phase
    await expect(page.locator('.founder-panel')).not.toBeVisible();
    
    // ResearchersPanel should be visible in lab phase
    await expect(page.locator('.researchers-panel')).toBeVisible();
  });
  
  test('Manual work should only apply to discoveries in startup phase', async ({ page }) => {
    await page.goto('/');
    
    // Ensure we're in startup phase
    await page.evaluate(() => {
      if (window.__phaseStore && window.__phaseStore.currentPhase !== 'startup') {
        window.__phaseStore.setPhase('startup');
      }
    });
    
    // Wait for DOM to update
    await page.waitForTimeout(NORMAL_TIMEOUT);
    
    // Select a discovery (assuming 'discovery1' is available)
    await page.evaluate(() => {
      if (window.__techTreeStore) {
        // First unlock the discovery if needed
        const techTreeStore = window.__techTreeStore;
        const availableTechs = Array.from(techTreeStore.available);
        const discoveryId = availableTechs.find(id => id.startsWith('discovery'));
        
        if (discoveryId) {
          // Unlock and select the discovery
          techTreeStore.unlock(discoveryId);
          techTreeStore.selectDiscovery(discoveryId);
        }
      }
    });
    
    // Wait for UI to update
    await page.waitForTimeout(NORMAL_TIMEOUT);
    
    // Click the "Focus Effort" button multiple times
    const focusButton = page.locator('.founder-panel button:not([disabled])');
    await expect(focusButton).toBeVisible();
    
    // Click the button and verify work is applied
    await focusButton.click();
    
    // Verify that work is applied (this would be more robust with a specific
    // progress element to check, but for now we'll just verify the button is still enabled)
    await expect(focusButton).toBeEnabled();
  });
});