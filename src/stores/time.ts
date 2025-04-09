import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { START_YEAR, END_YEAR, GAME_DURATION_MINUTES } from './staticData';
import { useResourcesStore } from './resources';
import { useDatacentreStore } from './datacentre';
import { useTechTreeStore } from './techTree';
import { usePhaseStore } from './phase'; // Import Phase Store

// Calculate how many game months pass per real-time second
const TOTAL_GAME_YEARS = END_YEAR - START_YEAR;
const TOTAL_GAME_MONTHS = TOTAL_GAME_YEARS * 12;
const TOTAL_REAL_SECONDS = GAME_DURATION_MINUTES * 60;
const MONTHS_PER_SECOND = TOTAL_GAME_MONTHS / TOTAL_REAL_SECONDS;

export const useTimeStore = defineStore('time', () => {
  // --- State ---
  const currentYear = ref(START_YEAR);
  const currentMonthIndex = ref(0); // 0 = January, 1 = February, ... 11 = December
  const isRunning = ref(false); // Master running state (game on/off)
  const isPaused = ref(false); // For temporary pauses (popups, menus)
  const lastTickTimestamp = ref<number | null>(null);
  const timerId = ref<number | null>(null); // To hold the setTimeout ID

  // --- Getters ---
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const displayDate = computed(() => `${months[currentMonthIndex.value]} ${currentYear.value}`);

  // --- Actions ---
  // The core update logic for one tick interval
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

  // Robust tick function using setTimeout
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
   if (typeof window !== 'undefined') {
       if (window.__timeStore) {
         window.__timeStore.pauseGame = pauseGame;
         window.__timeStore.resumeGame = resumeGame;
       }
       // Watch for changes to update global state
       watch(isPaused, (newValue) => {
         if (window.__timeStore) {
           window.__timeStore.isPaused = newValue;
         }
       });
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