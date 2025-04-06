<template>
  <div class="phase-container lab-phase">
    <div class="lab-content">
      <!-- Researchers Section - conditionally shown when we can have at least 1 researcher -->
      <div v-if="canAffordResearcher" class="section researchers-section">
        <h3>Researchers</h3>
        <div class="researcher-info">
          <p>Researchers: <strong>{{ researchers.count }}</strong></p>
          <p>Monthly Income: <span :class="{ positive: monthlyNetIncome > 0, negative: monthlyNetIncome < 0 }">
            ${{ monthlyNetIncome }}
          </span></p>
          <p>Insights per click: <strong>{{ insightRate }}</strong></p>
        </div>
        
        <!-- Researcher Count Slider - only shown when we can have at least 2 options -->
        <div v-if="maxResearchers > 0 || researchers.count > 0" class="researcher-slider-control">
          <p>Researcher Count:</p>
          <input 
            type="range" 
            :min="0" 
            :max="maxResearchers" 
            step="1" 
            v-model="researcherCount" 
            :disabled="maxResearchers < 1 && researchers.count == 0"
            class="researcher-slider"
            data-testid="researcher-slider"
          />
          <div class="researcher-count-display">{{ researcherCount }}</div>
        </div>
        
        <!-- Resource Allocation Slider -->
        <div class="allocation-control">
          <p>Resource Allocation:</p>
          <div class="allocation-labels">
            <span>Salaries ({{ Math.round(allocatedToSalaries * 100) }}%)</span>
            <span>Hardware ({{ Math.round(allocatedToHardware * 100) }}%)</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            v-model="allocation" 
            class="allocation-slider"
            data-testid="allocation-slider"
          />
        </div>
      </div>
      
      <!-- Hardware Section -->
      <div class="section hardware-section">
        <h3>Hardware</h3>
        <div class="hardware-info">
          <p>Current: <strong>{{ currentHardware.name }}</strong></p>
          <p>FLOP/s: <strong>{{ currentHardware.flops }}</strong></p>
          <p>Research Multiplier: <strong class="hardware-multiplier">{{ hardwareMultiplier }}x</strong></p>
          <p>Savings: <strong>${{ savings }}</strong></p>
        </div>
        
        <div v-if="nextHardware" class="next-hardware">
          <h4>Next Upgrade:</h4>
          <p>{{ nextHardware.name }} ({{ nextHardware.flops }} FLOP/s)</p>
          <p>${{ savings }} / ${{ nextHardware.cost }}</p>
          
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: `${upgradeProgress * 100}%` }"></div>
          </div>
          
          <button 
            @click="upgradeHardware" 
            class="upgrade-button"
            :disabled="!canUpgrade"
            data-testid="btn-upgrade-hardware"
          >
            Upgrade Hardware
          </button>
        </div>
        <div v-else class="max-hardware">
          <p>Maximum hardware tier reached!</p>
        </div>
      </div>
    </div>
    
    <!-- Research Panel -->
    <div class="section research-section">
      <h3>Research</h3>
      <div class="research-description">
        <p>Generate insights by clicking the Research button.</p>
        <p v-if="researchers.count > 0">Your researchers will help increase insight generation.</p>
      </div>
      <ProgressButton
        :enabled="true"
        :progress="0"
        @click="doResearch"
        theme="primary"
        data-testid="btn-research"
      >
        Research
      </ProgressButton>
    </div>
    
    <!-- Product Development Panel -->
    <div class="section product-section">
      <h3>Product Development</h3>
      
      <!-- Current Product Development (if any) -->
      <div v-if="selectedAIProduct" class="current-product">
        <h4>Currently Developing:</h4>
        <div class="product-card selected-product">
          <div class="product-header">
            <span class="product-name">{{ selectedAIProduct.name }}</span>
            <span class="product-revenue">${{ selectedAIProduct.revenue }}/mo</span>
          </div>
          <p class="product-description">{{ selectedAIProduct.description }}</p>
          <div class="product-requirements">
            <span class="flops-req">{{ formatFlops(selectedAIProduct.flopsRequired) }} FLOP/s required</span>
          </div>
          
          <ProgressButton
            :enabled="canDevelopSelectedAIProduct"
            :progress="aiProductDevelopmentProgress"
            @click="developAIProduct"
            theme="secondary"
            data-testid="btn-develop-product"
          >
            Develop ({{ selectedAIProduct.insightCost }} insights)
          </ProgressButton>
        </div>
      </div>
      
      <!-- Available Products List -->
      <div class="product-grid">
        <div 
          v-for="product in displayableAIProducts" 
          :key="product.id"
          class="product-card"
          :class="{ 
            'product-unlocked': isAIProductUnlocked(product.id),
            'product-locked': !isAIProductUnlocked(product.id),
            'product-developed': isAIProductDeveloped(product.id),
            'product-available': isAIProductAvailable(product.id) && !isAIProductDeveloped(product.id),
            'product-selected': selectedAIProductId === product.id
          }"
          @click="selectAIProduct(product.id)"
        >
          <div class="product-header">
            <span class="product-name">{{ product.name }}</span>
            <span class="product-revenue">${{ product.revenue }}/mo</span>
          </div>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-requirements">
            <span class="flops-req" :class="{ 'requirement-met': hasEnoughFlops(product.id) }">
              {{ formatFlops(product.flopsRequired) }} FLOP/s required
            </span>
            <span v-if="product.prerequisites && product.prerequisites.length > 0" 
                  class="prereq" 
                  :class="{ 'requirement-met': meetsPrerequisites(product.id) }">
              Prerequisites: {{ formatPrerequisites(product) }}
            </span>
          </div>
          
          <div class="product-status">
            <span v-if="isAIProductDeveloped(product.id)" class="status-developed">Developed</span>
            <span v-else-if="isAIProductUnlocked(product.id)" class="status-unlocked">Unlocked</span>
            <span v-else-if="isAIProductAvailable(product.id)" class="status-available">Available</span>
            <span v-else class="status-locked">Locked</span>
          </div>
        </div>
      </div>
      
      <!-- Educational modal for AI products -->
      <EducationalModal
        :visible="showProductEducationalModal"
        :title="productEducationalTitle"
        :content="productEducationalContent"
        :question="productEducationalQuestion"
        :cancellable="true"
        @success="completeProductEducation"
        @cancel="cancelProductEducation"
      />
    </div>
    
    <!-- Educational modal for hardware upgrades -->
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
import ProgressButton from '@/components/ProgressButton.vue';
import EducationalModal from '@/components/EducationalModal.vue';
import { useGameStore } from '@/store';
import { HIRE_RESEARCHER_COST } from '@/store/researchers';
import type { EducationalQuestion } from '@/types';
import { GamePhase } from '@/types/game-phase';
import type { AIProduct } from '@/store/ai-products';

