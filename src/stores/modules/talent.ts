import { defineStore } from 'pinia';
import { useResourcesStore } from './resources';

// Talent system constants
export const HIRE_TALENT_COST = 50;
export const TALENT_SALARY = 15;
export const TALENT_INCOME = 5;
export const TALENT_INSIGHTS = 0.02; // Insights generated per talent per month (50 talent-months per insight)

/**
 * Store for managing talent
 */
export const useTalentStore = defineStore('talent', {
  state: () => {
    return {
      talent: 0,
      hasHiredTalent: false,
    };
  },
  
  getters: {
    /**
     * Calculate monthly income from talent
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
     * Calculate monthly insights generated
     */
    monthlyInsights: (state) => {
      return state.talent * TALENT_INSIGHTS;
    },
    
    /**
     * Check if player can hire talent
     */
    canHireTalent() {
      const resourcesStore = useResourcesStore();
      return resourcesStore.money >= HIRE_TALENT_COST;
    },
    
    /**
     * Check if player can fire talent
     */
    canFireTalent: (state) => {
      return state.talent > 0;
    },

    /**
     * Get the progress toward first hire (0-1)
     */
    firstHireProgress() {
      const resourcesStore = useResourcesStore();
      return Math.min(resourcesStore.money / HIRE_TALENT_COST, 1);
    }
  },
  
  actions: {
    /**
     * Hire a new talent
     * @returns true if successful, false if not enough money
     */
    hireTalent() {
      const resourcesStore = useResourcesStore();
      if (this.canHireTalent) {
        resourcesStore.spendMoney(HIRE_TALENT_COST);
        this.talent++;
        
        // Mark that we've hired at least one talent
        if (!this.hasHiredTalent) {
          this.hasHiredTalent = true;
        }
        
        return true;
      }
      return false;
    },
    
    /**
     * Fire an existing talent
     * @returns true if successful, false if no talent to fire
     */
    fireTalent() {
      if (this.canFireTalent) {
        this.talent--;
        return true;
      }
      return false;
    },
    
    /**
     * Process monthly income/expenses for talent
     */
    processMonthlyFinances() {
      if (this.talent > 0) {
        const resourcesStore = useResourcesStore();
        resourcesStore.addMoney(this.monthlyNetIncome);
      }
    },
    
    /**
     * Reset talent to 0
     */
    reset() {
      this.talent = 0;
      this.hasHiredTalent = false;
    }
  }
});