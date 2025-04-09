# Implementation Instructions: Event and Phase System

## Overview

This document provides step-by-step instructions for implementing an event detection system, an informational popup system, and a game phase management system in the "March of Mind" game. The initial implementation focuses on transitioning the game from a "startup" phase (manual work generation) to a "lab" phase (automatic work generation) upon the completion of the first product.

Follow these instructions carefully. Do not deviate without consultation.

## Files to Create/Modify

**New Files:**

* `src/stores/phase.ts` (Phase Management Store)
* `src/components/InfoPopup.vue` (Popup Component)
* `src/components/FounderPanel.vue` (Panel for Startup Phase)

**Modified Files:**

* `src/stores/time.ts` (Add pause/resume functionality, modify tick logic)
* `src/stores/ui.ts` (Add popup state and controls)
* `src/stores/techTree.ts` (Trigger event on first product completion)
* `src/stores/resources.ts` (Minor clarification if needed, potentially new getter for manual work calculation)
* `src/App.vue` (Integrate Popup Component)
* `src/components/DatacentrePanel.vue` (Conditional rendering of Founder/Researcher panels)
* `src/types/index.ts` (Add new types/interfaces)

## Step-by-Step Implementation

**Step 1: Define Phase Types**

1.  Open `src/types/index.ts`.
2.  Add the following type definition:

    ```typescript
    /**
     * Represents the major phases of the game.
     */
    export type GamePhase = 'startup' | 'lab'; // Add more phases later as needed

    // Add the following to the declare global window interface for testing
    declare global {
      interface Window {
        // ... existing declarations
        __phaseStore?: {
          currentPhase: GamePhase;
          setPhase: (phase: GamePhase) => void;
        };
        __uiStore?: {
          // ... existing declarations
          isPopupVisible: boolean;
          popupTitle: string | null;
          popupMessage: string | null;
          showPopup: (title: string, message: string) => void;
          hidePopup: () => void;
        };
         __timeStore?: {
          // ... existing declarations
          pauseGame: () => void;
          resumeGame: () => void;
        };
      }
    }
    ```

**Step 2: Create Phase Store**

1.  Create a new file: `src/stores/phase.ts`.
2.  Add the following code:

    ```typescript
    import { defineStore } from 'pinia';
    import { ref } from 'vue';
    import type { GamePhase } from '../types';

    export const usePhaseStore = defineStore('phase', () => {
      // --- State ---
      const currentPhase = ref<GamePhase>('startup'); // Start in the 'startup' phase

      // --- Actions ---
      function setPhase(newPhase: GamePhase) {
        if (currentPhase.value !== newPhase) {
          console.log(`Transitioning from phase '${currentPhase.value}' to '${newPhase}'`);
          currentPhase.value = newPhase;
          // Potential future hook: emit('phaseChanged', newPhase);
        }
      }

      function initialize() {
        console.log("Initializing phase store");
        currentPhase.value = 'startup';
      }

      // Make store accessible for tests
      if (typeof window !== 'undefined') {
        window.__phaseStore = {
          currentPhase: currentPhase.value, // Expose value directly for reads
          setPhase // Expose action
        };
        // Watch for changes to update the global state for tests
        watch(currentPhase, (newPhase) => {
          if (window.__phaseStore) {
             window.__phaseStore.currentPhase = newPhase;
          }
        });
      }


      return {
        // State
        currentPhase,
        // Actions
        setPhase,
        initialize,
      };
    });
    ```
3.  Ensure this store is imported and initialized in `src/main.ts` similar to other stores, and add it to the global exposure section for tests.

    ```typescript
    // src/main.ts (additions)
    import { usePhaseStore } from './stores/phase';
    // ... other imports

    // Inside the setTimeout for global exposure:
    const phaseStore = usePhaseStore();
    window.__phaseStore = phaseStore; // Expose for tests
    ```

**Step 3: Add Pause/Resume to Time Store**

1.  Open `src/stores/time.ts`.
2.  Import `usePhaseStore`.
    ```typescript
    import { usePhaseStore } from './phase';
    ```