const gameStore = useGameStore();
const resources = gameStore.resources;
const researchers = gameStore.researchers;
const hardware = gameStore.hardware;

// AI products from the store
const aiProducts = gameStore.aiProducts;

// Modal state
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

// Computed properties for researcher UI
const monthlyNetIncome = computed(() => researchers.monthlyNetIncome);
const insightRate = computed(() => researchers.insightRate);
const allocatedToSalaries = computed(() => researchers.allocatedToSalaries);
const allocatedToHardware = computed(() => researchers.allocatedToHardware);

// Maximum affordable researchers based on money
const maxResearchers = computed(() => {
  return Math.floor(resources.money / HIRE_RESEARCHER_COST);
});

// Can afford at least one researcher
const canAffordResearcher = computed(() => {
  return resources.money >= HIRE_RESEARCHER_COST || researchers.count > 0;
});

// Researcher count model with watcher
const researcherCount = computed({
  get: () => researchers.count,
  set: (value) => {
    const newCount = Number(value);
    const currentCount = researchers.count;
    
    if (newCount > currentCount) {
      // Hire researchers
      for (let i = 0; i < newCount - currentCount; i++) {
        researchers.hireResearcher();
      }
    } else if (newCount < currentCount) {
      // Fire researchers
      for (let i = 0; i < currentCount - newCount; i++) {
        researchers.fireResearcher();
      }
    }
  }
});

