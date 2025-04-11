<template>
  <div class="population-simulator">
    <h1>Population Dynamics Simulator</h1>
    
    <!-- Population Graph -->
    <div class="graph-container">
      <canvas ref="populationChart" width="800" height="400"></canvas>
    </div>
    
    <div class="simulator-controls">
      <!-- Simulation Controls -->
      <div class="simulation-buttons">
        <button @click="startSimulation" :disabled="isRunning">Start</button>
        <button @click="pauseSimulation" :disabled="!isRunning">Pause</button>
        <button @click="resetSimulation">Reset</button>
        <button 
          @click="applyPendingChanges" 
          :disabled="!hasPendingChanges"
          class="apply-button"
        >
          Apply Changes
        </button>
        <button 
          @click="clearPendingChanges" 
          :disabled="!hasPendingChanges"
        >
          Cancel Changes
        </button>
      </div>
      
      <div class="control-panels">
        <!-- Population Allocation Panel -->
        <div class="control-panel">
          <h3>Population Allocation</h3>
          <div class="allocation-control">
            <label>Food Gathering: {{ displayAllocation.foodAllocationPercent }}%</label>
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                v-model.number="tempAllocation.foodAllocationPercent"
                @input="updateAllocation('food')"
              />
              <span v-if="isPendingAllocation('foodAllocationPercent')" class="pending-indicator">
                Pending: {{ pendingChanges.allocation?.foodAllocationPercent }}%
              </span>
            </div>
          </div>
          
          <div class="allocation-control">
            <label>Thinking: {{ displayAllocation.thinkingAllocationPercent }}%</label>
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                v-model.number="tempAllocation.thinkingAllocationPercent"
                @input="updateAllocation('thinking')"
              />
              <span v-if="isPendingAllocation('thinkingAllocationPercent')" class="pending-indicator">
                Pending: {{ pendingChanges.allocation?.thinkingAllocationPercent }}%
              </span>
            </div>
          </div>
          
          <div class="allocation-control">
            <label>Childcare: {{ displayAllocation.childcareAllocationPercent }}%</label>
            <div class="slider-container">
              <input 
                type="range" 
                min="0" 
                max="100" 
                v-model.number="tempAllocation.childcareAllocationPercent"
                @input="updateAllocation('childcare')"
              />
              <span v-if="isPendingAllocation('childcareAllocationPercent')" class="pending-indicator">
                Pending: {{ pendingChanges.allocation?.childcareAllocationPercent }}%
              </span>
            </div>
          </div>
          
          <div class="allocation-total">
            Total: {{ allocationTotal }}%
            <span v-if="allocationTotal !== 100" class="error-text">
              (Must equal 100%)
            </span>
          </div>
        </div>
        
        <!-- Fixed Parameters Panel -->
        <div class="control-panel">
          <h3>Fixed Parameters</h3>
          
          <div class="parameter-control">
            <label for="baseMinCalories">Base Min Calories:</label>
            <input 
              id="baseMinCalories"
              type="number" 
              v-model.number="tempFixedParams.baseMinCalories"
              @change="updateFixedParam('baseMinCalories')"
            />
            <span v-if="isPendingFixedParam('baseMinCalories')" class="pending-indicator">
              Pending: {{ pendingChanges.fixedParams?.baseMinCalories }}
            </span>
          </div>
          
          <div class="parameter-control">
            <label for="dependencyCalorieFactor">Dependency Calorie Factor:</label>
            <input 
              id="dependencyCalorieFactor"
              type="number" 
              step="0.1"
              v-model.number="tempFixedParams.dependencyCalorieFactor"
              @change="updateFixedParam('dependencyCalorieFactor')"
            />
            <span v-if="isPendingFixedParam('dependencyCalorieFactor')" class="pending-indicator">
              Pending: {{ pendingChanges.fixedParams?.dependencyCalorieFactor }}
            </span>
          </div>
          
          <div class="parameter-control">
            <label for="baseGrowthFactor">Base Growth Factor:</label>
            <input 
              id="baseGrowthFactor"
              type="number" 
              step="0.01"
              v-model.number="tempFixedParams.baseGrowthFactor"
              @change="updateFixedParam('baseGrowthFactor')"
            />
            <span v-if="isPendingFixedParam('baseGrowthFactor')" class="pending-indicator">
              Pending: {{ pendingChanges.fixedParams?.baseGrowthFactor }}
            </span>
          </div>
          
          <div class="parameter-control">
            <label for="childcareEfficiencyFactor">Childcare Efficiency Factor:</label>
            <input 
              id="childcareEfficiencyFactor"
              type="number" 
              step="0.01"
              v-model.number="tempFixedParams.childcareEfficiencyFactor"
              @change="updateFixedParam('childcareEfficiencyFactor')"
            />
            <span v-if="isPendingFixedParam('childcareEfficiencyFactor')" class="pending-indicator">
              Pending: {{ pendingChanges.fixedParams?.childcareEfficiencyFactor }}
            </span>
          </div>
          
          <div class="parameter-control">
            <label for="maxChildcareEffectiveness">Max Childcare Effectiveness:</label>
            <input 
              id="maxChildcareEffectiveness"
              type="number" 
              step="0.1"
              v-model.number="tempFixedParams.maxChildcareEffectiveness"
              @change="updateFixedParam('maxChildcareEffectiveness')"
            />
            <span v-if="isPendingFixedParam('maxChildcareEffectiveness')" class="pending-indicator">
              Pending: {{ pendingChanges.fixedParams?.maxChildcareEffectiveness }}
            </span>
          </div>
          
          <div class="parameter-control">
            <label for="baseDeclineRate">Base Decline Rate:</label>
            <input 
              id="baseDeclineRate"
              type="number" 
              step="0.01"
              v-model.number="tempFixedParams.baseDeclineRate"
              @change="updateFixedParam('baseDeclineRate')"
            />
            <span v-if="isPendingFixedParam('baseDeclineRate')" class="pending-indicator">
              Pending: {{ pendingChanges.fixedParams?.baseDeclineRate }}
            </span>
          </div>
          
          <div class="parameter-control">
            <label for="k">k (Decline Parameter):</label>
            <input 
              id="k"
              type="number" 
              step="0.1"
              v-model.number="tempFixedParams.k"
              @change="updateFixedParam('k')"
            />
            <span v-if="isPendingFixedParam('k')" class="pending-indicator">
              Pending: {{ pendingChanges.fixedParams?.k }}
            </span>
          </div>
          
          <div class="parameter-control">
            <label for="maxGrowthRateCap">Max Growth Rate Cap:</label>
            <input 
              id="maxGrowthRateCap"
              type="number" 
              step="0.01"
              v-model.number="tempFixedParams.maxGrowthRateCap"
              @change="updateFixedParam('maxGrowthRateCap')"
            />
            <span v-if="isPendingFixedParam('maxGrowthRateCap')" class="pending-indicator">
              Pending: {{ pendingChanges.fixedParams?.maxGrowthRateCap }}
            </span>
          </div>
        </div>
        
        <!-- Variable Parameters Panel -->
        <div class="control-panel">
          <h3>Variable Parameters</h3>
          
          <div class="parameter-control">
            <label for="socialScaleCapacity">Social Scale Capacity:</label>
            <input 
              id="socialScaleCapacity"
              type="number" 
              v-model.number="tempVariableParams.socialScaleCapacity"
              @change="updateVariableParam('socialScaleCapacity')"
            />
            <span v-if="isPendingVariableParam('socialScaleCapacity')" class="pending-indicator">
              Pending: {{ pendingChanges.variableParams?.socialScaleCapacity }}
            </span>
          </div>
          
          <div class="parameter-control">
            <label for="caloriesPerFoodWorker">Calories Per Food Worker:</label>
            <input 
              id="caloriesPerFoodWorker"
              type="number" 
              v-model.number="tempVariableParams.caloriesPerFoodWorker"
              @change="updateVariableParam('caloriesPerFoodWorker')"
            />
            <span v-if="isPendingVariableParam('caloriesPerFoodWorker')" class="pending-indicator">
              Pending: {{ pendingChanges.variableParams?.caloriesPerFoodWorker }}
            </span>
          </div>
        </div>
        
        <!-- Calculated Values Panel -->
        <div class="control-panel calculated-panel">
          <h3>Calculated Values</h3>
          
          <div class="calculated-value">
            <span class="label">Total Calories Supplied:</span>
            <span class="value">{{ Math.round(calculatedValues.totalCaloriesSupplied) }}</span>
          </div>
          
          <div class="calculated-value">
            <span class="label">Min Total Calories Needed:</span>
            <span class="value">{{ Math.round(calculatedValues.minTotalCaloriesNeeded) }}</span>
          </div>
          
          <div class="calculated-value calorie-comparison" :class="calorieBalanceClass">
            <span class="label">Calorie Balance:</span>
            <span class="value">{{ calorieBalanceText }}</span>
          </div>
          
          <div class="calculated-value">
            <span class="label">Adjusted Min Calories (per person):</span>
            <span class="value">{{ Math.round(calculatedValues.adjustedMinCalories) }}</span>
          </div>
          
          <div class="calculated-value">
            <span class="label">Childcare Effectiveness:</span>
            <span class="value">{{ (calculatedValues.childcareEffectiveness * 100).toFixed(1) }}%</span>
          </div>
          
          <div class="calculated-value">
            <span class="label">Actual Growth Factor:</span>
            <span class="value">{{ calculatedValues.actualGrowthFactor.toFixed(3) }}</span>
          </div>
          
          <div class="calculated-value">
            <span class="label">Predicted Population Change:</span>
            <span class="value" :class="{ 'positive': calculatedValues.predictedPopulationChange > 0, 'negative': calculatedValues.predictedPopulationChange < 0 }">
              {{ calculatedValues.predictedPopulationChange > 0 ? '+' : '' }}{{ Math.round(calculatedValues.predictedPopulationChange) }}
            </span>
          </div>
          
          <div class="calculated-value">
            <span class="label">Population Equilibrium:</span>
            <span class="value">{{ Math.round(calculatedValues.populationEquilibrium) }}</span>
          </div>
          
          <div class="calculated-value">
            <span class="label">Current Population:</span>
            <span class="value">{{ Math.round(simulationState.currentPopulation) }}</span>
          </div>
          
          <div class="calculated-value">
            <span class="label">Current Time Step:</span>
            <span class="value">{{ simulationState.currentTimeStep }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { usePopulationStore } from '@/stores/populationStore';
import Chart from 'chart.js/auto';

// Store
const populationStore = usePopulationStore();

// Chart reference
const populationChart = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

// Computed properties from store
const allocation = computed(() => populationStore.allocation);
const fixedParams = computed(() => populationStore.fixedParams);
const variableParams = computed(() => populationStore.variableParams);
const simulationState = computed(() => populationStore.simulationState);
const pendingChanges = computed(() => populationStore.pendingChanges);
const calculatedValues = computed(() => populationStore.calculatedValues);
const isRunning = computed(() => populationStore.isRunning);
const hasPendingChanges = computed(() => populationStore.hasPendingChanges);

// Temporary values for UI
const tempAllocation = ref({
  foodAllocationPercent: allocation.value.foodAllocationPercent,
  thinkingAllocationPercent: allocation.value.thinkingAllocationPercent,
  childcareAllocationPercent: allocation.value.childcareAllocationPercent
});

const tempFixedParams = ref({ ...fixedParams.value });
const tempVariableParams = ref({ ...variableParams.value });

// Display allocation (current or pending)
const displayAllocation = computed(() => {
  return {
    foodAllocationPercent: pendingChanges.value.allocation?.foodAllocationPercent ?? allocation.value.foodAllocationPercent,
    thinkingAllocationPercent: pendingChanges.value.allocation?.thinkingAllocationPercent ?? allocation.value.thinkingAllocationPercent,
    childcareAllocationPercent: pendingChanges.value.allocation?.childcareAllocationPercent ?? allocation.value.childcareAllocationPercent
  };
});

// Computed for allocation total
const allocationTotal = computed(() => {
  return displayAllocation.value.foodAllocationPercent + 
         displayAllocation.value.thinkingAllocationPercent + 
         displayAllocation.value.childcareAllocationPercent;
});

// Computed for calorie balance display
const calorieBalanceText = computed(() => {
  const surplus = calculatedValues.value.totalCaloriesSupplied - calculatedValues.value.minTotalCaloriesNeeded;
  return surplus >= 0 
    ? `Surplus: +${Math.round(surplus)}` 
    : `Deficit: ${Math.round(surplus)}`;
});

const calorieBalanceClass = computed(() => {
  const surplus = calculatedValues.value.totalCaloriesSupplied - calculatedValues.value.minTotalCaloriesNeeded;
  return {
    'positive': surplus > 0,
    'neutral': surplus === 0,
    'negative': surplus < 0
  };
});

// Helper functions to check if a parameter is pending
function isPendingAllocation(key: string) {
  return pendingChanges.value.allocation && key in pendingChanges.value.allocation;
}

function isPendingFixedParam(key: string) {
  return pendingChanges.value.fixedParams && key in pendingChanges.value.fixedParams;
}

function isPendingVariableParam(key: string) {
  return pendingChanges.value.variableParams && key in pendingChanges.value.variableParams;
}

// Update functions
function updateAllocation(type: 'food' | 'thinking' | 'childcare') {
  const updates: Record<string, number> = {};
  
  if (type === 'food') {
    updates.foodAllocationPercent = tempAllocation.value.foodAllocationPercent;
    
    // Adjust childcare to maintain total of 100%
    const remaining = 100 - tempAllocation.value.foodAllocationPercent;
    const thinkingRatio = tempAllocation.value.thinkingAllocationPercent / 
      (tempAllocation.value.thinkingAllocationPercent + tempAllocation.value.childcareAllocationPercent || 1);
    
    updates.thinkingAllocationPercent = Math.round(remaining * thinkingRatio);
    updates.childcareAllocationPercent = 100 - updates.foodAllocationPercent - updates.thinkingAllocationPercent;
    
    // Update temp values
    tempAllocation.value.thinkingAllocationPercent = updates.thinkingAllocationPercent;
    tempAllocation.value.childcareAllocationPercent = updates.childcareAllocationPercent;
  } 
  else if (type === 'thinking') {
    updates.thinkingAllocationPercent = tempAllocation.value.thinkingAllocationPercent;
    
    // Adjust childcare to maintain total of 100%
    updates.childcareAllocationPercent = 100 - tempAllocation.value.foodAllocationPercent - updates.thinkingAllocationPercent;
    
    // Update temp value
    tempAllocation.value.childcareAllocationPercent = updates.childcareAllocationPercent;
  }
  else if (type === 'childcare') {
    updates.childcareAllocationPercent = tempAllocation.value.childcareAllocationPercent;
    
    // Adjust thinking to maintain total of 100%
    updates.thinkingAllocationPercent = 100 - tempAllocation.value.foodAllocationPercent - updates.childcareAllocationPercent;
    
    // Update temp value
    tempAllocation.value.thinkingAllocationPercent = updates.thinkingAllocationPercent;
  }
  
  populationStore.updatePendingAllocation(updates);
}

function updateFixedParam(param: keyof typeof fixedParams.value) {
  populationStore.updatePendingFixedParams({ 
    [param]: tempFixedParams.value[param] 
  });
}

function updateVariableParam(param: keyof typeof variableParams.value) {
  populationStore.updatePendingVariableParams({ 
    [param]: tempVariableParams.value[param] 
  });
}

// Action functions
function startSimulation() {
  populationStore.startSimulation();
}

function pauseSimulation() {
  populationStore.pauseSimulation();
}

function resetSimulation() {
  populationStore.resetSimulation();
}

function applyPendingChanges() {
  populationStore.applyPendingChanges();
}

function clearPendingChanges() {
  populationStore.clearPendingChanges();
  
  // Reset temp values to current values
  tempAllocation.value = {
    foodAllocationPercent: allocation.value.foodAllocationPercent,
    thinkingAllocationPercent: allocation.value.thinkingAllocationPercent,
    childcareAllocationPercent: allocation.value.childcareAllocationPercent
  };
  
  tempFixedParams.value = { ...fixedParams.value };
  tempVariableParams.value = { ...variableParams.value };
}

// Chart initialization and update
function initChart() {
  if (!populationChart.value) return;
  
  const ctx = populationChart.value.getContext('2d');
  if (!ctx) return;
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: simulationState.value.populationHistory.map(p => p.timeStep.toString()),
      datasets: [{
        label: 'Population',
        data: simulationState.value.populationHistory.map(p => p.population),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0 // Disable animation for performance
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Population'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time Step'
          }
        }
      }
    }
  });
}

