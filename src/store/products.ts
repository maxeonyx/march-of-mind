import { reactive, computed, type ComputedRef } from 'vue';
import type { Product, ProductInstance } from '@/types';
import productsData from '@/assets/products.json';
import { type ResourcesStore } from './resources';
import { useTalent } from './talent';
import { useTime } from './time';

// Product development constants
export const PRODUCT_DEVELOPMENT_COST = 1; // Insights needed for first product
export const INITIAL_SATURATION = 10; // Starting saturation for new products

/**
 * Products module for managing product development
 * The marketing functionality has been removed as per TODO comment
 */
export function useProducts(
  resources: ResourcesStore,
  talent: ReturnType<typeof useTalent>,
  time: ReturnType<typeof useTime>
) {
  const products = reactive({
    hasProduct: false,
    hasLaunchedFirstProduct: false,
    activeProducts: [] as ProductInstance[],
    availableProducts: [] as Product[],
    currentIncome: 0,

    init() {
      // Load products from JSON
      const allProducts = productsData as Product[];
      
      // Clear existing data
      products.availableProducts = [];
      
      // Initialize product data
      products.loadAvailableProducts(allProducts);
    },

    loadAvailableProducts(allProducts: Product[]) {
      // Access currentYear directly from the time object (correcting the access)
      const currentYear = time.currentYear;
      
      // Get products that are appropriate for the current year
      // Filter to only include products from years up to the current one
      products.availableProducts = allProducts
        .filter(product => product.year <= currentYear)
        // Remove any that are already active
        .filter(product => !products.activeProducts.some(p => p.id === product.id))
        // Sort by year so oldest is first
        .sort((a, b) => a.year - b.year);
    },

    processMonthlyDevelopment() {
      resources.addInsights(talent.monthlyInsights);
      
      // Process product income
      products.processMonthlyIncome();
      
      // Update available products as time passes
      products.updateAvailableProducts();
    },

    processMonthlyIncome() {
      if (products.activeProducts.length === 0) return;
      
      // Calculate total income from all products
      let totalIncome = 0;
      
      products.activeProducts.forEach(product => {
        // Simple direct income without marketing effects
        product.currentIncome = product.baseIncome;
        totalIncome += product.currentIncome;
      });
      
      products.currentIncome = totalIncome;
      
      // Add money to resources
      resources.addMoney(totalIncome);
    },

    updateAvailableProducts() {
      const allProducts = productsData as Product[];
      products.loadAvailableProducts(allProducts);
    },

    launchProduct() {
      // Using direct check because we're avoiding circular reference
      if (resources.insights < (products.availableProducts[0]?.baseCost || Infinity) || 
          products.availableProducts.length === 0) return false;
      
      // Get the next product to launch
      const productToLaunch = products.availableProducts[0];
      
      // Deduct insights
      resources.insights -= productToLaunch.baseCost;
      
      // Create a product instance
      const newProduct: ProductInstance = {
        ...productToLaunch,
        launched: true,
        saturation: 0, // No saturation since marketing is removed
        currentIncome: productToLaunch.baseIncome,
        progress: 1
      };
      
      // Add to active products
      products.activeProducts.push(newProduct);
      
      // Remove from available products
      products.availableProducts = products.availableProducts.slice(1);
      
      // Update state
      products.hasProduct = true;
      products.hasLaunchedFirstProduct = true;
      
      return true;
    },

    reset() {
      products.hasProduct = false;
      products.hasLaunchedFirstProduct = false;
      products.activeProducts = [];
      products.currentIncome = 0;
      
      // Reinitialize available products
      products.init();
    },

    save() {
      return {
        hasProduct: products.hasProduct,
        hasLaunchedFirstProduct: products.hasLaunchedFirstProduct,
        activeProducts: products.activeProducts
      };
    },
    
    load(data: any) {
      if (data) {
        products.hasProduct = data.hasProduct || false;
        products.hasLaunchedFirstProduct = data.hasLaunchedFirstProduct || false;
        products.activeProducts = data.activeProducts || [];
        
        // Initialize product system
        products.init();
      }
    }
  });

  return reactive({
    ...products,
    
    productDevelopmentProgress: computed(() => {
      if (products.availableProducts.length === 0) return 0;
      const firstProduct = products.availableProducts[0];
      return Math.min(resources.insights / firstProduct.baseCost, 1);
    }),

    canLaunchProduct: computed(() => {
      if (products.availableProducts.length === 0) return false;
      const nextProduct = products.availableProducts[0];
      return resources.insights >= nextProduct.baseCost;
    }),

    currentProductInDevelopment: computed(() => {
      return products.availableProducts.length > 0 ? products.availableProducts[0] : null;
    }),
  });
}