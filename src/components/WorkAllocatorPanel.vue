<template>
  <div class="work-allocator-panel">
    <h3>Work Allocation</h3>
    <div class="allocation-display">
      <div>Products: {{ Math.round((1 - datacentreStore.proportionWorkSpentOnResearch) * 100) }}%</div>
      <div>Research: {{ Math.round(datacentreStore.proportionWorkSpentOnResearch * 100) }}%</div>
    </div>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      :value="datacentreStore.proportionWorkSpentOnResearch"
      @input="handleSliderChange"
    />
    <div class="allocation-note">
      Drag slider to change allocation between Products and Research
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDatacentreStore } from '../stores/datacentre';

const datacentreStore = useDatacentreStore();

function handleSliderChange(event) {
  const newValue = parseFloat(event.target.value);
  datacentreStore.setWorkAllocation(newValue);
}
</script>

<style scoped>
.work-allocator-panel {
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  color: #2c3e50;
}

.allocation-display {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  font-weight: bold;
}

input[type="range"] {
  width: 100%;
  margin: 1rem 0 0.5rem;
  cursor: pointer;
}

.allocation-note {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  font-style: italic;
}
</style>
