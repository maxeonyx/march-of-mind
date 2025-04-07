<template>
  <div class="debug-panel">
    <h2>Debug Panel</h2>
    
    <div class="debug-section">
      <h3>Resources</h3>
      <div class="debug-action">
        <input 
          type="number" 
          v-model.number="savingsToAdd" 
          min="0" 
          step="100"
        />
        <button @click="addSavings">Add Savings</button>
      </div>
    </div>
    
    <div class="debug-section">
      <h3>Work Progress</h3>
      <div class="debug-action">
        <select v-model="selectedTechId">
          <option value="">Select a Tech</option>
          <option 
            v-for="id in [...techTreeStore.unlocked_progress.keys()]" 
            :key="id"
            :value="id"
          >
            {{ getTechName(id) }}
          </option>
        </select>
        <input 
          type="number" 
          v-model.number="workAmount" 
          min="0" 
          :max="getWorkRequired(selectedTechId)" 
          step="10"
        />
        <button 
          @click="applyWork"
          :disabled="!selectedTechId || workAmount <= 0"
        >
          Apply Work
        </button>
      </div>
    </div>
    
    <div class="debug-section">
      <h3>Store Status</h3>
      <div class="status-item">
        <div>Savings: {{ resourcesStore.savingsAmount }}</div>
        <div>Researchers: {{ datacentreStore.numResearchers }}</div>
        <div>Current Hardware: {{ datacentreStore.currentHardwareObject?.name || 'None' }}</div>
        <div>Selected Product: {{ techTreeStore.currentlySelectedProduct || 'None' }}</div>
        <div>Selected Discovery: {{ techTreeStore.currentlySelectedDiscovery || 'None' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useResourcesStore } from '../stores/resources';
import { useDatacentreStore } from '../stores/datacentre';
import { useTechTreeStore } from '../stores/techTree';
import { findTechById } from '../stores/staticData';

const resourcesStore = useResourcesStore();
const datacentreStore = useDatacentreStore();
const techTreeStore = useTechTreeStore();

const savingsToAdd = ref(100);
const selectedTechId = ref('');
const workAmount = ref(10);

function addSavings() {
  resourcesStore.addSavings(savingsToAdd.value);
  console.log(`Added ${savingsToAdd.value} savings. New total: ${resourcesStore.savingsAmount}`);
}

function applyWork() {
  if (selectedTechId.value && workAmount.value > 0) {
    techTreeStore.progressWork(selectedTechId.value, workAmount.value);
  }
}

function getTechName(id) {
  const tech = findTechById(id);
  return tech?.name || id;
}

function getWorkRequired(id) {
  if (!id) return 0;
  const progress = techTreeStore.getProgress(id);
  return progress?.workRequired || 0;
}
</script>

<style scoped>
.debug-panel {
  background-color: #fffacd;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 2px dashed #f5ad6e;
}

h2 {
  margin-top: 0;
  color: #e67e22;
}

h3 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #e67e22;
}

.debug-section {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

.debug-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

input, select {
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  background-color: #e67e22;
  color: white;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.status-item {
  font-family: monospace;
  font-size: 0.9rem;
}
</style>