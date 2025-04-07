<template>
  <div class="resource-panel">
    <h2>Resources</h2>
    <div class="resource-sections-container">
      <div class="resources-section">
        <h3>Current Values</h3>
        <div class="resource-item">
          <span class="resource-label">Savings: $</span>
          <span class="resource-value">{{ resourcesStore.savingsAmount }}</span>
        </div>
        <div class="resource-item">
          <span class="resource-label">Thoughts: </span>
          <span class="resource-value">{{ resourcesStore.thoughtsAmount }}</span>
        </div>
      </div>
      
      <div class="rates-section">
        <h3>Rates</h3>
        <div class="resource-item">
          <span class="resource-label">Income Rate: </span>
          <span class="resource-value">${{ resourcesStore.incomeRate }}/tick</span>
        </div>
        <div class="resource-item">
          <span class="resource-label">Creativity: </span>
          <span class="resource-value">{{ resourcesStore.creativityRate }}</span>
        </div>
        <div class="resource-item">
          <span class="resource-label">FLOPS: </span>
          <span class="resource-value">{{ resourcesStore.flopsRate }}</span>
        </div>
        <div class="resource-item">
          <span class="resource-label">Work Rate: </span>
          <span class="resource-value">{{ resourcesStore.workRate }}/tick</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourcesStore } from '../stores/resources';

const resourcesStore = useResourcesStore();
</script>

<style scoped>
.resource-panel {
  background-color: #f0f8ff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.resource-sections-container {
  display: flex;
  gap: 1rem;
}

.resources-section, .rates-section {
  flex: 1;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
}

h3 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #42b983;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  margin: 0.25rem 0;
}

.resource-label {
  font-weight: bold;
}

.resource-value {
  font-family: monospace;
}
</style>
