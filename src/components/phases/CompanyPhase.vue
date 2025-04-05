<template>
  <div class="phase-container company-phase">
    <div class="company-info">
      <h3>Your Company is Founded!</h3>
      
      <!-- Core Actions Panel -->
      <div class="actions-panel">
        <div class="panel-header">
          <h4>Actions</h4>
        </div>
        
        <div class="company-actions">
          <ProgressButton
            :enabled="true"
            :progress="0"
            @click="workHard"
            theme="primary"
          >
            Work Hard
          </ProgressButton>
        </div>
      </div>
      
      <!-- Talent Management Panel -->
      <div class="management-panel">
        <div class="panel-header">
          <h4>Talent Management</h4>
          <div class="talent-count">
            <span class="talent-label">Current Talent:</span>
            <span class="talent-value">{{ talent }}</span>
          </div>
        </div>
        
        <div class="talent-actions">
          <ProgressButton
            :enabled="canHireTalent"
            :progress="hasHiredTalent ? 1 : firstHireProgress"
            :firstTimeOnly="!hasHiredTalent"
            :unlocked="hasHiredTalent"
            @click="hireTalent"
            theme="hire"
          >
            Hire Talent (${{ HIRE_TALENT_COST }})
          </ProgressButton>
          
          <ProgressButton
            :enabled="canFireTalent"
            :progress="0"
            @click="fireTalent"
            theme="fire"
          >
            Fire Talent
          </ProgressButton>
        </div>
        
        <div class="talent-info">
          <p>Each talent costs ${{ TALENT_SALARY }} per month and generates ${{ TALENT_INCOME }} in revenue.</p>
          <p>Net cost per talent: ${{ TALENT_SALARY - TALENT_INCOME }} per month.</p>
          <p>Each talent generates {{ TALENT_INSIGHTS }} insights per month.</p>
        </div>
      </div>
      
      <!-- Product Development Panel -->
      <div class="management-panel">
        <div class="panel-header">
          <h4>Product Development</h4>
          <div class="development-count">
            <span class="development-label">Insights:</span>
            <span class="development-value">{{ Math.floor(insights) }}</span>
          </div>
        </div>
        
        
        <div class="product-actions">
          <ProgressButton
            :enabled="canLaunchProduct"
            :progress="productProgress"
            :firstTimeOnly="!hasLaunchedFirstProduct"
            :unlocked="hasLaunchedFirstProduct"
            @click="launchProduct"
            theme="product"
          >
            Launch Product
          </ProgressButton>
        </div>
        
        <div class="product-info" v-if="hasProduct">
          <p>Your product is live! More features coming soon.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProgressButton from '../ProgressButton.vue';
import { useGameStore } from '../../stores/game';
import { useTalentStore, HIRE_TALENT_COST, TALENT_SALARY, TALENT_INCOME, TALENT_INSIGHTS } from '../../stores/modules/talent';
import { useProductStore } from '../../stores/modules/products';

const gameStore = useGameStore();
const talentStore = useTalentStore();
const productStore = useProductStore();

// Talent system
const talent = computed(() => talentStore.talent);
const canHireTalent = computed(() => talentStore.canHireTalent);
const canFireTalent = computed(() => talentStore.canFireTalent);
const hasHiredTalent = computed(() => talentStore.hasHiredTalent);
const firstHireProgress = computed(() => talentStore.firstHireProgress);

// Product development system
const insights = computed(() => productStore.insights);
const productProgress = computed(() => productStore.productDevelopmentProgress);
const canLaunchProduct = computed(() => productStore.canLaunchProduct);
const hasProduct = computed(() => productStore.hasProduct);
const hasLaunchedFirstProduct = computed(() => productStore.hasLaunchedFirstProduct);

function workHard() {
  gameStore.earnMoney();
}

function hireTalent() {
  if (canHireTalent.value) {
    gameStore.hireTalent();
  }
}

function fireTalent() {
  if (canFireTalent.value) {
    gameStore.fireTalent();
  }
}

function launchProduct() {
  if (canLaunchProduct.value) {
    gameStore.launchProduct();
  }
}
</script>

<style scoped>
.company-phase {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.company-info h3 {
  color: var(--primary-color);
  margin-bottom: 20px;
}

/* Panel styles */
.management-panel,
.actions-panel {
  margin: 15px 0;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

/* Company actions */
.company-actions {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h4 {
  margin: 0;
  color: var(--text-color);
  font-size: 18px;
}

.talent-count {
  background-color: var(--primary-color);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
}

.talent-value {
  font-weight: bold;
  margin-left: 5px;
}

.talent-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 15px 0;
}

.talent-info {
  font-size: 14px;
  color: var(--muted-text);
  margin-top: 15px;
  text-align: center;
}

.talent-info p {
  margin: 5px 0;
}

/* Progress bar styles for product development */
.progress-container {
  margin: 20px 0;
}

.progress-label {
  text-align: left;
  margin-bottom: 5px;
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: var(--progress-bg);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--progress-fill);
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
  font-size: 14px;
  color: var(--muted-text);
}

.development-count {
  background-color: var(--secondary-color);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
}

.development-value {
  font-weight: bold;
  margin-left: 5px;
}

.product-actions {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.product-info {
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  text-align: center;
}
</style>