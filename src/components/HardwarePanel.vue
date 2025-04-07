<template>
  <div class="hardware-panel">
    <h3>Hardware</h3>
    <div class="hardware-details">
      <div class="hardware-name">{{ datacentreStore.currentHardwareObject?.name || 'None' }}</div>
      <div class="hardware-stats">
        <div>FLOPS: {{ datacentreStore.currentHardwareObject?.flops || 0 }}</div>
      </div>
    </div>
    
    <div class="upgrade-info" v-if="datacentreStore.nextHardwareUpgrade">
      <h4>Next Upgrade:</h4>
      <div>{{ datacentreStore.nextHardwareUpgrade.name }}</div>
      <div>Cost: ${{ datacentreStore.nextHardwareUpgrade.upgradeCost }}</div>
      <div>FLOPS: {{ datacentreStore.nextHardwareUpgrade.flops }}</div>
      <div class="affordability" v-if="datacentreStore.canAffordUpgrade">
        Can afford: Yes
      </div>
      <div class="affordability" v-else>
        Can afford: No
      </div>
    </div>
    <div class="upgrade-info" v-else>
      <div>No more upgrades available</div>
    </div>
    
    <button 
      @click="datacentreStore.upgradeHardware"
      :disabled="!datacentreStore.nextHardwareUpgrade || !datacentreStore.canAffordUpgrade"
    >
      Upgrade
    </button>
  </div>
</template>

<script setup lang="ts">
import { useDatacentreStore } from '../stores/datacentre';

const datacentreStore = useDatacentreStore();
</script>

<style scoped>
.hardware-panel {
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3, h4 {
  margin-top: 0;
  color: #2c3e50;
}

h4 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.hardware-details {
  margin: 0.5rem 0;
}

.hardware-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.hardware-stats {
  font-family: monospace;
  margin-bottom: 1rem;
}

.upgrade-info {
  margin: 0.5rem 0 1rem;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 0.9rem;
}

.affordability {
  margin-top: 0.5rem;
  font-style: italic;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #42b983;
  color: white;
  cursor: pointer;
  width: 100%;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>