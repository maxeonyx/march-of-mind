import { reactive, computed } from 'vue';

// Time system constants
export const GAME_TICK_MS = 1000;  // How often to update the game state (1 second)
export const GAME_MONTH_MS = 2500; // How long a month lasts in real time (2.5 seconds, ~30 seconds per year)
export const START_YEAR = 1950;
export const START_MONTH = 0; // January
export const END_YEAR = 2035;
export const MONTHS_PER_YEAR = 12;

/**
 * Time module for managing game time
 */
export function useTime() {

  // TODO: Refactor to match useResources.
  const state = reactive({
    totalMonths: 0, // Months since game start (January 1950)
    lastTickTime: 0,
    timerId: null as number | null,
  });

  /**
   * Calculate current year based on months elapsed
   */
  const currentYear = computed(() => {
    return START_YEAR + Math.floor(state.totalMonths / MONTHS_PER_YEAR);
  });

  /**
   * Calculate current month (0-11) based on months elapsed
   */
  const currentMonth = computed(() => {
    return (START_MONTH + state.totalMonths) % MONTHS_PER_YEAR;
  });

  /**
   * Format the current date as a string
   */
  const formattedDate = computed(() => {
    const date = new Date(currentYear.value, currentMonth.value, 1);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  });

  /**
   * Start the game ticker
   */
  function startGameTicker(tickCallback: () => void) {
    // Clear any existing timer
    if (state.timerId !== null) {
      clearInterval(state.timerId);
    }
    
    // Set the last tick time to now
    state.lastTickTime = Date.now();
    
    // Start a new timer
    state.timerId = window.setInterval(() => {
      processTick(tickCallback);
    }, GAME_TICK_MS);
  }
  
  /**
   * Stop the game ticker
   */
  function stopGameTicker() {
    if (state.timerId !== null) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }
  
  /**
   * Process one game tick - determines elapsed time and calls callback for each month passed
   */
  function processTick(tickCallback: () => void) {
    // Calculate real time elapsed
    const now = Date.now();
    const elapsed = now - state.lastTickTime;
    state.lastTickTime = now;
    
    // Calculate how many game months have passed
    const monthsPassed = elapsed / GAME_MONTH_MS;
    
    if (monthsPassed > 0) {
      // Track previous month count
      const previousMonths = Math.floor(state.totalMonths);
      
      // Advance the total months
      state.totalMonths += monthsPassed;
      
      // Get the whole number of months that passed
      const currentMonths = Math.floor(state.totalMonths);
      const wholeMonthsPassed = currentMonths - previousMonths;
      
      // Process each full month that passed
      for (let i = 0; i < wholeMonthsPassed; i++) {
        tickCallback();
      }
    }
  }
  
  /**
   * Reset the time state
   */
  function reset() {
    stopGameTicker();
    state.totalMonths = 0;
    state.lastTickTime = 0;
  }

  /**
   * Save time state to an object for persistence
   */
  function save() {
    return {
      totalMonths: state.totalMonths
    };
  }
  
  /**
   * Load time state from saved data
   */
  function load(data: any) {
    if (data) {
      state.totalMonths = data.totalMonths || 0;
    }
  }

  return {
    // State
    state,
    
    // Computed
    currentYear,
    currentMonth,
    formattedDate,
    
    // Methods
    startGameTicker,
    stopGameTicker,
    processTick,
    reset,
    
    // Persistence
    save,
    load
  };
}