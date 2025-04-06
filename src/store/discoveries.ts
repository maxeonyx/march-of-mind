import { reactive, computed } from 'vue';
import type { Discovery } from '@/types';
import discoveryData from '@/assets/discoveries.json';
import type { ResourcesStore } from './resources';

export interface DiscoveryState {
  /** All discoveries in the game */
  allDiscoveries: Discovery[];

  /** IDs of discoveries that have been unlocked */
  unlockedDiscoveries: string[];

  /** ID of the currently focused discovery (for UI) */
  currentDiscoveryFocus: string | null;
}

/**
 * Discoveries module for managing unlocked technologies and research progression
 */
export function useDiscoveries(resources: ResourcesStore) {
  const state = reactive<DiscoveryState>({
    allDiscoveries: discoveryData as Discovery[],
    unlockedDiscoveries: [],
    currentDiscoveryFocus: null
  });

  // Computed properties
  const unlockedDiscoveriesData = computed(() => {
    return state.unlockedDiscoveries.map(id =>
      state.allDiscoveries.find(d => d.id === id)
    ).filter(d => d !== undefined) as Discovery[];
  });

  const availableDiscoveries = computed(() => {
    return state.allDiscoveries.filter(discovery =>
      // Not already unlocked
      !state.unlockedDiscoveries.includes(discovery.id) &&
      // All prerequisites are unlocked or no prerequisites
      (discovery.prerequisites.length === 0 ||
        discovery.prerequisites.every(preReqId => state.unlockedDiscoveries.includes(preReqId)))
    );
  });

  const nextDiscovery = computed(() => {
    if (availableDiscoveries.value.length === 0) return null;

    // Find the discovery with the lowest thought power cost among available ones
    return availableDiscoveries.value.reduce((lowest, current) => {
      return current.insightCost < lowest.insightCost ? current : lowest; // Using insightCost property for compatibility
    }, availableDiscoveries.value[0]);
  });

  const totalThoughtPowerBoost = computed(() => {
    // Calculate cumulative thought power boost from all unlocked discoveries
    return unlockedDiscoveriesData.value.reduce((total, discovery) => {
      return total * discovery.insightBoost; // Using insightBoost property for compatibility
    }, 1); // Start with 1 (no boost)
  });
  
  // Keep legacy property for backward compatibility
  const totalInsightBoost = computed(() => {
    return totalThoughtPowerBoost.value;
  });

  // Methods
  function unlockDiscovery(discoveryId: string): boolean {
    const discovery = state.allDiscoveries.find(d => d.id === discoveryId);

    if (!discovery) return false;

    // Check if already unlocked
    if (state.unlockedDiscoveries.includes(discoveryId)) return true;

    // Check if all prerequisites are met
    const prerequisitesMet = discovery.prerequisites.every(
      preReqId => state.unlockedDiscoveries.includes(preReqId)
    );

    if (!prerequisitesMet) return false;

    // Check if player has enough thought power
    if (!resources.spendThoughtPower(discovery.insightCost)) return false;

    // Unlock the discovery
    state.unlockedDiscoveries.push(discoveryId);
    return true;
  }

  function setFocus(discoveryId: string | null) {
    state.currentDiscoveryFocus = discoveryId;
  }

  function reset() {
    state.unlockedDiscoveries = [];
    state.currentDiscoveryFocus = null;
  }

  function save() {
    return {
      unlockedDiscoveries: state.unlockedDiscoveries,
      currentDiscoveryFocus: state.currentDiscoveryFocus
    };
  }

  function load(data: any) {
    if (data) {
      state.unlockedDiscoveries = data.unlockedDiscoveries || [];
      state.currentDiscoveryFocus = data.currentDiscoveryFocus || null;
    }
  }

  return {
    // State (expose as needed)
    unlockedDiscoveries: computed(() => state.unlockedDiscoveries),

    // Computed properties
    unlockedDiscoveriesData,
    availableDiscoveries,
    nextDiscovery,
    totalInsightBoost,
    totalThoughtPowerBoost,

    // Methods
    unlockDiscovery,
    setFocus,
    reset,
    save,
    load
  };
}

export type DiscoveriesStore = ReturnType<typeof useDiscoveries>;
