import { reactive, computed } from 'vue';
import { GamePhase } from '../types';

// TODO: Merge this module straight into the global gameStore.

// Cost to found a company
export const COMPANY_FOUNDING_COST = 100;

/**
 * Phase module for managing game phases
 */
export function usePhase() {
  const state = reactive({
    gamePhase: GamePhase.JOB,
  });

  /**
   * Check if player has already founded a company
   */
  const hasFoundedCompany = computed(() => {
    return state.gamePhase !== GamePhase.JOB;
  });

  /**
   * Get the phase title for display
   */
  const phaseTitle = computed(() => {
    switch (state.gamePhase) {
      case GamePhase.JOB:
        return "Working for the Man";
      case GamePhase.COMPANY:
        return "Company Dashboard";
      case GamePhase.MARKETING:
        return "Marketing Department";
      case GamePhase.RESEARCH:
        return "Research & Development";
      default:
        return "March of Mind";
    }
  });

  /**
   * Change to company phase
   */
  function enterPhase(phase: GamePhase) {
    state.gamePhase = phase;
  }

  /**
   * Reset to job phase
   */
  function reset() {
    state.gamePhase = GamePhase.JOB;
  }

  /**
   * Save phase state to an object for persistence
   */
  function save() {
    return {
      gamePhase: state.gamePhase
    };
  }
  
  /**
   * Load phase state from saved data
   */
  function load(data: any) {
    if (data) {
      state.gamePhase = data.gamePhase || GamePhase.JOB;
    }
  }

  return {
    // State
    state,
    
    // Computed
    hasFoundedCompany,
    phaseTitle,
    
    // Methods
    enterPhase,
    reset,
    
    // Persistence
    save,
    load
  };
}