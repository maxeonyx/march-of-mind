import { defineStore } from 'pinia';

// Game constants
export const COMPANY_FOUNDING_COST = 100;
export const HIRE_TALENT_COST = 50;
export const TALENT_SALARY = 15;
export const TALENT_INCOME = 5;
export const TALENT_DEVELOPMENT_POINTS = 2; // Development points generated per talent per month
export const PRODUCT_DEVELOPMENT_COST = 100; // Development points needed for first product
export const GAME_TICK_MS = 1000;  // How often to update the game state (1 second)
export const GAME_MONTH_MS = 2500; // How long a month lasts in real time (2.5 seconds, ~30 seconds per year)
export const START_YEAR = 1950;
export const START_MONTH = 0; // January
export const END_YEAR = 2035;
export const MONTHS_PER_YEAR = 12;

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
      totalMonths: 0, // Months since game start (January 1950)
      lastTickTime: 0,
      timerId: null as number | null,
      
      // Talent system
      talent: 0,
      
      // Product development system
      developmentPoints: 0,
      hasProduct: false
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
     * Calculate monthly development points generated
     */
    monthlyDevelopmentPoints: (state) => {
      return state.talent * TALENT_DEVELOPMENT_POINTS;
    },
    
    /**
     * Calculate progress toward first product (0-1)
     */
    productDevelopmentProgress: (state) => {
      return Math.min(state.developmentPoints / PRODUCT_DEVELOPMENT_COST, 1);
    },
    
    /**
     * Check if player can launch first product
     */
    canLaunchProduct: (state) => {
      return !state.hasProduct && state.developmentPoints >= PRODUCT_DEVELOPMENT_COST;
    },
    
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
     * Launch the first product when enough development points are available
     */
    launchProduct() {
      if (this.canLaunchProduct) {
        this.developmentPoints -= PRODUCT_DEVELOPMENT_COST;
        this.hasProduct = true;
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
     * Process one game tick - determines elapsed time and calls processOneMonth() as needed
     */
    processTick() {
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
          this.processOneMonth();
        }
        
        // Save the game
        this.saveGame();
      }
    },
    
    /**
     * Process a single month of game time
     */
    processOneMonth() {
      // No events to process if not in company phase
      if (this.gamePhase === GamePhase.JOB) {
        return;
      }
      
      // Apply monthly income or expense
      this.count += this.monthlyNetIncome;
      
      // Add development points based on talent
      this.developmentPoints += this.monthlyDevelopmentPoints;
    },
    
    /**
     * Save the game state to localStorage
     */
    saveGame() {
      const saveData = {
        count: this.count,
        gamePhase: this.gamePhase,
        savedAt: Date.now(),
        totalMonths: this.totalMonths,
        talent: this.talent,
        developmentPoints: this.developmentPoints,
        hasProduct: this.hasProduct
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
          this.totalMonths = data.totalMonths || 0;
          
          // Load talent system data
          this.talent = data.talent || 0;
          
          // Load product development data
          this.developmentPoints = data.developmentPoints || 0;
          this.hasProduct = data.hasProduct || false;
          
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
      this.totalMonths = 0;
      this.talent = 0;
      this.developmentPoints = 0;
      this.hasProduct = false;
      
      // Clear local storage
      localStorage.removeItem('marchOfMindSave');
      this.lastSavedAt = 0;
    }
  }
});