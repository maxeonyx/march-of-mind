Okay, here is a detailed plan for organizing the state with Pinia and building the game, tailored for a junior developer.

```markdown
# Vue AI Game Build Plan (using Pinia)

This document outlines the state organization using Pinia and a step-by-step plan to build the "Modern AI Game".

## 1. Project Setup

1.  **Create Vue Project:** Use Vite or Vue CLI to scaffold a new Vue 3 project.
    ```bash
    # Using Vite (recommended)
    npm create vite@latest modern-ai-game -- --template vue
    cd modern-ai-game
    npm install
    ```
2.  **Install Pinia:**
    ```bash
    npm install pinia
    ```
3.  **Integrate Pinia:**
    *   Create `src/main.js` (or `src/main.ts`):
        ```javascript
        import { createApp } from 'vue'
        import { createPinia } from 'pinia'
        import App from './App.vue'

        const app = createApp(App)
        const pinia = createPinia()

        app.use(pinia)
        app.mount('#app')
        ```

## 2. Static Data Handling

1.  **Create Data Files:**
    *   `src/data/hardware.json`: Contains the array of hardware objects as specified.
    *   `src/data/techTree.json`: Contains the array of tech tree item objects (discoveries and products) as specified.
2.  **Loading Strategy:** For simplicity in this prototype, we'll import them directly. Create a simple utility or store to hold this static data.
    *   **File:** `src/stores/staticData.js`
        ```javascript
        // src/stores/staticData.js
        import { ref } from 'vue'
        import hardwareData from '@/data/hardware.json'
        import techTreeData from '@/data/techTree.json'

        // Use simple refs for static data accessible across the app
        // Alternatively, could be a Pinia store if dynamic loading/updates were needed later
        export const allHardware = ref(hardwareData)
        export const allTech = ref(techTreeData)

        // Helper function to find tech by ID
        export function findTechById(id) {
          return allTech.value.find(item => item.id === id) || null;
        }

        // Helper function to find hardware by ID
        export function findHardwareById(id) {
          return allHardware.value.find(item => item.id === id) || null;
        }

        // Helper function to find hardware by Tier (for upgrades)
        export function findHardwareByTier(tier) {
          return allHardware.value.find(item => item.tier === tier) || null;
        }

        // Constants (can also live here or in a dedicated constants file)
        export const COST_PER_RESEARCHER = 5; // Example value
        export const BASE_INCOME = 10;
        export const GAME_DURATION_MINUTES = 20;
        export const START_YEAR = 1950;
        export const END_YEAR = 2030;
        ```

## 3. Pinia Store Definitions

Create the following store files within a `src/stores/` directory.

### 3.1. Resources Store

*   **File:** `src/stores/resources.js`
*   **Purpose:** Manages core numerical resources.

```javascript
// src/stores/resources.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDatacentreStore } from './datacentre'; // Import other stores for getters
import { useTechTreeStore } from './techTree';
import { BASE_INCOME } from './staticData';

export const useResourcesStore = defineStore('resources', () => {
  // --- State ---
  const savingsAmount = ref(0);
  const thoughtsAmount = ref(0);

  // --- Getters (Computed Properties) ---
  const datacentreStore = useDatacentreStore(); // Access other stores within getters/actions
  const techTreeStore = useTechTreeStore();

  // Total income = Base + Income from completed products
  const incomeRate = computed(() => BASE_INCOME + techTreeStore.totalIncomeRate);

  // Creativity comes from researchers (potentially with bonuses later)
  const creativityRate = computed(() => datacentreStore.numResearchers /* + potential bonuses */);

  // Flops comes from current hardware (potentially with bonuses later)
  const flopsRate = computed(() => datacentreStore.currentHardwareObject?.flops || 0 /* + potential bonuses */);

  // Work is creativity * flops
  const workRate = computed(() => creativityRate.value * flopsRate.value);

  // --- Actions ---
  function addSavings(amount) {
    savingsAmount.value += amount;
  }

  function spendSavings(amount) {
    if (savingsAmount.value >= amount) {
      savingsAmount.value -= amount;
      return true; // Indicate success
    }
    return false; // Indicate failure (not enough funds)
  }

  function addThoughts(amount) {
    thoughtsAmount.value += amount;
  }

  // Initialize function if needed (e.g., load from localStorage)
  function initialize() {
      savingsAmount.value = 0;
      thoughtsAmount.value = 0;
  }

  return {
    // State
    savingsAmount,
    thoughtsAmount,
    // Getters
    incomeRate,
    creativityRate,
    flopsRate,
    workRate,
    // Actions
    addSavings,
    spendSavings,
    addThoughts,
    initialize,
  };
});