3.  Add new actions `pauseGame` and `resumeGame`.
4.  Modify `startGame`, `stopGame`, and `tick` to handle the pause state correctly.
5.  Modify `performTick` to only apply automatic work if *not* in the 'startup' phase.

    ```typescript
    // src/stores/time.ts (modifications)
    import { defineStore } from 'pinia';
    import { ref, computed } from 'vue';
    import { START_YEAR, END_YEAR, GAME_DURATION_MINUTES } from './staticData';
    import { useResourcesStore } from './resources';
    import { useDatacentreStore } from './datacentre';
    import { useTechTreeStore } from './techTree';
    import { usePhaseStore } from './phase'; // Import Phase Store

    // ... (constants remain the same)

    export const useTimeStore = defineStore('time', () => {
      // --- State ---
      const currentYear = ref(START_YEAR);
      const currentMonthIndex = ref(0); // 0 = January, ..., 11 = December
      const isRunning = ref(false); // Master running state (game on/off)
      const isPaused = ref(false); // For temporary pauses (popups, menus)
      const lastTickTimestamp = ref<number | null>(null);
      const timerId = ref<number | null>(null);

      // --- Getters ---
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const displayDate = computed(() => `${months[currentMonthIndex.value]} ${currentYear.value}`);

      // --- Actions ---
      function performTick(deltaTimeSeconds: number) {
        // Exit if game is stopped OR paused
        if (!isRunning.value || isPaused.value) return;

        const resourcesStore = useResourcesStore();
        const datacentreStore = useDatacentreStore();
        const techTreeStore = useTechTreeStore();
        const phaseStore = usePhaseStore(); // Get phase store instance

        // 1. Update Game Time (Always happens if running and not paused)
        const monthsToAdd = deltaTimeSeconds * MONTHS_PER_SECOND;
        const newMonthIndex = currentMonthIndex.value + monthsToAdd;
        currentYear.value += Math.floor(newMonthIndex / 12);
        currentMonthIndex.value = Math.floor(newMonthIndex % 12);

        if (currentYear.value > END_YEAR) {
          stopGame();
          console.log("GAME OVER - Reached end year");
          alert("Game Over!");
          return;
        }

        // 2. Update Resources (Savings and Thoughts)
        const currentIncomeRate = resourcesStore.incomeRate;
        resourcesStore.addSavings(currentIncomeRate * deltaTimeSeconds);
        // Note: 'Thoughts' might be renamed or repurposed later.
        // Currently tied to workRate, which might be 0 in startup phase.
        // Let's keep adding based on calculated workRate for now.
        resourcesStore.addThoughts(resourcesStore.workRate * deltaTimeSeconds);

        // 3. Apply *Automatic* Work (Only if NOT in startup phase)
        if (phaseStore.currentPhase !== 'startup') {
          const currentWorkRate = resourcesStore.workRate; // Cache for tick
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
        // No automatic work applied in 'startup' phase via tick
      }

      function tick() {
        // Still schedule next tick even if paused, but performTick will exit early
        if (!isRunning.value) return; // Stop if game stopped completely

        const now = Date.now();
        if (lastTickTimestamp.value === null) {
          lastTickTimestamp.value = now;
        }
        // Calculate deltaTime even if paused, so it's correct on resume
        const deltaTimeSeconds = (now - lastTickTimestamp.value) / 1000;

        // Perform game updates ONLY if not paused
        if (!isPaused.value) {
           performTick(deltaTimeSeconds);
        }

        lastTickTimestamp.value = now; // Update timestamp regardless of pause state

        // Schedule the next tick
        if (timerId.value) clearTimeout(timerId.value); // Clear previous timeout just in case
        timerId.value = setTimeout(tick, 1000);
      }

      function startGame() {
        if (isRunning.value) return;
        console.log("Starting game loop...");
        currentYear.value = START_YEAR;
        currentMonthIndex.value = 0;
        lastTickTimestamp.value = null; // Reset timestamp
        isPaused.value = false; // Ensure not paused on start
        isRunning.value = true; // Set master running state
        tick(); // Start the loop
      }

      function stopGame() {
        if (!isRunning.value) return;
        console.log("Stopping game loop...");
        isRunning.value = false; // Clear master running state
        isPaused.value = false; // Ensure not paused when stopped
        if (timerId.value) {
          clearTimeout(timerId.value);
          timerId.value = null;
        }
        lastTickTimestamp.value = null;
      }

      // New Pause function for temporary stops (popups etc.)
      function pauseGame() {
        if (isRunning.value && !isPaused.value) {
          console.log("Game paused.");
          isPaused.value = true;
          // We don't clear the timerId here, tick() keeps running but performTick exits early
        }
      }

      // New Resume function
      function resumeGame() {
        if (isRunning.value && isPaused.value) {
          console.log("Game resumed.");
          isPaused.value = false;
          // Crucially, update lastTickTimestamp to NOW to avoid a large deltaTime jump
          lastTickTimestamp.value = Date.now();
          // The existing timer will call tick() again shortly
        }
      }

      function initialize() {
         console.log("Initializing time store");
         stopGame(); // Ensure everything is stopped and reset
         currentYear.value = START_YEAR;
         currentMonthIndex.value = 0;
         // isRunning and isPaused are handled by stopGame
      }

       // Expose pause/resume for tests
       if (typeof window !== 'undefined' && window.__timeStore) {
           window.__timeStore.pauseGame = pauseGame;
           window.__timeStore.resumeGame = resumeGame;
       }


      return {
        // State
        currentYear,
        currentMonthIndex,
        isRunning, // Master run state
        isPaused, // Temporary pause state
        lastTickTimestamp,
        timerId,
        // Getters
        displayDate,
        // Actions
        startGame,
        stopGame,
        pauseGame, // Expose pause
        resumeGame, // Expose resume
        tick, // Keep tick exposed? Maybe not necessary for external calls
        performTick, // Expose for potential manual calls? Use carefully.
        initialize,
      };
    });
    ```

