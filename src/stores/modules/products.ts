import { defineStore } from 'pinia';
import { useTalentStore } from './talent';

// Product development constants
export const PRODUCT_DEVELOPMENT_COST = 100; // Development points needed for first product

/**
 * Store for managing product development
 */
export const useProductStore = defineStore('products', {
  state: () => {
    return {
      developmentPoints: 0,
      hasProduct: false,
      hasLaunchedFirstProduct: false,
    };
  },
  
  getters: {
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
    }
  },
  
  actions: {
    /**
     * Add development points
     */
    addDevelopmentPoints(amount: number) {
      this.developmentPoints += amount;
    },
    
    /**
     * Process monthly development from talent
     */
    processMonthlyDevelopment() {
      const talentStore = useTalentStore();
      this.addDevelopmentPoints(talentStore.monthlyDevelopmentPoints);
    },
    
    /**
     * Launch the first product when enough development points are available
     * @returns true if successful, false if not enough development points
     */
    launchProduct() {
      if (this.canLaunchProduct) {
        this.developmentPoints -= PRODUCT_DEVELOPMENT_COST;
        this.hasProduct = true;
        this.hasLaunchedFirstProduct = true;
        return true;
      }
      return false;
    },
    
    /**
     * Reset product development
     */
    reset() {
      this.developmentPoints = 0;
      this.hasProduct = false;
      this.hasLaunchedFirstProduct = false;
    }
  }
});