# Game Loop Improvements & Pause/Resume Implementation

## Current Issues

The game loop currently has several issues:

1. The naming of `tick()` and `performTick()` is not clear
2. There's no dedicated pause/resume functionality
3. Potential time jumps can occur after pausing or tab inactivity
4. Both functions redundantly check `isRunning`

## Function Renaming

Rename the existing functions to better reflect their purposes:

```typescript
// Old: tick()
// New: runGameLoop()
function runGameLoop() {
  if (!isRunning.value) return;

  const now = Date.now();
  if (lastTickTimestamp.value === null) {
    lastTickTimestamp.value = now;
  }
  
  // Calculate delta time with safety cap
  let deltaTimeSeconds = (now - lastTickTimestamp.value) / 1000;
  
  // Cap maximum time that can pass in one tick
  const MAX_DELTA_TIME = 2.0; // Maximum 2 seconds per tick
  if (deltaTimeSeconds > MAX_DELTA_TIME) {
    console.log(`Large time gap detected (${deltaTimeSeconds.toFixed(2)}s), capping to ${MAX_DELTA_TIME}s`);
    deltaTimeSeconds = MAX_DELTA_TIME;
  }
  
  updateGameState(deltaTimeSeconds);
  
  lastTickTimestamp.value = now;
  timerId = setTimeout(runGameLoop, 1000);
}

// Old: performTick()
// New: updateGameState()
function updateGameState(deltaTimeSeconds: number) {
  if (!isRunning.value) return;

  const resourcesStore = useResourcesStore();
  const datacentreStore = useDatacentreStore();
  const techTreeStore = useTechTreeStore();

  // 1. Update Game Time
  const monthsToAdd = deltaTimeSeconds * MONTHS_PER_SECOND;
  const newMonthIndex = currentMonthIndex.value + monthsToAdd;
  currentYear.value += Math.floor(newMonthIndex / 12);
  currentMonthIndex.value = Math.floor(newMonthIndex % 12);

  // Check for game end condition
  if (currentYear.value > END_YEAR) {
    stopGame();
    console.log("GAME OVER - Reached end year");
    alert("Game Over!"); // Simple end notification
    return; // Stop further processing this tick
  }

  // 2. Update Resources
  const currentIncomeRate = resourcesStore.incomeRate; // Cache for tick
  const currentWorkRate = resourcesStore.workRate;   // Cache for tick
  resourcesStore.addSavings(currentIncomeRate * deltaTimeSeconds);
  resourcesStore.addThoughts(currentWorkRate * deltaTimeSeconds);

  // 3. Apply Work to Selected Tech
  const proportionResearch = datacentreStore.proportionWorkSpentOnResearch;
  const workForProducts = currentWorkRate * (1 - proportionResearch) * deltaTimeSeconds;
  const workForDiscoveries = currentWorkRate * proportionResearch * deltaTimeSeconds;

  if (techTreeStore.currentlySelectedProduct && workForProducts > 0) {
    techTreeStore.progressWork(techTreeStore.currentlySelectedProduct, workForProducts);
  }
  if (techTreeStore.currentlySelectedDiscovery && workForDiscoveries > 0) {
    techTreeStore.progressWork(techTreeStore.currentlySelectedDiscovery, workForDiscoveries);
  }
}
```

## Adding Pause and Resume Functions

Add dedicated pause and resume functions:

```typescript
/**
 * Pauses the game, stopping the game loop without resetting game state.
 * Safe to call even if the game is already paused.
 */
function pauseGame() {
  if (!isRunning.value) return; // Already paused
  
  console.log("Pausing game");
  isRunning.value = false;
  
  // Clear the current timeout to stop the loop
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  
  // Setting lastTickTimestamp to null prevents time jumps on resume
  lastTickTimestamp.value = null;
  
  // Optional: Store the current game state in case we want to save it
  const pauseState = {
    year: currentYear.value,
    month: currentMonthIndex.value,
    timestamp: Date.now()
  };
  
  return pauseState; // Can be useful for saving game state
}

/**
 * Resumes the game from a paused state.
 * Safe to call only if the game is currently paused.
 * Ensures no time jumps occur, even after a long pause.
 */
function resumeGame() {
  if (isRunning.value) return; // Already running
  
  console.log("Resuming game");
  
  // Critical: Set the timestamp to now to prevent time jumps
  lastTickTimestamp.value = Date.now();
  
  // Set the game as running
  isRunning.value = true;
  
  // Restart the game loop
  runGameLoop();
}
```