**Step 4: Enhance UI Store for Popups**

1.  Open `src/stores/ui.ts`.
2.  Import `useTimeStore`.
3.  Add state variables for popup visibility, title, and message.
4.  Modify `showQuizModal` and `hideQuizModal` to use the new `pauseGame`/`resumeGame` actions.
5.  Add new actions `showPopup` and `hidePopup` for generic informational popups.

    ```typescript
    // src/stores/ui.ts (modifications)
    import { defineStore } from 'pinia';
    import { ref } from 'vue';
    import { useTimeStore } from './time'; // Import time store

    export const useUiStore = defineStore('ui', () => {
      // --- State ---
      const isQuizModalVisible = ref(false);
      const quizTechId = ref<string | null>(null);

      // New state for generic popups
      const isPopupVisible = ref(false);
      const popupTitle = ref<string | null>(null);
      const popupMessage = ref<string | null>(null);

      // --- Actions ---

      // Quiz Modal Actions (Updated for Pause/Resume)
      function showQuizModal(techId: string) {
        const timeStore = useTimeStore();
        quizTechId.value = techId;
        isQuizModalVisible.value = true;
        timeStore.pauseGame(); // PAUSE game for quiz
        console.log(`Showing quiz modal for tech ${techId}, game paused.`);
      }

      function hideQuizModal() {
        const timeStore = useTimeStore();
        isQuizModalVisible.value = false;
        quizTechId.value = null;
        timeStore.resumeGame(); // RESUME game after quiz
        console.log('Quiz modal hidden, game resumed.');
      }

      // Generic Informational Popup Actions
      function showPopup(title: string, message: string) {
        const timeStore = useTimeStore();
        popupTitle.value = title;
        popupMessage.value = message;
        isPopupVisible.value = true;
        timeStore.pauseGame(); // PAUSE game for info popup
        console.log(`Showing popup "${title}", game paused.`);
      }

      function hidePopup() {
        const timeStore = useTimeStore();
        isPopupVisible.value = false;
        popupTitle.value = null;
        popupMessage.value = null;
        timeStore.resumeGame(); // RESUME game after info popup
        console.log('Popup hidden, game resumed.');
      }

      // Update global exposure for tests
      if (typeof window !== 'undefined' && window.__uiStore) {
        window.__uiStore.isPopupVisible = isPopupVisible.value; // Expose value
        window.__uiStore.popupTitle = popupTitle.value;
        window.__uiStore.popupMessage = popupMessage.value;
        window.__uiStore.showPopup = showPopup;
        window.__uiStore.hidePopup = hidePopup;
        // Watch changes to update global state
         watch(isPopupVisible, (newValue) => {
           if (window.__uiStore) window.__uiStore.isPopupVisible = newValue;
         });
         watch(popupTitle, (newValue) => {
           if (window.__uiStore) window.__uiStore.popupTitle = newValue;
         });
         watch(popupMessage, (newValue) => {
           if (window.__uiStore) window.__uiStore.popupMessage = newValue;
         });
      }


      return {
        // State
        isQuizModalVisible,
        quizTechId,
        isPopupVisible,
        popupTitle,
        popupMessage,
        // Actions
        showQuizModal,
        hideQuizModal,
        showPopup,
        hidePopup,
      };
    });
    ```

**Step 5: Create Info Popup Component**

