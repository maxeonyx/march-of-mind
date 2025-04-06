<template>
  <div class="phase-container lab-phase">
    <!-- Top row with hardware and research panels -->
    <div class="top-row">
      <!-- Hardware Panel -->
      <HardwarePanel
        :hardware="hardware"
        :onUpgrade="upgradeHardware"
      />
      
      <!-- Research Panel -->
      <ResearchPanel
        @research="doResearch"
      />
    </div>
    
    <!-- Insight Rate Indicator -->
    <InsightRateDisplay :rate="insightRate" />
    
    <!-- Resource Allocation Slider -->
    <ResourceAllocationSlider
      v-model="allocation"
      :leftValue="insightsToProducts"
      :rightValue="insightsToPureResearch"
    />
    
    <!-- Work Panels -->
    <div class="work-panels">
      <!-- Product Development Panel -->
      <ProductWorkPanel
        :hasProductInProgress="productInProgress"
        :productName="productInProgress ? aiProducts.selectedProduct.name : ''"
        :productDescription="productInProgress ? aiProducts.selectedProduct.description : ''"
        :progress="aiProducts.productProgress"
        :allocationValue="insightsToProducts"
      />
      
      <!-- Research Development Panel -->
      <ResearchWorkPanel
        :hasResearchInProgress="researchInProgress"
        researchTitle="Pure Research"
        researchDescription="Advance your theoretical understanding by investing in pure research."
        :progress="researchProgress"
        :allocationValue="insightsToPureResearch"
        :canStartResearch="canStartResearch"
        @startResearch="startResearch"
      />
    </div>
    
    <!-- Products and Discoveries -->
    <div class="cards-row">
      <!-- Products Panel -->
      <ProductCardsGrid
        :availableProducts="availableProducts"
        :unlockedProducts="unlockedProducts"
        :developedProducts="developedProducts"
        :isProductUnlocked="isAIProductUnlocked"
        @selectProduct="selectAIProduct"
        @showDetails="showProductDetails"
      />
      
      <!-- Discoveries Panel -->
      <DiscoveryCardsGrid
        :availableDiscoveries="availableDiscoveries"
        :unlockedDiscoveries="unlockedDiscoveries"
        :activeDiscoveries="activeDiscoveries"
      />
    </div>
    
    <!-- Tech Tree Section -->
    <div class="tech-tree-section">
      <h3>Tech Tree</h3>
      <div class="tech-tree-placeholder">
        <!-- Tech Tree visualization will be implemented here -->
      </div>
    </div>
    
    <!-- Educational modals -->
    <EducationalModal
      :visible="showProductEducationalModal"
      :title="productEducationalTitle"
      :content="productEducationalContent"
      :question="productEducationalQuestion"
      :cancellable="true"
      @success="completeProductEducation"
      @cancel="cancelProductEducation"
    />
    
    <EducationalModal
      :visible="showEducationalModal"
      :title="educationalModalTitle"
      :content="educationalModalContent"
      :question="educationalModalQuestion"
      :cancellable="false"
      @success="completeEducation"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import EducationalModal from '@/components/EducationalModal.vue';
import HardwarePanel from '@/components/panels/HardwarePanel.vue';
import ResearchPanel from '@/components/panels/ResearchPanel.vue';
import InsightRateDisplay from '@/components/panels/InsightRateDisplay.vue';
import ResourceAllocationSlider from '@/components/panels/ResourceAllocationSlider.vue';
import ProductWorkPanel from '@/components/panels/ProductWorkPanel.vue';
import ResearchWorkPanel from '@/components/panels/ResearchWorkPanel.vue';
import ProductCardsGrid from '@/components/panels/ProductCardsGrid.vue';
import DiscoveryCardsGrid from '@/components/panels/DiscoveryCardsGrid.vue';

import { useGameStore } from '@/store';
import type { EducationalQuestion } from '@/types';

const gameStore = useGameStore();
const researchers = gameStore.researchers;
const hardware = gameStore.hardware;
const aiProducts = gameStore.aiProducts;

// Modal state for educational content
const showEducationalModal = ref(false);
const educationalModalTitle = ref('');
const educationalModalContent = ref('');
const educationalModalQuestion = ref<EducationalQuestion>({
  question: '',
  answers: [],
  correctAnswerIndex: 0,
  explanation: ''
});
const pendingAction = ref<string | null>(null);

const showProductEducationalModal = ref(false);
const productEducationalTitle = ref('');
const productEducationalContent = ref('');
const productEducationalQuestion = ref<EducationalQuestion>({
  question: '',
  answers: [],
  correctAnswerIndex: 0,
  explanation: ''
});
const pendingProductId = ref<string | null>(null);

// Research and insight related properties
const insightRate = computed(() => researchers.insightRate);

// Resource allocation slider - controls balance between product development and research
// This allocation determines how insights are distributed between product development and research
// 0 = all to product development, 1 = all to pure research
const allocation = computed({
  get: () => researchers.allocation,
  set: (value) => researchers.setAllocation(Number(value))
});

// Calculate estimated insight distribution based on allocation
const insightsToProducts = computed(() => {
  return Math.round((1 - allocation.value) * insightRate.value * 10) / 10;
});

const insightsToPureResearch = computed(() => {
  return Math.round(allocation.value * insightRate.value * 10) / 10;
});

// Product development status
const productInProgress = computed(() => !!aiProducts.selectedProduct);

// Research in progress status and related properties
const researchInProgress = ref(false);
const researchProgress = ref(0);
const canStartResearch = ref(true);

// Function to start a new research project
function startResearch() {
  if (researchInProgress.value) return;
  researchInProgress.value = true;
  researchProgress.value = 0;
}

