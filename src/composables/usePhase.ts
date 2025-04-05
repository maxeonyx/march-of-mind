import { reactive, computed, type ComputedRef } from 'vue';
import { GamePhase } from '../types';

// Cost to found a company
export const COMPANY_FOUNDING_COST = 100;

/**
 * Phase module for managing game phases
 * This will soon be merged into the global gameStore
 */
export function usePhase() {
  const phase = reactive({
    gamePhase: GamePhase.JOB,

    enterPhase(newPhase: GamePhase) {
      phase.gamePhase = newPhase;
    },

    reset() {
      phase.gamePhase = GamePhase.JOB;
    },

    save() {
      return {
        gamePhase: phase.gamePhase
      };
    },
    
    load(data: any) {
      if (data) {
        phase.gamePhase = data.gamePhase || GamePhase.JOB;
      }
    }
  });

  return reactive({
    ...phase,

    hasFoundedCompany: computed(() => {
      return phase.gamePhase !== GamePhase.JOB;
    }),

    phaseTitle: computed(() => {
      switch (phase.gamePhase) {
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
    }),
  });
}