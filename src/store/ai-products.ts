import { reactive, computed } from 'vue';
import productsData from '@/assets/data/ai_products.json';
import type { ResourcesStore } from './resources';
import type { HardwareStore } from './hardware';
import type { EducationalQuestion } from '@/types';

// Product data structure
export interface AIProduct {
  id: string;
  name: string;
  description: string;
  flopsRequired: number;
  insightCost: number;
  revenue: number;
  yearAvailable: number;
  educationalContent?: EducationalQuestion;
  prerequisites?: string[];
}

// Current product being developed
export interface CurrentProduct {
  productId: string;
  progress: number;
}

/**
 * AI Products store module
 */
export function useAIProducts(
  resources: ResourcesStore, 
  hardware?: HardwareStore
) {
  // Load products from JSON
  const allProducts: AIProduct[] = productsData as AIProduct[];
  
  // Initialize reactive state
  const aiProducts = reactive({
    // Products the player has unlocked (they've answered the educational question)
    unlockedProducts: [] as string[],
    
    // Products the player has developed (they've spent insights to create)
    developedProducts: [] as string[],
    
    // Currently selected product for development
    selectedProductId: '' as string,
    
    // Current active product being developed (with progress)
    currentProduct: null as CurrentProduct | null,
    
    // Get all available products
    getAllProducts(): AIProduct[] {
      return allProducts;
    },
    
    // Get a product by ID
    getProduct(id: string): AIProduct | undefined {
      return allProducts.find(p => p.id === id);
    },
    
    // Check if a product is unlocked
    isProductUnlocked(id: string): boolean {
      return aiProducts.unlockedProducts.includes(id);
    },
    
    // Check if a product is developed
    isProductDeveloped(id: string): boolean {
      return aiProducts.developedProducts.includes(id);
    },
    
    // Check if we meet the prerequisites for a product
    meetsPrerequisites(id: string): boolean {
      const product = aiProducts.getProduct(id);
      if (!product || !product.prerequisites) return true;
      
      return product.prerequisites.every(prereqId => 
        aiProducts.developedProducts.includes(prereqId)
      );
    },
    
    // Check if we have enough FLOP/s for a product
    hasEnoughFlops(id: string): boolean {
      const product = aiProducts.getProduct(id);
      if (!product) return false;
      
      if (!hardware) return true; // Skip FLOP/s check if hardware isn't provided
      
      return hardware.currentFlops.value >= product.flopsRequired;
    },
    
    // Select a product to develop
    selectProduct(id: string) {
      const product = aiProducts.getProduct(id);
      if (!product) return false;
      
      aiProducts.selectedProductId = id;
      return true;
    },
    
    // Unlock a product (after answering educational question)
    unlockProduct(id: string) {
      if (aiProducts.isProductUnlocked(id)) return true;
      
      aiProducts.unlockedProducts.push(id);
      return true;
    },
    
    // Start developing a product
    startDevelopingProduct(id: string) {
      const product = aiProducts.getProduct(id);
      if (!product) return false;
      
      // Check if we have the prerequisites and enough FLOP/s
      if (!aiProducts.meetsPrerequisites(id)) return false;
      if (!aiProducts.hasEnoughFlops(id)) return false;
      
      // Set the current product
      aiProducts.currentProduct = {
        productId: id,
        progress: 0
      };
      
      return true;
    },
    
    // Make progress on the current product
    developProduct() {
      if (!aiProducts.currentProduct) return false;
      
      const product = aiProducts.getProduct(aiProducts.currentProduct.productId);
      if (!product) return false;
      
      // Check if we have enough thought power
      if (resources.thoughtPower < product.insightCost) return false;
      
      // Spend thought power and complete the product
      resources.spendThoughtPower(product.insightCost);
      
      // Add to developed products
      if (!aiProducts.developedProducts.includes(product.id)) {
        aiProducts.developedProducts.push(product.id);
      }
      
      // Add revenue
      resources.addMoney(product.revenue);
      
      // Clear current product
      aiProducts.currentProduct = null;
      
      return true;
    },
    
    // Make incremental progress on the current product
    addProductProgress(thoughtPowerAmount: number) {
      if (!aiProducts.currentProduct) return false;
      
      const product = aiProducts.getProduct(aiProducts.currentProduct.productId);
      if (!product) return false;
      
      // Calculate progress increment (normalized to thought power cost)
      const progressIncrement = thoughtPowerAmount / product.insightCost; // Using insightCost for compatibility
      
      // Add to current progress
      aiProducts.currentProduct.progress += progressIncrement;
      
      // Check if product is complete
      if (aiProducts.currentProduct.progress >= 1) {
        // Complete the product
        if (!aiProducts.developedProducts.includes(product.id)) {
          aiProducts.developedProducts.push(product.id);
        }
        
        // Add revenue
        resources.addMoney(product.revenue);
        
        // Clear current product
        aiProducts.currentProduct = null;
        
        return true; // Product completed
      }
      
      return false; // Product still in progress
    },
    
    // Calculate monthly income from all developed products
    calculateMonthlyIncome() {
      return aiProducts.developedProducts.reduce((total, id) => {
        const product = aiProducts.getProduct(id);
        return total + (product?.revenue || 0);
      }, 0);
    },
    
    // Reset the store
    reset() {
      aiProducts.unlockedProducts = [];
      aiProducts.developedProducts = [];
      aiProducts.selectedProductId = '';
      aiProducts.currentProduct = null;
    },
    
    // Save state
    save() {
      return {
        unlockedProducts: aiProducts.unlockedProducts,
        developedProducts: aiProducts.developedProducts,
        selectedProductId: aiProducts.selectedProductId,
        currentProduct: aiProducts.currentProduct
      };
    },
    
    // Load state
    load(data: any) {
      if (data) {
        aiProducts.unlockedProducts = data.unlockedProducts || [];
        aiProducts.developedProducts = data.developedProducts || [];
        aiProducts.selectedProductId = data.selectedProductId || '';
        aiProducts.currentProduct = data.currentProduct || null;
      }
    }
  });
  
  // Return the store with computed properties
  return {
    ...aiProducts,
    
    // Available products (meet prerequisites & FLOP/s requirements)
    availableProducts: computed(() => {
      return allProducts.filter(product => 
        aiProducts.meetsPrerequisites(product.id) && 
        aiProducts.hasEnoughFlops(product.id)
      );
    }),
    
    // Products that can be displayed (available or already developed)
    displayableProducts: computed(() => {
      return allProducts.filter(product => 
        aiProducts.meetsPrerequisites(product.id) || 
        aiProducts.isProductDeveloped(product.id)
      );
    }),
    
    // Monthly income from all products
    monthlyIncome: computed(() => aiProducts.calculateMonthlyIncome()),
    
    // Currently selected product
    selectedProduct: computed(() => {
      return aiProducts.getProduct(aiProducts.selectedProductId);
    }),
    
    // Can develop the selected product
    canDevelopSelectedProduct: computed(() => {
      if (!aiProducts.selectedProductId) return false;
      
      const product = aiProducts.getProduct(aiProducts.selectedProductId);
      if (!product) return false;
      
      return (
        aiProducts.meetsPrerequisites(product.id) &&
        aiProducts.hasEnoughFlops(product.id) &&
        resources.thoughtPower >= product.insightCost &&
        aiProducts.isProductUnlocked(product.id)
      );
    }),
    
    // Get the current product development progress (0-1)
    productProgress: computed(() => {
      if (!aiProducts.currentProduct) return 0;
      return aiProducts.currentProduct.progress;
    })
  };
}

export type AIProductsStore = ReturnType<typeof useAIProducts>;