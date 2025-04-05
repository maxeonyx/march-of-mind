import { defineStore } from 'pinia';

// Game constants
export const COMPANY_FOUNDING_COST = 100;
export const HIRE_TALENT_COST = 50;
export const TALENT_SALARY = 10;
export const TALENT_INCOME = 15;
export const GAME_TICK_MS = 1000;  // How often to update the game state (1 second)
export const GAME_MONTH_MS = 5000; // How long a month lasts in real time (5 seconds)
export const START_DATE = new Date(1950, 0, 1); // January 1, 1950
export const END_DATE = new Date(2035, 11, 31); // December 31, 2035

/**
 * Game phases
 */
export enum GamePhase {
  JOB = 'job',
  COMPANY = 'company',
  MARKETING = 'marketing',
  RESEARCH = 'research'
}

/**
 * Central store for the game state
 */
export const useAppStore = defineStore('app', {
  state: () => {
    return {
      message: 'Welcome to March of Mind!',
      count: 0,
      gamePhase: GamePhase.JOB,
      lastSavedAt: 0,
      
      // Time system
      currentDate: new Date(START_DATE),
      lastTickTime: 0,
      timerId: null as number | null,
      
      // Talent system
      talent: 0,
      lastSalaryPaymentDate: new Date(START_DATE)
    };
  },
  
  getters: {
    /**
     * Get the current money amount
     */
    money: (state) => state.count,
    
    /**
     * Calculate progress toward founding a company (0-1)
     */
    companyFoundingProgress: (state) => {
      return Math.min(state.count / COMPANY_FOUNDING_COST, 1);
    },
    
    /**
     * Check if player can found a company
     */
    canFoundCompany: (state) => {
      return state.count >= COMPANY_FOUNDING_COST;
    },
    
    /**
     * Check if player has already founded a company
     */
    hasFoundedCompany: (state) => {
      return state.gamePhase !== GamePhase.JOB;
    },
    
    /**
     * Calculate monthly passive income from talent
     */
    monthlyIncome: (state) => {
      return state.talent * TALENT_INCOME;
    },
    
    /**
     * Calculate monthly salary expenses
     */
    monthlySalary: (state) => {
      return state.talent * TALENT_SALARY;
    },
    
    /**
     * Calculate net monthly income (income - expenses)
     */
    monthlyNetIncome: (state) => {
      return state.talent * (TALENT_INCOME - TALENT_SALARY);
    },
    
    /**
     * Check if player can hire talent
     */
    canHireTalent: (state) => {
      return state.count >= HIRE_TALENT_COST;
    },
    
    /**
     * Check if player can fire talent
     */
    canFireTalent: (state) => {
      return state.talent > 0;
    },
    
    /**
     * Format the current date as a string
     */
    formattedDate: (state) => {
      return state.currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
  },
  
  actions: {
    /**
     * Earn money through manual labor
     */
    earnMoney() {
      this.count++;
      this.saveGame();
    },
    
    /**
     * Found a company when enough money is available
     */
    foundCompany() {
      if (this.canFoundCompany) {
        this.count -= COMPANY_FOUNDING_COST;
        this.gamePhase = GamePhase.COMPANY;
        this.startGameTicker();
        this.saveGame();
        return true;
      }
      return false;
    },
    
    /**
     * Hire a new talent
     */
    hireTalent() {
      if (this.canHireTalent) {
        this.count -= HIRE_TALENT_COST;
        this.talent++;
        this.saveGame();
        return true;
      }
      return false;
    },
    
    /**
     * Fire an existing talent
     */
    fireTalent() {
      if (this.canFireTalent) {
        this.talent--;
        this.saveGame();
        return true;
      }
      return false;
    },
    
    /**
     * Start the game ticker that advances time and processes events
     */
    startGameTicker() {
      // Clear any existing timer
      if (this.timerId !== null) {
        clearInterval(this.timerId);
      }
      
      // Set the last tick time to now
      this.lastTickTime = Date.now();
      
      // Start a new timer
      this.timerId = window.setInterval(() => {
        this.processTick();
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
     * Process one game tick
     */
    processTick() {
      // Calculate how much time has passed since the last tick
      const now = Date.now();
      const elapsed = now - this.lastTickTime;
      this.lastTickTime = now;
      
      // Calculate how many game months have passed
      const monthsPassed = elapsed / GAME_MONTH_MS;
      
      if (monthsPassed > 0) {
        // Advance the game date
        const newDate = new Date(this.currentDate);
        newDate.setMonth(newDate.getMonth() + Math.floor(monthsPassed));
        this.currentDate = newDate;
        
        // Process monthly events (only if we've entered a new month)
        if (this.currentDate > this.lastSalaryPaymentDate) {
          this.processMonthlyEvents();
        }
      }
      
      // Also handle partial month passive income
      if (this.gamePhase !== GamePhase.JOB && monthsPassed > 0) {
        // Add fractional income for partial months
        this.count += this.monthlyNetIncome * monthsPassed;
      }
      
      // Save the game if changes were made
      if (monthsPassed > 0) {
        this.saveGame();
      }
    },
    
    /**
     * Process monthly events (salaries, etc.)
     */
    processMonthlyEvents() {
      // Update the last salary payment date
      this.lastSalaryPaymentDate = new Date(this.currentDate);
      
      // No events to process if not in company phase
      if (this.gamePhase === GamePhase.JOB) {
        return;
      }
      
      // Process income (handled in the partial month processing)
      
      // Check if player has reached the end date
      if (this.currentDate >= END_DATE) {
        // Game completed logic here
        console.log('Game completed - reached 2035!');
      }
    },
    
    /**
     * Save the game state to localStorage
     */
    saveGame() {
      const saveData = {
        count: this.count,
        gamePhase: this.gamePhase,
        savedAt: Date.now(),
        currentDate: this.currentDate.toISOString(),
        talent: this.talent,
        lastSalaryPaymentDate: this.lastSalaryPaymentDate.toISOString()
      };
      localStorage.setItem('marchOfMindSave', JSON.stringify(saveData));
      this.lastSavedAt = saveData.savedAt;
    },
    
    /**
     * Load the game state from localStorage
     */
    loadGame() {
      const saveData = localStorage.getItem('marchOfMindSave');
      if (saveData) {
        try {
          const data = JSON.parse(saveData);
          this.count = data.count || 0;
          this.gamePhase = data.gamePhase || GamePhase.JOB;
          this.lastSavedAt = data.savedAt || 0;
          
          // Load time system data
          if (data.currentDate) {
            this.currentDate = new Date(data.currentDate);
          }
          
          // Load talent system data
          this.talent = data.talent || 0;
          if (data.lastSalaryPaymentDate) {
            this.lastSalaryPaymentDate = new Date(data.lastSalaryPaymentDate);
          }
          
          // If we're in company phase, start the game ticker
          if (this.gamePhase !== GamePhase.JOB) {
            this.startGameTicker();
          }
          
          return true;
        } catch (e) {
          console.error('Failed to load save data', e);
          return false;
        }
      }
      return false;
    },
    
    /**
     * Reset the game state (for testing or starting over)
     */
    resetGame() {
      // Stop the game ticker
      this.stopGameTicker();
      
      // Reset all state
      this.count = 0;
      this.gamePhase = GamePhase.JOB;
      this.currentDate = new Date(START_DATE);
      this.talent = 0;
      this.lastSalaryPaymentDate = new Date(START_DATE);
      
      // Clear local storage
      localStorage.removeItem('marchOfMindSave');
      this.lastSavedAt = 0;
    }
  }
});