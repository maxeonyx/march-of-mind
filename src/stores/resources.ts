import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { BASE_INCOME } from './staticData';
import { useDatacentreStore } from './datacentre';
import { useTechTreeStore } from './techTree';

export const useResourcesStore = defineStore('resources', () => {
  // --- State ---
  const savingsAmount = ref(0);
  const thoughtsAmount = ref(0);

  // --- Getters (Computed Properties) ---
  // These getters depend on other stores
  const incomeRate = computed(() => {
    const techTreeStore = useTechTreeStore();
    return BASE_INCOME + techTreeStore.totalIncomeRate;
  });

  const creativityRate = computed(() => {
    const datacentreStore = useDatacentreStore();
    return datacentreStore.numResearchers;
    // Future: Add bonuses from completed discoveries
  });

  const flopsRate = computed(() => {
    const datacentreStore = useDatacentreStore();
    return datacentreStore.currentHardwareObject?.flops || 0;
    // Future: Add bonuses from completed discoveries
  });

  const workRate = computed(() => {
    return Math.pow(flopsRate.value, 0.7) * Math.pow(creativityRate.value, 0.3);
  });

  // --- Actions ---
  function addSavings(amount) {
    savingsAmount.value += amount;
  }

  function spendSavings(amount) {
    if (savingsAmount.value >= amount) {
      savingsAmount.value -= amount;
      return true; // Indicate success
    }
    return false; // Indicate failure (not enough funds)
  }

  function addThoughts(amount) {
    thoughtsAmount.value += amount;
  }

  function initialize() {
    console.log("Initializing resources store");
    savingsAmount.value = 0;
    thoughtsAmount.value = 0;
  }

  return {
    // State
    savingsAmount,
    thoughtsAmount,
    // Getters
    incomeRate,
    creativityRate,
    flopsRate,
    workRate,
    // Actions
    addSavings,
    spendSavings,
    addThoughts,
    initialize,
  };
});
