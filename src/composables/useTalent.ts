import { reactive, computed } from 'vue';
import { type ResourcesStore } from './useResources';

// Talent system constants
export const HIRE_TALENT_COST = 50;
export const TALENT_SALARY = 15;
export const TALENT_INCOME = 5;
export const TALENT_INSIGHTS = 0.02; // Insights generated per talent per month (50 talent-months per insight)

/**
 * Talent module for managing talent
 */
export function useTalent(resources: ResourcesStore) {
  const state = reactive({
    talent: 0,
    hasHiredTalent: false,
  });

  /**
   * Calculate monthly income from talent
   */
  const monthlyIncome = computed(() => {
    return state.talent * TALENT_INCOME;
  });

  /**
   * Calculate monthly salary expenses
   */
  const monthlySalary = computed(() => {
    return state.talent * TALENT_SALARY;
  });

  /**
   * Calculate net monthly income (income - expenses)
   */
  const monthlyNetIncome = computed(() => {
    return state.talent * (TALENT_INCOME - TALENT_SALARY);
  });

  /**
   * Calculate monthly insights generated
   */
  const monthlyInsights = computed(() => {
    return state.talent * TALENT_INSIGHTS;
  });

  /**
   * Check if player can hire talent
   */
  const canHireTalent = computed(() => {
    return resources.money >= HIRE_TALENT_COST;
  });

  /**
   * Check if player can fire talent
   */
  const canFireTalent = computed(() => {
    return state.talent > 0;
  });

  /**
   * Get the progress toward first hire (0-1)
   */
  const firstHireProgress = computed(() => {
    return Math.min(resources.money / HIRE_TALENT_COST, 1);
  });

  /**
   * Hire a new talent
   * @returns true if successful, false if not enough money
   */
  function hireTalent() {
    if (canHireTalent.value) {
      resources.spendMoney(HIRE_TALENT_COST);
      state.talent++;
      
      // Mark that we've hired at least one talent
      if (!state.hasHiredTalent) {
        state.hasHiredTalent = true;
      }
      
      return true;
    }
    return false;
  }

  /**
   * Fire an existing talent
   * @returns true if successful, false if no talent to fire
   */
  function fireTalent() {
    if (canFireTalent.value) {
      state.talent--;
      return true;
    }
    return false;
  }

  /**
   * Process monthly income/expenses for talent
   */
  function processMonthlyFinances() {
    if (state.talent > 0) {
      resources.addMoney(monthlyNetIncome.value);
    }
  }

  /**
   * Reset talent to 0
   */
  function reset() {
    state.talent = 0;
    state.hasHiredTalent = false;
  }

  /**
   * Save talent state to an object for persistence
   */
  function save() {
    return {
      talent: state.talent,
      hasHiredTalent: state.hasHiredTalent
    };
  }
  
  /**
   * Load talent state from saved data
   */
  function load(data: any) {
    if (data) {
      state.talent = data.talent || 0;
      state.hasHiredTalent = data.hasHiredTalent || false;
    }
  }

  return {
    // State
    state,
    
    // Computed
    monthlyIncome,
    monthlySalary,
    monthlyNetIncome,
    monthlyInsights,
    canHireTalent,
    canFireTalent,
    firstHireProgress,
    
    // Methods
    hireTalent,
    fireTalent,
    processMonthlyFinances,
    
    // Persistence
    reset,
    save,
    load
  };
}