import { defineStore } from 'pinia';
import { COMPANY_FOUNDING_COST } from './phase';

/**
 * Store for managing game resources (money, etc.)
 */
export const useResourcesStore = defineStore('resources', {
  state: () => {
    return {
      money: 0,
    };
  },
  
  getters: {
    /**
     * Calculate progress toward founding a company (0-1)
     */
    companyFoundingProgress: (state) => {
      return Math.min(state.money / COMPANY_FOUNDING_COST, 1);
    },
    
    /**
     * Check if player can found a company
     */
    canFoundCompany: (state) => {
      return state.money >= COMPANY_FOUNDING_COST;
    },
  },
  
  actions: {
    /**
     * Add money
     */
    addMoney(amount: number) {
      this.money += amount;
    },
    
    /**
     * Spend money if available
     * @returns true if successful, false if not enough money
     */
    spendMoney(amount: number): boolean {
      if (this.money >= amount) {
        this.money -= amount;
        return true;
      }
      return false;
    },
    
    /**
     * Earn money through manual labor
     */
    earnMoney() {
      this.money++;
    },
    
    /**
     * Pay for founding a company
     * @returns true if successful, false if not enough money
     */
    payForCompanyFounding(): boolean {
      return this.spendMoney(COMPANY_FOUNDING_COST);
    },
    
    /**
     * Reset money to 0
     */
    reset() {
      this.money = 0;
    }
  }
});