// Allocation model with watcher
const allocation = computed({
  get: () => researchers.allocation,
  set: (value) => researchers.setAllocation(Number(value))
});

// Computed properties from the hardware store
const currentHardware = computed(() => hardware.currentHardware);
const nextHardware = computed(() => hardware.nextHardware);
const canUpgrade = computed(() => hardware.canUpgrade);
const upgradeProgress = computed(() => hardware.upgradeProgress);
const savings = computed(() => hardware.savings);

// Calculate hardware multiplier for display
const hardwareMultiplier = computed(() => {
  if (!hardware.currentFlops.value) return 1;
  
  // Calculate multiplier with same formula as in researchers.ts
  const multiplier = 1 + Math.log10(hardware.currentFlops.value) * 0.5;
  
  // Round to 1 decimal place
  return Math.round(multiplier * 10) / 10;
});

// AI Products modal state
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

// AI Product related computed properties
const selectedAIProductId = computed(() => aiProducts.selectedProductId);
const selectedAIProduct = computed(() => aiProducts.selectedProduct);
const displayableAIProducts = computed(() => aiProducts.displayableProducts);
const canDevelopSelectedAIProduct = computed(() => aiProducts.canDevelopSelectedProduct);

// Product development progress - now showing progress based on insights
const aiProductDevelopmentProgress = computed(() => {
  if (!selectedAIProduct.value) return 0;
  return Math.min(resources.insights / selectedAIProduct.value.insightCost, 1);
});

// No longer need explicit hire/fire methods as they're handled by the slider

function doResearch() {
  researchers.generateInsights(1);
  // Future: Could show a toast or animation with the amount gained
}

function upgradeHardware() {
  if (!canUpgrade.value || !nextHardware.value) return;
  
  // If the next hardware has educational content, show the modal
  if (nextHardware.value.educationalContent) {
    showHardwareEducationalModal();
  } else {
    completeHardwareUpgrade();
  }
}

function showHardwareEducationalModal() {
  if (!nextHardware.value || !nextHardware.value.educationalContent) return;
  
  educationalModalTitle.value = nextHardware.value.name;
  educationalModalContent.value = nextHardware.value.description;
  educationalModalQuestion.value = nextHardware.value.educationalContent;
  pendingAction.value = 'hardware_upgrade';
  showEducationalModal.value = true;
}

function completeHardwareUpgrade() {
  hardware.upgrade();
}

// AI Product related methods
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

function formatFlops(flops: number): string {
  if (flops >= 1000000) {
    return (flops / 1000000).toFixed(1) + 'M';
  } else if (flops >= 1000) {
    return (flops / 1000).toFixed(1) + 'K';
  }
  return flops.toString();
}

function formatPrerequisites(product: any): string {
  if (!product.prerequisites || product.prerequisites.length === 0) return '';
  
  return product.prerequisites.map((prereqId: string) => {
    const prereq = aiProducts.getProduct(prereqId);
    return prereq ? prereq.name : prereqId;
  }).join(', ');
}

function showProductEducationalContent(productId: string) {
  const product = aiProducts.getProduct(productId);
  if (!product || !product.educationalContent) return;
  
  // Set up the educational modal
  productEducationalTitle.value = product.name;
  productEducationalContent.value = product.description;
  productEducationalQuestion.value = product.educationalContent;
  pendingProductId.value = productId;
  
  // Show the modal
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
  
  // Clear modal state
  showProductEducationalModal.value = false;
  pendingProductId.value = null;
}

function cancelProductEducation() {
  // Just close the modal without unlocking
  showProductEducationalModal.value = false;
  pendingProductId.value = null;
}

function developAIProduct() {
  if (!selectedAIProduct.value || !canDevelopSelectedAIProduct.value) return;
  
  // Develop the product - this will spend insights and add revenue
  const result = aiProducts.developProduct();
  
  if (result && isFirstProductDeveloped()) {
    // If this is the first product developed, progress to the INDUSTRY_PHASE
    gameStore.enterPhase(GamePhase.INDUSTRY_PHASE);
  }
}

