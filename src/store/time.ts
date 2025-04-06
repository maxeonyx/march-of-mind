import { reactive, computed, type ComputedRef } from 'vue';

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
  const time = reactive({
    totalMonths: 0, // Months since game start (January 1950)
    lastTickTime: 0,
    timerId: null as ReturnType<typeof setInterval> | null,

    startGameTicker(tickCallback: () => void) {
      // Clear any existing timer
      if (time.timerId !== null) {
        clearInterval(time.timerId);
      }
      
      // Set the last tick time to now
      time.lastTickTime = Date.now();
      
      // Start a new timer
      // Using global setInterval instead of window.setInterval to avoid ESLint error
      time.timerId = setInterval(() => {
        time.processTick(tickCallback);
      }, GAME_TICK_MS);
    },
    
    stopGameTicker() {
      if (time.timerId !== null) {
        clearInterval(time.timerId);
        time.timerId = null;
      }
    },
    
    processTick(tickCallback: () => void) {
      // Calculate real time elapsed
      const now = Date.now();
      const elapsed = now - time.lastTickTime;
      time.lastTickTime = now;
      
      // Calculate how many game months have passed
      const monthsPassed = elapsed / GAME_MONTH_MS;
      
      if (monthsPassed > 0) {
        // Track previous month count
        const previousMonths = Math.floor(time.totalMonths);
        
        // Advance the total months
        time.totalMonths += monthsPassed;
        
        // Get the whole number of months that passed
        const currentMonths = Math.floor(time.totalMonths);
        const wholeMonthsPassed = currentMonths - previousMonths;
        
        // Process each full month that passed
        for (let i = 0; i < wholeMonthsPassed; i++) {
          tickCallback();
        }
      }
    },
    
    reset() {
      time.stopGameTicker();
      time.totalMonths = 0;
      time.lastTickTime = 0;
    },

    save() {
      return {
        totalMonths: time.totalMonths
      };
    },
    
    load(data: any) {
      if (data) {
        time.totalMonths = data.totalMonths || 0;
      }
    },
  });
  
  return reactive({
    ...time,
    
    currentYear: computed(() => {
      return START_YEAR + Math.floor(time.totalMonths / MONTHS_PER_YEAR);
    }),

    currentMonth: computed(() => {
      return (START_MONTH + time.totalMonths) % MONTHS_PER_YEAR;
    }),

    formattedDate: computed(() => {
      const date = new Date(
        START_YEAR + Math.floor(time.totalMonths / MONTHS_PER_YEAR), 
        (START_MONTH + time.totalMonths) % MONTHS_PER_YEAR, 
        1
      );
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    }),
  });
}