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
          
          <ProgressButton
            v-if="hasProduct"
            :enabled="true"
            :progress="1 - marketingEffectiveness"
            @click="applyMarketing"
            :style="{ backgroundColor: getMarketingButtonColor() }"
            theme="marketing"
          >
            Marketing Campaign
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
      
      <!-- Products Panel -->
      <div class="management-panel">
        <div class="panel-header">
          <h4>Products</h4>
          <div v-if="hasProducts" class="income-badge">
            <span class="income-label">Monthly Income:</span>
            <span class="income-value">${{ Math.floor(productIncome) }}</span>
          </div>
          <div v-else class="development-count">
            <span class="development-label">Insights:</span>
            <span class="development-value">{{ Math.floor(insights) }}</span>
          </div>
        </div>
        
        <!-- Product Development Section -->
        <div v-if="currentProductInDevelopment" class="product-development">
          <h5>In Development: {{ currentProductInDevelopment.name }}</h5>
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${productProgress * 100}%` }"
              ></div>
            </div>
            <div class="progress-info">
              {{ Math.floor(insights) }} / {{ currentProductInDevelopment.baseCost }} insights
            </div>
          </div>
          
          <ProgressButton
            :enabled="canLaunchProduct"
            :progress="productProgress"
            :firstTimeOnly="!hasLaunchedFirstProduct && !canLaunchProduct"
            :unlocked="hasLaunchedFirstProduct || canLaunchProduct"
            @click="launchProduct"
            theme="product"
          >
            Launch Product
          </ProgressButton>
        </div>
        
        <!-- Active Products List -->
        <div v-if="hasProducts" class="active-products">
          <h5>Active Products</h5>
          <div class="products-list">
            <div 
              v-for="product in activeProducts" 
              :key="product.id"
              class="product-item"
            >
              <div class="product-header">
                <div class="product-name">{{ product.name }} ({{ product.year }})</div>
                <div class="product-income">${{ Math.floor(product.currentIncome) }}/mo</div>
              </div>
              <div class="product-saturation">
                <div class="saturation-label">Market Saturation:</div>
                <div class="saturation-bar">
                  <div 
                    class="saturation-fill" 
                    :style="{ 
                      width: `${product.saturation}%`,
                      backgroundColor: getSaturationColor(product.saturation)
                    }"
                  ></div>
                </div>
                <div class="saturation-value">{{ Math.floor(product.saturation) }}%</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="!hasProducts && !currentProductInDevelopment" class="products-empty">
          <p>No products available to develop yet. Keep hiring talent to generate insights!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import ProgressButton from '../ProgressButton.vue';
import { useGameStore } from '../../stores/game';
import { HIRE_TALENT_COST, TALENT_SALARY, TALENT_INCOME, TALENT_INSIGHTS } from '../../composables/useTalent';

const gameStore = useGameStore();
const talentStore = gameStore.talent;
const productStore = gameStore.products;

// Initialize product data
onMounted(() => {
  productStore.init();
});

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

function workHard() {
  gameStore.resources.addMoney(1);
}

function hireTalent() {
  if (canHireTalent.value) {
    gameStore.talent.hireTalent();
  }
}

function fireTalent() {
  if (canFireTalent.value) {
    gameStore.talent.hireTalent();
  }
}

function launchProduct() {
  if (canLaunchProduct.value) {
    gameStore.products.launchProduct();
  }
}

function applyMarketing() {
  productStore.applyMarketing();
}

// Color utilities
function getSaturationColor(saturation: number): string {
  // Red (high saturation) to green (low saturation)
  const green = Math.floor(255 * (1 - saturation / 100));
  const red = Math.floor(180 * (saturation / 100) + 75);
  return `rgb(${red}, ${green}, 60)`;
}

function getMarketingButtonColor(): string {
  // Gradient from green (high effectiveness) to red (low effectiveness)
  const effectiveness = marketingEffectiveness.value;
  const red = Math.floor(200 * (1 - effectiveness) + 55);
  const green = Math.floor(180 * effectiveness + 75); 
  return `rgb(${red}, ${green}, 60)`;
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
  gap: 15px;
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

.panel-header h5 {
  margin: 10px 0;
  color: var(--text-color);
  font-size: 16px;
}

.talent-count, .income-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 14px;
}

.income-badge {
  background-color: var(--success-color);
}

.talent-value, .income-value {
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
  margin: 15px 0;
}

.progress-label {
  text-align: left;
  margin-bottom: 5px;
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background-color: var(--progress-bg);
  border-radius: 6px;
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

.product-development {
  margin-bottom: 20px;
  text-align: center;
}

.active-products {
  margin-top: 20px;
}

.products-list {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}

.product-item {
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-name {
  font-weight: bold;
  color: var(--text-color);
}

.product-income {
  font-weight: bold;
  color: var(--success-color);
}

.product-saturation {
  display: flex;
  align-items: center;
  font-size: 12px;
  gap: 8px;
}

.saturation-label {
  min-width: 115px;
  color: var(--muted-text);
}

.saturation-bar {
  flex-grow: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.saturation-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.saturation-value {
  min-width: 35px;
  text-align: right;
  font-weight: bold;
}

.products-empty {
  text-align: center;
  color: var(--muted-text);
  padding: 20px 0;
}
</style>