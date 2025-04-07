<template>
  <div class="researchers-panel">
    <h3>Researchers</h3>
    <div class="researchers-count">Count: {{ datacentreStore.numResearchers }}</div>
    <div class="affordability" v-if="datacentreStore.canAffordToHire">
      Can afford to hire: Yes
    </div>
    <div class="affordability" v-else>
      Can afford to hire: No
    </div>
    <div class="researchers-actions">
      <button 
        @click="datacentreStore.hireResearcher"
        :disabled="!datacentreStore.canAffordToHire"
      >
        Hire
      </button>
      <button 
        @click="datacentreStore.fireResearcher"
        :disabled="datacentreStore.numResearchers <= 0"
      >
        Fire
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDatacentreStore } from '../stores/datacentre';

const datacentreStore = useDatacentreStore();
</script>

<style scoped>
.researchers-panel {
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  color: #2c3e50;
}

.researchers-count {
  margin: 0.5rem 0;
  font-weight: bold;
}

.affordability {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.researchers-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #42b983;
  color: white;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>