// Products organized by state
const availableProducts = computed(() => {
  return aiProducts.displayableProducts.filter(product => 
    isAIProductAvailable(product.id) && 
    !isAIProductUnlocked(product.id) && 
    !isAIProductDeveloped(product.id)
  );
});

const unlockedProducts = computed(() => {
  return aiProducts.displayableProducts.filter(product => 
    isAIProductUnlocked(product.id) && 
    !isAIProductDeveloped(product.id)
  );
});

const developedProducts = computed(() => {
  return aiProducts.displayableProducts.filter(product => 
    isAIProductDeveloped(product.id)
  );
});

// Placeholder discoveries data - will be implemented in future
const availableDiscoveries = ref([{}, {}]); // Placeholder for available discoveries
const unlockedDiscoveries = ref([{}]);     // Placeholder for unlocked discoveries
const activeDiscoveries = ref([{}]);       // Placeholder for active discoveries

// Core gameplay functions
function doResearch() {
  const totalInsights = researchers.generateInsights(1);
  
  // Distribute insights based on allocation
  if (productInProgress.value) {
    // If we have a product in progress, allocate some insights to it
    const productInsights = totalInsights * (1 - allocation.value);
    
    // Apply insights toward product development
    const productCompleted = aiProducts.addProductProgress(productInsights);
    
    // If product was completed, update our status
    if (productCompleted) {
      console.log('Product completed!');
    }
  }
  
  if (researchInProgress.value) {
    // If we have research in progress, allocate some insights to it
    const researchInsights = totalInsights * allocation.value;
    
    // Apply insights toward pure research progress
    researchProgress.value += researchInsights / 100; // Research requires 100 total insights
    
    // Check if research is complete
    if (researchProgress.value >= 1) {
      // Research complete - update discoveries
      console.log('Research complete!');
      
      // For simplicity, we'll just reset for now
      researchInProgress.value = false;
      researchProgress.value = 0;
    }
  }
}

function upgradeHardware() {
  if (!hardware.canUpgrade || !hardware.nextHardware) return;
  
  if (hardware.nextHardware.educationalContent) {
    showHardwareEducationalModal();
  } else {
    completeHardwareUpgrade();
  }
}

function showHardwareEducationalModal() {
  if (!hardware.nextHardware || !hardware.nextHardware.educationalContent) return;
  
  educationalModalTitle.value = hardware.nextHardware.name;
  educationalModalContent.value = hardware.nextHardware.description;
  educationalModalQuestion.value = hardware.nextHardware.educationalContent;
  pendingAction.value = 'hardware_upgrade';
  showEducationalModal.value = true;
}

function completeHardwareUpgrade() {
  hardware.upgrade();
}

// Product related functions
function selectAIProduct(productId: string) {
  const product = aiProducts.getProduct(productId);
  if (!product) return;

  // If the product is locked but available, show educational content to unlock
  if (!aiProducts.isProductUnlocked(productId) && isAIProductAvailable(productId)) {
    showProductEducationalContent(productId);
    return;
  }

  // Otherwise select the product for development if it's unlocked and available
  if (aiProducts.isProductUnlocked(productId) && !aiProducts.isProductDeveloped(productId)) {
    aiProducts.selectProduct(productId);
  }
}

function isAIProductUnlocked(productId: string): boolean {
  return aiProducts.isProductUnlocked(productId);
}

function isAIProductDeveloped(productId: string): boolean {
  return aiProducts.isProductDeveloped(productId);
}

function isAIProductAvailable(productId: string): boolean {
  const product = aiProducts.getProduct(productId);
  if (!product) return false;
  
  return meetsPrerequisites(productId) && hasEnoughFlops(productId);
}

function meetsPrerequisites(productId: string): boolean {
  return aiProducts.meetsPrerequisites(productId);
}

function hasEnoughFlops(productId: string): boolean {
  return aiProducts.hasEnoughFlops(productId);
}

function showProductEducationalContent(productId: string) {
  const product = aiProducts.getProduct(productId);
  if (!product || !product.educationalContent) return;
  
  productEducationalTitle.value = product.name;
  productEducationalContent.value = product.description;
  productEducationalQuestion.value = product.educationalContent;
  pendingProductId.value = productId;
  
  showProductEducationalModal.value = true;
}

function completeProductEducation() {
  if (!pendingProductId.value) {
    showProductEducationalModal.value = false;
    return;
  }
  
  // Unlock the product
  aiProducts.unlockProduct(pendingProductId.value);
  
  // Select it for development
  aiProducts.selectProduct(pendingProductId.value);
  
  showProductEducationalModal.value = false;
  pendingProductId.value = null;
}

function cancelProductEducation() {
  showProductEducationalModal.value = false;
  pendingProductId.value = null;
}

function completeEducation() {
  showEducationalModal.value = false;
  
  if (pendingAction.value === 'hardware_upgrade') {
    completeHardwareUpgrade();
  }
  
  pendingAction.value = null;
}

function showProductDetails(productId: string) {
  // Placeholder for showing product details
  console.log('Show details for product:', productId);
}
</script>

<style scoped>
.lab-phase {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Common section styling */
.section {
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Top row with hardware and research */
.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* Work panels */
.work-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* Products and Discoveries Row */
.cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* Tech Tree Section */
.tech-tree-section {
  margin-top: 10px;
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tech-tree-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--primary-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 5px;
  font-size: 1rem;
}

.tech-tree-placeholder {
  height: 50px;
  background-color: #f5f5f5;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--muted-text);
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .top-row, .work-panels, .cards-row {
    grid-template-columns: 1fr;
  }
}
</style>