1.  Create a new file: `src/components/InfoPopup.vue`.
2.  Add the following code:

    ```vue
    <template>
      <div v-if="uiStore.isPopupVisible" class="info-popup-container">
        <div class="info-popup-overlay"></div>
        <div class="info-popup">
          <h2 v-if="uiStore.popupTitle">{{ uiStore.popupTitle }}</h2>
          <p v-if="uiStore.popupMessage">{{ uiStore.popupMessage }}</p>
          <button @click="closePopup">Close</button>
        </div>
      </div>
    </template>

    <script setup lang="ts">
    import { useUiStore } from '../stores/ui';

    const uiStore = useUiStore();

    function closePopup() {
      uiStore.hidePopup();
    }
    </script>

    <style scoped>
    .info-popup-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000; /* Ensure it's above other content but below potential debug overlays */
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .info-popup-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(3px);
    }

    .info-popup {
      position: relative; /* To be above overlay */
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      max-width: 90%;
      width: 450px;
      z-index: 1001;
      text-align: center;
    }

    h2 {
      margin-top: 0;
      color: var(--primary-color, #42b983);
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 1.5rem;
      color: var(--text-color, #2c3e50);
      line-height: 1.6;
    }

    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      background-color: var(--primary-color, #42b983);
      color: white;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: var(--primary-hover, #3aa876);
    }
    </style>
    ```

**Step 6: Integrate Info Popup in App**

1.  Open `src/App.vue`.
2.  Import the `InfoPopup` component.
3.  Add `<InfoPopup />` within the main `<div id="app">`, typically near other global components like `<QuizModal />`.

    ```vue
    // src/App.vue (additions)
    <script setup lang="ts">
    // ... other imports
    import InfoPopup from './components/InfoPopup.vue'; // Import InfoPopup
    // ... rest of script setup
    </script>

    <template>
      <div id="app">
        <HeaderPanel />
        <main>
          </main>
        <footer>
          </footer>

        <QuizModal />
        <InfoPopup /> {/* Add the InfoPopup component */}
      </div>
    </template>

    <style>
    /* ... existing styles ... */
    </style>
    ```

**Step 7: Trigger Event and Phase Transition in Tech Tree Store**

