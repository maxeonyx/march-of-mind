import { reactive, computed } from 'vue';
import type { Hardware } from '@/types';
import hardwareData from '@/assets/hardware.json';
import type { ResourcesStore } from './resources';

export interface HardwareState {
  /** All hardware tiers in the game */
  allHardware: Hardware[];

  /** Index of current hardware tier */
  currentTierIndex: number;

  /** Savings allocated toward next hardware purchase */
  savings: number;
}

/**
 * Hardware module for managing computing resources
 */
export function useHardware(resources: ResourcesStore) {
  const state = reactive<HardwareState>({
    allHardware: hardwareData as Hardware[],
    currentTierIndex: 0, // Start with the most basic hardware
    savings: 0
  });

  // Computed properties
  const currentHardware = computed(() => {
    return state.allHardware[state.currentTierIndex];
  });

  const nextHardware = computed(() => {
    if (state.currentTierIndex >= state.allHardware.length - 1) {
      return null; // No next tier available
    }
    return state.allHardware[state.currentTierIndex + 1];
  });

  const currentFlops = computed(() => {
    return currentHardware.value?.flops || 0;
  });

  const upgradeProgress = computed(() => {
    if (!nextHardware.value) return 1; // Already at max tier

    return Math.min(state.savings / nextHardware.value.cost, 1);
  });

  const canUpgrade = computed(() => {
    if (!nextHardware.value) return false;
    return state.savings >= nextHardware.value.cost;
  });

  // Methods
  function addSavings(amount: number) {
    state.savings += amount;
  }

  function upgrade(): boolean {
    if (!canUpgrade.value) return false;

    // Upgrade to the next tier
    state.savings -= nextHardware.value!.cost;
    state.currentTierIndex++;

    return true;
  }

  function reset() {
    state.currentTierIndex = 0;
    state.savings = 0;
  }

  function save() {
    return {
      currentTierIndex: state.currentTierIndex,
      savings: state.savings
    };
  }

  function load(data: any) {
    if (data) {
      state.currentTierIndex = data.currentTierIndex || 0;
      state.savings = data.savings || 0;
    }
  }

  return {
    // State (expose as needed)
    savings: computed(() => state.savings),

    // Computed properties
    currentHardware,
    nextHardware,
    currentFlops,
    upgradeProgress,
    canUpgrade,

    // Methods
    addSavings,
    upgrade,
    reset,
    save,
    load
  };
}

export type HardwareStore = ReturnType<typeof useHardware>;