```

### 3.2. Datacentre Store

*   **File:** `src/stores/datacentre.js`
*   **Purpose:** Manages researchers, hardware, and work allocation.

```javascript
// src/stores/datacentre.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useResourcesStore } from './resources';
import { allHardware, findHardwareById, findHardwareByTier, COST_PER_RESEARCHER } from './staticData';

export const useDatacentreStore = defineStore('datacentre', () => {
  // --- State ---
  const numResearchers = ref(0);
  const currentHardwareId = ref('hardware1'); // Initial hardware ID
  const proportionWorkSpentOnProducts = ref(0.5); // Initial 50/50 allocation

  // --- Getters (Computed Properties) ---
  const resourcesStore = useResourcesStore();

  const currentHardwareObject = computed(() => findHardwareById(currentHardwareId.value));

  // Check if hiring one more researcher is affordable
  const canAffordToHire = computed(() => {
    const nextResearcherCost = (numResearchers.value + 1) * COST_PER_RESEARCHER;
    // NOTE: Comparing against *base* income + product income, as per clarification
    return resourcesStore.incomeRate >= nextResearcherCost;
  });

  // Find the next hardware upgrade option
  const nextHardwareUpgrade = computed(() => {
    const currentTier = currentHardwareObject.value?.tier || 0;
    return findHardwareByTier(currentTier + 1);
  });

  // Check if the next upgrade can be afforded
  const canAffordUpgrade = computed(() => {
    const upgradeCost = nextHardwareUpgrade.value?.upgradeCost || Infinity;
    return resourcesStore.savingsAmount >= upgradeCost;
  });

  // --- Actions ---
  function hireResearcher() {
    if (canAffordToHire.value) {
      numResearchers.value++;
    } else {
      console.warn("Cannot hire researcher: insufficient income.");
    }
  }

  function fireResearcher() {
    if (numResearchers.value > 0) {
      numResearchers.value--;
    }
  }

  function upgradeHardware() {
    const upgradeTarget = nextHardwareUpgrade.value;
    if (upgradeTarget && canAffordUpgrade.value) {
      if (resourcesStore.spendSavings(upgradeTarget.upgradeCost)) {
        currentHardwareId.value = upgradeTarget.id;
      } else {
         console.error("Upgrade failed: Could not spend savings."); // Should not happen if canAffordUpgrade is true
      }
    } else {
       console.warn("Cannot upgrade hardware: Not available or insufficient funds.");
    }
  }

  function setWorkAllocation(proportion) {
    // Clamp proportion between 0 and 1
    proportionWorkSpentOnProducts.value = Math.max(0, Math.min(1, proportion));
  }

  // Initialize function
  function initialize() {
      numResearchers.value = 0;
      currentHardwareId.value = 'hardware1';
      proportionWorkSpentOnProducts.value = 0.5;
  }

  return {
    // State
    numResearchers,
    currentHardwareId,
    proportionWorkSpentOnProducts,
    // Getters
    currentHardwareObject,
    canAffordToHire,
    nextHardwareUpgrade,
    canAffordUpgrade,
    // Actions
    hireResearcher,
    fireResearcher,
    upgradeHardware,
    setWorkAllocation,
    initialize,
  };
});

```

### 3.3. Tech Tree Store

*   **File:** `src/stores/techTree.js`
*   **Purpose:** Manages the state of discoveries and products.

```javascript
// src/stores/techTree.js
import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { allTech, findTechById } from './staticData';

