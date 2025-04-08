import { test, expect } from '@playwright/test';
import { NORMAL_TIMEOUT } from '../src/stores/staticData';

test('Quiz modal appears and works when clicking a locked tech card', async ({ page }) => {
  // Load the application
  await page.goto('/');

  // Wait for the game to be loaded and running
  await expect(page.locator('.tech-card')).toBeVisible();

  // Find a locked tech card (discovery1) and click it
  const lockedDiscoveryCard = page.locator('.tech-card:has-text("Discovery 1")');
  await expect(lockedDiscoveryCard).toBeVisible();
  
  // Verify it has a lock icon
  await expect(lockedDiscoveryCard.locator('.locked-indicator')).toBeVisible();

  // Click the locked card
  await lockedDiscoveryCard.click();

  // Verify quiz modal appears
  const quizModal = page.locator('.quiz-modal');
  await expect(quizModal).toBeVisible({ timeout: NORMAL_TIMEOUT });

  // Verify the question is displayed
  await expect(quizModal.locator('.quiz-question')).toBeVisible();

  // Verify the tech name is displayed
  await expect(quizModal.locator('.quiz-tech-name')).toContainText('Discovery 1');

  // Verify the game is paused by checking that time doesn't advance
  const dateDisplay = page.locator('text=January 1950');
  await expect(dateDisplay).toBeVisible();
  
  // Wait 2 seconds to see if date changes (it shouldn't)
  await page.waitForTimeout(2000);
  await expect(dateDisplay).toBeVisible();

  // Answer the quiz (correct option is at index 0 for discovery1)
  const quizOptions = quizModal.locator('button').filter({ hasText: 'A systematic process' });
  await quizOptions.click();

  // Verify countdown appears
  await expect(quizModal.locator('.quiz-countdown')).toBeVisible({ timeout: NORMAL_TIMEOUT });

  // Verify options are disabled
  const optionButtons = quizModal.locator('.quiz-options button');
  await expect(optionButtons.first()).toBeDisabled();

  // Wait for the countdown to complete and modal to close (5+ seconds)
  await expect(quizModal).not.toBeVisible({ timeout: 6000 });

  // Verify the tech card is now unlocked (lock icon is gone)
  await expect(lockedDiscoveryCard.locator('.locked-indicator')).not.toBeVisible();

  // Verify that it's now selected (has the selected class)
  await expect(lockedDiscoveryCard).toHaveClass(/selected/);

  // Verify game has resumed
  await page.waitForTimeout(2000);
  await expect(dateDisplay).not.toBeVisible();
});

test('Quiz modal shows incorrect answer feedback', async ({ page }) => {
  // Load the application and reset the game state
  await page.goto('/');
  await page.locator('button:has-text("Initialize All Stores")').click();
  
  // Wait for a locked tech card to be visible
  const lockedProductCard = page.locator('.tech-card:has-text("Product A")');
  await expect(lockedProductCard).toBeVisible();
  
  // Verify it has a lock icon
  await expect(lockedProductCard.locator('.locked-indicator')).toBeVisible();

  // Click the locked card
  await lockedProductCard.click();

  // Verify quiz modal appears
  const quizModal = page.locator('.quiz-modal');
  await expect(quizModal).toBeVisible({ timeout: NORMAL_TIMEOUT });

  // Answer incorrectly (select an option that is not the correct one)
  // For productA, correct option is at index 2
  const incorrectOption = quizModal.locator('.quiz-options button').first();
  await incorrectOption.click();

  // Verify visual feedback (class should change briefly)
  await expect(incorrectOption).toHaveClass(/incorrect/);

  // Verify modal stays open
  await expect(quizModal).toBeVisible();

  // Verify we can still interact with options (they're not disabled)
  await expect(incorrectOption).not.toBeDisabled();

  // Cancel the quiz
  await quizModal.locator('button:has-text("Cancel")').click();

  // Verify modal closes
  await expect(quizModal).not.toBeVisible({ timeout: NORMAL_TIMEOUT });

  // Verify tech remains locked
  await expect(lockedProductCard.locator('.locked-indicator')).toBeVisible();
});

test('Game time pauses during quiz and resumes after', async ({ page }) => {
  // Load the application and reset the game state
  await page.goto('/');
  
  // Check initial date
  const initialDate = await page.locator('text=January 1950').innerText();
  
  // Let the game run for a few seconds to ensure time advances
  await page.waitForTimeout(3000);
  
  // Store current date
  const dateBeforeQuiz = await page.locator('header h2').innerText();
  
  // Verify time has advanced from start
  expect(dateBeforeQuiz).not.toEqual(initialDate);

  // Find a locked tech card and click it
  const lockedDiscoveryCard = page.locator('.tech-card:has-text("Discovery A")');
  await lockedDiscoveryCard.click();
  
  // Verify quiz modal appears
  const quizModal = page.locator('.quiz-modal');
  await expect(quizModal).toBeVisible({ timeout: NORMAL_TIMEOUT });
  
  // Wait a few seconds
  await page.waitForTimeout(3000);
  
  // Check date again - should be the same as before the quiz
  const dateAfterWaiting = await page.locator('header h2').innerText();
  expect(dateAfterWaiting).toEqual(dateBeforeQuiz);
  
  // Click the correct answer (index 2)
  const correctAnswer = quizModal.locator('.quiz-options button').nth(2);
  await correctAnswer.click();
  
  // Wait for countdown to complete
  await expect(quizModal).not.toBeVisible({ timeout: 6000 });
  
  // Wait to verify time is advancing again
  await page.waitForTimeout(3000);
  
  // Check date has advanced
  const dateAfterQuiz = await page.locator('header h2').innerText();
  expect(dateAfterQuiz).not.toEqual(dateBeforeQuiz);
});