function isFirstProductDeveloped(): boolean {
  return aiProducts.developedProducts.length === 1;
}

function completeEducation() {
  showEducationalModal.value = false;
  
  if (pendingAction.value === 'hardware_upgrade') {
    completeHardwareUpgrade();
  }
  // Future: Add other educational completions here
  
  pendingAction.value = null;
}
</script>

<style scoped>
.lab-phase {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lab-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.section {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.section h3 {
  margin-top: 0;
  color: var(--primary-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  margin-bottom: 15px;
}

.researcher-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.hire-button, .fire-button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.hire-button {
  background-color: var(--hire-color);
  color: white;
}

.hire-button:hover:not(:disabled) {
  background-color: var(--hire-hover);
}

.fire-button {
  background-color: var(--fire-color);
  color: white;
}

.fire-button:hover:not(:disabled) {
  background-color: var(--fire-hover);
}

.researcher-info {
  text-align: left;
  margin-bottom: 15px;
}

.researcher-info p {
  margin: 5px 0;
}

.positive {
  color: var(--positive-color);
}

.negative {
  color: var(--negative-color);
}

.allocation-control {
  margin-top: 15px;
}

.allocation-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.allocation-slider,
.researcher-slider {
  width: 100%;
  margin: 10px 0;
}

.researcher-slider-control {
  margin-top: 15px;
  margin-bottom: 15px;
}

.researcher-count-display {
  font-weight: bold;
  font-size: 18px;
  margin-top: 5px;
  text-align: center;
}

.hardware-info {
  text-align: left;
  margin-bottom: 15px;
}

.hardware-multiplier {
  color: var(--primary-color);
  font-size: 18px;
}

.next-hardware {
  margin-top: 15px;
}

.next-hardware h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--secondary-color);
}

.progress-container {
  width: 100%;
  height: 10px;
  background-color: var(--progress-bg);
  border-radius: 5px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-bar {
  height: 100%;
  background-color: var(--secondary-color);
  transition: width 0.3s ease;
}

.upgrade-button {
  width: 100%;
  padding: 10px;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
}

.upgrade-button:hover:not(:disabled) {
  background-color: var(--secondary-hover);
}

.upgrade-button:disabled {
  background-color: var(--disabled-color);
  cursor: not-allowed;
}

.research-section,
.product-section {
  margin-top: 20px;
  text-align: center;
}

.research-description {
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

/* Product Grid Layout */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

/* Product Cards */
.product-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.product-card.product-locked {
  opacity: 0.7;
  background-color: #e0e0e0;
}

.product-card.product-unlocked {
  background-color: #f0f8ff;
}

.product-card.product-developed {
  background-color: #e8f5e9;
  border-color: var(--positive-color);
}

.product-card.product-available {
  border-color: var(--secondary-color);
}

.product-card.product-selected {
  border-color: var(--primary-color);
  background-color: #f0fff0;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.product-name {
  font-weight: bold;
  font-size: 16px;
  color: var(--text-color);
}

.product-revenue {
  font-weight: bold;
  color: var(--positive-color);
  font-size: 14px;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  flex-grow: 1;
}

.product-requirements {
  font-size: 12px;
  color: #888;
  margin-top: auto;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.flops-req, .prereq {
  color: var(--negative-color);
}

.requirement-met {
  color: var(--positive-color);
}

.product-status {
  font-size: 12px;
  font-weight: bold;
  text-align: right;
  text-transform: uppercase;
}

.status-developed {
  color: var(--positive-color);
}

.status-unlocked {
  color: var(--secondary-color);
}

.status-available {
  color: var(--primary-color);
}

.status-locked {
  color: var(--negative-color);
}

/* Current Product Development */
.current-product {
  margin-bottom: 20px;
}

.current-product h4 {
  margin-bottom: 10px;
  color: var(--primary-color);
}

.selected-product {
  cursor: default;
}

.selected-product:hover {
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .lab-content {
    flex-direction: column;
  }
}
</style>