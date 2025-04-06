import { reactive, computed, type ComputedRef } from 'vue';
import { type ResourcesStore } from './resources';

// Talent system constants
export const HIRE_TALENT_COST = 50;
export const TALENT_SALARY = 15;
export const TALENT_INCOME = 5;
export const TALENT_INSIGHTS = 0.02; // Insights generated per talent per month (50 talent-months per insight)

/**
 * Talent module for managing talent
 */
export function useTalent(resources: ResourcesStore) {
  const talent = reactive({
    count: 0,
    hasHiredTalent: false,

    hireTalent() {
      if (resources.money >= HIRE_TALENT_COST) {
        resources.spendMoney(HIRE_TALENT_COST);
        talent.count++;
        
        // Mark that we've hired at least one talent
        if (!talent.hasHiredTalent) {
          talent.hasHiredTalent = true;
        }
        
        return true;
      }
      return false;
    },

    fireTalent() {
      if (talent.count > 0) {
        talent.count--;
        return true;
      }
      return false;
    },

    processMonthlyFinances() {
      if (talent.count > 0) {
        // Calculate net income directly without using computed property
        const netIncome = talent.count * (TALENT_INCOME - TALENT_SALARY);
        resources.addMoney(netIncome);
      }
    },

    reset() {
      talent.count = 0;
      talent.hasHiredTalent = false;
    },

    save() {
      return {
        talent: talent.count,
        hasHiredTalent: talent.hasHiredTalent
      };
    },
    
    load(data: any) {
      if (data) {
        talent.count = data.talent || 0;
        talent.hasHiredTalent = data.hasHiredTalent || false;
      }
    }
  });

  return reactive({
    ...talent,
    
    monthlyIncome: computed(() => {
      return talent.count * TALENT_INCOME;
    }),

    monthlySalary: computed(() => {
      return talent.count * TALENT_SALARY;
    }),

    monthlyNetIncome: computed(() => {
      return talent.count * (TALENT_INCOME - TALENT_SALARY);
    }),

    monthlyInsights: computed(() => {
      return talent.count * TALENT_INSIGHTS;
    }),

    canHireTalent: computed(() => {
      return resources.money >= HIRE_TALENT_COST;
    }),

    canFireTalent: computed(() => {
      return talent.count > 0;
    }),

    firstHireProgress: computed(() => {
      return Math.min(resources.money / HIRE_TALENT_COST, 1);
    }),
  });
}