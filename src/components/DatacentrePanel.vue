<template>
  <div class="datacentre-panel">
    <h2>Datacentre</h2>
    <div class="datacentre-content">
      <ResearchersPanel />
      <HardwarePanel />
      <WorkPanel />
      <WorkAllocatorPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import ResearchersPanel from './ResearchersPanel.vue';
import HardwarePanel from './HardwarePanel.vue';
import WorkPanel from './WorkPanel.vue';
import WorkAllocatorPanel from './WorkAllocatorPanel.vue';
</script>

<style scoped>
.datacentre-panel {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
}

.datacentre-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;
}
</style>