import { defineStore } from 'pinia';

// Game constants
export const COMPANY_FOUNDING_COST = 100;

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
      lastSavedAt: 0
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
        this.saveGame();
        return true;
      }
      return false;
    },
    
    /**
     * Save the game state to localStorage
     */
    saveGame() {
      const saveData = {
        count: this.count,
        gamePhase: this.gamePhase,
        savedAt: Date.now()
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
      this.count = 0;
      this.gamePhase = GamePhase.JOB;
      localStorage.removeItem('marchOfMindSave');
      this.lastSavedAt = 0;
    }
  }
});