export const useTechTreeStore = defineStore('techTree', () => {
  // --- State ---
  // Using Sets for efficient add/delete/has checks for IDs
  const available = ref(new Set(['discovery1', 'discoveryA'])); // Initial available techs
  const locked = ref(new Set(['discovery1', 'discoveryA']));    // Initial locked techs
  // Using a Map for unlocked items to easily access progress by ID
  const unlocked_progress = reactive(new Map()); // Map<idString, { workRequired: number, workApplied: number }>
  const complete = ref(new Set());
  const currentlySelectedProduct = ref(null); // ID string or null
  const currentlySelectedDiscovery = ref(null); // ID string or null

  // --- Getters (Computed Properties) ---

  // Calculate total income from completed products
  const totalIncomeRate = computed(() => {
    let income = 0;
    complete.value.forEach(id => {
      const tech = findTechById(id);
      if (tech && tech.type === 'product' && tech.incomeGenerated) {
        income += tech.incomeGenerated;
      }
    });
    return income;
  });

  // Helper getters to provide filtered lists for the UI grids
  const availableProducts = computed(() => [...available.value].filter(id => findTechById(id)?.type === 'product'));
  const availableDiscoveries = computed(() => [...available.value].filter(id => findTechById(id)?.type === 'discovery'));
  const completedProducts = computed(() => [...complete.value].filter(id => findTechById(id)?.type === 'product'));
  const completedDiscoveries = computed(() => [...complete.value].filter(id => findTechById(id)?.type === 'discovery'));

  // Check if a specific ID is locked
  function isLocked(id) {
    return locked.value.has(id);
  }

  // Get progress details for an unlocked item
  function getProgress(id) {
    return unlocked_progress.get(id); // Returns { workRequired, workApplied } or undefined
  }

  // --- Actions ---

  // Called when a user clicks a locked card
  function unlock(id) {
    if (locked.value.has(id)) {
      const tech = findTechById(id);
      if (tech) {
        locked.value.delete(id);
        unlocked_progress.set(id, {
          workRequired: tech.WorkRequired,
          workApplied: 0,
        });
        console.log(`Unlocked: ${id}`);
      }
    }
  }

  // Called by the game tick to apply work
  function progressWork(id, amount) {
    if (unlocked_progress.has(id)) {
      const progress = unlocked_progress.get(id);
      progress.workApplied += amount;

      // Check for completion
      if (progress.workApplied >= progress.workRequired) {
        completeWork(id);
      }
    }
  }

  // Called internally when workRequired is met
  function completeWork(id) {
    if (unlocked_progress.has(id)) {
      console.log(`Completed: ${id}`);
      unlocked_progress.delete(id); // Remove from progress tracking
      complete.value.add(id);       // Add to completed set

      // Deselect if it was the currently selected item
      const tech = findTechById(id);
      if (tech) {
        if (tech.type === 'product' && currentlySelectedProduct.value === id) {
          currentlySelectedProduct.value = null;
        } else if (tech.type === 'discovery' && currentlySelectedDiscovery.value === id) {
          currentlySelectedDiscovery.value = null;
        }

        // Make newly available techs available and locked
        tech.completionMakesAvailable?.forEach(newItemId => {
          makeAvailable(newItemId);
        });
      }
    }
  }

  // Called when a tech is completed to add new prerequisites
  function makeAvailable(id) {
    if (!available.value.has(id)) { // Only add if not already available
      available.value.add(id);
      locked.value.add(id); // Newly available items start locked
      console.log(`Made available: ${id}`);
    }
  }

  // Called when user clicks an unlocked card in the grid
  function selectProduct(id) {
    if (available.value.has(id) && !locked.value.has(id) && findTechById(id)?.type === 'product') {
       currentlySelectedProduct.value = id;
       console.log(`Selected Product: ${id}`);
    }
  }

  // Called when user clicks an unlocked card in the grid
  function selectDiscovery(id) {
     if (available.value.has(id) && !locked.value.has(id) && findTechById(id)?.type === 'discovery') {
       currentlySelectedDiscovery.value = id;
       console.log(`Selected Discovery: ${id}`);
     }
  }

  // Initialize function
  function initialize() {
    available.value = new Set(['discovery1', 'discoveryA']);
    locked.value = new Set(['discovery1', 'discoveryA']);
    unlocked_progress.clear();
    complete.value = new Set();
    currentlySelectedProduct.value = null;
    currentlySelectedDiscovery.value = null;
  }

  return {
    // State (make refs/reactives available)
    available,
    locked,
    unlocked_progress,
    complete,
    currentlySelectedProduct,
    currentlySelectedDiscovery,
    // Getters
    totalIncomeRate,
    availableProducts,
    availableDiscoveries,
    completedProducts,
    completedDiscoveries,
    isLocked, // Function-style getter
    getProgress, // Function-style getter
    // Actions
    unlock,
    progressWork,
    // completeWork, // Might keep internal if only triggered by progressWork
    // makeAvailable, // Might keep internal if only triggered by completeWork
    selectProduct,
    selectDiscovery,
    initialize,
  };
});
```

### 3.4. Time Store (Game Loop)

*   **File:** `src/stores/time.js`
*   **Purpose:** Manages game time and orchestrates the main game tick updates.

```javascript
// src/stores/time.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useResourcesStore } from './resources';
import { useDatacentreStore } from './datacentre';
import { useTechTreeStore } from './techTree';
import { GAME_DURATION_MINUTES, START_YEAR, END_YEAR } from './staticData';

