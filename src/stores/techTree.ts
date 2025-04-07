import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { findTechById } from './staticData';

export const useTechTreeStore = defineStore('techTree', () => {
  // --- State ---
  // Using Sets for efficient add/delete/has checks for IDs
  const available = ref(new Set(['discovery1', 'discoveryA'])); // Initial available techs
  const locked = ref(new Set(['discovery1', 'discoveryA']));    // Initial locked techs
  // Using a Map for unlocked items to easily access progress by ID
  const unlocked_progress = reactive(new Map()); // Map<idString, { workRequired: number, workApplied: number }>
  const complete = ref(new Set());
  const currentlySelectedProduct = ref(null); // ID string or null
  const currentlySelectedDiscovery = ref(null); // ID string or null

  // --- Getters (Computed Properties) ---
  // Calculate total income from completed products
  const totalIncomeRate = computed(() => {
    let income = 0;
    Array.from(complete.value).forEach(id => {
      const tech = findTechById(id);
      if (tech?.type === 'product' && tech.incomeGenerated) {
        income += tech.incomeGenerated;
      }
    });
    return income;
  });

  // Simple getters that don't depend on other stores
  const availableProducts = computed(() => {
    return Array.from(available.value).filter(id => {
      const tech = findTechById(id);
      return tech?.type === 'product';
    });
  });

  const availableDiscoveries = computed(() => {
    return Array.from(available.value).filter(id => {
      const tech = findTechById(id);
      return tech?.type === 'discovery';
    });
  });

  const completedProducts = computed(() => {
    return Array.from(complete.value).filter(id => {
      const tech = findTechById(id);
      return tech?.type === 'product';
    });
  });

  const completedDiscoveries = computed(() => {
    return Array.from(complete.value).filter(id => {
      const tech = findTechById(id);
      return tech?.type === 'discovery';
    });
  });

  // Function-style getters
  function isLocked(id) {
    return locked.value.has(id);
  }

  function getProgress(id) {
    return unlocked_progress.get(id); // Returns { workRequired, workApplied } or undefined
  }

  // --- Actions ---
  // Unlock a tech card to start working on it
  function unlock(id) {
    if (locked.value.has(id)) {
      const tech = findTechById(id);
      if (tech) {
        locked.value.delete(id);
        unlocked_progress.set(id, {
          workRequired: tech.workRequired,
          workApplied: 0
        });
        console.log(`Unlocked: ${tech.name}`);
      }
    }
  }

  // Apply work to a tech that's being worked on
  function progressWork(id, amount) {
    if (unlocked_progress.has(id)) {
      const progress = unlocked_progress.get(id);
      progress.workApplied += amount;
      console.log(`Applied ${amount} work to ${id}. Progress: ${progress.workApplied}/${progress.workRequired}`);

      // Check for completion
      if (progress.workApplied >= progress.workRequired) {
        completeWork(id);
      }
    }
  }

  // Called internally when workRequired is met
  function completeWork(id) {
    if (unlocked_progress.has(id)) {
      const tech = findTechById(id);
      console.log(`Completed: ${tech?.name || id}`);
      unlocked_progress.delete(id); // Remove from progress tracking
      complete.value.add(id);       // Add to completed set

      // Deselect if it was the currently selected item
      if (tech) {
        if (tech.type === 'product' && currentlySelectedProduct.value === id) {
          currentlySelectedProduct.value = null;
        } else if (tech.type === 'discovery' && currentlySelectedDiscovery.value === id) {
          currentlySelectedDiscovery.value = null;
        }

        // Make newly available techs available and locked
        if (tech.completionMakesAvailable) {
          tech.completionMakesAvailable.forEach(newItemId => {
            makeAvailable(newItemId);
          });
        }
      }
    }
  }

  // Called when a tech is completed to add new prerequisites
  function makeAvailable(id) {
    if (!available.value.has(id)) { // Only add if not already available
      available.value.add(id);
      locked.value.add(id); // Newly available items start locked
      console.log(`Made available: ${id}`);
    }
  }

  // Select a product card to work on
  function selectProduct(id) {
    if (available.value.has(id) && !locked.value.has(id)) {
      const tech = findTechById(id);
      if (tech?.type === 'product') {
        currentlySelectedProduct.value = id;
        console.log(`Selected product: ${tech.name}`);
      }
    }
  }

  // Select a discovery card to work on
  function selectDiscovery(id) {
    if (available.value.has(id) && !locked.value.has(id)) {
      const tech = findTechById(id);
      if (tech?.type === 'discovery') {
        currentlySelectedDiscovery.value = id;
        console.log(`Selected discovery: ${tech.name}`);
      }
    }
  }

  // Initialize function
  function initialize() {
    console.log("Initializing techTree store");
    available.value = new Set(['discovery1', 'discoveryA']);
    locked.value = new Set(['discovery1', 'discoveryA']);
    unlocked_progress.clear();
    complete.value = new Set();
    currentlySelectedProduct.value = null;
    currentlySelectedDiscovery.value = null;
  }

  return {
    // State
    available,
    locked,
    unlocked_progress,
    complete,
    currentlySelectedProduct,
    currentlySelectedDiscovery,
    // Getters
    totalIncomeRate,
    availableProducts,
    availableDiscoveries,
    completedProducts,
    completedDiscoveries,
    isLocked,
    getProgress,
    // Actions
    unlock,
    progressWork,
    makeAvailable,
    completeWork,
    selectProduct,
    selectDiscovery,
    initialize,
  };
});