<template>
  <div class="phase-container lab-phase">
    <!-- Top row with hardware and research panels -->
    <div class="top-row">
      <!-- Hardware Panel -->
      <div class="section hardware-section">
        <h3>Hardware</h3>
        <div class="hardware-info">
          <p>{{ currentHardware.name }}</p>
          <p>{{ currentHardware.flops }} FLOP/s</p>
        </div>
        
        <div v-if="nextHardware" class="hardware-upgrade">
          <ProgressButton 
            @click="upgradeHardware" 
            :enabled="canUpgrade"
            :progress="upgradeProgress"
            theme="secondary"
            data-testid="btn-upgrade-hardware"
          >
            Upgrade
          </ProgressButton>
        </div>
        <div v-else class="max-hardware">
          <p>Maximum hardware reached</p>
        </div>
      </div>
      
      <!-- Research Panel -->
      <div class="section research-section">
        <h3>Research</h3>
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
    </div>
    
    <!-- Insight Rate Indicator -->
    <div class="insight-rate">
      <div class="insight-multiplier">{{ insightRate }}x</div>
      <div class="insight-label">insight</div>
    </div>
    
    <!-- Resource Allocation Slider -->
    <div class="resource-allocation">
      <div class="allocation-label left">Product Development</div>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.1" 
        v-model="allocation" 
        class="allocation-slider"
        data-testid="resource-allocation-slider"
      />
      <div class="allocation-label right">Pure Research</div>
    </div>
    
    
    <!-- Work Panels -->
    <div class="work-panels">
      <!-- Product Development Panel -->
      <div class="section product-panel">
        <div v-if="productInProgress" class="in-progress-product">
          <div class="card-label">In progress product card</div>
        </div>
        <div v-else class="no-product">
          <p>No product in development</p>
        </div>
      </div>
      
      <!-- Research Development Panel -->
      <div class="section research-panel">
        <div v-if="researchInProgress" class="in-progress-research">
          <div class="card-label">In-progress research card</div>
        </div>
        <div v-else class="no-research">
          <p>No research in progress</p>
        </div>
      </div>
    </div>
    
    <!-- Products and Discoveries -->
    <div class="cards-row">
      <!-- Products Panel -->
      <div class="section products-section">
        <h3>Products</h3>
        <div class="cards-grid products-grid">
          <!-- Available but not started products -->
          <div v-for="product in availableProducts" :key="product.id" class="card product-card available">
            <div v-if="!isAIProductUnlocked(product.id)" class="card-status">
              <span class="status-text">quiz not done yet</span>
            </div>
            <div class="card-title">{{ product.name }}</div>
            <div class="card-action">
              <button @click="selectAIProduct(product.id)" class="action-button">Select</button>
            </div>
          </div>
          
          <!-- Unlocked products -->
          <div v-for="product in unlockedProducts" :key="product.id" class="card product-card unlocked">
            <div class="card-title">{{ product.name }}</div>
            <div class="card-action">
              <button @click="selectAIProduct(product.id)" class="action-button">
                select to put in-progress
              </button>
            </div>
          </div>
          
          <!-- Developed products -->
          <div v-for="product in developedProducts" :key="product.id" class="card product-card developed">
            <div class="card-title">{{ product.name }}</div>
            <div class="card-revenue">${{ product.revenue }}/mo</div>
            <div class="card-detail">
              <button class="detail-button">Detail</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Discoveries Panel -->
      <div class="section discoveries-section">
        <h3>Discoveries</h3>
        <div class="cards-grid discoveries-grid">
          <!-- Available discoveries -->
          <div v-for="(discovery, index) in availableDiscoveries" :key="index" class="card discovery-card available">
            <div class="card-status">
              <span class="status-text">quiz not done yet</span>
            </div>
          </div>
          
          <!-- Unlocked discoveries -->
          <div v-for="(discovery, index) in unlockedDiscoveries" :key="index" class="card discovery-card unlocked">
            <span class="status-text">unlocked</span>
          </div>
          
          <!-- Active discoveries -->
          <div v-for="(discovery, index) in activeDiscoveries" :key="index" class="card discovery-card active">
            <span class="status-text">active</span>
          </div>
        </div>
      </div>
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
import ProgressButton from '@/components/ProgressButton.vue';
import EducationalModal from '@/components/EducationalModal.vue';
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

// Hardware related computed properties
const currentHardware = computed(() => hardware.currentHardware);
const nextHardware = computed(() => hardware.nextHardware);
const canUpgrade = computed(() => hardware.canUpgrade);
const upgradeProgress = computed(() => hardware.upgradeProgress);

// Research and insight related properties
const insightRate = computed(() => researchers.insightRate);

// Resource allocation slider - controls balance between product development and research
const allocation = computed({
  get: () => researchers.allocation,
  set: (value) => researchers.setAllocation(Number(value))
});

// Product development status
const productInProgress = computed(() => !!aiProducts.selectedProduct);

// Research in progress status - placeholder for now
const researchInProgress = ref(false);

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
  researchers.generateInsights(1);
}

function upgradeHardware() {
  if (!canUpgrade.value || !nextHardware.value) return;
  
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

.section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--primary-color);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 5px;
  font-size: 1rem;
}

/* Top row with hardware and research */
.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.hardware-section {
  text-align: center;
}

.hardware-info {
  margin-bottom: 10px;
}

.hardware-info p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.research-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Insight multiplier display */
.insight-rate {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 5px 15px;
  border: 1px solid var(--border-color);
}

.insight-multiplier {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.insight-label {
  font-size: 0.8rem;
  color: var(--muted-text);
}

/* Resource allocation slider */
.resource-allocation {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.allocation-label {
  font-size: 0.8rem;
  color: var(--text-color);
  flex-shrink: 0;
}

.allocation-slider {
  flex-grow: 1;
}

/* Work panels */
.work-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.product-panel, .research-panel {
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.in-progress-product, .in-progress-research {
  width: 100%;
  height: 100px;
  background-color: #f5f5f5;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed var(--border-color);
}

.no-product, .no-research {
  color: var(--muted-text);
  font-style: italic;
}

/* Products and Discoveries Row */
.cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  max-height: 250px;
  overflow-y: auto;
  padding: 5px;
}

/* Card Styling */
.card {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.card-status {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 5px;
  border-radius: 0 6px 0 6px;
  font-size: 0.7rem;
}

.card-action {
  margin-top: 8px;
}

.action-button {
  width: 100%;
  padding: 5px;
  font-size: 0.8rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.card-revenue {
  color: var(--positive-color);
  font-weight: bold;
  font-size: 0.9rem;
}

.detail-button {
  margin-top: 5px;
  padding: 3px;
  font-size: 0.7rem;
  background-color: transparent;
  color: var(--muted-text);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;
}

/* Card states */
.card.available {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
}

.card.unlocked {
  background-color: #f0f8ff;
  border: 1px solid var(--secondary-color);
}

.card.developed, .card.active {
  background-color: #e8f5e9;
  border: 1px solid var(--positive-color);
}

.status-text {
  color: var(--muted-text);
  font-size: 0.7rem;
}

/* Tech Tree Section */
.tech-tree-section {
  margin-top: 10px;
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
  
  .resource-allocation {
    flex-direction: column;
  }
  
  .allocation-slider {
    width: 100%;
  }
}
</style>