// Calculate how many game months pass per real-time second
const TOTAL_GAME_YEARS = END_YEAR - START_YEAR;
const TOTAL_GAME_MONTHS = TOTAL_GAME_YEARS * 12;
const TOTAL_REAL_SECONDS = GAME_DURATION_MINUTES * 60;
const MONTHS_PER_SECOND = TOTAL_GAME_MONTHS / TOTAL_REAL_SECONDS;

export const useTimeStore = defineStore('time', () => {
  // --- State ---
  const currentYear = ref(START_YEAR);
  const currentMonthIndex = ref(0); // 0 = January, 1 = February, ... 11 = December
  const isRunning = ref(false);
  const lastTickTimestamp = ref(null);
  let timerId = null; // To hold the setTimeout ID

  // --- Getters ---
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const displayDate = computed(() => `${months[currentMonthIndex.value]} ${currentYear.value}`);

  // --- Actions ---
  const resourcesStore = useResourcesStore();
  const datacentreStore = useDatacentreStore();
  const techTreeStore = useTechTreeStore();

  // The core update logic for one tick interval
  function performTick(deltaTimeSeconds) {
    if (!isRunning.value) return;

    // 1. Update Game Time
    const monthsToAdd = deltaTimeSeconds * MONTHS_PER_SECOND;
    let newMonthIndex = currentMonthIndex.value + monthsToAdd;
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
    const proportionProducts = datacentreStore.proportionWorkSpentOnProducts;
    const workForProducts = currentWorkRate * proportionProducts * deltaTimeSeconds;
    const workForDiscoveries = currentWorkRate * (1 - proportionProducts) * deltaTimeSeconds;

    if (techTreeStore.currentlySelectedProduct && workForProducts > 0) {
      techTreeStore.progressWork(techTreeStore.currentlySelectedProduct, workForProducts);
    }
    if (techTreeStore.currentlySelectedDiscovery && workForDiscoveries > 0) {
      techTreeStore.progressWork(techTreeStore.currentlySelectedDiscovery, workForDiscoveries);
    }
    // If only one type is selected, the other calculation will be 0 anyway
  }

  // Robust tick function using setTimeout
  function tick() {
    if (!isRunning.value) return; // Stop if game paused/stopped

    const now = Date.now();
    // Ensure lastTickTimestamp is set on the very first tick after starting
    if (lastTickTimestamp.value === null) {
        lastTickTimestamp.value = now;
    }
    const deltaTimeSeconds = (now - lastTickTimestamp.value) / 1000;

    // Perform the actual game state updates
    performTick(deltaTimeSeconds);

    lastTickTimestamp.value = now;

    // Schedule the next tick ~1 second later
    // Adjust timeout slightly if needed, but simple 1000ms is often fine for idle games
    timerId = setTimeout(tick, 1000);
  }

  function startGame() {
    if (isRunning.value) return; // Already running
    console.log("Starting game loop...");
    // Initialize stores
    resourcesStore.initialize();
    datacentreStore.initialize();
    techTreeStore.initialize();
    // Initialize time
    currentYear.value = START_YEAR;
    currentMonthIndex.value = 0;
    lastTickTimestamp.value = null; // Reset timestamp for accurate first delta
    isRunning.value = true;
    // Start the loop
    tick(); // Start the first tick immediately
  }

  function stopGame() { // Can be used for pause or game over
    if (!isRunning.value) return;
    console.log("Stopping game loop...");
    isRunning.value = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
     lastTickTimestamp.value = null; // Clear timestamp when stopped
  }

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
    // performTick, // Keep internal usually
  };
});