1.  Open `src/stores/techTree.ts`.
2.  Import `useUiStore` and `usePhaseStore`.
3.  Add a new state variable `hasCompletedFirstProduct`.
4.  Modify the `completeWork` action to check for the first product completion, trigger the popup, and set the phase.

    ```typescript
    // src/stores/techTree.ts (modifications)
    import { defineStore } from 'pinia';
    import { ref, reactive, computed } from 'vue';
    import { findTechById } from './staticData';
    import { useUiStore } from './ui'; // Import UI Store
    import { usePhaseStore } from './phase'; // Import Phase Store

    export const useTechTreeStore = defineStore('techTree', () => {
      // --- State ---
      const available = ref(new Set(['discovery1', 'discoveryA']));
      const locked = ref(new Set(['discovery1', 'discoveryA']));
      const unlocked_progress = reactive(new Map());
      const complete = ref(new Set());
      const currentlySelectedProduct = ref<string | null>(null);
      const currentlySelectedDiscovery = ref<string | null>(null);
      const hasCompletedFirstProduct = ref(false); // New state flag

      // --- Getters (Computed Properties) ---
      // ... (existing getters remain the same) ...

      // --- Actions ---
      // ... (unlock, progressWork - see below, makeAvailable, selectProduct, selectDiscovery remain mostly same) ...

      function progressWork(id: string, amount: number) {
        if (unlocked_progress.has(id)) {
          const progress = unlocked_progress.get(id);
          progress.workApplied += amount;
          console.log(`Applied ${amount.toFixed(2)} work to ${id}. Progress: ${progress.workApplied.toFixed(2)}/${progress.workRequired}`);

          // Check for completion
          if (progress.workApplied >= progress.workRequired) {
            // Ensure we don't over-apply work conceptually, cap it at required
            progress.workApplied = progress.workRequired;
            completeWork(id); // Call completion logic
          }
        } else {
           console.warn(`Attempted to apply work to non-progressing tech: ${id}`);
        }
      }

      function completeWork(id: string) {
        // Ensure it's actually in progress before completing
        if (!unlocked_progress.has(id)) return;

        const tech = findTechById(id);
        console.log(`Completed: ${tech?.name || id}`);
        unlocked_progress.delete(id); // Remove from progress tracking
        complete.value.add(id);     // Add to completed set
        available.value.delete(id);   // Remove from available list (if it was there)

        // Deselect if it was the currently selected item
        if (tech) {
          if (tech.type === 'product' && currentlySelectedProduct.value === id) {
            currentlySelectedProduct.value = null;
          } else if (tech.type === 'discovery' && currentlySelectedDiscovery.value === id) {
            currentlySelectedDiscovery.value = null;
          }

          // Make newly available techs available and locked
          if (tech.completionMakesAvailable) {
            tech.completionMakesAvailable.forEach(newItemId => {
              makeAvailable(newItemId);
            });
          }

          // *** EVENT TRIGGER: First Product Completion ***
          if (tech.type === 'product' && !hasCompletedFirstProduct.value) {
            hasCompletedFirstProduct.value = true;
            console.log("EVENT: First product completed!");

            // Get store instances
            const uiStore = useUiStore();
            const phaseStore = usePhaseStore();

            // Show popup
            uiStore.showPopup(
              "Milestone Achieved!",
              "Congratulations! You've completed your first product. Your operation is moving from the initial startup phase into a dedicated lab environment. Research efforts will now be automated."
            );

            // Transition to the 'lab' phase
            phaseStore.setPhase('lab');
          }
        }
      }

       function makeAvailable(id: string) {
         const tech = findTechById(id);
         if (!tech) {
           console.warn(`Attempted to make unknown tech available: ${id}`);
           return;
         }
         // Prevent adding if already available, in progress, or completed
         if (!available.value.has(id) && !unlocked_progress.has(id) && !complete.value.has(id)) {
           available.value.add(id);
           locked.value.add(id); // Newly available items start locked
           console.log(`Made available: ${tech.name} (${id})`);
         }
       }


      function initialize() {
        console.log("Initializing techTree store");
        available.value = new Set(['discovery1', 'discoveryA']);
        locked.value = new Set(['discovery1', 'discoveryA']);
        unlocked_progress.clear();
        complete.value = new Set();
        currentlySelectedProduct.value = null;
        currentlySelectedDiscovery.value = null;
        hasCompletedFirstProduct.value = false; // Reset flag on init
      }

      // Expose necessary state/actions for tests
      if (typeof window !== 'undefined') {
         window.__techTreeStore = {
           // ... keep existing exposed items if any ...
           currentlySelectedProduct: currentlySelectedProduct.value,
           currentlySelectedDiscovery: currentlySelectedDiscovery.value,
           progressWork, // Expose for manual work application tests
           // Add other necessary items for tests
         };
         // Watchers to update global state for tests
         watch(currentlySelectedProduct, (newValue) => {
           if (window.__techTreeStore) window.__techTreeStore.currentlySelectedProduct = newValue;
         });
          watch(currentlySelectedDiscovery, (newValue) => {
           if (window.__techTreeStore) window.__techTreeStore.currentlySelectedDiscovery = newValue;
         });
      }


      return {
        // State
        available,
        locked,
        unlocked_progress,
        complete,
        currentlySelectedProduct,
        currentlySelectedDiscovery,
        hasCompletedFirstProduct, // Expose if needed for debugging/testing
        // Getters
        totalIncomeRate,
        availableProducts,
        availableDiscoveries,
        completedProducts,
        completedDiscoveries,
        isLocked,
        getProgress,
        // Actions
        unlock,
        progressWork,
        makeAvailable,
        completeWork,
        selectProduct,
        selectDiscovery,
        initialize,
      };
    });
    ```
**Step 8: Create Founder Panel Component (Startup Phase)**

