<template>
  <div class="work-panel">
    <h3>Work</h3>
    <div class="work-rate">Work Rate: {{ resourcesStore.workRate }}/tick</div>
    <div class="work-formula">Work = Creativity * FLOPS</div>
    <div class="work-details">
      <div>{{ resourcesStore.creativityRate }} × {{ resourcesStore.flopsRate }} = {{ resourcesStore.workRate }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourcesStore } from '../stores/resources';

const resourcesStore = useResourcesStore();
</script>

<style scoped>
.work-panel {
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  color: #2c3e50;
}

.work-rate {
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0.5rem 0;
}

.work-formula {
  font-style: italic;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.work-details {
  font-family: monospace;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>