```

## 4. Component Implementation Plan

Create components within `src/components/`. Use `<script setup>` syntax for brevity.

1.  **`App.vue` (Main Layout)**
    *   Import and render `HeaderPanel`, `ResourcePanel`, `DatacentrePanel`, `TechnologyPanel`.
    *   Import `useTimeStore`.
    *   Add buttons (or use lifecycle hooks `onMounted`/`onUnmounted`) to call `timeStore.startGame()` and `timeStore.stopGame()`.
    *   Apply basic CSS for layout (e.g., using Flexbox or CSS Grid).

2.  **`HeaderPanel.vue`**
    *   Import `useTimeStore`.
    *   Display the game title "Modern AI Game".
    *   Display `timeStore.displayDate`.

3.  **`ResourcePanel.vue`**
    *   Import `useResourcesStore`.
    *   Display `resourcesStore.thoughtsAmount`, `resourcesStore.savingsAmount`, `resourcesStore.incomeRate`, `resourcesStore.workRate`. Format numbers nicely (e.g., using `toFixed`).

4.  **`DatacentrePanel.vue`**
    *   Render `ResearchersPanel`, `HardwarePanel`, `WorkPanel`, `WorkAllocatorPanel`.
    *   Apply layout styles.

5.  **`ResearchersPanel.vue`**
    *   Import `useDatacentreStore` and `useResourcesStore` (only for `creativityRate` which comes via Resources).
    *   Display `datacentreStore.numResearchers`.
    *   Display `resourcesStore.creativityRate`.
    *   Button "Hire": `@click="datacentreStore.hireResearcher"`, `:disabled="!datacentreStore.canAffordToHire"`.
    *   Button "Fire": `@click="datacentreStore.fireResearcher"`, `:disabled="datacentreStore.numResearchers <= 0"`.

6.  **`HardwarePanel.vue`**
    *   Import `useDatacentreStore`.
    *   Display `datacentreStore.currentHardwareObject?.name` (use optional chaining `?.`).
    *   Display `datacentreStore.currentHardwareObject?.flops`.
    *   Button "Upgrade":
        *   Text: `Upgrade (Cost: ${datacentreStore.nextHardwareUpgrade?.upgradeCost || 'N/A'})`
        *   `@click="datacentreStore.upgradeHardware"`
        *   `:disabled="!datacentreStore.nextHardwareUpgrade || !datacentreStore.canAffordUpgrade"`

7.  **`WorkPanel.vue`**
    *   Import `useResourcesStore`.
    *   Display `resourcesStore.workRate`.
    *   Add static text: "Work = Creativity (Researchers) * FLOPS (Hardware)".

8.  **`WorkAllocatorPanel.vue`**
    *   Import `useDatacentreStore`.
    *   Use an `<input type="range" min="0" max="1" step="0.01">`.
    *   Bind its value using `v-model` to `datacentreStore.proportionWorkSpentOnProducts`.
        *   *Note:* `v-model` on range inputs might need a computed property with getter/setter if direct binding to store state causes issues, or use `@input="datacentreStore.setWorkAllocation($event.target.valueAsNumber)"` and `:value="datacentreStore.proportionWorkSpentOnProducts"`.
    *   Display labels "Products [X%]" and "Research [Y%]" calculated from `proportionWorkSpentOnProducts`. (Products = `proportion * 100`, Research = `(1 - proportion) * 100`).

9.  **`TechnologyPanel.vue`**
    *   Render `ProductGrid` and `DiscoveryGrid`.
    *   Apply layout styles.

10. **`ProductGrid.vue`**
    *   Import `useTechTreeStore`.
    *   **Available Section:**
        *   Use `v-for` to iterate over `techTreeStore.availableProducts`.
        *   For each `id`, render a `TechCard` component (see below).
        *   Pass props to `TechCard`: `id`, `isLocked=techTreeStore.isLocked(id)`, `progress=techTreeStore.getProgress(id)`, `isSelected=(id === techTreeStore.currentlySelectedProduct)`.
    *   **Completed Section:**
        *   Use `v-for` to iterate over `techTreeStore.completedProducts`.
        *   Render a simpler display (e.g., just the name from `findTechById(id).name`).

11. **`DiscoveryGrid.vue`**
    *   Import `useTechTreeStore`.
    *   **Available Section:**
        *   Use `v-for` over `techTreeStore.availableDiscoveries`.
        *   Render `TechCard` component.
        *   Pass props: `id`, `isLocked=techTreeStore.isLocked(id)`, `progress=techTreeStore.getProgress(id)`, `isSelected=(id === techTreeStore.currentlySelectedDiscovery)`.
    *   **Completed Section:**
        *   Use `v-for` over `techTreeStore.completedDiscoveries`.
        *   Render a simpler display (e.g., just name).

12. **`TechCard.vue` (Reusable Card Component)**
    *   **Props:** `id` (string), `isLocked` (boolean), `progress` (object `{ workRequired, workApplied }` or undefined), `isSelected` (boolean).
    *   Import `useTechTreeStore`, `findTechById`.
    *   Get card details: `const tech = computed(() => findTechById(props.id))`.
    *   Display `tech.value?.name`.
    *   Display padlock icon `v-if="isLocked"`.
    *   Display progress bar `v-if="!isLocked && progress"`:
        *   Calculate `percentage = (progress.workApplied / progress.workRequired) * 100`.
        *   Use nested divs or a dedicated progress bar element, setting width based on `percentage`.
    *   Add click handler `@click="handleClick"`:
        *   Inside `handleClick`:
            *   Get `techType = tech.value?.type`.
            *   If `isLocked`, call `techTreeStore.unlock(id)`.
            *   Else if `!isLocked` and `techType === 'product'`, call `techTreeStore.selectProduct(id)`.
            *   Else if `!isLocked` and `techType === 'discovery'`, call `techTreeStore.selectDiscovery(id)`.
    *   Add visual styling for `isSelected` (e.g., change border color).

## 5. Implementation Order for Junior Dev

1.  **Setup:** Steps 1 & 2.
2.  **Static Data:** Create JSON files and `staticData.js`.
3.  **Stores (Basic State/Getters):** Create store files (`resources.js`, `datacentre.js`, `techTree.js`, `time.js`). Define *only* the `state` refs and simple `getters` that don't depend on other stores yet.
4.  **Stores (Inter-dependencies):** Implement getters that rely on other stores (e.g., `incomeRate`, `workRate`).
5.  **Components (Display Only):** Create `App.vue` and all panel/grid components. Connect them to stores and display the state/getters. Get the basic layout working.
6.  **Store Actions (Simple):** Implement simple actions like `fireResearcher`, `setWorkAllocation`, `selectProduct`, `selectDiscovery`.
7.  **Component Interactions (Simple):** Wire up buttons/sliders for the simple actions (firing, allocation, selection). Implement the `TechCard` click logic for *selecting* unlocked items.
8.  **Stores Actions (Complex):** Implement `hireResearcher`, `upgradeHardware`, `unlock`, `progressWork`, `completeWork`, `makeAvailable`. Pay close attention to checks (affordability) and calls to other stores (`spendSavings`).
9.  **Component Interactions (Complex):** Wire up buttons for hiring/upgrading. Implement the `TechCard` click logic for *unlocking* locked items. Ensure disabled states work correctly. Add progress bars.
10. **Game Loop:** Implement `startGame`, `stopGame`, `tick`, `performTick` in `TimeStore`. Call `startGame` from `App.vue`'s `onMounted`.
11. **Styling & Polish:** Add CSS to make it look like the diagram. Improve number formatting, add visual feedback for selection/completion.
12. **Testing & Debugging:** Play the game, use Vue Devtools extensively to inspect store state and track changes. Fix bugs.

This detailed plan provides a clear roadmap, breaking down the complex system into manageable parts suitable for incremental development.
```