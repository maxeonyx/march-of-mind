import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { findHardwareById, getNextHardware, COST_PER_RESEARCHER } from './staticData';
import { useResourcesStore } from './resources';

export const useDatacentreStore = defineStore('datacentre', () => {
  // --- State ---
  const numResearchers = ref(0);
  const currentHardwareId = ref('hardware1'); // Initial hardware ID
  const proportionWorkSpentOnProducts = ref(0.5); // Initial 50/50 allocation

  // --- Getters (Computed Properties) ---
  // This getter doesn't depend on other stores
  const currentHardwareObject = computed(() => findHardwareById(currentHardwareId.value));

  // These getters depend on other stores
  const canAffordToHire = computed(() => {
    const resourcesStore = useResourcesStore();
    const nextResearcherCost = (numResearchers.value + 1) * COST_PER_RESEARCHER;
    return resourcesStore.incomeRate >= nextResearcherCost;
  });

  const nextHardwareUpgrade = computed(() => {
    return getNextHardware(currentHardwareId.value);
  });

  const canAffordUpgrade = computed(() => {
    const resourcesStore = useResourcesStore();
    const upgradeCost = nextHardwareUpgrade.value?.upgradeCost || Infinity;
    return resourcesStore.savingsAmount >= upgradeCost;
  });

  // --- Actions ---
  function hireResearcher() {
    if (canAffordToHire.value) {
      numResearchers.value++;
      console.log(`Hired a researcher. Total: ${numResearchers.value}`);
    } else {
      console.warn("Cannot hire researcher: insufficient income");
    }
  }

  function fireResearcher() {
    if (numResearchers.value > 0) {
      numResearchers.value--;
      console.log(`Fired a researcher. Remaining: ${numResearchers.value}`);
    } else {
      console.warn("Cannot fire researcher: none employed");
    }
  }

  function upgradeHardware() {
    const upgradeTarget = nextHardwareUpgrade.value;
    if (upgradeTarget && canAffordUpgrade.value) {
      const resourcesStore = useResourcesStore();
      if (resourcesStore.spendSavings(upgradeTarget.upgradeCost)) {
        currentHardwareId.value = upgradeTarget.id;
        console.log(`Upgraded hardware to ${upgradeTarget.name}`);
      } else {
        console.error("Upgrade failed: Could not spend savings"); // Should not happen if canAffordUpgrade is true
      }
    } else {
      console.warn("Cannot upgrade hardware: Not available or insufficient funds");
    }
  }

  function setWorkAllocation(proportion) {
    // Clamp proportion between 0 and 1
    proportionWorkSpentOnProducts.value = Math.max(0, Math.min(1, proportion));
    console.log(`Updated work allocation: ${Math.round(proportionWorkSpentOnProducts.value * 100)}% to Products, ${Math.round((1 - proportionWorkSpentOnProducts.value) * 100)}% to Research`);
  }

  function initialize() {
    console.log("Initializing datacentre store");
    numResearchers.value = 0;
    currentHardwareId.value = 'hardware1';
    proportionWorkSpentOnProducts.value = 0.5;
  }

  return {
    // State
    numResearchers,
    currentHardwareId,
    proportionWorkSpentOnProducts,
    // Getters
    currentHardwareObject,
    canAffordToHire,
    nextHardwareUpgrade,
    canAffordUpgrade,
    // Actions
    hireResearcher,
    fireResearcher,
    upgradeHardware,
    setWorkAllocation,
    initialize,
  };
});