<template>
  <div class="phase-container lab-phase">
    <!-- Main game layout: two-column grid -->
    <div class="main-layout">
      <!-- Left column for Datacentre Panel -->
      <div class="left-column">
        <!-- Datacentre Panel (contains hardware, research, insight rate, and allocation) -->
        <DatacentrePanel
          :hardware="hardware"
          :insightRate="gameStore.researchers.insightRate"
          v-model:allocation="allocation"
          :insightsToProducts="insightsToProducts"
          :insightsToPureResearch="insightsToPureResearch"
          @research="doResearch"
          @upgradeHardware="upgradeHardware"
        />
      </div>
      
      <!-- Right column for Research Panel -->
      <div class="right-column">
        <!-- Research Panel (contains work panels and discovery cards) -->
        <ResearchPanel
          :hasProductInProgress="productInProgress"
          :productName="productInProgress ? aiProducts.selectedProduct.name : ''"
          :productDescription="productInProgress ? aiProducts.selectedProduct.description : ''"
          :productProgress="aiProducts.productProgress"
          :insightsToProducts="insightsToProducts"
          
          :hasResearchInProgress="researchInProgress"
          researchTitle="Pure Research"
          researchDescription="Advance your theoretical understanding by investing in pure research."
          :researchProgress="researchProgress"
          :insightsToPureResearch="insightsToPureResearch"
          :canStartResearch="canStartResearch"
          
          :availableProducts="availableProducts"
          :unlockedProducts="unlockedProducts"
          :developedProducts="developedProducts"
          
          :availableDiscoveries="availableDiscoveries"
          :unlockedDiscoveries="unlockedDiscoveries"
          :activeDiscoveries="activeDiscoveries"
          
          @selectProduct="selectAIProduct"
          @showProductDetails="showProductDetails"
          @startResearch="startResearch"
        />
      </div>
    </div>

    <!-- Tech Tree Button (in footer) -->
    <div class="footer-controls">
      <button class="tech-tree-button" @click="showTechTree">
        View Tech Tree
      </button>
    </div>
    
    <!-- Tech Tree Modal (will be implemented later) -->
    <!-- Low priority feature, just stub for now -->
    <div v-if="techTreeVisible" class="modal-overlay" @click="hideTechTree">
      <div class="modal-content" @click.stop>
        <h3>Tech Tree</h3>
        <div class="tech-tree-placeholder">
          <!-- Tech Tree visualization will be implemented here -->
          <p>Tech Tree visualization coming soon</p>
        </div>
        <button class="close-button" @click="hideTechTree">Close</button>
      </div>
    </div>

    <!-- Educational modal (shared for all educational content) -->
    <EducationalModal
      :visible="showEducationalModal"
      :title="educationalModalTitle"
      :content="educationalModalContent"
      :question="educationalModalQuestion"
      :cancellable="educationalModalCancellable"
      @success="completeEducation"
      @cancel="cancelEducation"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import EducationalModal from '@/components/EducationalModal.vue';
import DatacentrePanel from '@/components/panels/DatacentrePanel.vue';
import ResearchPanel from '@/components/panels/ResearchPanel.vue';

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
const pendingProductId = ref<string | null>(null);

// Added for tech tree and educational modal config
const techTreeVisible = ref(false);
const educationalModalCancellable = ref(false);

/*
 * Note: Prefer accessing gameStore directly in the template rather than creating 
 * tiny computed properties. For example, use gameStore.researchers.insightRate
 * instead of creating a computed property for it.
 */

// Resource allocation slider - controls balance between product development and research
// This allocation determines how insights are distributed between product development and research
// 0 = all to product development, 1 = all to pure research
const allocation = computed({
  get: () => researchers.allocation,
  set: (value) => researchers.setAllocation(Number(value))
});

// Calculate estimated insight distribution based on allocation
const insightsToProducts = computed(() => {
  return Math.round((1 - allocation.value) * researchers.insightRate * 10) / 10;
});

const insightsToPureResearch = computed(() => {
  return Math.round(allocation.value * researchers.insightRate * 10) / 10;
});

