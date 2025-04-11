import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  PopulationAllocation, 
  FixedParameters, 
  VariableParameters, 
  CalculatedValues,
  SimulationState,
  PendingChanges
} from '@/types/population';

export const usePopulationStore = defineStore('population', () => {
  // Current applied parameters
  const allocation = ref<PopulationAllocation>({
    foodAllocationPercent: 70,
    thinkingAllocationPercent: 10,
    childcareAllocationPercent: 20
  });

  const fixedParams = ref<FixedParameters>({
    baseMinCalories: 2000,
    dependencyCalorieFactor: 0.5,
    baseGrowthFactor: 0.05,
    childcareEfficiencyFactor: 0.1,
    maxChildcareEffectiveness: 0.8,
    baseDeclineRate: 0.02,
    k: 5,
    maxGrowthRateCap: 0.1
  });

  const variableParams = ref<VariableParameters>({
    socialScaleCapacity: 1000,
    caloriesPerFoodWorker: 3000
  });

  // Simulation state
  const simulationState = ref<SimulationState>({
    currentPopulation: 100,
    currentTimeStep: 0,
    previousGrowthRatePercent: 0,
    populationHistory: [{ timeStep: 0, population: 100 }]
  });

  // Pending changes (not yet applied)
  const pendingChanges = ref<PendingChanges>({});

  // Simulation running state
  const isRunning = ref(false);
  const simulationInterval = ref<number | null>(null);

  // Computed values based on current parameters
  const calculatedValues = computed<CalculatedValues>(() => {
    const effectiveAllocation = {
      ...allocation.value,
      ...pendingChanges.value.allocation
    };
    
    const effectiveFixedParams = {
      ...fixedParams.value,
      ...pendingChanges.value.fixedParams
    };
    
    const effectiveVariableParams = {
      ...variableParams.value,
      ...pendingChanges.value.variableParams
    };

    // Calculate total calories supplied
    const totalCaloriesSupplied = 
      simulationState.value.currentPopulation * 
      (effectiveAllocation.foodAllocationPercent / 100) * 
      effectiveVariableParams.caloriesPerFoodWorker;

    // Calculate adjusted minimum calories
    const adjustedMinCalories = 
      effectiveFixedParams.baseMinCalories * 
      (1 + effectiveFixedParams.dependencyCalorieFactor * simulationState.value.previousGrowthRatePercent);

    // Calculate minimum total calories needed
    const minTotalCaloriesNeeded = 
      adjustedMinCalories * simulationState.value.currentPopulation;

    // Calculate childcare effectiveness
    const childcareEffectiveness = Math.min(
      effectiveFixedParams.maxChildcareEffectiveness,
      (effectiveAllocation.childcareAllocationPercent / 100) * effectiveFixedParams.childcareEfficiencyFactor
    );

    // Calculate actual growth factor
    const actualGrowthFactor = 
      effectiveFixedParams.baseGrowthFactor * childcareEffectiveness;

    // Predict population change
    let predictedPopulationChange = 0;
    
    if (totalCaloriesSupplied < minTotalCaloriesNeeded) {
      // Population decline due to calorie deficit
      const currentCaloriesPerCapita = totalCaloriesSupplied / simulationState.value.currentPopulation;
      const adjustedCalorieDeficitRatio = (adjustedMinCalories - currentCaloriesPerCapita) / adjustedMinCalories;
      const declineRate = effectiveFixedParams.baseDeclineRate * Math.exp(effectiveFixedParams.k * adjustedCalorieDeficitRatio);
      predictedPopulationChange = -simulationState.value.currentPopulation * declineRate;
    } else {
      // Population growth (logistic growth model)
      predictedPopulationChange = actualGrowthFactor * 
        simulationState.value.currentPopulation * 
        (1 - simulationState.value.currentPopulation / effectiveVariableParams.socialScaleCapacity);
      
      // Cap growth rate if needed
      const growthRate = predictedPopulationChange / simulationState.value.currentPopulation;
      if (growthRate > effectiveFixedParams.maxGrowthRateCap) {
        predictedPopulationChange = effectiveFixedParams.maxGrowthRateCap * simulationState.value.currentPopulation;
      }
    }

    // Calculate equilibrium population
    const populationEquilibrium = totalCaloriesSupplied >= minTotalCaloriesNeeded 
      ? effectiveVariableParams.socialScaleCapacity 
      : 0;

    return {
      totalCaloriesSupplied,
      minTotalCaloriesNeeded,
      adjustedMinCalories,
      childcareEffectiveness,
      actualGrowthFactor,
      predictedPopulationChange,
      populationEquilibrium
    };
  });

  // Check if there are any pending changes
  const hasPendingChanges = computed(() => {
    return Object.keys(pendingChanges.value).length > 0 && 
      (pendingChanges.value.allocation || 
       pendingChanges.value.fixedParams || 
       pendingChanges.value.variableParams);
  });

  // Actions
  function updatePendingAllocation(newAllocation: Partial<PopulationAllocation>) {
    pendingChanges.value.allocation = {
      ...pendingChanges.value.allocation,
      ...newAllocation
    };
    
    // Ensure allocations sum to 100%
    const alloc = {
      ...allocation.value,
      ...pendingChanges.value.allocation
    };
    
    // If all three are specified, adjust thinking to make sum 100%
    if (pendingChanges.value.allocation?.foodAllocationPercent !== undefined && 
        pendingChanges.value.allocation?.childcareAllocationPercent !== undefined) {
      const sum = alloc.foodAllocationPercent + alloc.childcareAllocationPercent;
      if (sum <= 100) {
        pendingChanges.value.allocation.thinkingAllocationPercent = 100 - sum;
      }
    }
  }

  function updatePendingFixedParams(params: Partial<FixedParameters>) {
    pendingChanges.value.fixedParams = {
      ...pendingChanges.value.fixedParams,
      ...params
    };
  }

  function updatePendingVariableParams(params: Partial<VariableParameters>) {
    pendingChanges.value.variableParams = {
      ...pendingChanges.value.variableParams,
      ...params
    };
  }

  function applyPendingChanges() {
    if (pendingChanges.value.allocation) {
      allocation.value = {
        ...allocation.value,
        ...pendingChanges.value.allocation
      };
    }
    
    if (pendingChanges.value.fixedParams) {
      fixedParams.value = {
        ...fixedParams.value,
        ...pendingChanges.value.fixedParams
      };
    }
    
    if (pendingChanges.value.variableParams) {
      variableParams.value = {
        ...variableParams.value,
        ...pendingChanges.value.variableParams
      };
    }
    
    // Clear pending changes
    pendingChanges.value = {};
  }

  function clearPendingChanges() {
    pendingChanges.value = {};
  }

  function simulationStep() {
    const { predictedPopulationChange } = calculatedValues.value;
    
    // Calculate new population
    const newPopulation = Math.max(0, simulationState.value.currentPopulation + predictedPopulationChange);
    
    // Calculate growth rate for this step
    const growthRatePercent = simulationState.value.currentPopulation > 0
      ? (newPopulation - simulationState.value.currentPopulation) / simulationState.value.currentPopulation
      : 0;
    
    // Update simulation state
    simulationState.value.previousGrowthRatePercent = growthRatePercent;
    simulationState.value.currentPopulation = newPopulation;
    simulationState.value.currentTimeStep++;
    
    // Add to history
    simulationState.value.populationHistory.push({
      timeStep: simulationState.value.currentTimeStep,
      population: newPopulation
    });
    
    // Limit history length to prevent memory issues
    if (simulationState.value.populationHistory.length > 1000) {
      simulationState.value.populationHistory.shift();
    }
  }

  function startSimulation() {
    if (!isRunning.value) {
      isRunning.value = true;
      simulationInterval.value = window.setInterval(() => {
        simulationStep();
      }, 1000); // Run simulation step every second
    }
  }

  function pauseSimulation() {
    if (isRunning.value && simulationInterval.value !== null) {
      clearInterval(simulationInterval.value);
      simulationInterval.value = null;
      isRunning.value = false;
    }
  }

  function resetSimulation() {
    pauseSimulation();
    simulationState.value = {
      currentPopulation: 100,
      currentTimeStep: 0,
      previousGrowthRatePercent: 0,
      populationHistory: [{ timeStep: 0, population: 100 }]
    };
  }

  return {
    // State
    allocation,
    fixedParams,
    variableParams,
    simulationState,
    pendingChanges,
    isRunning,
    
    // Computed
    calculatedValues,
    hasPendingChanges,
    
    // Actions
    updatePendingAllocation,
    updatePendingFixedParams,
    updatePendingVariableParams,
    applyPendingChanges,
    clearPendingChanges,
    simulationStep,
    startSimulation,
    pauseSimulation,
    resetSimulation
  };
});
