import { defineStore } from 'pinia';
import { ref, reactive, computed, watch } from 'vue';
import { findTechById } from './staticData';
import { useUiStore } from './ui'; // Import UI Store
import { usePhaseStore } from './phase'; // Import Phase Store

export const useTechTreeStore = defineStore('techTree', () => {
  // --- State ---
  // Using Sets for efficient add/delete/has checks for IDs
  const available = ref(new Set(['discovery1', 'discoveryA'])); // Initial available techs
  const locked = ref(new Set(['discovery1', 'discoveryA']));    // Initial locked techs
  // Using a Map for unlocked items to easily access progress by ID
  const unlocked_progress = reactive(new Map()); // Map<idString, { workRequired: number, workApplied: number }>
  const complete = ref(new Set());
  const currentlySelectedProduct = ref<string | null>(null); // ID string or null
  const currentlySelectedDiscovery = ref<string | null>(null); // ID string or null
  const hasCompletedFirstProduct = ref(false); // New state flag for event tracking

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
  function isLocked(id: string) {
    return locked.value.has(id);
  }

  function getProgress(id: string) {
    return unlocked_progress.get(id); // Returns { workRequired, workApplied } or undefined
  }

  // --- Actions ---
  // Unlock a tech card to start working on it
  function unlock(id: string) {
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
  function progressWork(id: string, amount: number) {
    if (unlocked_progress.has(id)) {
      const progress = unlocked_progress.get(id);
      progress.workApplied += amount;
      console.log(`Applied ${amount.toFixed(2)} work to ${id}. Progress: ${progress.workApplied.toFixed(2)}/${progress.workRequired}`);

      // Check for completion
      if (progress.workApplied >= progress.workRequired) {
        // Ensure we don't over-apply work conceptually, cap it at required
        progress.workApplied = progress.workRequired;
        completeWork(id); // Call completion logic
      }
    } else {
      console.warn(`Attempted to apply work to non-progressing tech: ${id}`);
    }
  }

  // Called internally when workRequired is met
  function completeWork(id: string) {
    // Ensure it's actually in progress before completing
    if (!unlocked_progress.has(id)) return;

    const tech = findTechById(id);
    console.log(`Completed: ${tech?.name || id}`);
    unlocked_progress.delete(id); // Remove from progress tracking
    complete.value.add(id);     // Add to completed set
    available.value.delete(id);   // Remove from available list (if it was there)

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

      // *** EVENT TRIGGER: First Product Completion ***
      if (tech.type === 'product' && !hasCompletedFirstProduct.value) {
        hasCompletedFirstProduct.value = true;
        console.log("EVENT: First product completed!");

        // Get store instances
        const uiStore = useUiStore();
        const phaseStore = usePhaseStore();

        // Show popup
        uiStore.showPopup(
          "Milestone Achieved!",
          "Congratulations! You've completed your first product. Your operation is moving from the initial startup phase into a dedicated lab environment. Research efforts will now be automated."
        );

        // Transition to the 'lab' phase
        phaseStore.setPhase('lab');
      }
    }
  }

  // Called when a tech is completed to add new prerequisites
  function makeAvailable(id: string) {
    const tech = findTechById(id);
    if (!tech) {
      console.warn(`Attempted to make unknown tech available: ${id}`);
      return;
    }
    // Prevent adding if already available, in progress, or completed
    if (!available.value.has(id) && !unlocked_progress.has(id) && !complete.value.has(id)) {
      available.value.add(id);
      locked.value.add(id); // Newly available items start locked
      console.log(`Made available: ${tech.name} (${id})`);
    }
  }

  // Select a product card to work on
  function selectProduct(id: string) {
    if (available.value.has(id) && !locked.value.has(id)) {
      const tech = findTechById(id);
      if (tech?.type === 'product') {
        currentlySelectedProduct.value = id;
        console.log(`Selected product: ${tech.name}`);
      }
    }
  }

  // Select a discovery card to work on
  function selectDiscovery(id: string) {
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
    hasCompletedFirstProduct.value = false; // Reset flag on init
  }

  // Expose necessary state/actions for tests
  if (typeof window !== 'undefined') {
    if (window.__techTreeStore) {
      window.__techTreeStore.currentlySelectedProduct = currentlySelectedProduct.value;
      window.__techTreeStore.currentlySelectedDiscovery = currentlySelectedDiscovery.value;
      window.__techTreeStore.progressWork = progressWork; // Expose for manual work application tests
    }
    // Watchers to update global state for tests
    watch(currentlySelectedProduct, (newValue) => {
      if (window.__techTreeStore) window.__techTreeStore.currentlySelectedProduct = newValue;
    });
    watch(currentlySelectedDiscovery, (newValue) => {
      if (window.__techTreeStore) window.__techTreeStore.currentlySelectedDiscovery = newValue;
    });
  }

  return {
    // State
    available,
    locked,
    unlocked_progress,
    complete,
    currentlySelectedProduct,
    currentlySelectedDiscovery,
    hasCompletedFirstProduct, // Expose for debugging/testing
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