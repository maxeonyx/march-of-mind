import { reactive, computed, type ComputedRef } from 'vue';
import { type ResourcesStore } from './resources';
import { type HardwareStore } from './hardware';
import { type DiscoveriesStore } from './discoveries';

// Researcher system constants
export const HIRE_RESEARCHER_COST = 10;
export const RESEARCHER_SALARY = 15;
export const RESEARCHER_INCOME = 5;
export const BASE_INSIGHT_RATE = 0.1; // Base insights per researcher per click

/**
 * Researchers module for managing research staff
 */
export function useResearchers(
  resources: ResourcesStore,
  hardware?: HardwareStore,
  discoveries?: DiscoveriesStore
) {
  const researchers = reactive({
    count: 0,
    hasHiredResearcher: false,
    // Allocation between salaries and hardware (0-1)
    // 0 = all money to salaries, 1 = all money to hardware
    allocation: 0.5,

    hireResearcher() {
      if (resources.money >= HIRE_RESEARCHER_COST) {
        resources.spendMoney(HIRE_RESEARCHER_COST);
        researchers.count++;

        // Mark that we've hired at least one researcher
        if (!researchers.hasHiredResearcher) {
          researchers.hasHiredResearcher = true;
        }

        return true;
      }
      return false;
    },

    fireResearcher() {
      if (researchers.count > 0) {
        researchers.count--;
        return true;
      }
      return false;
    },

    setAllocation(value: number) {
      // Ensure value is between 0 and 1
      researchers.allocation = Math.max(0, Math.min(1, value));
    },

    processMonthlyFinances() {
      if (researchers.count > 0) {
        // Calculate net income directly without using computed property
        const netIncome = researchers.count * (RESEARCHER_INCOME - RESEARCHER_SALARY);
        
        // Add to money based on income
        resources.addMoney(netIncome);
        
        // If hardware module is provided, allocate some income to hardware savings
        if (hardware && netIncome > 0) {
          const hardwareSavings = netIncome * researchers.allocation;
          hardware.addSavings(hardwareSavings);
        }
      }
    },

    generateInsights(baseAmount: number) {
      if (researchers.count <= 0) {
        // No researchers, just add base amount
        resources.addInsights(baseAmount);
        return baseAmount;
      }
      
      // Calculate total insight generation based on:
      // 1. Base amount
      // 2. Number of researchers
      // 3. Hardware FLOP/s (if available)
      // 4. Discovery boosts (if available)
      
      let insightAmount = baseAmount;
      
      // Add researcher contribution
      insightAmount += researchers.count * BASE_INSIGHT_RATE;
      
      // Multiply by hardware FLOP/s if available
      if (hardware) {
        // More significant multiplier based on FLOP/s
        // This makes hardware upgrades much more impactful
        const hardwareMultiplier = hardware.currentFlops.value > 0 
          ? 1 + Math.log10(hardware.currentFlops.value) * 0.5
          : 1;
        
        insightAmount *= hardwareMultiplier;
      }
      
      // Apply discovery boosts if available
      if (discoveries) {
        insightAmount *= discoveries.totalInsightBoost.value;
      }
      
      // Add the calculated insights
      resources.addInsights(insightAmount);
      
      return insightAmount;
    },

    reset() {
      researchers.count = 0;
      researchers.hasHiredResearcher = false;
      researchers.allocation = 0.5;
    },

    save() {
      return {
        researchers: researchers.count,
        hasHiredResearcher: researchers.hasHiredResearcher,
        allocation: researchers.allocation
      };
    },

    load(data: any) {
      if (data) {
        researchers.count = data.researchers || 0;
        researchers.hasHiredResearcher = data.hasHiredResearcher || false;
        researchers.allocation = data.allocation ?? 0.5;
      }
    }
  });

  return reactive({
    ...researchers,

    monthlyIncome: computed(() => {
      return researchers.count * RESEARCHER_INCOME;
    }),

    monthlySalary: computed(() => {
      return researchers.count * RESEARCHER_SALARY;
    }),

    monthlyNetIncome: computed(() => {
      return researchers.count * (RESEARCHER_INCOME - RESEARCHER_SALARY);
    }),

    insightRate: computed(() => {
      // Base insight rate for one click
      let rate = 1; // Base rate
      
      if (researchers.count > 0) {
        rate += researchers.count * BASE_INSIGHT_RATE;
      }
      
      // Apply hardware multiplier if available
      if (hardware) {
        // Significantly larger multiplier based on FLOP/s
        // Make vacuum tubes more impactful
        const hardwareMultiplier = hardware.currentFlops.value > 0 
          ? 1 + Math.log10(hardware.currentFlops.value) * 0.5
          : 1;
        
        rate *= hardwareMultiplier;
      }
      
      // Apply discovery boosts if available
      if (discoveries) {
        rate *= discoveries.totalInsightBoost.value;
      }
      
      return Math.round(rate * 10) / 10; // Round to 1 decimal place
    }),

    canHireResearcher: computed(() => {
      return resources.money >= HIRE_RESEARCHER_COST;
    }),

    canFireResearcher: computed(() => {
      return researchers.count > 0;
    }),

    firstHireProgress: computed(() => {
      return Math.min(resources.money / HIRE_RESEARCHER_COST, 1);
    }),
    
    // Allocation properties
    allocatedToSalaries: computed(() => {
      return 1 - researchers.allocation;
    }),

    allocatedToHardware: computed(() => {
      return researchers.allocation;
    }),
  });
}

export type ResearchersStore = ReturnType<typeof useResearchers>;