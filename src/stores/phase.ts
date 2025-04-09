import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { GamePhase } from '../types';

export const usePhaseStore = defineStore('phase', () => {
  // --- State ---
  const currentPhase = ref<GamePhase>('startup'); // Start in the 'startup' phase

  // --- Actions ---
  function setPhase(newPhase: GamePhase) {
    if (currentPhase.value !== newPhase) {
      console.log(`Transitioning from phase '${currentPhase.value}' to '${newPhase}'`);
      currentPhase.value = newPhase;
      // Potential future hook: emit('phaseChanged', newPhase);
    }
  }

  function initialize() {
    console.log("Initializing phase store");
    currentPhase.value = 'startup';
  }

  // Make store accessible for tests
  if (typeof window !== 'undefined') {
    window.__phaseStore = {
      currentPhase: currentPhase.value, // Expose value directly for reads
      setPhase // Expose action
    };
    // Watch for changes to update the global state for tests
    watch(currentPhase, (newPhase) => {
      if (window.__phaseStore) {
         window.__phaseStore.currentPhase = newPhase;
      }
    });
  }

  return {
    // State
    currentPhase,
    // Actions
    setPhase,
    initialize,
  };
});