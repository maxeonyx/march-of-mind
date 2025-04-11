export interface PopulationAllocation {
  foodAllocationPercent: number;
  thinkingAllocationPercent: number;
  childcareAllocationPercent: number;
}

export interface FixedParameters {
  baseMinCalories: number;
  dependencyCalorieFactor: number;
  baseGrowthFactor: number;
  childcareEfficiencyFactor: number;
  maxChildcareEffectiveness: number;
  baseDeclineRate: number;
  k: number;
  maxGrowthRateCap: number;
}

export interface VariableParameters {
  socialScaleCapacity: number;
  caloriesPerFoodWorker: number;
}

export interface CalculatedValues {
  totalCaloriesSupplied: number;
  minTotalCaloriesNeeded: number;
  adjustedMinCalories: number;
  childcareEffectiveness: number;
  actualGrowthFactor: number;
  predictedPopulationChange: number;
  populationEquilibrium: number;
}

export interface SimulationState {
  currentPopulation: number;
  currentTimeStep: number;
  previousGrowthRatePercent: number;
  populationHistory: { timeStep: number; population: number }[];
}

export interface PendingChanges {
  allocation?: Partial<PopulationAllocation>;
  fixedParams?: Partial<FixedParameters>;
  variableParams?: Partial<VariableParameters>;
}