1.  Create a new file `src/components/FounderPanel.vue`.
2.  Add the following code. Note the comments explaining the limitation of manual work to discoveries in this phase.

    ```vue
    <template>
      <div class="founder-panel panel-card">
        <h3>Founder Actions (Startup Phase)</h3>
        <p>Manually drive initial breakthroughs by applying focused effort to discoveries.</p>
        <div v-if="techTreeStore.currentlySelectedDiscovery">
          <p>Applying effort to: <strong>{{ selectedDiscoveryName }}</strong></p>
          <button @click="doManualResearch" :disabled="!canDoResearch">
            Focus Effort (Applies {{ manualWorkPerClick.toFixed(2) }} Work)
          </button>
          <p v-if="!canDoResearch" class="error-message">
            Cannot apply effort: No discovery selected.
          </p>
        </div>
        <div v-else>
          <p class="info-message">Select an available Discovery to begin.</p>
          <button disabled>Focus Effort</button>
        </div>

        <div class="manual-work-info">
          Work per Click ≈ FLOPS<sup>0.7</sup> &times; 1<sup>0.3</sup> (Base Effort)
          <br/>
          Current FLOPS: {{ resourcesStore.flopsRate }}
        </div>
      </div>
    </template>

    <script setup lang="ts">
    import { computed } from 'vue';
    import { useTechTreeStore } from '../stores/techTree';
    import { useResourcesStore } from '../stores/resources';
    import { findTechById } from '../stores/staticData';

    const techTreeStore = useTechTreeStore();
    const resourcesStore = useResourcesStore();

    const canDoResearch = computed(() => !!techTreeStore.currentlySelectedDiscovery);

    const selectedDiscoveryName = computed(() => {
      if (!techTreeStore.currentlySelectedDiscovery) return 'None';
      const tech = findTechById(techTreeStore.currentlySelectedDiscovery);
      return tech?.name ?? 'Unknown';
    });

    // Calculate how much work one manual click generates
    const manualWorkPerClick = computed(() => {
      // Design Decision: In 'startup', manual effort applies directly to discoveries.
      // We use current FLOPS, but assume a fixed "creativity input" of 1 per click.
      const flops = resourcesStore.flopsRate;
      const baseCreativityPerClick = 1; // Represents one unit of focused effort/creativity input.
      // Formula: Work = FLOPS^0.7 * Creativity^0.3
      return Math.pow(flops, 0.7) * Math.pow(baseCreativityPerClick, 0.3);
    });

    function doManualResearch() {
      if (!canDoResearch.value || !techTreeStore.currentlySelectedDiscovery) {
        console.warn("Attempted manual research without a selected discovery.");
        return;
      }

      const workAmount = manualWorkPerClick.value;
      const discoveryId = techTreeStore.currentlySelectedDiscovery;

      console.log(`Applying ${workAmount.toFixed(2)} manual work to ${discoveryId}`);
      techTreeStore.progressWork(discoveryId, workAmount);

      // Optional: Add visual feedback here (e.g., button flash)
    }
    </script>

    <style scoped>
    .panel-card { /* Use a consistent card style */
      background-color: #fff;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: left;
    }

    h3 {
      margin-top: 0;
      color: #2c3e50;
      text-align: center;
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 0.75rem;
      line-height: 1.5;
    }

    button {
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 4px;
      background-color: #42b983;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      display: block;
      width: 100%;
      margin-bottom: 1rem;
      transition: background-color 0.2s;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    button:hover:not(:disabled) {
       background-color: #3aa876;
    }

    .error-message {
      color: var(--error-color, #e53935);
      font-size: 0.9rem;
      margin-top: -0.5rem;
      margin-bottom: 1rem;
    }

    .info-message {
       color: var(--muted-text, #666);
       font-style: italic;
       text-align: center;
    }

    .manual-work-info {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color, #ddd);
      font-size: 0.85rem;
      color: var(--muted-text, #666);
      font-family: monospace;
      text-align: center;
    }
    </style>
    ```

**Step 9: Implement Conditional Rendering in Datacentre Panel**

1.  Open `src/components/DatacentrePanel.vue`.
2.  Import `usePhaseStore`.
3.  Import the new `FounderPanel` component.
4.  Use `v-if` directives to show `FounderPanel` in the 'startup' phase and `ResearchersPanel` + `WorkAllocatorPanel` in the 'lab' phase.
5.  **Layout Handling:** Choose *one* of the following CSS approaches for handling the layout changes between phases:

    * **Option A (Simpler - Recommended): Using Conditional CSS Classes**
        * Add a computed property for the phase class.
        * Bind this class to the `.datacentre-content` div.
        * Define CSS rules targeting `.startup-layout` and `.lab-layout`.
    * **Option B (More Complex - Advanced): Using Direct Grid Area Manipulation**
        * Relies more heavily on the structure within the `<template>` and specific CSS grid area names/rules, potentially using `:has()` if browser support is sufficient/acceptable.

