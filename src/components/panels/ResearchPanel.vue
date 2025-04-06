<template>
  <div class="research-panel-container">
    <div class="research-panel-grid">
      <!-- Left column: Product Work and Product Cards -->
      <div class="panel-column">
        <!-- Product Development Panel -->
        <ProductWorkPanel
          :hasProductInProgress="hasProductInProgress"
          :productName="productName"
          :productDescription="productDescription"
          :progress="productProgress"
          :allocationValue="insightsToProducts"
        />
        
        <!-- Products Cards -->
        <DiscoveryCardsGrid
          title="Products"
          :availableCards="availableProducts"
          :activeCards="developedProducts"
          :showDescription="true"
          @selectCard="onSelectProduct"
          @showDetails="onShowProductDetails"
        />
      </div>
      
      <!-- Right column: Research Work and Discovery Cards -->
      <div class="panel-column">
        <!-- Research Development Panel -->
        <ResearchWorkPanel
          :hasResearchInProgress="hasResearchInProgress"
          :researchTitle="researchTitle"
          :researchDescription="researchDescription"
          :progress="researchProgress"
          :allocationValue="insightsToPureResearch"
          :canStartResearch="canStartResearch"
          @startResearch="onStartResearch"
        />
        
        <!-- Discoveries Cards -->
        <DiscoveryCardsGrid
          title="Discoveries"
          :availableCards="availableDiscoveries"
          :activeCards="activeDiscoveries" 
          :showDescription="true"
          @selectCard="onSelectDiscovery"
          @showDetails="onShowDiscoveryDetails"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductWorkPanel from '@/components/panels/ProductWorkPanel.vue';
import ResearchWorkPanel from '@/components/panels/ResearchWorkPanel.vue';
import DiscoveryCardsGrid from '@/components/panels/DiscoveryCardsGrid.vue';

// Props for the component
const props = defineProps<{
  // Product work panel props
  hasProductInProgress: boolean;
  productName?: string;
  productDescription?: string;
  productProgress: number;
  insightsToProducts: number;
  
  // Research work panel props
  hasResearchInProgress: boolean;
  researchTitle?: string;
  researchDescription?: string;
  researchProgress: number;
  insightsToPureResearch: number;
  canStartResearch?: boolean;
  
  // Product cards props
  availableProducts: any[];
  unlockedProducts: any[];
  developedProducts: any[];
  
  // Discovery cards props
  availableDiscoveries: any[];
  unlockedDiscoveries: any[];
  activeDiscoveries: any[];
}>();

// Emit events back to parent
const emit = defineEmits<{
  (e: 'selectProduct', id: string): void;
  (e: 'showProductDetails', id: string): void;
  (e: 'selectDiscovery', id: string): void;
  (e: 'showDiscoveryDetails', id: string): void;
  (e: 'startResearch'): void;
}>();

// Event handlers
function onSelectProduct(id: string) {
  emit('selectProduct', id);
}

function onShowProductDetails(id: string) {
  emit('showProductDetails', id);
}

function onSelectDiscovery(id: string) {
  emit('selectDiscovery', id);
}

function onShowDiscoveryDetails(id: string) {
  emit('showDiscoveryDetails', id);
}

function onStartResearch() {
  emit('startResearch');
}
</script>

<style scoped>
.research-panel-container {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.research-panel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.panel-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .research-panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
