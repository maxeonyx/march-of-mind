<template>
  <div class="resource-display">
    <h3>Money: ${{ Math.floor(money) }}</h3>
    
    <!-- Income stats (visible in company phase) -->
    <div v-if="showIncomeStats" class="income-stats">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/game';

defineProps({
  showIncomeStats: {
    type: Boolean,
    default: false
  }
});

const gameStore = useGameStore();
const resourcesStore = gameStore.resources;
const talentStore = gameStore.talent;

const money = computed(() => resourcesStore.state.money);
const monthlyIncome = computed(() => talentStore.monthlyIncome.value);
const monthlySalary = computed(() => talentStore.monthlySalary.value);
const monthlyNetIncome = computed(() => talentStore.monthlyNetIncome.value);
</script>

<style scoped>
.resource-display {
  margin-bottom: 20px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.resource-display h3 {
  font-size: 24px;
  color: var(--text-color);
  margin: 0;
}

/* Income statistics */
.income-stats {
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
</style>