6.  Apply the chosen layout approach (Option A shown below is recommended):

    ```vue
    <template>
      <div class="datacentre-panel">
        <h2>Datacentre</h2>
        <div class="datacentre-content" :class="layoutClass">

          <template v-if="phaseStore.currentPhase === 'startup'">
             <FounderPanel class="grid-founder" />
             <HardwarePanel class="grid-hardware" />
             <WorkPanel class="grid-work" />
             </template>

          <template v-else-if="phaseStore.currentPhase === 'lab'">
             <ResearchersPanel class="grid-researchers" />
             <HardwarePanel class="grid-hardware" />
             <WorkPanel class="grid-work" />
             <WorkAllocatorPanel class="grid-allocator" />
          </template>
          </div>
      </div>
    </template>

    <script setup lang="ts">
    import { computed } from 'vue'; // Import computed
    import { usePhaseStore } from '../stores/phase'; // Import Phase Store

    // Import all possible panels
    import FounderPanel from './FounderPanel.vue';
    import ResearchersPanel from './ResearchersPanel.vue';
    import HardwarePanel from './HardwarePanel.vue';
    import WorkPanel from './WorkPanel.vue';
    import WorkAllocatorPanel from './WorkAllocatorPanel.vue';

    const phaseStore = usePhaseStore();

    // Computed property for layout class (Used with Option A CSS)
    const layoutClass = computed(() => {
      return `${phaseStore.currentPhase}-layout`; // e.g., 'startup-layout' or 'lab-layout'
    });
    </script>

    <style scoped>
    .datacentre-panel {
      background-color: #f5f5f5;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    h2 {
      margin-top: 0;
      color: #2c3e50;
      text-align: center;
    }

    .datacentre-content {
      display: grid;
      gap: 1rem;
    }

    /* --- Option A CSS: Using Conditional Layout Classes --- */

    /* Default Layout (Lab Phase) */
    .datacentre-content.lab-layout {
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "researchers hardware"
        "work work"
        "allocator allocator";
    }
    .lab-layout .grid-researchers { grid-area: researchers; }
    .lab-layout .grid-hardware { grid-area: hardware; }
    .lab-layout .grid-work { grid-area: work; }
    .lab-layout .grid-allocator { grid-area: allocator; }

    /* Startup Phase Layout */
    .datacentre-content.startup-layout {
       grid-template-columns: 1fr; /* Single column */
       grid-template-areas:
         "founder"
         "hardware"
         "work";
    }
    .startup-layout .grid-founder { grid-area: founder; }
    .startup-layout .grid-hardware { grid-area: hardware; }
    .startup-layout .grid-work { grid-area: work; }

    /* --- End Option A CSS --- */

    /* --- Option B CSS: Direct Grid Area (More Complex/Potentially Brittle) --- */
    /* This approach would skip the :class binding and define grid areas */
    /* directly on the components, possibly needing more complex selectors */
    /* or relying on element order. Example (Illustrative, less recommended): */
    /*
    .datacentre-content { ... basic grid setup ... }
    .grid-item:nth-child(1) { grid-area: researchers; } // Might map to FounderPanel in startup
    .grid-item:nth-child(2) { grid-area: hardware; }
    .full-width:nth-child(3) { grid-area: work; }
    .full-width:nth-child(4) { grid-area: allocator; } // Hidden via v-if
     // Would likely need adjustments based on conditional rendering order.
    */
    /* --- End Option B CSS --- */

    </style>
    ```

**Step 10: Testing**

Perform the following tests manually, verifying UI elements, console logs, and game state changes (e.g., using browser dev tools to inspect `window.__phaseStore.currentPhase` or `window.__timeStore.isPaused`).

1.  **Initial State & Startup Phase Mechanics:**
    * [ ] Verify the game starts in the `'startup'` phase.
    * [ ] Verify the `FounderPanel` is visible in the `DatacentrePanel`.
    * [ ] Verify `ResearchersPanel` and `WorkAllocatorPanel` are hidden.
    * [ ] Verify selecting an available Discovery enables the "Focus Effort" button in `FounderPanel`.
    * [ ] Verify clicking "Focus Effort" applies work *only* to the selected Discovery's progress bar (check UI and console logs).
    * [ ] Verify game time advances (`HeaderPanel` date changes).
    * [ ] Verify *no automatic work* is applied via the game tick (tech progress *only* occurs via manual clicks).
    * [ ] Verify Savings increase if there's base income, but Thoughts likely won't increase much (as automatic `workRate` should be near 0 unless researchers are somehow present).