function updateChart() {
  if (!chart) return;
  
  chart.data.labels = simulationState.value.populationHistory.map(p => p.timeStep.toString());
  chart.data.datasets[0].data = simulationState.value.populationHistory.map(p => p.population);
  chart.update();
}

// Lifecycle hooks
onMounted(() => {
  initChart();
  
  // Watch for population history changes to update chart
  watch(() => simulationState.value.populationHistory, () => {
    updateChart();
  }, { deep: true });
  
  // Watch for changes in allocation, params to update temp values when applied
  watch([allocation, fixedParams, variableParams], () => {
    tempAllocation.value = {
      foodAllocationPercent: allocation.value.foodAllocationPercent,
      thinkingAllocationPercent: allocation.value.thinkingAllocationPercent,
      childcareAllocationPercent: allocation.value.childcareAllocationPercent
    };
    
    tempFixedParams.value = { ...fixedParams.value };
    tempVariableParams.value = { ...variableParams.value };
  });
});

onUnmounted(() => {
  if (chart) {
    chart.destroy();
  }
  populationStore.pauseSimulation();
});
</script>

<style scoped>
.population-simulator {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.graph-container {
  width: 100%;
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
}

.simulator-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.simulation-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}

.simulation-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.simulation-buttons button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.simulation-buttons .apply-button {
  background-color: #2196F3;
}

.control-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.control-panel {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background-color: #f9f9f9;
}

.control-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

.allocation-control, .parameter-control {
  margin-bottom: 15px;
}

.allocation-control label, .parameter-control label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.slider-container {
  position: relative;
}

input[type="range"] {
  width: 100%;
}

input[type="number"] {
  width: 100px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.allocation-total {
  font-weight: bold;
  margin-top: 10px;
}

.error-text {
  color: red;
}

.pending-indicator {
  display: inline-block;
  margin-left: 10px;
  color: #2196F3;
  font-style: italic;
}

.calculated-panel {
  background-color: #f0f8ff;
}

.calculated-value {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px;
  border-bottom: 1px dashed #ddd;
}

.calculated-value .label {
  font-weight: bold;
}

.calorie-comparison {
  padding: 8px 5px;
  border-radius: 4px;
  margin: 10px 0;
}

.positive {
  color: green;
}

.negative {
  color: red;
}

.neutral {
  color: #666;
}

.calorie-comparison.positive {
  background-color: rgba(0, 128, 0, 0.1);
}

.calorie-comparison.negative {
  background-color: rgba(255, 0, 0, 0.1);
}
</style>
