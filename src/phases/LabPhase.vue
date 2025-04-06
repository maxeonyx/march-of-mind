<template>
  <div class="phase-container lab-phase">
    <div class="lab-content">
      <!-- Researchers Section -->
      <div class="section researchers-section">
        <h3>Researchers</h3>
        <div class="researcher-controls">
          <button 
            @click="hireResearcher" 
            class="hire-button"
            :disabled="!canHireResearcher"
            data-testid="btn-hire-researcher"
          >
            Hire Researcher (${{ HIRE_RESEARCHER_COST }})
          </button>
          <button 
            @click="fireResearcher" 
            class="fire-button"
            :disabled="!canFireResearcher"
            data-testid="btn-fire-researcher"
          >
            Fire Researcher
          </button>
        </div>
        <div class="researcher-info">
          <p>Researchers: <strong>{{ researchers.count }}</strong></p>
          <p>Monthly Income: <span :class="{ positive: monthlyNetIncome > 0, negative: monthlyNetIncome < 0 }">
            ${{ monthlyNetIncome }}
          </span></p>
          <p>Insights per click: <strong>{{ insightRate }}</strong></p>
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
    
    <div class="actions">
      <ProgressButton
        :enabled="true"
        :progress="0"
        @click="doResearch"
        theme="primary"
        data-testid="btn-research"
      >
        Research
      </ProgressButton>

      <ProgressButton
        :enabled="canDevelopProduct"
        :progress="productDevelopmentProgress"
        @click="developProduct"
        theme="secondary"
        data-testid="btn-develop-product"
      >
        Develop Product
      </ProgressButton>
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

const gameStore = useGameStore();
const resources = gameStore.resources;
const researchers = gameStore.researchers;
const hardware = gameStore.hardware;

// Product development constants
const PRODUCT_DEVELOPMENT_COST = 20; // Insights needed to develop a product
const PRODUCT_INCOME = 10; // Monthly income from a single product

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

// Computed properties from the researchers store
const canHireResearcher = computed(() => researchers.canHireResearcher);
const canFireResearcher = computed(() => researchers.canFireResearcher);
const monthlyNetIncome = computed(() => researchers.monthlyNetIncome);
const insightRate = computed(() => researchers.insightRate);
const allocatedToSalaries = computed(() => researchers.allocatedToSalaries);
const allocatedToHardware = computed(() => researchers.allocatedToHardware);

// Allocation model with watcher to update the store
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

// Product development progress
const productDevelopmentProgress = computed(() => {
  return Math.min(resources.insights / PRODUCT_DEVELOPMENT_COST, 1);
});

// Can develop product check
const canDevelopProduct = computed(() => {
  return resources.insights >= PRODUCT_DEVELOPMENT_COST;
});

// Methods
function hireResearcher() {
  researchers.hireResearcher();
}

function fireResearcher() {
  researchers.fireResearcher();
}

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

function developProduct() {
  if (!canDevelopProduct.value) return;
  
  // Future: Could have educational content for products too
  // For now, just spend insights and add income
  resources.spendInsights(PRODUCT_DEVELOPMENT_COST);
  resources.addMoney(PRODUCT_INCOME);
  
  // Future: Add to products list, track products, etc.
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

.allocation-slider {
  width: 100%;
  margin: 10px 0;
}

.hardware-info {
  text-align: left;
  margin-bottom: 15px;
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

.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .lab-content {
    flex-direction: column;
  }
}
</style>