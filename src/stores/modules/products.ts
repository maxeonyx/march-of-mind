import { defineStore } from 'pinia';
import { useTalentStore } from './talent';

// Product development constants
export const PRODUCT_DEVELOPMENT_COST = 1; // Insights needed for first product

/**
 * Store for managing product development
 */
export const useProductStore = defineStore('products', {
  state: () => {
    return {
      insights: 0,
      hasProduct: false,
      hasLaunchedFirstProduct: false,
    };
  },
  
  getters: {
    /**
     * Calculate progress toward first product (0-1)
     */
    productDevelopmentProgress: (state) => {
      return Math.min(state.insights / PRODUCT_DEVELOPMENT_COST, 1);
    },
    
    /**
     * Check if player can launch first product
     */
    canLaunchProduct: (state) => {
      return !state.hasProduct && state.insights >= PRODUCT_DEVELOPMENT_COST;
    }
  },
  
  actions: {
    /**
     * Add insights
     */
    addInsights(amount: number) {
      this.insights += amount;
    },
    
    /**
     * Process monthly insights from talent
     */
    processMonthlyDevelopment() {
      const talentStore = useTalentStore();
      this.addInsights(talentStore.monthlyInsights);
    },
    
    /**
     * Launch the first product when enough insights are available
     * @returns true if successful, false if not enough insights
     */
    launchProduct() {
      if (this.canLaunchProduct) {
        this.insights -= PRODUCT_DEVELOPMENT_COST;
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
      this.insights = 0;
      this.hasProduct = false;
      this.hasLaunchedFirstProduct = false;
    }
  }
});