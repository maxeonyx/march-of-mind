<template>
  <div class="resource-display">
    <!-- Universal resources display -->
    <div class="resources-header">
      <div class="resource">
        <span class="resource-label">Money:</span> 
        <span class="resource-value" data-testid="money-value">${{ Math.floor(money) }}</span>
      </div>
      
      <div class="resource">
        <span class="resource-label">Insights:</span>
        <span class="resource-value" data-testid="insights-value">{{ Math.floor(insights) }}</span>
      </div>
    </div>

    <!-- Income stats (visible in company or lab phase) -->
    <div v-if="showIncomeStats" class="income-stats" data-testid="income-stats">
      <div class="stat-row">
        <span>Monthly Income:</span>
        <span :class="{ 'positive': monthlyIncome > 0 }">+${{ monthlyIncome }}</span>
      </div>
      <div class="stat-row">
        <span>Monthly Expenses:</span>
        <span :class="{ 'negative': monthlySalary > 0 }">-${{ monthlySalary }}</span>
      </div>
      <div class="stat-row net-income">
        <span>Net Monthly:</span>
        <span :class="{ 'positive': monthlyNetIncome > 0, 'negative': monthlyNetIncome < 0 }">
          {{ monthlyNetIncome >= 0 ? '+' : '' }}${{ monthlyNetIncome }}
        </span>
      </div>
    </div>
    
    <!-- Research stats (visible in research or lab phase) -->
    <div v-if="showResearchStats" class="research-stats" data-testid="research-stats">
      <div class="stat-row">
        <span>Research Rate:</span>
        <span class="positive">+{{ insightRate }} insights/click</span>
      </div>
      <div v-if="showHardwareStats" class="stat-row">
        <span>Computing Power:</span>
        <span class="hardware-value">{{ hardwareFlops }} FLOP/s</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/store';
import { GamePhase } from '@/types';

const props = defineProps({
  showIncomeStats: {
    type: Boolean,
    default: false
  },
  showResearchStats: {
    type: Boolean,
    default: false
  },
  showHardwareStats: {
    type: Boolean,
    default: false
  }
});

const gameStore = useGameStore();
const resourcesStore = gameStore.resources;

// Get the right store based on game phase
const legacyStore = gameStore.talent;
const researchersStore = gameStore.researchers;
const hardwareStore = gameStore.hardware;

// Basic resources
const money = computed(() => resourcesStore.money);
const insights = computed(() => resourcesStore.insights);

// Income stats - use the right store depending on game phase
const monthlyIncome = computed(() => {
  return gameStore.phase === GamePhase.COMPANY 
    ? legacyStore.monthlyIncome 
    : researchersStore.monthlyIncome;
});

const monthlySalary = computed(() => {
  return gameStore.phase === GamePhase.COMPANY 
    ? legacyStore.monthlySalary 
    : researchersStore.monthlySalary;
});

const monthlyNetIncome = computed(() => {
  return gameStore.phase === GamePhase.COMPANY 
    ? legacyStore.monthlyNetIncome 
    : researchersStore.monthlyNetIncome;
});

// Research stats from the researchers system
const insightRate = computed(() => {
  return researchersStore.insightRate;
});

// Hardware stats from the hardware system
const hardwareFlops = computed(() => {
  return hardwareStore.currentFlops?.value || 0;
});
</script>

<style scoped>
.resource-display {
  margin-bottom: 20px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.resources-header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 10px;
}

.resource {
  text-align: center;
}

.resource-label {
  font-weight: bold;
  color: var(--text-color);
  margin-right: 5px;
}

.resource-value {
  font-size: 24px;
  font-weight: bold;
}

/* Stats sections */
.income-stats,
.research-stats {
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  text-align: left;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
  font-size: 14px;
}

.net-income {
  font-weight: bold;
  margin-top: 10px;
  padding-top: 5px;
  border-top: 1px dashed var(--border-color);
}

.positive {
  color: var(--positive-color);
}

.negative {
  color: var(--negative-color);
}

.hardware-value {
  color: var(--secondary-color);
  font-weight: bold;
}
</style>