## Updating the Store API

Update the returned store API to include the new and renamed functions:

```typescript
return {
  // State
  currentYear,
  currentMonthIndex,
  isRunning,
  // Getters
  displayDate,
  // Actions
  startGame,
  stopGame,
  pauseGame,     // Add the new pause function
  resumeGame,    // Add the new resume function
  runGameLoop,   // Renamed from tick
  updateGameState, // Renamed from performTick
  initialize,
};
```

## Update `startGame` to use new function names

```typescript
function startGame() {
  if (isRunning.value) return; // Already running
  console.log("Starting game loop...");
  
  // Initialize all stores
  const resourcesStore = useResourcesStore();
  const datacentreStore = useDatacentreStore();
  const techTreeStore = useTechTreeStore();
  
  resourcesStore.initialize();
  datacentreStore.initialize();
  techTreeStore.initialize();
  
  // Initialize time
  currentYear.value = START_YEAR;
  currentMonthIndex.value = 0;
  lastTickTimestamp.value = null; // Reset timestamp for accurate first delta
  isRunning.value = true;
  
  // Start the loop
  runGameLoop(); // Changed from tick() to runGameLoop()
}
```

## Adding UI Controls in Debug Panel

Add a pause/resume toggle to the debug panel:

```html
<!-- In DebugPanel.vue -->
<div class="debug-section">
  <h3>Game Time Controls</h3>
  <div class="debug-action">
    <button @click="togglePause">
      {{ timeStore.isRunning ? 'Pause Game' : 'Resume Game' }}
    </button>
    <span class="status-text">
      {{ timeStore.isRunning ? 'Game is running' : 'Game is paused' }}
    </span>
  </div>
</div>
```

Add the toggle function to the script section:

```javascript
// In DebugPanel.vue script
import { useTimeStore } from '../stores/time';

const timeStore = useTimeStore();

function togglePause() {
  if (timeStore.isRunning) {
    timeStore.pauseGame();
  } else {
    timeStore.resumeGame();
  }
}
```

Add some styling:

```css
/* In DebugPanel.vue style section */
.status-text {
  margin-left: 0.5rem;
  font-style: italic;
  color: #666;
}
```

## Implementation Tasks Checklist

- [ ] Rename `tick()` to `runGameLoop()` in time.ts
- [ ] Rename `performTick()` to `updateGameState()` in time.ts
- [ ] Add `MAX_DELTA_TIME` constant and time delta capping logic
- [ ] Implement `pauseGame()` function
- [ ] Implement `resumeGame()` function
- [ ] Update the return object in useTimeStore to include new functions
- [ ] Update `startGame()` to call `runGameLoop()` instead of `tick()`
- [ ] Update any external calls to `tick()` to use `runGameLoop()`
- [ ] Update any external calls to `performTick()` to use `updateGameState()`
- [ ] Update window.__timeStore type definitions in types/index.ts
- [ ] Add pause/resume toggle to the Debug Panel
- [ ] Add toggle function and status text to DebugPanel.vue
- [ ] Update any tests that directly call `tick()` or `performTick()`
- [ ] Verify that pausing and resuming work correctly, even after long pauses
- [ ] Check that the maximum delta time cap works as expected when time jumps would occur
- [ ] Test that game state is properly preserved during pause/resume

## Notes

1. The implementation includes a maximum delta time cap of 2 seconds to prevent time jumps from any cause, not just pauses. This can be adjusted based on game balance needs.

2. If there are any tests that call `tick()` or `performTick()` directly, they will need to be updated to use the new function names.

3. The pause function optionally returns the pause state, which could be used in the future for save/load functionality.

4. Both `runGameLoop()` and `updateGameState()` still check `isRunning` for safety. This redundancy is preserved because `updateGameState()` might be called directly for testing or debugging.