<template>
  <div class="datacentre-panel">
    <h2>Datacentre</h2>
    <div class="datacentre-content">
      <ResearchersPanel class="grid-item" />
      <HardwarePanel class="grid-item" />
      <WorkPanel class="full-width" />
      <WorkAllocatorPanel class="full-width" />
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
  grid-template-areas:
    "researchers hardware"
    "work work"
    "allocator allocator";
  gap: 1rem;
}

.grid-item:nth-child(1) {
  grid-area: researchers;
}

.grid-item:nth-child(2) {
  grid-area: hardware;
}

.full-width:nth-child(3) {
  grid-area: work;
}

.full-width:nth-child(4) {
  grid-area: allocator;
}
</style>
