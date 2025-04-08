import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { START_YEAR, END_YEAR, GAME_DURATION_MINUTES } from './staticData';
import { useResourcesStore } from './resources';
import { useDatacentreStore } from './datacentre';
import { useTechTreeStore } from './techTree';

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
  const lastTickTimestamp = ref<number | null>(null);
  const timerId = ref<number | null>(null); // To hold the setTimeout ID

  // --- Getters ---
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const displayDate = computed(() => `${months[currentMonthIndex.value]} ${currentYear.value}`);

  // --- Actions ---
  // The core update logic for one tick interval
  function performTick(deltaTimeSeconds: number) {
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

  // Robust tick function using setTimeout
  function tick() {
    if (!isRunning.value) return; // Stop if game stopped

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
    timerId.value = setTimeout(tick, 1000);
  }

  function startGame() {
    if (isRunning.value) return; // Already running
    console.log("Starting game loop...");

    // Initialize time
    currentYear.value = START_YEAR;
    currentMonthIndex.value = 0;
    lastTickTimestamp.value = null; // Reset timestamp for accurate first delta
    isRunning.value = true;

    // Start the loop
    tick(); // Start the first tick immediately
  }

  function stopGame() {
    if (!isRunning.value) return;
    console.log("Stopping game loop...");
    isRunning.value = false;
    if (timerId.value) {
      clearTimeout(timerId.value);
      timerId.value = null;
    }
    lastTickTimestamp.value = null; // Clear timestamp when stopped
  }

  function initialize() {
    console.log("Initializing time store");
    currentYear.value = START_YEAR;
    currentMonthIndex.value = 0;
    isRunning.value = false;
    lastTickTimestamp.value = null;
    if (timerId.value) {
      clearTimeout(timerId.value);
      timerId.value = null;
    }
  }

  return {
    // State
    currentYear,
    currentMonthIndex,
    isRunning,
    lastTickTimestamp,
    timerId,
    // Getters
    displayDate,
    // Actions
    startGame,
    stopGame,
    tick,
    performTick,
    initialize,
  };
});