// Product development status
const productInProgress = computed(() => !!aiProducts.selectedProduct);

// Research state - this should be moved to the discoveries store later
// Access to this state should be via the store for proper save/load
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

// Discovery data - this should come from the discoveries store
// Placeholder implementation until discoveries store is fully implemented
const availableDiscoveries = computed(() => {
  // Safely access discoveries data with fallbacks
  return gameStore.discoveries?.availableDiscoveries || [];
});
const unlockedDiscoveries = computed(() => {
  // Safely access discoveries data with fallbacks
  return gameStore.discoveries?.unlockedDiscoveriesData || [];
});
const activeDiscoveries = ref([{id: 'placeholder', name: 'No Active Discoveries'}]); // Placeholder - will eventually come from store

// Main research function
// This should eventually be moved to a dedicated research service
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

// Hardware upgrade flow
// This bridges between hardware panel and educational content
function upgradeHardware() {
  if (!hardware.canUpgrade || !hardware.nextHardware) return;

  if (hardware.nextHardware.educationalContent) {
    // Show educational content before upgrading
    educationalModalTitle.value = hardware.nextHardware.name;
    educationalModalContent.value = hardware.nextHardware.description;
    educationalModalQuestion.value = hardware.nextHardware.educationalContent;
    educationalModalCancellable.value = false;
    pendingAction.value = 'hardware_upgrade';
    showEducationalModal.value = true;
  } else {
    // Directly upgrade if no educational content
    hardware.upgrade();
  }
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

// Helper functions to determine product state
// These should ideally be computed properties in the store
function isAIProductAvailable(productId: string): boolean {
  const product = aiProducts.getProduct(productId);
  if (!product) return false;

  return aiProducts.meetsPrerequisites(productId) && aiProducts.hasEnoughFlops(productId);
}

function isAIProductUnlocked(productId: string): boolean {
  return aiProducts.isProductUnlocked(productId);
}

function isAIProductDeveloped(productId: string): boolean {
  return aiProducts.isProductDeveloped(productId);
}

function showProductEducationalContent(productId: string) {
  const product = aiProducts.getProduct(productId);
  if (!product || !product.educationalContent) return;

  // Set up educational modal with product content
  educationalModalTitle.value = product.name;
  educationalModalContent.value = product.description;
  educationalModalQuestion.value = product.educationalContent;
  educationalModalCancellable.value = true;
  
  // Track what we're showing education for
  pendingAction.value = 'product_education';
  pendingProductId.value = productId;
  
  // Show the modal
  showEducationalModal.value = true;
}

// State for tech tree and educational modal was declared earlier

// Centralized education completion handler
function completeEducation() {
  // Handle different educational content based on what's pending
  if (pendingAction.value === 'hardware_upgrade') {
    // Complete hardware upgrade
    hardware.upgrade();
  } else if (pendingAction.value === 'product_education' && pendingProductId.value) {
    // Unlock the product
    aiProducts.unlockProduct(pendingProductId.value);
    // Select it for development
    aiProducts.selectProduct(pendingProductId.value);
  }
  
  // Reset state
  showEducationalModal.value = false;
  pendingAction.value = null;
  pendingProductId.value = null;
}

// Cancel education
function cancelEducation() {
  // Only allows cancellation if it's marked as cancellable
  if (educationalModalCancellable.value) {
    showEducationalModal.value = false;
    pendingAction.value = null;
    pendingProductId.value = null;
  }
}

// Tech tree visibility functions
function showTechTree() {
  techTreeVisible.value = true;
}

function hideTechTree() {
  techTreeVisible.value = false;
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

/* Two-column layout */
.main-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 15px;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Footer controls */
.footer-controls {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.tech-tree-button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--primary-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.tech-tree-placeholder {
  min-height: 400px;
  background-color: #f5f5f5;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--muted-text);
  font-style: italic;
}

.close-button {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: var(--muted-text);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .top-row, .work-panels {
    grid-template-columns: 1fr;
  }
}
</style>