2.  **Event Trigger & Phase Transition:**
    * [ ] Manually complete the *first Discovery that unlocks a Product* (e.g., "Discovery 1" which unlocks "Product 1") using the "Focus Effort" button.
    * [ ] **On completion of that specific Discovery:**
        * [ ] Verify a console log indicates the event trigger ("EVENT: First product completed!" or similar, based on the revised trigger name).
        * [ ] Verify the informational popup appears ("Milestone Achieved!").
        * [ ] Verify the game time stops advancing (game is paused). Check `window.__timeStore.isPaused` is true.
    * [ ] **Close the Popup:**
        * [ ] Verify the popup closes.
        * [ ] Verify the game time *resumes* advancing. Check `window.__timeStore.isPaused` is false.
        * [ ] Verify the game phase has transitioned to `'lab'`. Check `window.__phaseStore.currentPhase`.

3.  **Lab Phase Mechanics:**
    * [ ] Verify `FounderPanel` is now hidden.
    * [ ] Verify `ResearchersPanel` and `WorkAllocatorPanel` are now visible.
    * [ ] Hire a researcher using the `ResearchersPanel`.
    * [ ] Select an available product or discovery.
    * [ ] Adjust the `WorkAllocatorPanel` slider.
    * [ ] Verify work is now applied *automatically* over time via the game tick, according to the allocation, causing progress bars to fill.
    * [ ] Complete another discovery or product. Verify the phase transition popup *does not* appear again.

4.  **Pause/Resume Functionality:**
    * [ ] Open the Quiz modal for any tech item. Verify game time pauses. Close the modal. Verify game time resumes.
    * *Re-verify (if possible by resetting state)* Trigger the phase transition popup again. Verify game time pauses. Close the popup. Verify game time resumes.

5.  **Store State & Initialization:**
    * [ ] Use browser dev tools to inspect the exposed window variables (`window.__phaseStore`, `window.__timeStore`, `window.__techTreeStore`) to confirm state changes during testing.
    * [ ] Test any "Initialize" or "Reset" functionality if available (like in `DebugPanel`) to ensure the `hasCompletedFirstProductUnlockingDiscovery` flag and `currentPhase` reset correctly.

## Implementation Checklist

- [ ] Defined `GamePhase` type and updated `Window` interface in `src/types/index.ts`.
- [ ] Created `src/stores/phase.ts` with `currentPhase` state, `setPhase` action, and `initialize` function.
- [ ] Updated `src/main.ts` to initialize `usePhaseStore` and expose it globally for tests.
- [ ] Added `isPaused` state, `pauseGame`, and `resumeGame` actions to `src/stores/time.ts`.
- [ ] Modified `startGame`, `stopGame`, and `tick` in `src/stores/time.ts` to respect `isPaused`.
- [ ] Modified `performTick` in `src/stores/time.ts` to *not* apply automatic work during the `'startup'` phase.
- [ ] Added `isPopupVisible`, `popupTitle`, `popupMessage` state to `src/stores/ui.ts`.
- [ ] Added `showPopup` and `hidePopup` actions to `src/stores/ui.ts`, ensuring they call `timeStore.pauseGame`/`resumeGame`.
- [ ] Updated `showQuizModal` and `hideQuizModal` in `src/stores/ui.ts` to use `pauseGame`/`resumeGame`.
- [ ] Created `src/components/InfoPopup.vue` component to display generic popups based on `uiStore` state.
- [ ] Imported and added `<InfoPopup />` to `src/App.vue`.
- [ ] Added `hasCompletedFirstProductUnlockingDiscovery` state flag to `src/stores/techTree.ts`.
- [ ] Modified `completeWork` action in `src/stores/techTree.ts` to detect the completion of the first discovery unlocking a product, trigger `uiStore.showPopup`, and call `phaseStore.setPhase('lab')`.
- [ ] Reset `hasCompletedFirstProductUnlockingDiscovery` flag in `techTreeStore.initialize`.
- [ ] Created `src/components/FounderPanel.vue` with a "Focus Effort" button applying manual work to the selected *discovery*, including explanatory comments.
- [ ] Imported `usePhaseStore` and `FounderPanel` into `src/components/DatacentrePanel.vue`.
- [ ] Implemented conditional rendering in `DatacentrePanel.vue` using `v-if` based on `phaseStore.currentPhase` to show `FounderPanel` ('startup') or `ResearchersPanel`/`WorkAllocatorPanel` ('lab'), applying a chosen CSS layout strategy.
- [ ] Performed manual testing following the **revised structure and steps outlined in the updated Step 10**, verifying startup mechanics, event trigger, popup, pause/resume, phase transition, and lab mechanics.
- [ ] Ensured all new code includes appropriate TypeScript types and comments for clarity.
- [ ] Ensured all modified stores correctly expose necessary states/actions for Playwright tests via the `window.__storeName` pattern.