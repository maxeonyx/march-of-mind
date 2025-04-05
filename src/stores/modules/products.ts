import { defineStore } from 'pinia';
import { useTalentStore } from './talent';
import { useTimeStore } from './time';
import { Product, ProductInstance } from '../../types';
import productsData from '../../assets/products.json';

// Product development constants
export const PRODUCT_DEVELOPMENT_COST = 1; // Insights needed for first product
export const SATURATION_INCREASE_PER_MARKETING = 20; // % increase per marketing action
export const SATURATION_DECREASE_PER_MONTH = 5; // % decrease per month
export const MARKETING_EFFECTIVENESS_MIN = 0.2; // Min effectiveness at max saturation
export const INITIAL_SATURATION = 10; // Starting saturation for new products

/**
 * Store for managing product development and marketing
 */
export const useProductStore = defineStore('products', {
  state: () => {
    return {
      insights: 0,
      hasProduct: false,
      hasLaunchedFirstProduct: false,
      activeProducts: [] as ProductInstance[],
      availableProducts: [] as Product[],
      currentIncome: 0,
      totalMarketingSaturation: 0,
      marketingEffectiveness: 1
    };
  },
  
  getters: {
    /**
     * Calculate progress toward first product (0-1)
     */
    productDevelopmentProgress: (state) => {
      if (state.availableProducts.length === 0) return 0;
      const firstProduct = state.availableProducts[0];
      return Math.min(state.insights / firstProduct.baseCost, 1);
    },
    
    /**
     * Check if player can launch first or next product
     */
    canLaunchProduct: (state) => {
      if (state.availableProducts.length === 0) return false;
      const nextProduct = state.availableProducts[0];
      return state.insights >= nextProduct.baseCost;
    },
    
    /**
     * Get current product in development
     */
    currentProductInDevelopment: (state) => {
      return state.availableProducts.length > 0 ? state.availableProducts[0] : null;
    },
    
    /**
     * Get weighted market saturation (0-100%)
     */
    weightedMarketSaturation: (state) => {
      if (state.activeProducts.length === 0) return 0;
      
      let totalWeight = 0;
      let weightedSaturation = 0;
      
      state.activeProducts.forEach(product => {
        totalWeight += product.baseIncome;
        weightedSaturation += product.saturation * product.baseIncome;
      });
      
      return totalWeight > 0 ? weightedSaturation / totalWeight : 0;
    },
    
    /**
     * Calculate marketing effectiveness (0.2-1)
     * Diminishing returns based on weighted market saturation
     */
    currentMarketingEffectiveness: (state): number => {
      // Calculate based on weighted saturation
      const saturation = state.totalMarketingSaturation / 100;
      // Linear diminishing returns with minimum effectiveness
      return Math.max(
        MARKETING_EFFECTIVENESS_MIN,
        1 - saturation * (1 - MARKETING_EFFECTIVENESS_MIN)
      );
    }
  },
  
  actions: {
    /**
     * Initialize product store with available products
     */
    init() {
      // Load products from JSON
      const allProducts = productsData as Product[];
      
      // Clear existing data
      this.availableProducts = [];
      
      // Initialize product data
      this.loadAvailableProducts(allProducts);
    },
    
    /**
     * Load available products based on current year
     */
    loadAvailableProducts(allProducts: Product[]) {
      const timeStore = useTimeStore();
      const currentYear = timeStore.currentYear;
      
      // Get products that are appropriate for the current year
      // Filter to only include products from years up to the current one
      this.availableProducts = allProducts
        .filter(product => product.year <= currentYear)
        // Remove any that are already active
        .filter(product => !this.activeProducts.some(p => p.id === product.id))
        // Sort by year so oldest is first
        .sort((a, b) => a.year - b.year);
    },
    
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
      
      // Process product income
      this.processMonthlyIncome();
      
      // Reduce saturation each month
      this.reduceMarketSaturation();
      
      // Update available products as time passes
      this.updateAvailableProducts();
    },
    
    /**
     * Calculate and apply monthly income from products
     */
    processMonthlyIncome() {
      if (this.activeProducts.length === 0) return;
      
      // Calculate total income from all products
      let totalIncome = 0;
      
      this.activeProducts.forEach(product => {
        // Apply marketing effect: 100% to 120% of base income
        // Saturation reduces effectiveness, but always some benefit
        const marketingMultiplier = 1 + (1 - product.saturation / 100) * 0.2;
        product.currentIncome = product.baseIncome * marketingMultiplier;
        totalIncome += product.currentIncome;
      });
      
      this.currentIncome = totalIncome;
      
      // Add money to resources
      const resourcesStore = useResourcesStore();
      resourcesStore.addMoney(totalIncome);
    },
    
    /**
     * Reduce market saturation each month
     */
    reduceMarketSaturation() {
      if (this.activeProducts.length === 0) return;
      
      // Reduce saturation for all products
      this.activeProducts.forEach(product => {
        product.saturation = Math.max(0, product.saturation - SATURATION_DECREASE_PER_MONTH);
      });
      
      // Recalculate total saturation
      this.updateTotalSaturation();
    },
    
    /**
     * Update available products as time passes
     */
    updateAvailableProducts() {
      const allProducts = productsData as Product[];
      this.loadAvailableProducts(allProducts);
    },
    
    /**
     * Launch a product when enough insights are available
     * @returns true if successful, false if not enough insights
     */
    launchProduct() {
      if (!this.canLaunchProduct || this.availableProducts.length === 0) return false;
      
      // Get the next product to launch
      const productToLaunch = this.availableProducts[0];
      
      // Deduct insights
      this.insights -= productToLaunch.baseCost;
      
      // Create a product instance
      const newProduct: ProductInstance = {
        ...productToLaunch,
        launched: true,
        saturation: INITIAL_SATURATION,
        currentIncome: productToLaunch.baseIncome,
        progress: 1
      };
      
      // Add to active products
      this.activeProducts.push(newProduct);
      
      // Remove from available products
      this.availableProducts = this.availableProducts.slice(1);
      
      // Update state
      this.hasProduct = true;
      this.hasLaunchedFirstProduct = true;
      
      // Update total saturation
      this.updateTotalSaturation();
      
      return true;
    },
    
    /**
     * Apply marketing to boost product income
     * @returns true if marketing was applied
     */
    applyMarketing() {
      if (this.activeProducts.length === 0) return false;
      
      // Increase saturation for all products
      this.activeProducts.forEach(product => {
        // Apply current effectiveness to the marketing effect
        const effectiveIncrease = SATURATION_INCREASE_PER_MARKETING * this.marketingEffectiveness;
        product.saturation = Math.min(100, product.saturation + effectiveIncrease);
      });
      
      // Update total saturation
      this.updateTotalSaturation();
      
      return true;
    },
    
    /**
     * Calculate and update the total marketing saturation
     */
    updateTotalSaturation() {
      this.totalMarketingSaturation = this.weightedMarketSaturation;
      this.marketingEffectiveness = this.currentMarketingEffectiveness;
    },
    
    /**
     * Reset product development
     */
    reset() {
      this.insights = 0;
      this.hasProduct = false;
      this.hasLaunchedFirstProduct = false;
      this.activeProducts = [];
      this.currentIncome = 0;
      this.totalMarketingSaturation = 0;
      this.marketingEffectiveness = 1;
      
      // Reinitialize available products
      this.init();
    }
  }
});

// Need to import this after defining the store to avoid circular dependencies
import { useResourcesStore } from './resources';