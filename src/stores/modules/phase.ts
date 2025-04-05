import { defineStore } from 'pinia';

/**
 * Game phases
 */
export enum GamePhase {
  JOB = 'job',
  COMPANY = 'company',
  MARKETING = 'marketing',
  RESEARCH = 'research'
}

// Cost to found a company
export const COMPANY_FOUNDING_COST = 100;

/**
 * Store for managing game phases
 */
export const usePhaseStore = defineStore('phase', {
  state: () => {
    return {
      gamePhase: GamePhase.JOB,
    };
  },
  
  getters: {
    /**
     * Check if player has already founded a company
     */
    hasFoundedCompany: (state) => {
      return state.gamePhase !== GamePhase.JOB;
    },
    
    /**
     * Get the phase title for display
     */
    phaseTitle() {
      switch (this.gamePhase) {
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
    }
  },
  
  actions: {
    /**
     * Change to company phase
     */
    enterCompanyPhase() {
      this.gamePhase = GamePhase.COMPANY;
    },
    
    /**
     * Change to marketing phase
     */
    enterMarketingPhase() {
      this.gamePhase = GamePhase.MARKETING;
    },
    
    /**
     * Change to research phase
     */
    enterResearchPhase() {
      this.gamePhase = GamePhase.RESEARCH;
    },
    
    /**
     * Reset to job phase
     */
    reset() {
      this.gamePhase = GamePhase.JOB;
    }
  }
});