import { defineStore } from 'pinia';

// Time system constants
export const GAME_TICK_MS = 1000;  // How often to update the game state (1 second)
export const GAME_MONTH_MS = 2500; // How long a month lasts in real time (2.5 seconds, ~30 seconds per year)
export const START_YEAR = 1950;
export const START_MONTH = 0; // January
export const END_YEAR = 2035;
export const MONTHS_PER_YEAR = 12;

/**
 * Store for managing game time
 */
export const useTimeStore = defineStore('time', {
  state: () => {
    return {
      totalMonths: 0, // Months since game start (January 1950)
      lastTickTime: 0,
      timerId: null as number | null,
    };
  },

  getters: {
    /**
     * Calculate current year based on months elapsed
     */
    currentYear() {
      return START_YEAR + Math.floor(this.totalMonths / MONTHS_PER_YEAR);
    },

    /**
     * Calculate current month (0-11) based on months elapsed
     */
    currentMonth() {
      return (START_MONTH + this.totalMonths) % MONTHS_PER_YEAR;
    },

    /**
     * Format the current date as a string
     */
    formattedDate() {
      const date = new Date(this.currentYear, this.currentMonth, 1);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
  },

  actions: {
    /**
     * Start the game ticker
     */
    startGameTicker(tickCallback: () => void) {
      // Clear any existing timer
      if (this.timerId !== null) {
        clearInterval(this.timerId);
      }
      
      // Set the last tick time to now
      this.lastTickTime = Date.now();
      
      // Start a new timer
      this.timerId = window.setInterval(() => {
        this.processTick(tickCallback);
      }, GAME_TICK_MS);
    },
    
    /**
     * Stop the game ticker
     */
    stopGameTicker() {
      if (this.timerId !== null) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    },
    
    /**
     * Process one game tick - determines elapsed time and calls callback for each month passed
     */
    processTick(tickCallback: () => void) {
      // Calculate real time elapsed
      const now = Date.now();
      const elapsed = now - this.lastTickTime;
      this.lastTickTime = now;
      
      // Calculate how many game months have passed
      const monthsPassed = elapsed / GAME_MONTH_MS;
      
      if (monthsPassed > 0) {
        // Track previous month count
        const previousMonths = Math.floor(this.totalMonths);
        
        // Advance the total months
        this.totalMonths += monthsPassed;
        
        // Get the whole number of months that passed
        const currentMonths = Math.floor(this.totalMonths);
        const wholeMonthsPassed = currentMonths - previousMonths;
        
        // Process each full month that passed
        for (let i = 0; i < wholeMonthsPassed; i++) {
          tickCallback();
        }
      }
    },
    
    /**
     * Reset the time state
     */
    reset() {
      this.stopGameTicker();
      this.totalMonths = 0;
      this.lastTickTime = 0;
    }
  }
});