import { reactive, computed } from 'vue';
import type { Product, ProductInstance } from '../types';
import productsData from '../assets/products.json';
import { type ResourcesStore } from './useResources';
import { useTalent } from './useTalent';
import { useTime } from './useTime';

// TODO: We have scrapped the marketing idea, we are going to refactor this at some point.

// Product development constants
export const PRODUCT_DEVELOPMENT_COST = 1; // Insights needed for first product
export const SATURATION_INCREASE_PER_MARKETING = 20; // % increase per marketing action
export const SATURATION_DECREASE_PER_MONTH = 5; // % decrease per month
export const MARKETING_EFFECTIVENESS_MIN = 0.2; // Min effectiveness at max saturation
export const INITIAL_SATURATION = 10; // Starting saturation for new products

/**
 * Products module for managing product development and marketing
 */
export function useProducts(
  resources: ResourcesStore,
  talent: ReturnType<typeof useTalent>,
  time: ReturnType<typeof useTime>
) {
  const state = reactive({
    hasProduct: false,
    hasLaunchedFirstProduct: false,
    activeProducts: [] as ProductInstance[],
    availableProducts: [] as Product[],
    currentIncome: 0,
    totalMarketingSaturation: 0,
    marketingEffectiveness: 1
  });

  /**
   * Calculate progress toward first product (0-1)
   */
  const productDevelopmentProgress = computed(() => {
    if (state.availableProducts.length === 0) return 0;
    const firstProduct = state.availableProducts[0];
    return Math.min(resources.insights / firstProduct.baseCost, 1);
  });

  /**
   * Check if player can launch first or next product
   */
  const canLaunchProduct = computed(() => {
    if (state.availableProducts.length === 0) return false;
    const nextProduct = state.availableProducts[0];
    return resources.insights >= nextProduct.baseCost;
  });

  /**
   * Get current product in development
   */
  const currentProductInDevelopment = computed(() => {
    return state.availableProducts.length > 0 ? state.availableProducts[0] : null;
  });

  /**
   * Get weighted market saturation (0-100%)
   */
  const weightedMarketSaturation = computed(() => {
    if (state.activeProducts.length === 0) return 0;
    
    let totalWeight = 0;
    let weightedSaturation = 0;
    
    state.activeProducts.forEach(product => {
      totalWeight += product.baseIncome;
      weightedSaturation += product.saturation * product.baseIncome;
    });
    
    return totalWeight > 0 ? weightedSaturation / totalWeight : 0;
  });

  /**
   * Calculate marketing effectiveness (0.2-1)
   * Diminishing returns based on weighted market saturation
   */
  const currentMarketingEffectiveness = computed(() => {
    // Calculate based on weighted saturation
    const saturation = state.totalMarketingSaturation / 100;
    // Linear diminishing returns with minimum effectiveness
    return Math.max(
      MARKETING_EFFECTIVENESS_MIN,
      1 - saturation * (1 - MARKETING_EFFECTIVENESS_MIN)
    );
  });

  /**
   * Initialize product store with available products
   */
  function init() {
    // Load products from JSON
    const allProducts = productsData as Product[];
    
    // Clear existing data
    state.availableProducts = [];
    
    // Initialize product data
    loadAvailableProducts(allProducts);
  }

  /**
   * Load available products based on current year
   */
  function loadAvailableProducts(allProducts: Product[]) {
    const currentYear = time.currentYear.value;
    
    // Get products that are appropriate for the current year
    // Filter to only include products from years up to the current one
    state.availableProducts = allProducts
      .filter(product => product.year <= currentYear)
      // Remove any that are already active
      .filter(product => !state.activeProducts.some(p => p.id === product.id))
      // Sort by year so oldest is first
      .sort((a, b) => a.year - b.year);
  }

  /**
   * Process monthly insights from talent
   */
  function processMonthlyDevelopment() {
    resources.addInsights(talent.monthlyInsights.value);
    
    // Process product income
    processMonthlyIncome();
    
    // Reduce saturation each month
    reduceMarketSaturation();
    
    // Update available products as time passes
    updateAvailableProducts();
  }

  /**
   * Calculate and apply monthly income from products
   */
  function processMonthlyIncome() {
    if (state.activeProducts.length === 0) return;
    
    // Calculate total income from all products
    let totalIncome = 0;
    
    state.activeProducts.forEach(product => {
      // Apply marketing effect: 100% to 120% of base income
      // Saturation reduces effectiveness, but always some benefit
      const marketingMultiplier = 1 + (1 - product.saturation / 100) * 0.2;
      product.currentIncome = product.baseIncome * marketingMultiplier;
      totalIncome += product.currentIncome;
    });
    
    state.currentIncome = totalIncome;
    
    // Add money to resources
    resources.addMoney(totalIncome);
  }

  /**
   * Reduce market saturation each month
   */
  function reduceMarketSaturation() {
    if (state.activeProducts.length === 0) return;
    
    // Reduce saturation for all products
    state.activeProducts.forEach(product => {
      product.saturation = Math.max(0, product.saturation - SATURATION_DECREASE_PER_MONTH);
    });
    
    // Recalculate total saturation
    updateTotalSaturation();
  }

  /**
   * Update available products as time passes
   */
  function updateAvailableProducts() {
    const allProducts = productsData as Product[];
    loadAvailableProducts(allProducts);
  }

  /**
   * Launch a product when enough insights are available
   * @returns true if successful, false if not enough insights
   */
  function launchProduct() {
    if (!canLaunchProduct.value || state.availableProducts.length === 0) return false;
    
    // Get the next product to launch
    const productToLaunch = state.availableProducts[0];
    
    // Deduct insights
    resources.insights -= productToLaunch.baseCost;
    
    // Create a product instance
    const newProduct: ProductInstance = {
      ...productToLaunch,
      launched: true,
      saturation: INITIAL_SATURATION,
      currentIncome: productToLaunch.baseIncome,
      progress: 1
    };
    
    // Add to active products
    state.activeProducts.push(newProduct);
    
    // Remove from available products
    state.availableProducts = state.availableProducts.slice(1);
    
    // Update state
    state.hasProduct = true;
    state.hasLaunchedFirstProduct = true;
    
    // Update total saturation
    updateTotalSaturation();
    
    return true;
  }

  /**
   * Apply marketing to boost product income
   * @returns true if marketing was applied
   */
  function applyMarketing() {
    if (state.activeProducts.length === 0) return false;
    
    // Increase saturation for all products
    state.activeProducts.forEach(product => {
      // Apply current effectiveness to the marketing effect
      const effectiveIncrease = SATURATION_INCREASE_PER_MARKETING * state.marketingEffectiveness;
      product.saturation = Math.min(100, product.saturation + effectiveIncrease);
    });
    
    // Update total saturation
    updateTotalSaturation();
    
    return true;
  }

  /**
   * Calculate and update the total marketing saturation
   */
  function updateTotalSaturation() {
    state.totalMarketingSaturation = weightedMarketSaturation.value;
    state.marketingEffectiveness = currentMarketingEffectiveness.value;
  }

  /**
   * Reset product development
   */
  function reset() {
    state.hasProduct = false;
    state.hasLaunchedFirstProduct = false;
    state.activeProducts = [];
    state.currentIncome = 0;
    state.totalMarketingSaturation = 0;
    state.marketingEffectiveness = 1;
    
    // Reinitialize available products
    init();
  }

  /**
   * Save products state to an object for persistence
   */
  function save() {
    return {
      hasProduct: state.hasProduct,
      hasLaunchedFirstProduct: state.hasLaunchedFirstProduct,
      activeProducts: state.activeProducts,
      totalMarketingSaturation: state.totalMarketingSaturation,
      marketingEffectiveness: state.marketingEffectiveness
    };
  }
  
  /**
   * Load products state from saved data
   */
  function load(data: any) {
    if (data) {
      state.hasProduct = data.hasProduct || false;
      state.hasLaunchedFirstProduct = data.hasLaunchedFirstProduct || false;
      state.activeProducts = data.activeProducts || [];
      state.totalMarketingSaturation = data.totalMarketingSaturation || 0;
      state.marketingEffectiveness = data.marketingEffectiveness || 1;
      
      // Initialize product system
      init();
    }
  }

  return {
    // State
    state,
    
    // Computed
    productDevelopmentProgress,
    canLaunchProduct,
    currentProductInDevelopment,
    weightedMarketSaturation,
    currentMarketingEffectiveness,
    
    // Methods
    init,
    processMonthlyDevelopment,
    launchProduct,
    applyMarketing,
    reset,
    
    // Persistence
    save,
    load
  };
}